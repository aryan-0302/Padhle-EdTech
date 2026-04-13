import express from "express";
const app = express();

import userRoutes from "./routes/User.js";
import paymentRoutes from "./routes/Payment.js";
import profileRoutes from "./routes/Profile.js";
import CourseRoutes from "./routes/Course.js";

import activityTrack from "./routes/Activity.js";
import recommendRoutes from "./routes/RecommendRoutes.js";

import dbConnect from "./config/db.js";

import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import cloudinaryconnect from "./config/Cloudinary.js";
import generatequiz from "./routes/GenerateQuiz.js";
import smartNotes from "./routes/SmartNotes.js";
import doubtRoutes from "./routes/doubtRoutes.js";
import notificationRoutes from "./routes/Notification.js";

import dotenv from "dotenv";
dotenv.config();


import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const PORT = process.env.PORT || 4000;
dbConnect();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      // Allow any Vercel deployment URL for this project
      if (/https:\/\/padhle-ed-tech.*\.vercel\.app$/.test(origin))
        return callback(null, true);
      // Allow explicitly listed origins
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  }),
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  }),
);

cloudinaryconnect();

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", CourseRoutes);

app.use("/api/v1/activity", activityTrack);

app.use("/api/v1/recommend", recommendRoutes);
app.use("/api/v1/generatequiz", generatequiz);
app.use("/api/v1/notes", smartNotes);
app.use("/api/v1/doubt", doubtRoutes);
app.use("/api/v1/notifications", notificationRoutes);

const chat = model.startChat({
  history: [
    {
      role: "user",
      parts: [{ text: "Hello" }],
    },
    {
      role: "model",
      parts: [{ text: "Great to meet you. What would you like to know?" }],
    },
  ],
});

const sendMessageStream = async (prompt) => {
  try {
    let responseText = "";
    const result = await chat.sendMessageStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      process.stdout.write(chunkText);
      responseText += chunkText;
    }

    console.log("\n");
    return responseText;
  } catch (err) {
    console.error("Error:", err);
    return "Error generating response.";
  }
};

app.post("/api/generate-content", async (req, res) => {
  try {
    const { input } = req.body;
    if (!input) {
      return res.status(400).json({ error: "Input is required" });
    }

    const response = await sendMessageStream(input);
    res.json({ candidates: [{ content: { parts: [{ text: response }] } }] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Padhle API. Docs available at /api-docs",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});