class Logger {
  private isSilent = false;

  info(info: string) {
    this.isSilent || console.log(info);
  }

  error(error: string) {
    this.isSilent || console.log(error);
  }

  setSilent(isSilent: boolean) {
    this.isSilent = isSilent;
  }
}

export const logger = new Logger();
