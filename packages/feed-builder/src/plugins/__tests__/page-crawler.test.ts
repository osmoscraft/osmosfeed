import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { mimeMap } from "../lib/mime-map";
import { useHtmlPageCrawler } from "../htmp-page-crawler";
import { mockDataForSingleItem, runOnItemHook } from "./fixtures";

describe("Plugin/Page crawler", () => {
  it("Makes no http request when item has no url", async () => {
    const requestedUrls: string[] = [];

    await runOnItemHook(useHtmlPageCrawler(), {
      data: mockDataForSingleItem({
        id: "test-item-id",
      }),
      api: {
        httpGet: async (url) => {
          requestedUrls.push(url);
          return {
            statusCode: 200,
            buffer: Buffer.from("Hello world"),
          };
        },
        getTextFile: async () => null,
        setFile: async () => {},
      },
    });

    expect(requestedUrls).toEqual([]);
  });

  it("Makes http request if cache miss", async () => {
    const requestedUrls: string[] = [];

    await runOnItemHook(useHtmlPageCrawler(), {
      data: mockDataForSingleItem({
        id: "test-item-id",
        url: "https://mock-domain.com/article.html",
      }),
      api: {
        httpGet: async (url) => {
          requestedUrls.push(url);
          return {
            statusCode: 200,
            buffer: Buffer.from("Hello world"),
          };
        },
        getTextFile: async () => null,
        setFile: async () => {},
      },
    });

    expect(requestedUrls).toEqual(["https://mock-domain.com/article.html"]);
  });

  it("Does not write to file when http request fails", async () => {
    const fileOperations: any[] = [];

    await runOnItemHook(useHtmlPageCrawler(), {
      data: mockDataForSingleItem({
        id: "test-item-id",
        url: "https://mock-domain.com/article.html",
      }),
      api: {
        httpGet: async (url) => {
          return {
            statusCode: 404,
            buffer: Buffer.from([]),
          };
        },
        getTextFile: async () => null,
        setFile: async (filename, content) => {
          fileOperations.push([filename, content.toString()]);
        },
      },
    });

    await expect(fileOperations.length).toEqual(0);
  });

  it("Does not write to file when result has no content type", async () => {
    const fileOperations: any[] = [];

    await runOnItemHook(useHtmlPageCrawler(), {
      data: mockDataForSingleItem({
        id: "test-item-id",
        url: "https://mock-domain.com/article.html",
      }),
      api: {
        httpGet: async (url) => {
          return {
            statusCode: 200,
            buffer: Buffer.from("Hello world"),
          };
        },
        getTextFile: async () => null,
        setFile: async (filename, content) => {
          fileOperations.push([filename, content.toString()]);
        },
      },
    });

    await expect(fileOperations.length).toEqual(0);
  });

  it("Does not write to file when result has non-html content type", async () => {
    const fileOperations: any[] = [];

    await runOnItemHook(useHtmlPageCrawler(), {
      data: mockDataForSingleItem({
        id: "test-item-id",
        url: "https://mock-domain.com/article.html",
      }),
      api: {
        httpGet: async (url) => {
          return {
            statusCode: 200,
            contentType: mimeMap[".txt"],
            buffer: Buffer.from("Hello world"),
          };
        },
        getTextFile: async () => null,
        setFile: async (filename, content) => {
          fileOperations.push([filename, content.toString()]);
        },
      },
    });

    await expect(fileOperations.length).toEqual(0);
  });

  it("Writes to file when result is missing charset", async () => {
    const fileOperations: any[] = [];

    await runOnItemHook(useHtmlPageCrawler(), {
      data: mockDataForSingleItem({
        id: "test-item-id",
        url: "https://mock-domain.com/article.html",
      }),
      api: {
        httpGet: async (url) => {
          return {
            statusCode: 200,
            contentType: "text/html",
            buffer: Buffer.from("Hello world"),
          };
        },
        getTextFile: async () => null,
        setFile: async (filename, content) => {
          fileOperations.push([filename, content.toString()]);
        },
      },
    });

    await expect(fileOperations.length).toEqual(1);
    await expect(fileOperations[0][1]).toEqual("Hello world");
  });

  it("Writes to file when result is correct", async () => {
    const fileOperations: any[] = [];

    await runOnItemHook(useHtmlPageCrawler(), {
      data: mockDataForSingleItem({
        id: "test-item-id",
        url: "https://mock-domain.com/article.html",
      }),
      api: {
        httpGet: async (url) => {
          return {
            statusCode: 200,
            contentType: "text/html; charset=UTF-8",
            buffer: Buffer.from("Hello world"),
          };
        },
        getTextFile: async () => null,
        setFile: async (filename, content) => {
          fileOperations.push([filename, content.toString()]);
        },
      },
    });

    await expect(fileOperations.length).toEqual(1);
    await expect(fileOperations[0][1]).toEqual("Hello world");
  });

  it("Add associated filename to item when file is saved", async () => {
    let savedFilename;
    const result = await runOnItemHook(useHtmlPageCrawler(), {
      data: mockDataForSingleItem({
        id: "test-item-id",
        url: "https://mock-domain.com/article.html",
      }),
      api: {
        httpGet: async () => {
          return {
            statusCode: 200,
            contentType: "text/html",
            buffer: Buffer.from("Hello world"),
          };
        },
        getTextFile: async () => null,
        setFile: async (filename) => {
          savedFilename = filename;
        },
      },
    });

    expect(result._plugin.pageFilename).toEqual(savedFilename);
  });

  // TODO test cache clean up after build
});
