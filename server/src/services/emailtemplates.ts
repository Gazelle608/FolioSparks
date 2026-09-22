// ============================================================
// Email templates — shared HTML + plain-text renderers
// ------------------------------------------------------------
// Every renderer returns `{ subject, html, text }`, which is exactly
// what services/emailService.ts hands to Resend.
//
// Constraints for email HTML:
//   • Inline styles only (Gmail strips <style> blocks in some clients)
//   • Tables for layout, not flex/grid
//   • Web-safe font stacks (Merriweather/Inter fall back to Georgia/Arial)
//   • Every email has a plain-text alternative
// ============================================================

// ------------------------------------------------------------
// Brand tokens — mirrors client/src/styles/variables.css
// ------------------------------------------------------------
const BRAND = {
  navy: "#0a0f2c",
  navySoft: "#1a2255",
  accent: "#8b7ba5",
  spark: "#f4c77a",
  surface: "#ffffff",
  background: "#e8e4ef",
  textPrimary: "#0a0f2c",
  textSecondary: "#2a3566",
  textMuted: "#5a6493",
  border: "#c7c1dc",
} as const;

const FONT_DISPLAY = "Merriweather, Georgia, 'Times New Roman', serif";
const FONT_BODY = "Inter, Helvetica, Arial, sans-serif";

// ============================================================
// Types
// ============================================================
export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

// ============================================================
// Helpers
// ============================================================
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function firstName(displayName: string): string {
  const trimmed = displayName.trim();
  if (!trimmed)
    return "there";
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

function button(label: string, url: string): string {
  return `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td align="center" bgcolor="${BRAND.spark}" style="border-radius:10px;">
                    <a href="${url}" style="display:inline-block;padding:14px 28px;font-family:${FONT_BODY};font-size:16px;font-weight:700;color:${BRAND.navy};text-decoration:none;border-radius:10px;">${label}</a>
                  </td>
                </tr>
              </table>`;
}

function paragraph(html: string): string {
  return `
              <p style="margin:0 0 16px;font-family:${FONT_BODY};font-size:16px;line-height:1.6;color:${BRAND.textSecondary};">${html}</p>`;
}

function linkFallback(url: string): string {
  return `
              <p style="margin:24px 0 0;font-family:${FONT_BODY};font-size:13px;line-height:1.6;color:${BRAND.textMuted};">
                Button not working? Paste this link into your browser:<br />
                <a href="${url}" style="color:${BRAND.navySoft};word-break:break-all;">${url}</a>
              </p>`;
}

function footer(clientUrl: string, note: string): string {
  return `
              <tr>
                <td style="padding:8px 40px 36px;">
                  <div style="height:1px;background:${BRAND.border};margin-bottom:20px;"></div>
                  <p style="margin:0;font-family:${FONT_BODY};font-size:12px;line-height:1.6;color:${BRAND.textMuted};">
                    ${note}
                  </p>
                  <p style="margin:12px 0 0;font-family:${FONT_BODY};font-size:12px;line-height:1.6;color:${BRAND.textMuted};">
                    <a href="${clientUrl}" style="color:${BRAND.textMuted};text-decoration:underline;">${escapeHtml(clientUrl)}</a>
                  </p>
                </td>
              </tr>`;
}

interface LayoutInput {
  /** Hidden inbox preview line */
  preheader: string;
  heading: string;
  body: string;
  clientUrl: string;
  footerNote: string;
}

function layout({
  preheader,
  heading,
  body,
  clientUrl,
  footerNote,
}: LayoutInput): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.background};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.background};">
      <tr>
        <td align="center" style="padding:32px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:16px;overflow:hidden;">
            <tr>
              <td bgcolor="${BRAND.navy}" style="padding:28px 40px;">
                <span style="font-family:${FONT_DISPLAY};font-size:20px;font-weight:700;color:${BRAND.surface};letter-spacing:0.02em;">FolioSparks</span>
                <span style="font-family:${FONT_BODY};font-size:12px;color:${BRAND.spark};letter-spacing:0.14em;text-transform:uppercase;">&nbsp;Stories that glow</span>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 40px 8px;">
                <h1 style="margin:0 0 20px;font-family:${FONT_DISPLAY};font-size:24px;line-height:1.3;font-weight:700;color:${BRAND.textPrimary};">${escapeHtml(heading)}</h1>
                ${body}
              </td>
            </tr>
            ${footer(clientUrl, footerNote)}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}


// ============================================================
// Verification — POST /api/auth/register + resend-verification
// ============================================================
export interface RenderVerificationInput {
  displayName: string;
  verificationUrl: string;
  expiresInHours: number;
  clientUrl: string;
}

export function renderVerificationEmail({
  displayName,
  verificationUrl,
  expiresInHours,
  clientUrl,
}: RenderVerificationInput): RenderedEmail {
  const name = firstName(displayName);
  const heading = "Confirm your email";

  const html = layout({
    preheader: `One click and your FolioSparks account is ready, ${name}.`,
    heading,
    clientUrl,
    footerNote:
      "You received this email because someone signed up for FolioSparks with this address. If that wasn't you, you can safely ignore it.",
    body: [
      paragraph(
        `Welcome, ${escapeHtml(name)}. You're one click away from writing, reading, and sparking stories.`,
      ),
      paragraph(
        `Confirm your email address to activate your account. This link expires in ${expiresInHours} hours.`,
      ),
      button("Confirm my email", verificationUrl),
      linkFallback(verificationUrl),
    ].join(""),
  });

  const text = [
    `Welcome, ${name}.`,
    "",
    "Confirm your email address to activate your FolioSparks account:",
    verificationUrl,
    "",
    `This link expires in ${expiresInHours} hours.`,
    "If you didn't sign up, you can safely ignore this email.",
    "",
    clientUrl,
  ].join("\n");

  return { subject: "Confirm your FolioSparks email", html, text };
}

