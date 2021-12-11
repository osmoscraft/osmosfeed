import crypto from "crypto";

export function sha256(input: string): string {
  const hash = crypto.createHash("sha256").update(input).digest();
  return hash.toString("hex");
}
