import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import os from "os";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import SubSection from "../models/SubSection.js";
import uploadImageToCloudinary from "../utils/imageUploader.js";
import { createSubsectionProcessWorker } from "../queues/subsectionProcess.queue.js";
import { attachDeadLetterForwarding } from "../queues/deadLetter.queue.js";
import cloudinaryconnect from "../config/Cloudinary.js";

async function processSubsection(job) {
  const { subSectionId, videoUrl } = job.data;
  const videoPath = path.join(os.tmpdir(), `v-${subSectionId}-${job.id}.mp4`);
  const audioPath = path.join(os.tmpdir(), `a-${subSectionId}-${job.id}.mp3`);

  await SubSection.findByIdAndUpdate(subSectionId, {
    processingStatus: "processing",
    processingError: "",
  });

  try {
    const response = await axios({ method: "GET", url: videoUrl, responseType: "stream" });
    const writer = fs.createWriteStream(videoPath);
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .output(audioPath)
        .noVideo()
        .audioCodec("libmp3lame")
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    const audioFile = { tempFilePath: audioPath };
    await uploadImageToCloudinary(audioFile, process.env.FOLDER_AUDIO);

    const assemblyApiKey = process.env.ASSEMBLY_API_KEY;
    const assemblyUploadResponse = await axios.post(
      "https://api.assemblyai.com/v2/upload",
      fs.createReadStream(audioPath),
      { headers: { Authorization: assemblyApiKey, "Content-Type": "application/octet-stream" } }
    );

    const audioUrl = assemblyUploadResponse.data.upload_url;

    const transcriptResponse = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      { audio_url: audioUrl },
      { headers: { Authorization: assemblyApiKey, "Content-Type": "application/json" } }
    );

    const transcriptId = transcriptResponse.data.id;

    let transcriptText = "";
    let status = "processing";
    while (status === "processing" || status === "queued") {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const transcriptData = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        { headers: { Authorization: assemblyApiKey } }
      );
      status = transcriptData.data.status;
      if (status === "completed") {
        transcriptText = transcriptData.data.text ?? "";
        break;
      }
      if (status === "failed") {
        throw new Error(transcriptData.data.error || "AssemblyAI transcription failed");
      }
    }

    await SubSection.findByIdAndUpdate(subSectionId, {
      transcript: transcriptText,
      processingStatus: "ready",
      processingError: "",
    });
  } catch (e) {
    await SubSection.findByIdAndUpdate(subSectionId, {
      processingStatus: "failed",
      processingError: e.message,
    });
    throw e;
  } finally {
    try {
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    } catch (_) {}
  }
}

const { worker } = createSubsectionProcessWorker(processSubsection);
attachDeadLetterForwarding(worker);

async function main() {
  cloudinaryconnect();
  const mongoUri = process.env.MONGODB_URL || process.env.DATABASE_URL;
  if (!mongoUri) {
    console.error("Missing MONGODB_URL (or DATABASE_URL)");
    process.exit(1);
  }
  await mongoose.connect(mongoUri);
  console.log("Subsection worker up");
}

main().catch(console.error);