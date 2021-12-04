import { cyan, gray, red } from "./terminal";
import { withBorder } from "./box-drawing";
import { InterfaceOfClass } from "../typings/interface-of-class";

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
