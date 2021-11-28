import { cyan, gray, red } from "./terminal";
import { InterfaceOfClass } from "./interface-of-class";
import { withBorder } from "./box-drawing";

export type ILogger = InterfaceOfClass<Logger>;

class Logger {
  heading(message: string) {
    console.log(cyan(withBorder(message)));
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

  private getTimestamp(): string {
    const now = new Date();
    return `${now.toLocaleTimeString()}`;
  }
}

export const log = new Logger();
