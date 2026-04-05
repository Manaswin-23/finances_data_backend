import path from "path";
const express = require("express");
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorMiddleware";
import authRoutes from "./routes/authRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import userRoutes from "./routes/userRoutes";
import { globalLimiter } from "./middleware/rateLimiter";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use("/api", globalLimiter);
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Serve static files from the frontend
// Correcting path: src is at root/src, frontend is at root/frontend
// So from root/src/app.ts, we need to go up one level to root, then into frontend/dist
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// API Routes
app.get("/api/health", (req: any, res: any) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

// SPA Routing for frontend
// Use a middleware to handle non-API routes for SPA
app.use((req: any, res: any, next: any) => {
  if (req.originalUrl.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(frontendPath, "index.html"), (err: any) => {
    if (err) {
      // If index.html is missing, just send a 404 or a basic response
      res.status(404).send("Frontend not found. Please run 'npm run build' in the frontend directory.");
    }
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
