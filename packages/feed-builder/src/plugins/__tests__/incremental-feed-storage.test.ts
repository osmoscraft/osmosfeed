import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { useIncrementalFeedStorage } from "../incremental-feed-storage";
import { mockFeedHookApi } from "../../runtime/api/__mocks__/api.mock";
import { MockStorageApi } from "../../runtime/api/__mocks__/storage.mock";
import { mockDataForFeed, runTransformFeedHook, runTransformItemHook } from "./fixtures";
import { getFeedStorageData } from "../__mocks__/feed-storage.mock";

describe("Plugin/Incremental Feed Storage", () => {
  it("No storage, no new data", async () => {
    const readRecords: string[] = [];
    const plugin = useIncrementalFeedStorage();
    const output = await runTransformFeedHook(plugin, {
      data: mockDataForFeed({ feed: { items: [] } }),
      api: {
        ...mockFeedHookApi({
          storage: new MockStorageApi({
            readPluginDataFile: async (filename) => {
              readRecords.push(filename);
              return null;
            },
          }),
        }),
      },
    });

    await expect(readRecords.length).toEqual(1);
  });

  it("No storage, has new data", async () => {
    const plugin = useIncrementalFeedStorage();
    const output = await runTransformFeedHook(plugin, {
      data: mockDataForFeed({
        feed: {
          items: [
            {
              id: "item-1",
              title: "Item 1",
            },
            {
              id: "item-2",
              title: "Item 2",
            },
          ],
        },
      }),
      api: {
        ...mockFeedHookApi({
          storage: new MockStorageApi({
            readPluginDataFile: async (filename) => {
              return null;
            },
          }),
        }),
      },
    });

    await expect(output.items?.length).toEqual(2);
    await expect(output.items![0].title).toEqual("Item 1");
    await expect(output.items![1].title).toEqual("Item 2");
  });

  it("Has storage, no new data", async () => {
    const readRecords: string[] = [];
    const mockStoredData = getFeedStorageData();
    const plugin = useIncrementalFeedStorage();
    const output = await runTransformFeedHook(plugin, {
      data: mockDataForFeed({
        feed: {
          items: [],
        },
      }),
      api: {
        ...mockFeedHookApi({
          storage: new MockStorageApi({
            readPluginDataFile: async (filename) => {
              readRecords.push(filename);
              return Buffer.from(JSON.stringify(mockStoredData));
            },
          }),
        }),
      },
    });

    await expect(output.items?.length).toEqual(mockStoredData.items.length);
  });

  it("Has storage, has new data", async () => {
    const readRecords: string[] = [];
    const mockStoredData = getFeedStorageData();
    const plugin = useIncrementalFeedStorage();
    const output = await runTransformFeedHook(plugin, {
      data: mockDataForFeed({
        feed: {
          items: [
            {
              id: "item-1",
              title: "Item 1",
            },
            {
              id: "item-2",
              title: "Item 2",
            },
          ],
        },
      }),
      api: {
        ...mockFeedHookApi({
          storage: new MockStorageApi({
            readPluginDataFile: async (filename) => {
              readRecords.push(filename);
              return Buffer.from(JSON.stringify(mockStoredData));
            },
          }),
        }),
      },
    });

    await expect(output.items?.length).toEqual(mockStoredData.items.length + 2);
  });
});
