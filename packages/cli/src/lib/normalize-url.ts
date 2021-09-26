/**
 * Encode any unicode characters in the URL
 */
export function normalizeUrl(url: string): string {
  return isEncoded(url) ? url : encodeURI(url);
}

/**
 * Check if a URL is already encoded
 */
function isEncoded(url: string): boolean {
  return decodeURI(url) !== url;
}
