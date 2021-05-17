export function getHostnameFromUrl(url?: string | null): string | null {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (e) {
    console.error(e);
    return null;
  }
}
