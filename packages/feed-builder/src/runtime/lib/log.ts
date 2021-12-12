import { cyan, gray, red } from "./terminal";
import { InterfaceOfClass } from "../../types/interface-of-class";

export type ILogger = InterfaceOfClass<Logger>;

class Logger {
  heading(message: string) {
    console.log(cyan(this.withBorder(message)));
  }

  error(...args: Parameters<typeof console["error"]>) {
    const [message, ...rest] = args;
    console.error(`${red(`[ERROR]`)} ${this.getTimestamp()} ${message}`, ...rest);
  }
  info(...args: Parameters<typeof console["log"]>) {
    const [message, ...rest] = args;
    console.log(`${cyan(`[INFO]`)} ${this.getTimestamp()} ${message}`, ...rest);
  }
  trace(...args: Parameters<typeof console["log"]>) {
    const [message, ...rest] = args;
    console.log(gray(`[TRACE] ${this.getTimestamp()} ${message}`), ...rest);
  }

  private withBorder(message: string) {
    const length = message.length;
    const output = `
╔═${this.drawChar("═", length)}═╗
║ ${message} ║
╚═${this.drawChar("═", length)}═╝
`.trim();

    return output;
  }

  private drawChar(char: string, count = 1) {
    return Array(count).fill(char).join("");
  }

  private getTimestamp(): string {
    const now = new Date();
    return `${now.toLocaleTimeString()}`;
  }
}

export const log = new Logger();
