import express from "express"
const app=express();

import userRoutes from "./routes/User.js"
import paymentRoutes from "./routes/Payment.js"
import profileRoutes from "./routes/Profile.js"
import CourseRoutes from "./routes/Course.js"

import dbConnect from "./config/db.js"

import cookieParser from "cookie-parser";
import cors from "cors"
import fileUpload from "express-fileupload"
import cloudinaryconnect from "./config/Cloudinary.js"


import dotenv from "dotenv"
dotenv.config();


import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("AIzaSyBPx7qBZz0TJiEz1KYteNdAZMqib6GdWD0");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


const PORT = process.env.PORT || 5000;
dbConnect();

app.use(express.json());

app.use(cookieParser());

const allowedOrigins = ["http://localhost:5173"];
app.use(cors({
  origin: allowedOrigins, 
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", 
  credentials: true 
}));


app.use(fileUpload({
  useTempFiles:true,
  tempFileDir:'/tmp/'
}));

cloudinaryconnect();
  

// routes:
app.use("/api/v1/auth", userRoutes); 
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", CourseRoutes);
// app.use("/api/v1/contact", require("./routes/ContactUs"));

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


app.post("/api/generate-content",async (req,res)=>{
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
})


app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});
  
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
