const MINUTES_PER_MS = 1000 * 60;

export function getTimeWithOffset(baseTimestamp: number, offsetInMinutes: number) {
  return baseTimestamp - offsetInMinutes * 60 * 1000;
}

export function getDateFromIsoString(isoTimeString: string): string {
  return isoTimeString.split("T")[0];
}

export function getIsoTimeZeroOffset(isoTimeString: string): string {
  return new Date(isoTimeString).toISOString();
}

export function getIsoTimeWithOffset(utcIsoString: string, offsetInMinutes: number): string {
  const date = new Date(utcIsoString);
  const offsetTime = getTimeWithOffset(date.getTime(), offsetInMinutes);
  const isoStirng = new Date(offsetTime).toISOString();

  return isoStirng;
}

export function getOffsetFromTimezoneName(timezone: string) {
  return (
    Math.floor(new Date(new Date().toLocaleString("sv", { timeZone: "UTC" })).getTime() / MINUTES_PER_MS) -
    Math.floor(new Date(new Date().toLocaleString("sv", { timeZone: timezone })).getTime() / MINUTES_PER_MS)
  );
}
