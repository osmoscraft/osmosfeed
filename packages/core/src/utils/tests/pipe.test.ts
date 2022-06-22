import { describe, expect, it } from "vitest";
import { pipe } from "../pipe";

describe("asyncVectorPipe", () => {
  it("empty", async () => {
    const mockPipe = pipe(() => []);
    expect(mockPipe).toBeDefined();
  });

  it("empty mockPipe mirrors input", async () => {
    const mockPipe = pipe(() => [1]);
    const output = await mockPipe();
    expect(output).toEqual([1]);
  });

  it("single map", async () => {
    const mockPipe = pipe(
      () => [1],
      (i: number) => i * 2
    );
    const output = await mockPipe();
    expect(output).toEqual([2]);
  });

  it("single async map", async () => {
    const mockPipe = pipe(
      () => [1],
      async (i: number) => i * 2
    );
    const output = await mockPipe();
    expect(output).toEqual([2]);
  });

  it("single async map on multiple elements", async () => {
    const mockPipe = pipe(
      () => [1, 2, 3],
      async (i: number) => i * 2
    );
    const output = await mockPipe();
    expect(output).toEqual([2, 4, 6]);
  });

  it("single async map on zero elements", async () => {
    const mockPipe = pipe(
      () => [],
      async (i: number) => i * 2
    );
    const output = await mockPipe();
    expect(output).toEqual([]);
  });

  it("multi async maps", async () => {
    const mockPipe = pipe(
      () => [1, 2, 3],
      async (i: number) => i + 1,
      async (i: number) => i * 2
    );
    const output = await mockPipe();
    expect(output).toEqual([4, 6, 8]);
  });

  it("concurrency: normal order", async () => {
    const records: any[] = [];

    let step1BaseIndex = 0;
    let step2BaseIndex = 2;

    const mockOutputs = [0, 1, 2, 3].map((index) => {
      let resolveFn!: (v: any) => any;
      const value = new Promise(
        (resolve) =>
          (resolveFn = (v: any) => {
            records.push(index);
            resolve(v);
          })
      );

      return {
        resolve: resolveFn,
        value,
      };
    });

    const mockPipe = pipe(
      () => ["", ""],
      () => mockOutputs[step1BaseIndex++].value,
      () => mockOutputs[step2BaseIndex++].value
    );

    const resultAsync = mockPipe();

    [0, 1, 2, 3].forEach((i) => mockOutputs[i].resolve(""));

    await resultAsync;

    expect(records).toEqual([0, 1, 2, 3]);
  });

  it("concurrency: in-step mockPipe reordering", async () => {
    const records: any[] = [];

    let step1BaseIndex = 0;
    let step2BaseIndex = 2;

    const mockOutputs = [0, 1, 2, 3].map((index) => {
      let resolveFn!: (v: any) => any;
      const value = new Promise(
        (resolve) =>
          (resolveFn = (v: any) => {
            records.push(index);
            resolve(v);
          })
      );

      return {
        resolve: resolveFn,
        value,
      };
    });

    const mockPipe = pipe(
      () => ["", ""],
      () => mockOutputs[step1BaseIndex++].value,
      () => mockOutputs[step2BaseIndex++].value
    );

    const resultAsync = mockPipe();

    [1, 0, 2, 3].forEach((i) => mockOutputs[i].resolve(""));

    await resultAsync;

    expect(records).toEqual([1, 0, 2, 3]);
  });

  it("concurrency: full mockPipe reordering", async () => {
    const records: any[] = [];

    let step1BaseIndex = 0;
    let step2BaseIndex = 2;

    const mockOutputs = [0, 1, 2, 3].map((index) => {
      let resolveFn!: (v: any) => any;
      const value = new Promise(
        (resolve) =>
          (resolveFn = (v: any) => {
            records.push(index);
            resolve(v);
          })
      );

      return {
        resolve: resolveFn,
        value,
      };
    });

    const mockPipe = pipe(
      () => ["", ""],
      () => mockOutputs[step1BaseIndex++].value,
      () => mockOutputs[step2BaseIndex++].value
    );

    const resultAsync = mockPipe();

    [2, 3, 0, 1].forEach((i) => mockOutputs[i].resolve(""));

    await resultAsync;

    expect(records).toEqual([2, 3, 0, 1]);
  });
});
