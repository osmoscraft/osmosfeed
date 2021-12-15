import { cyan, gray, red } from "../lib/terminal";
import { ILogApi } from "../../types/plugin";

export class LogApi implements ILogApi {
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
