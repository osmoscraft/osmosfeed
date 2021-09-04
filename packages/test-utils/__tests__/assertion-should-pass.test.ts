import { expect } from "../assertion";
import { describe, it } from "../scheduler";

describe("assertion should pass", () => {
  it("empty spec", async () => {});

  it("equality", async () => {
    expect(true).toEqual(true);
  });

  it("equality negated", async () => {
    expect(true).not.toEqual(false);
  });

  it("throw", async () => {
    expect(() => {
      throw new Error();
    }).toThrow();
  });

  it("specific throw", async () => {
    expect(() => {
      throw new Error();
    }).toThrow(Error);
  });

  it("promise reject", async () => {
    expect(() => {
      return Promise.reject("");
    }).toThrow();
  });

  it("async throw", async () => {
    expect(async () => {
      await Promise.resolve();
      throw new Error();
    }).toThrow();
  });

  it("no throw", async () => {
    expect(() => {}).not.toThrow();
  });

  it("no specific throw", async () => {
    expect(() => {}).not.toThrow(Error);
  });

  it("no specific throw", async () => {
    expect(() => {
      throw class {};
    }).not.toThrow(Error);
  });
});
