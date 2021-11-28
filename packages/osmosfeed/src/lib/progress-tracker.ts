export interface ProgressSummary {
  total: number;
  current: number;
}

class ProgressTracker {
  private total = 0;
  private progress = 0;

  getProgress(): ProgressSummary {
    return {
      total: this.total,
      current: this.progress,
    };
  }

  toString(): string {
    return `(${this.progress}/${this.total})`;
  }

  increaseTaskCount(count = 1) {
    this.total += count;
  }

  increaseProgressCount(count = 1) {
    this.progress += count;
  }
}

export const progress = new ProgressTracker();
