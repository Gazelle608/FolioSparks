import { env } from "../config/env.js";
import { supabaseAdmin } from "../config/supabase.js";
import { logger } from "../utils/logger.js";
import { sendVerificationEmail, sendWelcomeEmail } from "./emailservice.js";

// ============================================================
// Types
// ============================================================
export interface SignUpInput {
  email: string;
  password: string;
  username: string;
  displayName: string;
}

export interface SignUpResult {
  userId: string | null;
  needsVerification: boolean;
  error: string | null;
}

// ============================================================
// Email/password signup
// ============================================================
export async function signUpWithEmail(
  input: SignUpInput,
): Promise<SignUpResult> {
  const { email, password, username, displayName } = input;

  const { data: created, error: createError }
    = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        username: username.toLowerCase(),
        display_name: displayName,
      },
    });

  if (createError || !created.user) {
    logger.error("Failed to create auth user", {
      email,
      error: createError?.message,
    });
    return {
      userId: null,
      needsVerification: false,
      error: createError?.message ?? "Could not create account",
    };
  }

  const userId = created.user.id;

  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      redirectTo: `${env.CLIENT_URL}/auth/callback?type=email_verified`,
    },
  });

  if (linkError || !linkData?.properties?.action_link) {
    logger.error("Failed to generate verification link", {
      userId,
      error: linkError?.message,
    });
    return {
      userId,
      needsVerification: true,
      error: "Account created but verification email could not be sent",
    };
  }

  const emailResult = await sendVerificationEmail({
    to: email,
    displayName,
    verificationUrl: linkData.properties.action_link,
    expiresInHours: 24,
  });

  if (emailResult.error) {
    logger.error("Verification email send failed", {
      userId,
      error: emailResult.error,
    });
    return {
      userId,
      needsVerification: true,
      error: "Account created but verification email failed to send",
    };
  }

  return { userId, needsVerification: true, error: null };
}

// ============================================================
// Welcome email (fires once)
// ============================================================
export async function sendWelcomeIfFirstTime(
  userId: string,
  source: "email" | "google",
): Promise<{ sent: boolean; error: string | null }> {
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (userError || !userData.user) {
    return { sent: false, error: "User not found" };
  }

  const user = userData.user;

  if (user.user_metadata?.welcome_sent) {
    return { sent: false, error: null };
  }

  const displayName = (user.user_metadata?.display_name as string | undefined) || user.email?.split("@")[0] || "reader";

  const result = await sendWelcomeEmail({
    to: user.email!,
    displayName,
    source,
  });

  if (result.error)
    return { sent: false, error: result.error };

  await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...user.user_metadata,
      welcome_sent: true,
      welcome_sent_at: new Date().toISOString(),
    },
  });

  return { sent: true, error: null };
}
