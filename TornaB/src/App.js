import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes imports
import userRouter from './routes/user.routes.js';
import projectRouter from './routes/project.routes.js';
import documentRouter from './routes/document.routes.js'; // Import the new project router

// Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter); 
app.use("/api/v1/documents", documentRouter); // Use the document router
// Declare the project router

export { app };