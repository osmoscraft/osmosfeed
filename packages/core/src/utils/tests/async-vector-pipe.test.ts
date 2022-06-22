import { describe, expect, it } from "vitest";
import { asyncVectorPipe } from "../async-vector-pipe";

describe("asyncVectorPipe", () => {
  it("empty", async () => {
    const pipe = asyncVectorPipe(() => []);
    expect(pipe).toBeDefined();
  });

  it("empty pipe mirrors input", async () => {
    const pipe = asyncVectorPipe(() => [1]);
    const output = await pipe();
    expect(output).toEqual([1]);
  });

  it("single map", async () => {
    const pipe = asyncVectorPipe(
      () => [1],
      (i: number) => i * 2
    );
    const output = await pipe();
    expect(output).toEqual([2]);
  });

  it("single async map", async () => {
    const pipe = asyncVectorPipe(
      () => [1],
      async (i: number) => i * 2
    );
    const output = await pipe();
    expect(output).toEqual([2]);
  });

  it("single async map on multiple elements", async () => {
    const pipe = asyncVectorPipe(
      () => [1, 2, 3],
      async (i: number) => i * 2
    );
    const output = await pipe();
    expect(output).toEqual([2, 4, 6]);
  });

  it("single async map on zero elements", async () => {
    const pipe = asyncVectorPipe(
      () => [],
      async (i: number) => i * 2
    );
    const output = await pipe();
    expect(output).toEqual([]);
  });

  it("multi async maps", async () => {
    const pipe = asyncVectorPipe(
      () => [1, 2, 3],
      async (i: number) => i + 1,
      async (i: number) => i * 2
    );
    const output = await pipe();
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

    const pipe = asyncVectorPipe(
      () => ["", ""],
      () => mockOutputs[step1BaseIndex++].value,
      () => mockOutputs[step2BaseIndex++].value
    );

    const resultAsync = pipe();

    [0, 1, 2, 3].forEach((i) => mockOutputs[i].resolve(""));

    await resultAsync;

    expect(records).toEqual([0, 1, 2, 3]);
  });

  it("concurrency: in-step pipe reordering", async () => {
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

    const pipe = asyncVectorPipe(
      () => ["", ""],
      () => mockOutputs[step1BaseIndex++].value,
      () => mockOutputs[step2BaseIndex++].value
    );

    const resultAsync = pipe();

    [1, 0, 2, 3].forEach((i) => mockOutputs[i].resolve(""));

    await resultAsync;

    expect(records).toEqual([1, 0, 2, 3]);
  });

  it("concurrency: full pipe reordering", async () => {
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

    const pipe = asyncVectorPipe(
      () => ["", ""],
      () => mockOutputs[step1BaseIndex++].value,
      () => mockOutputs[step2BaseIndex++].value
    );

    const resultAsync = pipe();

    [2, 3, 0, 1].forEach((i) => mockOutputs[i].resolve(""));

    await resultAsync;

    expect(records).toEqual([2, 3, 0, 1]);
  });
});