// ============================================================
// Welcome — sent after a verified signup
// ============================================================
export interface RenderWelcomeInput {
  displayName: string;
  source: "email" | "google";
  clientUrl: string;
}

export function renderWelcomeEmail({
  displayName,
  source,
  clientUrl,
}: RenderWelcomeInput): RenderedEmail {
  const name = firstName(displayName);
  const isGoogle = source === "google";

  const setupLine = isGoogle
    ? "You're signed in with Google, so there's no password to remember. Your profile is ready to customise."
    : "Your email is confirmed and your account is fully active.";

  const html = layout({
    preheader: `Your FolioSparks account is ready, ${name}.`,
    heading: `Welcome to FolioSparks, ${name}`,
    clientUrl,
    footerNote:
      "You're receiving this because you created a FolioSparks account. Manage your emails from your account settings.",
    body: [
      paragraph(setupLine),
      paragraph("Here's how to get started:"),
      paragraph(
        `<strong style="color:${BRAND.textPrimary};">1. Pick a pen name</strong><br />Your author profile takes about a minute to set up — add a tagline and an avatar so readers recognise you.`,
      ),
      paragraph(
        `<strong style="color:${BRAND.textPrimary};">2. Publish your first story</strong><br />Draft chapter by chapter, or upload a full manuscript and let FolioSparks schedule it for you.`,
      ),
      paragraph(
        `<strong style="color:${BRAND.textPrimary};">3. Earn Sparks</strong><br />Readers send Sparks to chapters they love. Your first 100 Sparks are already in your balance.`,
      ),
      button("Open my desk", `${clientUrl}/studio`),
      linkFallback(`${clientUrl}/studio`),
    ].join(""),
  });

  const text = [
    `Welcome to FolioSparks, ${name}.`,
    "",
    setupLine,
    "",
    "Get started:",
    `1. Pick a pen name — ${clientUrl}/settings`,
    `2. Publish your first story — ${clientUrl}/studio`,
    "3. Earn Sparks — your first 100 Sparks are already in your balance.",
    "",
    `Open your desk: ${clientUrl}/studio`,
  ].join("\n");

  return { subject: `Welcome to FolioSparks, ${name}`, html, text };
}

// ============================================================
// Password reset — POST /api/auth/forgot-password
// ============================================================
export interface RenderPasswordResetInput {
  resetUrl: string;
  expiresInHours: number;
  clientUrl: string;
}

export function renderPasswordResetEmail({
  resetUrl,
  expiresInHours,
  clientUrl,
}: RenderPasswordResetInput): RenderedEmail {
  const expiryNote = `${expiresInHours} hour${expiresInHours === 1 ? "" : "s"}`;

  const html = layout({
    preheader: "Reset your FolioSparks password.",
    heading: "Reset your password",
    clientUrl,
    footerNote:
      "You received this email because a password reset was requested for your FolioSparks account. If you didn't request it, no action is needed — your password stays the same.",
    body: [
      paragraph(
        "We received a request to reset the password for your FolioSparks account.",
      ),
      paragraph(
        `Choose a new password using the button below. The link expires in ${expiryNote}.`,
      ),
      button("Choose a new password", resetUrl),
      linkFallback(resetUrl),
    ].join(""),
  });

  const text = [
    "Reset your FolioSparks password",
    "",
    "We received a request to reset the password for your FolioSparks account.",
    `Choose a new password here (expires in ${expiryNote}):`,
    resetUrl,
    "",
    "If you didn't request a reset, you can ignore this email — your password will not change.",
    "",
    clientUrl,
  ].join("\n");

  return { subject: "Reset your FolioSparks password", html, text };
}

// ============================================================
// Magic link — passwordless sign-in
// ============================================================
export interface RenderMagicLinkInput {
  magicLinkUrl: string;
  clientUrl: string;
}

export function renderMagicLinkEmail({
  magicLinkUrl,
  clientUrl,
}: RenderMagicLinkInput): RenderedEmail {
  const html = layout({
    preheader: "Your one-time FolioSparks sign-in link.",
    heading: "Your sign-in link",
    clientUrl,
    footerNote:
      "This link can only be used once and expires shortly. If you didn't try to sign in, you can safely ignore this email.",
    body: [
      paragraph(
        "Tap the button below to sign in to FolioSparks. No password needed.",
      ),
      button("Sign in to FolioSparks", magicLinkUrl),
      linkFallback(magicLinkUrl),
    ].join(""),
  });

  const text = [
    "Sign in to FolioSparks",
    "",
    "Use this one-time link to sign in — no password needed:",
    magicLinkUrl,
    "",
    "If you didn't try to sign in, you can safely ignore this email.",
    "",
    clientUrl,
  ].join("\n");

  return { subject: "Your FolioSparks sign-in link", html, text };
}

// ============================================================
// Exports for tests / future templates
// ============================================================
export { BRAND as EMAIL_BRAND, escapeHtml, layout as renderEmailLayout };
