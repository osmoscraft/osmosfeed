const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

export function getRelativeTime(isoTime: string): string {
  const currentEpoc = Date.now();
  const sourceEpoc = new Date(isoTime).getTime();
  const relativeDays = Math.floor((sourceEpoc - currentEpoc) / 1000 / 60 / 60 / 24);
  return rtf.format(relativeDays, "day");
}
