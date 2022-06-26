import { createHash } from "crypto";

export function sha1(input: string): string {
  const hash = createHash("sha1");
  hash.update(input);

  return hash.digest("hex");
}

export function md5(input: string): string {
  const hash = createHash("md5");
  hash.update(input);

  return hash.digest("hex");
}
