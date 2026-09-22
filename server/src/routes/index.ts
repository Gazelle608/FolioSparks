import { Router } from "express";

import analyticsRoutes from "./analytics.js";
import audioRoutes from "./audio.js";
import authRoutes from "./auth.js";
import chapterRoutes from "./chapters.js";
import deskRoutes from "./desks.js";
import pollRoutes from "./polls.js";
import sparkRoutes from "./sparks.js";
import storyRoutes from "./stories.js";

const router = Router();

// ============================================================
// Health check — no auth, no rate limit
// ============================================================
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
    env: globalThis.process?.env?.NODE_ENV ?? "development",
  });
});

// ============================================================
// Resource routers
// ============================================================
router.use("/auth", authRoutes);
router.use("/stories", storyRoutes);
router.use("/chapters", chapterRoutes); // top-level /api/chapters/:id/...
router.use("/sparks", sparkRoutes);
router.use("/polls", pollRoutes);
router.use("/desks", deskRoutes);
router.use("/audio", audioRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
