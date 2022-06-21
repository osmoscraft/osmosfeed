import { describe, expect, it } from "vitest";
import { asyncVectorPipeFactory } from "./async-vector-pipe";

describe("asyncVectorPipe", () => {
  it("Empty", async () => {
    const pipe = asyncVectorPipeFactory();
    expect(pipe).toBeDefined();
  });

  it("Empty pipe mirrors input", async () => {
    const pipe = asyncVectorPipeFactory();
    const output = await pipe([1]);
    expect(output).toEqual([1]);
  });

  it("Single map", async () => {
    const pipe = asyncVectorPipeFactory((i: number) => i * 2);
    const output = await pipe([1]);
    expect(output).toEqual([2]);
  });

  it("Single async map", async () => {
    const pipe = asyncVectorPipeFactory(async (i: number) => i * 2);
    const output = await pipe([1]);
    expect(output).toEqual([2]);
  });

  it("Single async map on multiple elements", async () => {
    const pipe = asyncVectorPipeFactory(async (i: number) => i * 2);
    const output = await pipe([1, 2, 3]);
    expect(output).toEqual([2, 4, 6]);
  });

  it("Single async map on zero elements", async () => {
    const pipe = asyncVectorPipeFactory(async (i: number) => i * 2);
    const output = await pipe([]);
    expect(output).toEqual([]);
  });

  it("Multi async maps", async () => {
    const pipe = asyncVectorPipeFactory(
      async (i: number) => i + 1,
      async (i: number) => i * 2
    );
    const output = await pipe([1, 2, 3]);
    expect(output).toEqual([4, 6, 8]);
  });

  it("Concurrency: normal order", async () => {
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

    const pipe = asyncVectorPipeFactory(
      () => mockOutputs[step1BaseIndex++].value,
      () => mockOutputs[step2BaseIndex++].value
    );

    const resultAsync = pipe(["", ""]);

    [0, 1, 2, 3].forEach((i) => mockOutputs[i].resolve(""));

    await resultAsync;

    expect(records).toEqual([0, 1, 2, 3]);
  });

  it("Concurrency: in-step pipe reordering", async () => {
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

    const pipe = asyncVectorPipeFactory(
      () => mockOutputs[step1BaseIndex++].value,
      () => mockOutputs[step2BaseIndex++].value
    );

    const resultAsync = pipe(["", ""]);

    [1, 0, 2, 3].forEach((i) => mockOutputs[i].resolve(""));

    await resultAsync;

    expect(records).toEqual([1, 0, 2, 3]);
  });

  it("Concurrency: full pipe reordering", async () => {
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

    const pipe = asyncVectorPipeFactory(
      () => mockOutputs[step1BaseIndex++].value,
      () => mockOutputs[step2BaseIndex++].value
    );

    const resultAsync = pipe(["", ""]);

    [2, 3, 0, 1].forEach((i) => mockOutputs[i].resolve(""));

    await resultAsync;

    expect(records).toEqual([2, 3, 0, 1]);
  });
});
