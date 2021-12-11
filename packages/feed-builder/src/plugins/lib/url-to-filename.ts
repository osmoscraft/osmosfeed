import crypto from "crypto";

export function urlToFilename(url: string): string {
  const hash = crypto.createHash("sha256").update(url).digest();
  return hash.toString("hex");
}
