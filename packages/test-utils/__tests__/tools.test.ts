import { expect } from "../assertion";
import { describe, it } from "../scheduler";
import { flushAsync } from "../tools";

describe("tools", () => {
  it("flushAsync (without)", async () => {
    let called = false;

    new Promise(() => {
      setTimeout(() => {
        called = true;
      }, 0);
    });

    expect(called).toEqual(false);
  });

  it("flushAsync (with)", async () => {
    let called = false;

    new Promise(() => {
      setTimeout(() => {
        called = true;
      }, 0);
    });

    await flushAsync();

    expect(called).toEqual(true);
  });
});
