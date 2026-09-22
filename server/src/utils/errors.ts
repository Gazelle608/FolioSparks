export class HttpError extends Error {
  status: number;
  code?: string;
  fields?: Record<string, string>;

  constructor(
    status: number,
    message: string,
    opts: { code?: string; fields?: Record<string, string> } = {},
  ) {
    super(message);
    this.status = status;
    this.code = opts.code;
    this.fields = opts.fields;
  }

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

  static conflict(message: string) {
    return new HttpError(409, message, { code: "CONFLICT" });
  }

  static tooMany(message = "Too many requests") {
    return new HttpError(429, message, { code: "RATE_LIMIT" });
  }

  static internal(message = "Internal server error") {
    return new HttpError(500, message, { code: "INTERNAL" });
  }
}
