import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { apiLimiter } from "./middlewares/rateLimit.js";
import adminRoutes from "./routes/admin.routes.js";
import verificationRoutes from "./routes/verification.routes.js";

dotenv.config();

const app = express();

/* ===============================
   GLOBAL MIDDLEWARES
================================ */
app.use(cors());
app.use(express.json());

/* ===============================
   RATE LIMIT (IMPORTANT)
   Applies to all /api routes
================================ */
app.use("/api", apiLimiter);

/* ===============================
   API ROUTES
================================ */
app.use("/api/admin", adminRoutes);
app.use("/api", verificationRoutes);

/* ===============================
   HEALTH CHECK & STATUS
================================ */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Wisteria Trust Backend API is live"
  });
});

app.get("/api/status", (req, res) => {
  res.status(200).json({
    service: "Wisteria Trust Verification Infrastructure",
    status: "Active",
    timestamp: new Date().toISOString()
  });
});

/* ===============================
   404 NOT FOUND HANDLER
================================ */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found`
  });
});

/* ===============================
   GLOBAL ERROR HANDLER
================================ */
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

export default app;
