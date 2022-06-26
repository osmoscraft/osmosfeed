import { describe, expect, it } from "vitest";
import { build } from "../build";

describe("definePipe", () => {
  it("empty pipe", async () => {
    const result = await build();
    expect(result).toEqual({ feeds: [] });
  });

  it("preProjectTask", async () => {
    const result = await build({
      preProjectTasks: [
        async (project) => ({
          ...project,
          hello: 42,
        }),
      ],
    });

    expect(result).toEqual({ hello: 42, feeds: [] });
  });

  it("preFeedTask", async () => {
    const result = await build({
      preProjectTasks: [async (project) => ({ ...project, feeds: [{ items: [] }] })],
      preFeedTasks: [async (_feed) => ({ items: [1] })],
    });

    expect(result).toEqual({ feeds: [{ items: [1] }] });
  });

  it("itemTask", async () => {
    const result = await build({
      preProjectTasks: [async (project) => ({ ...project, feeds: [{ items: [1, 2] }] })],
      itemTasks: [async (item) => item * 2],
    });

    expect(result).toEqual({ feeds: [{ items: [2, 4] }] });
  });

  it("postFeedTask", async () => {
    const result = await build({
      preProjectTasks: [async (project) => ({ ...project, feeds: [{ items: [1, 2] }] })],
      postFeedTasks: [async (feed) => ({ items: [...feed.items, 3] })],
    });

    expect(result).toEqual({ feeds: [{ items: [1, 2, 3] }] });
  });

  it("postProjectTask", async () => {
    const result = await build({
      preProjectTasks: [async (project) => ({ ...project, feeds: [{ items: [1, 2] }] })],
      postProjectTasks: [async (project) => ({ ...project, foo: "bar" })],
    });

    expect(result).toEqual({ feeds: [{ items: [1, 2] }], foo: "bar" });
  });

  it("integration", async () => {
    const result = await build({
      preProjectTasks: [async (project) => ({ ...project, preProj: true, feeds: [{ items: [1] }, { items: [2] }] })],
      preFeedTasks: [(feed) => ({ ...feed, items: [...feed.items, 2, 3] }), (feed) => ({ ...feed, preFeed: true })], // [1,2,3], [2,2,3]
      itemTasks: [async (item) => item + 1, (item) => item * 2], // [4,6,8], [6,6,8]
      postFeedTasks: [async (feed) => ({ ...feed, postFeed: true })],
      postProjectTasks: [(project) => ({ ...project, postProj: true })],
    });

    expect(result).toEqual({
      preProj: true,
      postProj: true,
      feeds: [
        {
          preFeed: true,
          postFeed: true,
          items: [4, 6, 8],
        },
        {
          preFeed: true,
          postFeed: true,
          items: [6, 6, 8],
        },
      ],
    });
  });
});
