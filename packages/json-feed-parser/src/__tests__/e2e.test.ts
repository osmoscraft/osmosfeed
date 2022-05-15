import { describe, expect, it } from "vitest";
import { parse } from "../lib";
import { readFixture, runMatrix } from "./helper";

describe("Integration", () => {
  it("Rejects non feed xml", () => {
    expect(() => readFixture("non-feed.xml").then(parse)).rejects.toThrow();
  });

  it("No error thrown on basic setup", async () => {
    await runMatrix(["empty-atom.xml", "empty-rss.xml", "empty-rdf.xml"], async (filename) => {
      const asyncResult = readFixture(filename).then(parse);
      await expect(asyncResult).resolves.not.toThrow();
    });
  });

  it("Parse multiple items", async () => {
    await runMatrix(["multi-item-atom.xml", "multi-item-rss.xml", "multi-item-rdf.xml"], async (filename) => {
      const jsonFeed = await readFixture(filename).then(parse);
      await expect(jsonFeed.items.length).toEqual(2);
    });
  });
});
