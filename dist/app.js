"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express = require("express");
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const rateLimiter_1 = require("./middleware/rateLimiter");
dotenv_1.default.config();
const app = express();
// Middlewares
app.use((0, cors_1.default)());
app.use("/api", rateLimiter_1.globalLimiter);
app.use(express.json());
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
// Serve static files from the frontend
// Correcting path: src is at root/src, frontend is at root/frontend
// So from root/src/app.ts, we need to go up one level to root, then into frontend/dist
const frontendPath = path_1.default.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));
// API Routes
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/transactions", transactionRoutes_1.default);
app.use("/api/dashboard", dashboardRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
// SPA Routing for frontend
// Use a middleware to handle non-API routes for SPA
app.use((req, res, next) => {
    if (req.originalUrl.startsWith("/api")) {
        return next();
    }
    res.sendFile(path_1.default.join(frontendPath, "index.html"), (err) => {
        if (err) {
            // If index.html is missing, just send a 404 or a basic response
            res.status(404).send("Frontend not found. Please run 'npm run build' in the frontend directory.");
        }
    });
});
// Global error handler
app.use(errorMiddleware_1.errorHandler);
module.exports = app;
