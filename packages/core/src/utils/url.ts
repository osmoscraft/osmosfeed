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
