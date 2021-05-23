export function getFirstNonNullItem<T>(...args: (T | null)[]): T {
  const nonNullString = args.find((item): item is T => item !== null);
  if (nonNullString === undefined) throw new Error("At least one option must be a string");

  return nonNullString;
}
