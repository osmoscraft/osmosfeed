import fs from "fs/promises";
import path from "path";
import type { FileHandle } from "./fs";

export interface CopyPlanConfig {
  systemStatic: FileHandle[];
  systemIncludes: FileHandle[];
  userStatic: FileHandle[];
  userIncludes: FileHandle[];
  getOutPath: (handle: FileHandle) => string;
}

export interface CopyItem extends FileHandle {
  toPath: string;
}

export function getCopyPlan(config: CopyPlanConfig): CopyItem[] {
  const userFiles = config.userStatic;
  const effectiveSystemTemplateStaticFiles = config.userIncludes.length ? [] : config.systemIncludes;
  const systemFiles = [...effectiveSystemTemplateStaticFiles, ...config.systemStatic];

  /* The order of array items matters! First come first serve */
  const deduplicatedCopyFiles = [...userFiles, ...systemFiles].reduce<FileHandle[]>((files, currentFile) => {
    if (!files.some((file) => file.relativePath === currentFile.relativePath)) {
      files.push(currentFile);
    }
    return files;
  }, []);

  const copyItem = deduplicatedCopyFiles.map((handle) => ({
    ...handle,
    toPath: config.getOutPath(handle),
  }));

  return copyItem;
}

export async function executeCopyPlan(items: CopyItem[], onCopy?: (handle: CopyItem) => any) {
  await Promise.all(
    items.map(async (item) => {
      const from = item.fullPath;
      const to = item.toPath;
      onCopy?.(item);
      await fs.mkdir(path.resolve(path.dirname(to)), { recursive: true });
      return fs.copyFile(from, to);
    })
  );
}
