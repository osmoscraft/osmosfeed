export function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error;
}
