import type Parser from "rss-parser";
import { describe, expect, it } from "vitest";
import { normalizeFeed } from "../normalize-feed";

describe("normalizeFeed", () => {
  it("smoke test", () => {
    const mockInput: Parser.Output<any> = {
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [],
    };

    expect(() => normalizeFeed(mockInput, "https://example.com/feed/feed.xml")).not.toThrow();
  });

  it("resolve invalid URL to null in item link", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          link: "https://123        .",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");
    expect(result.items[0].link).toBe(null);
  });

  it("resolve invalid relatve URL to null in item link", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          link: "\\\\",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");
    expect(result.items[0].link).toBe(null);
  });

  it("ignore feed url from the parser", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/hello-world/feed.xml",
      title: "Mock title",
      items: [
        {
          link: "https://example.com/page-1",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].link).toBe("https://example.com/page-1");
  });

  it("resolve url in item link", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          link: "https://example.com/page-1",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].link).toBe("https://example.com/page-1");
  });

  it("resolve url relative to feed host as a file", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          link: "/page-1",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].link).toBe("https://example.com/page-1");
  });

  it("resolve url relative to feed host as path", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/rss",
      title: "Mock title",
      items: [
        {
          link: "/page-1",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].link).toBe("https://example.com/page-1");
  });

  it("resolve url relative to feed host as path with trailing slash", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/rss/",
      title: "Mock title",
      items: [
        {
          link: "/page-1",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].link).toBe("https://example.com/page-1");
  });

  it("resolve url relative to feed endpoint", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          link: "./asset/page.html",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].link).toBe("https://example.com/feed/asset/page.html");
  });

  it("resolve url relative to feed endpoint as its parent", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          link: "../asset/page.html",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].link).toBe("https://example.com/asset/page.html");
  });

  it("resolve image url from feed", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      image: {
        url: "https://example.com/asset/image.png",
      },
      title: "Mock title",
      items: [{}],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].imageUrl).toBe("https://example.com/asset/image.png");
  });

  it("resolve relative image url from feed", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      image: {
        url: "/asset/image.png",
      },
      title: "Mock title",
      items: [{}],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].imageUrl).toBe("https://example.com/asset/image.png");
  });

  it("resolve image url from enclosure", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          enclosure: {
            type: "image/png",
            url: "https://example.com/asset/image.png",
          },
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].imageUrl).toBe("https://example.com/asset/image.png");
  });

  it("resolve relative image url from enclosure", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          enclosure: {
            type: "image/png",
            url: "/asset/image.png",
          },
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].imageUrl).toBe("https://example.com/asset/image.png");
  });

  it("resolve image url from thumbnail", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          "media:thumbnail": "https://example.com/asset/image.png",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].imageUrl).toBe("https://example.com/asset/image.png");
  });

  it("resolve relative image url from thumbnail", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          "media:thumbnail": "/asset/image.png",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");

    expect(result.items[0].imageUrl).toBe("https://example.com/asset/image.png");
  });

  it("resolve empty URL to null in item link", () => {
    const mockInput: Parser.Output<any> = {
      link: "https://example.com/",
      feedUrl: "https://example.com/feed/feed.xml",
      title: "Mock title",
      items: [
        {
          link: "",
        },
      ],
    };
    const result = normalizeFeed(mockInput, "https://example.com/feed/feed.xml");
    expect(result.items[0].link).toBe(null);
  });
});
