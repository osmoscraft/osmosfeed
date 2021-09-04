const RESET = `\x1b[0m\x1b[0m`;

export function red(input: string) {
  return `\x1b[31m${input}\x1b[89m${RESET}`;
}

export function green(input: string) {
  return `\x1b[32m${input}\x1b[89m${RESET}`;
}

export function yellow(input: string) {
  return `\x1b[33m${input}\x1b[89m${RESET}`;
}

export function blue(input: string) {
  return `\x1b[34m${input}\x1b[89m${RESET}`;
}

export function gray(input: string) {
  return `\x1b[90m${input}\x1b[89m${RESET}`;
}

export function bold(input: string) {
  return `\x1b[1m${input}\x1b[22m${RESET}`;
}
