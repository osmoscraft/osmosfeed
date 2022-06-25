import { lastValueFrom } from "rxjs";
import { describe, expect, it } from "vitest";
import { createPipe } from "..";

describe("definePipe", () => {
  it("smoke test", () => {
    const pipe = createPipe();
    expect(pipe).toBeDefined();
  });

  it("empty pipe", async () => {
    const project = createPipe();

    const result = await lastValueFrom(project);
    expect(result).toEqual([]);
  });

  it("preProjectTransform", async () => {
    const project = createPipe({
      preProjectTasks: [async () => [[{ a: 1 }], [{ a: 2 }]]],
    });

    const result = await lastValueFrom(project);
    expect(result).toEqual([[{ a: 1 }], [{ a: 2 }]]);
  });

  it("preFeedTransform", async () => {
    const project = createPipe({
      preProjectTasks: [async (_feeds) => [[1], [2]]],
      preFeedTasks: [async (items) => items.map(addOne)],
    });

    const result = await lastValueFrom(project);
    expect(result).toEqual([[2], [3]]);
  });

  it("itemTransform", async () => {
    const project = createPipe({
      preProjectTasks: [async (_feeds) => [[1], [2]]],
      preFeedTasks: [async (items) => items.map(addOne)],
      itemTasks: [doubleAsync],
    });

    const result = await lastValueFrom(project);
    expect(result).toEqual([[4], [6]]);
  });

  // it("pre-transform", async () => {
  //   const pipe = createPipe({
  //     preProjectTransforms: [async () => [[1], [2], [3]]],
  //     preFeedTransforms: [],
  //     itemTransforms: [],
  //     postFeedTransforms: [],
  //     postProjectTransforms: [],
  //   });

  //   const result = await lastValueFrom(pipe);
  //   expect(result).toEqual([[[1, 2, 3]]]);
  // });

  // it("pre-transform multiple", async () => {
  //   const pipe = createPipe({
  //     postFeedTransforms: [],
  //     preFeedTransforms: [async () => [1, 2, 3], async (list) => list.map((item) => item + 1)],
  //     itemTransforms: [],
  //   });

  //   const result = await lastValueFrom(pipe);
  //   expect(result).toEqual([2, 3, 4]);
  // });

  // it("item transform", async () => {
  //   const pipe = createPipe({
  //     postFeedTransforms: [],
  //     preFeedTransforms: [async () => [1, 2, 3]],
  //     itemTransforms: [doubleAsync],
  //   });

  //   const result = await lastValueFrom(pipe);
  //   expect(result).toEqual([2, 4, 6]);
  // });

  // it("item transform multiple", async () => {
  //   const pipe = createPipe({
  //     postFeedTransforms: [],
  //     preFeedTransforms: [async () => [1, 2, 3]],
  //     itemTransforms: [doubleAsync, addOneAsync],
  //   });

  //   const result = await lastValueFrom(pipe);
  //   expect(result).toEqual([3, 5, 7]);
  // });

  // it("post-transform", async () => {
  //   const pipe = createPipe({
  //     postFeedTransforms: [async (collection) => collection.map(double)],
  //     preFeedTransforms: [async () => [1, 2, 3]],
  //     itemTransforms: [],
  //   });

  //   const result = await lastValueFrom(pipe);
  //   expect(result).toEqual([2, 4, 6]);
  // });

  // it("post-transform multiple", async () => {
  //   const pipe = createPipe({
  //     postFeedTransforms: [async (collection) => collection.map(double), async (collection) => collection.map(addOne)],
  //     preFeedTransforms: [async () => [1, 2, 3]],
  //     itemTransforms: [],
  //   });

  //   const result = await lastValueFrom(pipe);
  //   expect(result).toEqual([3, 5, 7]);
  // });

  // it("integration", async () => {
  //   const pipe = createPipe({
  //     postFeedTransforms: [async (collection) => collection.map(addOne)],
  //     preFeedTransforms: [async () => [1, 2, 3]],
  //     itemTransforms: [doubleAsync],
  //   });

  //   const result = await lastValueFrom(pipe);
  //   expect(result).toEqual([3, 5, 7]);
  // });
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
