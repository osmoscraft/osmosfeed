import { expect } from "../assertion";
import { beforeAll, beforeEach, describe, it } from "../scheduler";

describe("assertion should fail", () => {
  it("error", async () => {
    throw Error();
  });

  it("equality", async () => {
    await expect(true).not.toEqual(true);
  });

  it("equality negated", async () => {
    await expect(true).toEqual(false);
  });

  it("throw", async () => {
    await expect(() => {
      throw new Error();
    }).not.toThrow();
  });

  it("specific throw", async () => {
    await expect(() => {
      throw new Error();
    }).not.toThrow(Error);
  });

  it("promise reject", async () => {
    await expect(() => {
      return Promise.reject("");
    }).not.toThrow();
  });

  it("async throw", async () => {
    await expect(async () => {
      await Promise.resolve();
      throw new Error();
    }).not.toThrow();
  });

  it("no throw", async () => {
    await expect(() => {}).toThrow();
  });

  it("no specific throw", async () => {
    await expect(() => {}).toThrow(Error);
  });

  it("no specific throw", async () => {
    await expect(() => {
      throw class {};
    }).toThrow(Error);
  });
});
