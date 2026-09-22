// ============================================================
// HttpError — the only error class services should throw
// ------------------------------------------------------------
// Errors carry an HTTP status, a machine-readable code, and
// optional field-level validation messages. The central error
// handler knows how to format all three.
// ============================================================
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string>;
  readonly isOperational: boolean;

  constructor(
    status: number,
    message: string,
    opts: {
      code?: string;
      fields?: Record<string, string>;
      isOperational?: boolean;
    } = {},
  ) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = opts.code ?? "HTTP_ERROR";
    this.fields = opts.fields;
    this.isOperational = opts.isOperational ?? true;

    // Preserve stack in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }

  // ==========================================================
  // 4xx factories
  // ==========================================================
  static badRequest(message: string, fields?: Record<string, string>) {
    return new HttpError(400, message, { code: "BAD_REQUEST", fields });
  }

  static unauthorized(message = "Not authenticated") {
    return new HttpError(401, message, { code: "UNAUTHORIZED" });
  }

  static forbidden(message = "Not allowed") {
    return new HttpError(403, message, { code: "FORBIDDEN" });
  }

  static notFound(message = "Not found") {
    return new HttpError(404, message, { code: "NOT_FOUND" });
  }

  static methodNotAllowed(message = "Method not allowed") {
    return new HttpError(405, message, { code: "METHOD_NOT_ALLOWED" });
  }

  static conflict(message: string) {
    return new HttpError(409, message, { code: "CONFLICT" });
  }

  static gone(message = "Resource no longer available") {
    return new HttpError(410, message, { code: "GONE" });
  }

  static payloadTooLarge(message = "Payload too large") {
    return new HttpError(413, message, { code: "PAYLOAD_TOO_LARGE" });
  }

  static unsupportedMedia(message = "Unsupported media type") {
    return new HttpError(415, message, { code: "UNSUPPORTED_MEDIA" });
  }

  static validation(fields: Record<string, string>) {
    return new HttpError(422, "Validation failed", {
      code: "VALIDATION_ERROR",
      fields,
    });
  }

  static tooMany(message = "Too many requests") {
    return new HttpError(429, message, { code: "RATE_LIMIT" });
  }

  // ==========================================================
  // Special: paywall (used for the chapter-4+ gate)
  // ==========================================================
  static paywall(message = "Sign up required") {
    return new HttpError(402, message, { code: "SIGNUP_REQUIRED" });
  }

  // ==========================================================
  // 5xx factories
  // ==========================================================
  static internal(message = "Internal server error") {
    return new HttpError(500, message, {
      code: "INTERNAL",
      isOperational: false,
    });
  }

  static notImplemented(message = "Not implemented") {
    return new HttpError(501, message, { code: "NOT_IMPLEMENTED" });
  }

  static badGateway(message = "Upstream service failed") {
    return new HttpError(502, message, { code: "BAD_GATEWAY" });
  }

  static serviceUnavailable(message = "Service unavailable") {
    return new HttpError(503, message, { code: "SERVICE_UNAVAILABLE" });
  }

  static timeout(message = "Request timed out") {
    return new HttpError(504, message, { code: "TIMEOUT" });
  }
}

// ============================================================
// Type guard — used by the error handler
// ============================================================
export function isHttpError(err: unknown): err is HttpError {
  return err instanceof HttpError;
}

// ============================================================
// Serialize for API responses
// ============================================================
export function serializeError(err: HttpError): {
  error: string;
  code: string;
  fields?: Record<string, string>;
} {
  return {
    error: err.message,
    code: err.code,
    ...(err.fields ? { fields: err.fields } : {}),
  };
}
