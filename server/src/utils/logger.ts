import { isProduction } from "../config/env.js";

// ============================================================
// Types
// ============================================================
type Level = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

// ============================================================
// Level rank — anything below this is dropped
// ============================================================
const LEVEL_RANK: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const MIN_LEVEL: Level = isProduction ? "info" : "debug";

function shouldLog(level: Level): boolean {
  return LEVEL_RANK[level] >= LEVEL_RANK[MIN_LEVEL];
}

// ============================================================
// Formatting
// ------------------------------------------------------------
// Production: single-line JSON (parsed by log aggregators)
// Development: pretty colored line with context inline
// ============================================================
const COLORS = {
  debug: "\x1B[90m", // gray
  info: "\x1B[36m", // cyan
  warn: "\x1B[33m", // yellow
  error: "\x1B[31m", // red
  reset: "\x1B[0m",
  dim: "\x1B[2m",
} as const;

function formatDev(
  level: Level,
  message: string,
  context?: LogContext,
): string {
  const time = new Date().toISOString().slice(11, 23); // "12:34:56.789"
  const color = COLORS[level];
  const label = level.toUpperCase().padEnd(5);
  const header = `${COLORS.dim}${time}${COLORS.reset} ${color}${label}${COLORS.reset} ${message}`;

  if (!context || Object.keys(context).length === 0) {
    return header;
  }

  const ctxString = formatContextDev(context);
  return `${header}\n  ${COLORS.dim}${ctxString}${COLORS.reset}`;
}

function formatContextDev(context: LogContext): string {
  return Object.entries(context)
    .map(([key, value]) => {
      if (value instanceof Error) {
        return `${key}=${value.message}`;
      }
      if (typeof value === "object") {
        try {
          return `${key}=${JSON.stringify(value)}`;
        }
        catch {
          return `${key}=[circular]`;
        }
      }
      return `${key}=${String(value)}`;
    })
    .join(" ");
}

function formatProd(
  level: Level,
  message: string,
  context?: LogContext,
): string {
  const payload = {
    level,
    time: new Date().toISOString(),
    message,
    ...sanitizeContext(context),
  };
  return JSON.stringify(payload);
}

// ============================================================
// Sanitize — never log secrets, tokens, or passwords
// ============================================================
const REDACTED_KEYS = new Set([
  "password",
  "token",
  "access_token",
  "refresh_token",
  "apiKey",
  "api_key",
  "secret",
  "authorization",
  "service_role_key",
  "stripe_secret_key",
  "resend_api_key",
  "tts_api_key",
]);

function sanitizeContext(context?: LogContext): LogContext {
  if (!context)
    return {};

  const clean: LogContext = {};
  for (const [key, value] of Object.entries(context)) {
    if (REDACTED_KEYS.has(key.toLowerCase())) {
      clean[key] = "[REDACTED]";
      continue;
    }

    if (value instanceof Error) {
      clean[key] = {
        name: value.name,
        message: value.message,
        stack: isProduction ? undefined : value.stack,
      };
      continue;
    }

    if (typeof value === "object" && value !== null) {
      try {
        clean[key] = JSON.parse(JSON.stringify(value));
      }
      catch {
        clean[key] = "[unserializable]";
      }
      continue;
    }

    clean[key] = value;
  }
  return clean;
}

// ============================================================
// Core log function
// ============================================================
function log(level: Level, message: string, context?: LogContext): void {
  if (!shouldLog(level))
    return;

  const line = isProduction
    ? formatProd(level, message, context)
    : formatDev(level, message, context);

  // Route to the correct stream — errors to stderr, everything else to stdout
  if (level === "error" || level === "warn") {
    process.stderr.write(`${line}\n`);
  }
  else {
    process.stdout.write(`${line}\n`);
  }
}

// ============================================================
// Public API
// ============================================================
export const logger = {
  debug: (message: string, context?: LogContext) =>
    log("debug", message, context),
  info: (message: string, context?: LogContext) =>
    log("info", message, context),
  warn: (message: string, context?: LogContext) =>
    log("warn", message, context),
  error: (message: string, context?: LogContext) =>
    log("error", message, context),

  /**
   * Log a child logger bound to a specific context (e.g. a userId).
   * Every subsequent log includes the bound context.
   */
  child(boundContext: LogContext) {
    return {
      debug: (message: string, context?: LogContext) =>
        log("debug", message, { ...boundContext, ...context }),
      info: (message: string, context?: LogContext) =>
        log("info", message, { ...boundContext, ...context }),
      warn: (message: string, context?: LogContext) =>
        log("warn", message, { ...boundContext, ...context }),
      error: (message: string, context?: LogContext) =>
        log("error", message, { ...boundContext, ...context }),
    };
  },
};

export type Logger = ReturnType<typeof logger.child> | typeof logger;
