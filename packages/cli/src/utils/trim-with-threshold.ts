export function trimWithThreshold(input: string, activationThreshold: number, trimTo: number): string {
  return input.length > activationThreshold ? `${input.slice(0, trimTo)}…` : input;
}
