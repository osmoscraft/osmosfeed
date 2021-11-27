import { describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { scanDir } from "../scan-dir";
import path from "path";
import { access } from "fs/promises";

describe("scan-dir", () => {
  it("Throws when dir doesn't exist", async () => {
    await expect(() => scanDir("./non-exist-dir")).toThrow();
  });

  it("Does not throw when dir exist", async () => {
    const dir = path.resolve(__dirname, "../__fixtures__/directories/shallow");
    await expect(() => scanDir(dir)).not.toThrow();
  });

  it("Scans shallow dir content", async () => {
    const dir = path.resolve(__dirname, "../__fixtures__/directories/shallow");
    const scannedDir = await scanDir(dir);
    await expect(scannedDir.files.length).toEqual(1);
  });

  it("Scans deep dir content", async () => {
    const dir = path.resolve(__dirname, "../__fixtures__/directories/deep");
    const scannedDir = await scanDir(dir);
    await expect(scannedDir.files.length).toEqual(2);
  });

  it("Scans filename", async () => {
    const dir = path.resolve(__dirname, "../__fixtures__/directories/deep");
    const scannedDir = await scanDir(dir);
    await expect(scannedDir.files[0].filename).toEqual("file-1.txt");
  });

  it("Scans extension", async () => {
    const dir = path.resolve(__dirname, "../__fixtures__/directories/deep");
    const scannedDir = await scanDir(dir);
    await expect(scannedDir.files[0].extension).toEqual(".txt");
  });

  it("Scans path", async () => {
    const dir = path.resolve(__dirname, "../__fixtures__/directories/deep");
    const scannedDir = await scanDir(dir);
    await expect(() => access(scannedDir.files[0].path)).not.toThrow();
  });
});
