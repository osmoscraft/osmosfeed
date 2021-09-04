import { afterAll, afterEach, beforeAll, beforeEach, describe, it } from "../scheduler";

describe("assertion lifecycle fail", () => {
  beforeAll(() => {
    throw Error();
  });

  it("spec", async () => {});
});

describe("assertion lifecycle fail", () => {
  beforeEach(() => {
    throw Error();
  });

  it("spec", async () => {});
});

describe("assertion lifecycle fail", () => {
  afterEach(() => {
    throw Error();
  });

  it("spec", async () => {});
});

describe("assertion lifecycle fail", () => {
  afterAll(() => {
    throw Error();
  });

  it("spec", async () => {});
});
