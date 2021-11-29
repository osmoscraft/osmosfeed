import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import path from "path";
import { loadClient } from "../load-client";

describe("loadClient", () => {
  it("Loads empty client", async () => {
    const client = await loadClient([], "/");
    await expect(client.files.length).toEqual(0);
  });

  it("Loads file metadata", async () => {
    const client = await loadClient(
      [
        {
          filename: "index.js",
          extension: ".js",
          path: path.resolve(__dirname, "../__fixtures__/clients/basic/index.js"),
        },
        {
          filename: "index.css",
          extension: ".css",
          path: path.resolve(__dirname, "../__fixtures__/clients/basic/index.css"),
        },
        {
          filename: "favicon.svg",
          extension: ".svg",
          path: path.resolve(__dirname, "../__fixtures__/clients/basic/favicon.svg"),
        },
      ],
      path.resolve(__dirname, "../__fixtures__/clients/basic")
    );

    await expect(client.files.length).toEqual(3);
    await expect(client.files.some((asset) => asset.metadata.filename === "index.js")).toEqual(true);
    await expect(client.files.some((asset) => asset.metadata.filename === "index.css")).toEqual(true);
    await expect(client.files.some((asset) => asset.metadata.filename === "favicon.svg")).toEqual(true);
  });

  it("Loads file content", async () => {
    const client = await loadClient(
      [
        {
          filename: "index.js",
          extension: ".js",
          path: path.resolve(__dirname, "../__fixtures__/clients/basic/index.js"),
        },
      ],
      path.resolve(__dirname, "../__fixtures__/clients/basic")
    );

    await expect(client.files[0].content.toString("utf-8").includes("intentionally blank")).toEqual(true);
  });

  it("Loads entry points", async () => {
    const client = await loadClient(
      [
        {
          filename: "index.js",
          extension: ".js",
          path: path.resolve(__dirname, "../__fixtures__/clients/basic/index.js"),
        },
        {
          filename: "index.css",
          extension: ".css",
          path: path.resolve(__dirname, "../__fixtures__/clients/basic/index.css"),
        },
      ],
      path.resolve(__dirname, "../__fixtures__/clients/basic")
    );

    await expect(client.files[0].metadata.path === path.resolve(__dirname, "../__fixtures__/clients/basic/index.js"));
    await expect(client.files[1].metadata.path === path.resolve(__dirname, "../__fixtures__/clients/basic/index.css"));
  });
});
