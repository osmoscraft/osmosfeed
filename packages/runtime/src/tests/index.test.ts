import { lastValueFrom } from "rxjs";
import { describe, expect, it } from "vitest";
import { createPipe } from "..";

describe("definePipe", () => {
  it("smoke test", () => {
    const pipe = createPipe({
      collectionPostTransforms: [],
      collectionPreTransforms: [],
      itemTransform: [],
    });
    expect(pipe).toBeDefined();
  });

  it("empty pipe", async () => {
    const pipe = createPipe({
      collectionPostTransforms: [],
      collectionPreTransforms: [],
      itemTransform: [],
    });

    const result = await lastValueFrom(pipe);
    expect(result).toEqual([]);
  });

  it("pre-transform", async () => {
    const pipe = createPipe({
      collectionPostTransforms: [],
      collectionPreTransforms: [async () => [1, 2, 3]],
      itemTransform: [],
    });

    const result = await lastValueFrom(pipe);
    expect(result).toEqual([1, 2, 3]);
  });

  it("pre-transform multiple", async () => {
    const pipe = createPipe({
      collectionPostTransforms: [],
      collectionPreTransforms: [async () => [1, 2, 3], async (list) => list.map((item) => item + 1)],
      itemTransform: [],
    });

    const result = await lastValueFrom(pipe);
    expect(result).toEqual([2, 3, 4]);
  });

  it("item transform", async () => {
    const pipe = createPipe({
      collectionPostTransforms: [],
      collectionPreTransforms: [async () => [1, 2, 3]],
      itemTransform: [doubleAsync],
    });

    const result = await lastValueFrom(pipe);
    expect(result).toEqual([2, 4, 6]);
  });

  it("item transform multiple", async () => {
    const pipe = createPipe({
      collectionPostTransforms: [],
      collectionPreTransforms: [async () => [1, 2, 3]],
      itemTransform: [doubleAsync, addOneAsync],
    });

    const result = await lastValueFrom(pipe);
    expect(result).toEqual([3, 5, 7]);
  });

  it("post-transform", async () => {
    const pipe = createPipe({
      collectionPostTransforms: [async (collection) => collection.map(double)],
      collectionPreTransforms: [async () => [1, 2, 3]],
      itemTransform: [],
    });

    const result = await lastValueFrom(pipe);
    expect(result).toEqual([2, 4, 6]);
  });

  it("post-transform multiple", async () => {
    const pipe = createPipe({
      collectionPostTransforms: [
        async (collection) => collection.map(double),
        async (collection) => collection.map(addOne),
      ],
      collectionPreTransforms: [async () => [1, 2, 3]],
      itemTransform: [],
    });

    const result = await lastValueFrom(pipe);
    expect(result).toEqual([3, 5, 7]);
  });

  it("integration", async () => {
    const pipe = createPipe({
      collectionPostTransforms: [async (collection) => collection.map(addOne)],
      collectionPreTransforms: [async () => [1, 2, 3]],
      itemTransform: [doubleAsync],
    });

    const result = await lastValueFrom(pipe);
    expect(result).toEqual([3, 5, 7]);
  });
});

async function addOneAsync(i: number) {
  return i + 1;
}
async function doubleAsync(i: number) {
  return i * 2;
}

function addOne(i: number) {
  return i + 1;
}
function double(i: number) {
  return i * 2;
}
