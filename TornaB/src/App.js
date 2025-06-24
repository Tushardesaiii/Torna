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

import userRouter from './routes/user.routes.js';
import projectRouter from './routes/project.routes.js';
import documentRouter from './routes/document.routes.js';

// Mount all routers at /api/v1
app.use("/api/v1", userRouter);
app.use("/api/v1", projectRouter);
app.use("/api/v1", documentRouter);

export { app };
