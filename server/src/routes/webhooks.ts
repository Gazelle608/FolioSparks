import { type Request, type Response, Router } from "express";

import { sendWelcomeIfFirstTime } from "../services/authservice.js";
import { logger } from "../utils/logger.js";

const router = Router();

// POST /api/webhooks/supabase-auth
router.post("/supabase-auth", async (req: Request, res: Response) => {
  try {
    const payload = req.body as {
      type: string;
      record?: {
        id: string;
        email?: string;
        app_metadata?: { provider?: string };
      };
      user?: {
        id: string;
        email?: string;
        app_metadata?: { provider?: string };
      };
    };

    logger.info("Received Supabase auth webhook", { type: payload.type });

    if (payload.type === "user.created") {
      const user = payload.record ?? payload.user;
      if (user?.id && user.email) {
        const provider = user.app_metadata?.provider ?? "email";
        if (provider === "google") {
          await sendWelcomeIfFirstTime(user.id, "google");
        }
      }
    }

    if (payload.type === "user.confirmed") {
      const user = payload.record ?? payload.user;
      if (user?.id) {
        await sendWelcomeIfFirstTime(user.id, "email");
      }
    }

    return res.json({ ok: true });
  }
  catch (error) {
    logger.error("Webhook failed", { error });
    return res.json({ ok: true });
  }
});

export default router;
