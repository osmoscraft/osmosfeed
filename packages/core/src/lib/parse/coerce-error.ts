export function coerceError<T, P>(fn: () => T, errorAs: P): T | P {
  try {
    return fn();
  } catch {
    return errorAs;
  }
}
