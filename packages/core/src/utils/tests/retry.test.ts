import { describe, expect, it } from "vitest";
import { withAsyncRetry } from "../retry";

describe("withAsyncRetry", () => {
  it("Compiles", () => {
    const fn = withAsyncRetry(async () => {}, { retry: 3, delay: 1000 });
    expect(typeof fn).toBe("function");
  });

  it("Executes 1st time", async () => {
    const runOutput: any[] = [];
    const fn = withAsyncRetry(
      async () => {
        runOutput.push("1");
      },
      { retry: 3, delay: 1000 }
    );
    await fn();

    expect(runOutput).toEqual(["1"]);
  });

  it("Throws on error", async () => {
    const fn = withAsyncRetry(
      async () => {
        throw new Error();
      },
      { retry: 0, delay: 1000 }
    );

    expect(() => fn()).rejects.toThrow();
  });

  it("Throws on error after exhausting retries", async () => {
    let tryCount = 0;
    const fn = withAsyncRetry(
      async () => {
        tryCount++;
        throw new Error();
      },
      { retry: 3, delay: 1 }
    );

    await expect(() => fn()).rejects.toThrow();
    expect(tryCount).toBe(4);
  });

  it("Recovers after 1 retry", async () => {
    let tryCount = 0;
    let successCount = 0;
    const fn = withAsyncRetry(
      async () => {
        if (tryCount === 0) {
          tryCount++;
          throw new Error();
        } else {
          successCount++;
        }
      },
      { retry: 3, delay: 1 }
    );

    await fn();
    expect(tryCount).toBe(1);
    expect(successCount).toBe(1);
  });
});
