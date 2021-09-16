export function getNonEmptyStringOrNull(input?: string): string | null {
  const trimmed = input?.trim?.();
  if (!trimmed?.length) return null;

  return trimmed;
}
