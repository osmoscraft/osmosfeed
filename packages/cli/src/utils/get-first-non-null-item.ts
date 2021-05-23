export function getFirstNonNullItem<T>(...args: (T | null)[]): T {
  const nonNullString = args.find((item) => item !== null);
  if (!nonNullString) throw new Error("At least one option must be a string");

  return nonNullString;
}
