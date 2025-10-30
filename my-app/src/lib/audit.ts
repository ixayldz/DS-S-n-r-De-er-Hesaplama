import { appendFile } from "node:fs/promises";

interface AuditEntry {
  event: string;
  ip?: string | null;
  meta?: Record<string, unknown>;
  level?: "info" | "warn" | "error";
}

const LOG_PATH = process.env.AUDIT_LOG_PATH ?? "./audit.log";
const WEBHOOK = process.env.AUDIT_WEBHOOK_URL;

export async function writeAuditLog(entry: AuditEntry) {
  const payload = {
    timestamp: new Date().toISOString(),
    level: entry.level ?? "info",
    event: entry.event,
    ip: entry.ip ?? undefined,
    meta: entry.meta,
  };

  console.log("[AUDIT]", JSON.stringify(payload));

  try {
    await appendFile(LOG_PATH, `${JSON.stringify(payload)}\n`);
  } catch (error) {
    console.warn("AUDIT_LOG_APPEND_FAILED", error);
  }

  if (WEBHOOK) {
    fetch(WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  }
}
