export function withBorder(message: string) {
  const length = message.length;
  const output = `
╔═${drawChar("═", length)}═╗
║ ${message} ║
╚═${drawChar("═", length)}═╝
`.trim();

  return output;
}

function drawChar(char: string, count = 1) {
  return Array(count).fill(char).join("");
}
