export function isNotNull<T>(maybeNull: T | null): maybeNull is T {
  return maybeNull !== null;
}
