import { describe, expect, it } from "vitest";
import { build } from "..";

describe("definePipe", () => {
  it("empty pipe", async () => {
    const result = await build();
    expect(result).toEqual([]);
  });

  it("preProjectTask", async () => {
    const result = await build<number>({
      preProjectTasks: [async () => [[1], [2]]],
    });

    expect(result).toEqual([[1], [2]]);
  });

  it("preFeedTask", async () => {
    const result = await build<number>({
      preProjectTasks: [async (_feeds) => [[1], [2]]],
      preFeedTasks: [async (items) => items.map((i) => i + 1)],
    });

    expect(result).toEqual([[2], [3]]);
  });

  it("itemTask", async () => {
    const result = await build<number>({
      preProjectTasks: [async (_feeds) => [[1], [2]]],
      itemTasks: [async (item) => item * 2],
    });

    expect(result).toEqual([[2], [4]]);
  });

  it("postFeedTask", async () => {
    const result = await build<number>({
      preProjectTasks: [async (_feeds) => [[1], [2]]],
      postFeedTasks: [async (items) => items.map((i) => i + 1)],
    });

    expect(result).toEqual([[2], [3]]);
  });

  it("postProjectTask", async () => {
    const result = await build<number>({
      preProjectTasks: [async (_feeds) => [[1], [2]]],
      postProjectTasks: [async (feeds) => [...feeds, [3]]],
    });

    expect(result).toEqual([[1], [2], [3]]);
  });

  it("postProjectTask", async () => {
    const result = await build<number>({
      preProjectTasks: [async (_feeds) => [[1], [2]]],
      preFeedTasks: [(items) => [0, ...items]],
      itemTasks: [async (item) => item + 1, async (item) => item * 2],
      postFeedTasks: [async (items) => [...items, 8]],
      postProjectTasks: [(feeds) => [...feeds, [1, 2, 3]]],
    });

    expect(result).toEqual([
      [2, 4, 8],
      [2, 6, 8],
      [1, 2, 3],
    ]);
  });
});
