import { sha1 } from "./hash";

/**
 * Encode any unicode characters in the URL
 */
export function escapeUnicodeUrl(url: string): string {
  return isEncoded(url) ? url : encodeURI(url);
}

function isEncoded(url: string): boolean {
  return decodeURI(url) !== url;
}

export function resolveRelativeUrl(targetUrl: string, baseUrl: string): string | null {
  try {
    return new URL(targetUrl, baseUrl).href;
  } catch {
    return null;
  }
}

export function urlToFileString(url: string): string {
  const maxFilenameLength = 240; // excluding extention, e.g. `.json`
  const host = new URL(url).hostname.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const hash = sha1(url);
  return `${host.slice(0, maxFilenameLength - hash.length - 1)}_${hash}`;
}
