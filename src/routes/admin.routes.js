import express from "express";
import { adminLogin } from "../controllers/admin.controller.js";
import {
  createVerification,
  getAllVerifications,
  revokeVerification,
  expireVerification,
  extendVerification,
  updateVerification,
  deleteVerification
} from "../controllers/verification.controller.js";
import { protectAdmin } from "../middlewares/adminAuth.js";

const router = express.Router();

/**
 * ================================
 * Admin login
 * ================================
 */
router.post("/login", adminLogin);

/**
 * ================================
 * Admin create verification
 * ================================
 */
router.post("/verification", protectAdmin, createVerification);

/**
 * ================================
 * Admin get all verifications
 * ================================
 */
router.get("/verifications", protectAdmin, getAllVerifications);

/**
 * ================================
 * Admin revoke verification
 * ================================
 */
router.patch(
  "/verification/:id/revoke",
  protectAdmin,
  revokeVerification
);

/**
 * ================================
 * Admin expire verification
 * ================================
 */
router.patch(
  "/verification/:id/expire",
  protectAdmin,
  expireVerification
);

/**
 * ================================
 * Admin extend verification
 * ================================
 */
router.patch(
  "/verification/:id/extend",
  protectAdmin,
  extendVerification
);

/**
 * ================================
 * Admin update verification
 * ================================
 */
router.patch(
  "/verification/:id/update",
  protectAdmin,
  updateVerification
);

/**
 * ================================
 * Admin delete verification
 * ================================
 */
router.delete(
  "/verification/:id",
  protectAdmin,
  deleteVerification
);

export default router;
