import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { env } from "./config/env.config";
import { connectDB } from "./config/db.config";
import { globalErrorHandler } from "./middleware/error.middleware";
import { initSocket } from "./sockets";

import authRoutes from "./modules/auth/auth.route";
import userRoutes from "./modules/user/user.route";
import projectRoutes from "./modules/project/project.route";
import taskRoutes from "./modules/task/task.route";

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", environment: env.NODE_ENV });
});

// Handle unhandled routes — use app.use() because Express 5 (path-to-regexp v8)
// no longer accepts bare * as a route pattern
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Global Error Handler
app.use(globalErrorHandler);

// Start Server
const PORT = env.PORT || 8000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${env.NODE_ENV} mode.`);
});

export default app;
