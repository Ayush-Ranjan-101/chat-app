import express from "express";
import path from "path"; // Don't forget this
import cors from "cors";
import cookieParser from "cookie-parser";
import { app } from "./utils/socket.js"; // Use the instance from socket.js

const __dirname = path.resolve();

// Basic configurations
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Cors configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Routes
import healthCheckRouter from "./routes/healthCheckRouter.routes.js";
import authRouter from "./routes/authRouter.routes.js";
import messageRouter from "./routes/messageRouter.routes.js";

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/messages", messageRouter);

// Production Static Files
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "./frontend/dist"))); // Check this path

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./frontend/dist/index.html"));
  })
}

import errorHandler from "./middlewares/errorHandler.middlewares.js";
app.use(errorHandler);

export default app;
