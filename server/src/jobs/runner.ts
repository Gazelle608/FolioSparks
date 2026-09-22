import { logger } from "../utils/logger.js";

// ============================================================
// Guard against concurrent runs
// ------------------------------------------------------------
// If a job takes longer than its schedule interval, the next tick
// would otherwise start a second copy. This lock keeps it single-flight.
// ============================================================
const running = new Set<string>();

// ============================================================
// wrapJob — run a job with logging + overlap protection
// ============================================================
export async function wrapJob(
  name: string,
  fn: () => Promise<number | void>,
): Promise<void> {
  if (running.has(name)) {
    logger.warn(`Job "${name}" skipped — previous run still in progress`);
    return;
  }

  running.add(name);
  const startedAt = Date.now();

  try {
    logger.info(`Job "${name}" started`);
    const result = await fn();

    const elapsed = Date.now() - startedAt;
    logger.info(`Job "${name}" finished`, {
      elapsedMs: elapsed,
      ...(typeof result === "number" ? { processed: result } : {}),
    });
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Job "${name}" failed`, {
      elapsedMs: Date.now() - startedAt,
      error: message,
    });
    // Swallow — the next cron tick will retry
  }
  finally {
    running.delete(name);
  }
}
