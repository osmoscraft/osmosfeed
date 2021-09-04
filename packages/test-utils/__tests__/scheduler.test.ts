import { expect } from "../assertion";
import { beforeAll, beforeEach, describe, it, afterAll, afterEach } from "../scheduler";

const effects: string[] = [];

describe("scheduler", () => {
  beforeAll(async () => {
    effects.push("ba1");
  });

  beforeAll(async () => {
    effects.push("ba2");
  });

  afterAll(async () => {
    effects.push("aa1");
  });

  afterAll(async () => {
    effects.push("aa2");
  });

  beforeEach(async () => {
    effects.push("be1");
  });

  beforeEach(async () => {
    effects.push("be2");
  });

  afterEach(async () => {
    effects.push("ae1");
  });

  afterEach(async () => {
    effects.push("ae2");
  });

  it("it1", async () => {
    effects.push("it1");
  });

  it("it2", async () => {
    effects.push("it2");
  });
});

describe("scheduler (assert)", () => {
  it("handles lifecycle", async () => {
    expect(effects.join(",")).toEqual("ba1,ba2,be1,be2,it1,ae1,ae2,be1,be2,it2,ae1,ae2,aa1,aa2");
  });
});
