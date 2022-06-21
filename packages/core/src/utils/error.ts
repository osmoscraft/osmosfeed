/**
 * Cast any object error to Error
 */
export function asError(e: unknown): Error {
  return e instanceof Error ? e : new Error("Unknown error");
}

export function extractError<ValueType>(maybeError?: ValueType | Error): [value: ValueType, error: Error | undefined] {
  return [maybeError as ValueType, maybeError instanceof Error ? maybeError : undefined];
}

export function undefinedAsError<T>(e: T | undefined): T | Error {
  return e === undefined ? new Error(`${e} is undefined`) : e;
}
