export function notNullish<T>(maybeNull: T | undefined | null, message?: string) {
  if (maybeNull === undefined || maybeNull === null) throw new Error(message ?? "Not null assertion failed");

  return maybeNull;
}
