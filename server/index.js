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

// INBUILT MIDDLEWARE
// parse incoming request with json body and make it available to req.body
app.use(express.json());

//when we login,this request have cookie so to access/to make available this cookie we use it.
// Parses cookies from incoming requests.
app.use(cookieParser());

// CORS is used to interact frontend and backend hosted at different port/domain.
// When your frontend (React) makes an API request to the backend (Express) using Axios (or any other HTTP client),
// this is considered a cross-origin request. The browser will block this request unless the backend explicitly allows it through CORS.

const allowedOrigins = ["http://localhost:5173"];
app.use(cors({
  origin: allowedOrigins, 
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", 
  credentials: true 
}));


// allow server to accept and manage files uploaded by client through HTML form or API request.
app.use(fileUpload({
  useTempFiles:true,
  tempFileDir:'/tmp/'
}));

// connection with cloudinary:
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




// IMPORTANT POINTS:
/*
1. Client sends request to DNR(domain name resolution)which finds the exact address of server(as there are many servers, which further sends request to server and server responds according to it to client.
2. NodeJS provides runtime environment(earlier we can only run in browser but now due to nodejs we can run javascript code through client side also).
3. before nodemon: node index.js, after nodemon dev:"nodemon index.js" and npm run dev
4. Middleware: validate,log,authentication,authorize the request before responds.
5. There are 5 types of middlewares: a).Application-level middleware(jo banaye he)   b).Built-in(app.use(express.json())    c).Third Party middleware(app.use(cookieParser()))
    d). router middleware(router.use())     e).error-handling middleware     f).Route-specific middleware(for industry)

6. MongoDB: No SQL database,in which data stored in document or json like structure. wheereas in SQL data is stored in every new row.s
7. DUe to easy integation,scalibility.
8. In mongoDB compass, there can be several collection and each collection can have several documents.
9. Backend application interact with the database through the mongoose.
10. Mongoose is a ODM(object data modelling) library.
11. Schema is the blueprint of the document.
12. Model is a toolbox that uses schema to do CRUD operations in DB.
13. MVC(mode view controller) pattern(in which our project flow is there) follows SOC(separation of concerns)
*/ 