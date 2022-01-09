import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { JsonFeed } from "@osmosfeed/types";
import { mergeJsonFeed } from "../merge";

describe("Util/Merge", () => {
  it("Feed/Empty input", async () => {
    const existing: JsonFeed = {
      version: "Mock version",
      title: "Mock title",
      items: [],
    };

    const incoming: JsonFeed = {
      version: "Mock version",
      title: "Mock title",
      items: [],
    };

    const merged = mergeJsonFeed(incoming, existing);

    await expect(merged.items.length).toEqual(0);
    await expect(merged.title).toEqual("Mock title");
  });

  it("Feed/Metadata update", async () => {
    const existing: JsonFeed = {
      version: "Mock version",
      title: "Mock title",
      description: "Mock description",
      items: [],
    };

    const incoming: JsonFeed = {
      version: "Mock version",
      title: "Mock title new",
      description: "Mock description new",
      items: [],
    };

    const merged = mergeJsonFeed(incoming, existing);

    await expect(merged.items.length).toEqual(0);
    await expect(merged.title).toEqual("Mock title new");
    await expect(merged.description).toEqual("Mock description new");
  });

  it("Items/Addition", async () => {
    const existing: JsonFeed = {
      version: "",
      title: "",
      items: [],
    };

    const incoming: JsonFeed = {
      version: "",
      title: "",
      items: [
        {
          id: "1",
        },
      ],
    };

    const merged = mergeJsonFeed(incoming, existing);

    await expect(merged.items.length).toEqual(1);
    await expect(merged.items[0].id).toEqual("1");
  });

  it("Items/Persistence", async () => {
    const existing: JsonFeed = {
      version: "",
      title: "",
      items: [
        {
          id: "1",
        },
      ],
    };

    const incoming: JsonFeed = {
      version: "",
      title: "",
      items: [],
    };

    const merged = mergeJsonFeed(incoming, existing);

    await expect(merged.items.length).toEqual(1);
    await expect(merged.items[0].id).toEqual("1");
  });

  it("Items/Idempotency", async () => {
    const existing: JsonFeed = {
      version: "",
      title: "",
      items: [
        {
          id: "1",
        },
      ],
    };

    const incoming: JsonFeed = {
      version: "",
      title: "",
      items: [
        {
          id: "1",
        },
      ],
    };

    const merged = mergeJsonFeed(incoming, mergeJsonFeed(incoming, existing));

    await expect(merged.items.length).toEqual(1);
    await expect(merged.items[0].id).toEqual("1");
  });

  it("Items/Update", async () => {
    const existing: JsonFeed = {
      version: "",
      title: "",
      items: [
        {
          id: "1",
          title: "Title",
        },
      ],
    };

    const incoming: JsonFeed = {
      version: "",
      title: "",
      items: [
        {
          id: "1",
          title: "Title new",
        },
      ],
    };

    const merged = mergeJsonFeed(incoming, mergeJsonFeed(incoming, existing));

    await expect(merged.items.length).toEqual(1);
    await expect(merged.items[0].title).toEqual("Title new");
  });

  it("Items/Ordering/Without timestamp", async () => {
    const existing: JsonFeed = {
      version: "",
      title: "",
      items: [
        {
          id: "1",
          title: "Title 1",
        },
        {
          id: "2",
          title: "Title 2",
        },
      ],
    };

    const incoming: JsonFeed = {
      version: "",
      title: "",
      items: [
        {
          id: "3",
          title: "Title 3",
        },
        {
          id: "4",
          title: "Title 4",
        },
      ],
    };

    const merged = mergeJsonFeed(incoming, mergeJsonFeed(incoming, existing));

    await expect(merged.items.length).toEqual(4);
    await expect(merged.items.map((item) => item.id).join(",")).toEqual("3,4,1,2");
  });

  it("Items/Ordering/With timestamp", async () => {
    const existing: JsonFeed = {
      version: "",
      title: "",
      items: [
        {
          id: "1",
          title: "Title 1",
          date_published: "2000-01-01T00:00:00Z",
        },
        {
          id: "2",
          title: "Title 2",
          date_published: "2000-01-02T00:00:00Z",
        },
      ],
    };

    const incoming: JsonFeed = {
      version: "",
      title: "",
      items: [
        {
          id: "3",
          title: "Title 3",
          date_published: "2000-01-03T00:00:00Z",
        },
        {
          id: "4",
          title: "Title 4",
          date_published: "2000-01-04T00:00:00Z",
        },
      ],
    };

    const merged = mergeJsonFeed(incoming, mergeJsonFeed(incoming, existing));

    await expect(merged.items.length).toEqual(4);
    await expect(merged.items.map((item) => item.id).join(",")).toEqual("4,3,2,1");
  });
});
