import { EMAIL_FROM, EMAIL_REPLY_TO, resend } from "../config/email.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import {
  renderMagicLinkEmail,
  renderPasswordResetEmail,
  renderVerificationEmail,
  renderWelcomeEmail,
} from "./emailtemplates.js";

interface SendResult {
  id: string | null;
  error: string | null;
}

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

async function sendEmail(input: SendEmailInput): Promise<SendResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo ?? EMAIL_REPLY_TO,
    });

    if (error) {
      logger.error("Email send failed", { to: input.to, error: error.message });
      return { id: null, error: error.message };
    }

    logger.info("Email sent", { to: input.to, id: data?.id });
    return { id: data?.id ?? null, error: null };
  }
  catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    logger.error("Email send threw", { to: input.to, message });
    return { id: null, error: message };
  }
}

// ---------------------------------------------------------------------------
export interface SendVerificationInput {
  to: string;
  displayName: string;
  verificationUrl: string;
  expiresInHours?: number;
}

export async function sendVerificationEmail(
  input: SendVerificationInput,
): Promise<SendResult> {
  const { subject, html, text } = renderVerificationEmail({
    displayName: input.displayName,
    verificationUrl: input.verificationUrl,
    expiresInHours: input.expiresInHours ?? 24,
    clientUrl: env.CLIENT_URL,
  });
  return sendEmail({ to: input.to, subject, html, text });
}

// ---------------------------------------------------------------------------
export interface SendWelcomeInput {
  to: string;
  displayName: string;
  source: "email" | "google";
}

export async function sendWelcomeEmail(
  input: SendWelcomeInput,
): Promise<SendResult> {
  const { subject, html, text } = renderWelcomeEmail({
    displayName: input.displayName,
    source: input.source,
    clientUrl: env.CLIENT_URL,
  });
  return sendEmail({ to: input.to, subject, html, text });
}

// ---------------------------------------------------------------------------
export interface SendPasswordResetInput {
  to: string;
  resetUrl: string;
  expiresInHours?: number;
}

export async function sendPasswordResetEmail(
  input: SendPasswordResetInput,
): Promise<SendResult> {
  const { subject, html, text } = renderPasswordResetEmail({
    resetUrl: input.resetUrl,
    expiresInHours: input.expiresInHours ?? 1,
    clientUrl: env.CLIENT_URL,
  });
  return sendEmail({ to: input.to, subject, html, text });
}

// ---------------------------------------------------------------------------
export interface SendMagicLinkInput {
  to: string;
  magicLinkUrl: string;
}

export async function sendMagicLinkEmail(
  input: SendMagicLinkInput,
): Promise<SendResult> {
  const { subject, html, text } = renderMagicLinkEmail({
    magicLinkUrl: input.magicLinkUrl,
    clientUrl: env.CLIENT_URL,
  });
  return sendEmail({ to: input.to, subject, html, text });
}
