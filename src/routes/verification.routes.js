import express from "express";
import { publicVerify } from "../controllers/verification.controller.js";
import { getDynamicBadgeSvg } from "../controllers/badge.controller.js";

const router = express.Router();

/**
 * @route   GET /api/verify/:id
 * @desc    Public registry verification lookup (JSON data)
 * @access  Public
 */
router.get("/verify/:id", publicVerify);

/**
 * @route   GET /api/badge/:id
 * @route   GET /api/badge/:id.svg
 * @route   GET /api/verify/:id/badge.svg
 * @desc    Dynamic Real-Time SVG Trust Badge for website embeds
 * @access  Public
 */
router.get("/badge/:id", getDynamicBadgeSvg);
router.get("/verify/:id/badge.svg", getDynamicBadgeSvg);

export default router;
