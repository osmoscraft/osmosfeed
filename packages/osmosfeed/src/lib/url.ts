import { URL } from "url";

export function isUrl(maybeUrl = "", protocols = ["http:", "https:"] as string[]): maybeUrl is string {
  try {
    const url = new URL(maybeUrl);
    return !!url.protocol && protocols.includes(url.protocol);
  } catch (err) {
    return false;
  }
}
