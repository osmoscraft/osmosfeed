import type { ParsableFile, PassthroughFile } from "./discover-files";
import path from "path";
import { ENTRY_DIR, PUBLIC_ROOT_DIR, SYSTEM_STATIC_DIR, USER_STATIC_DIR } from "./path-constants";

export interface GetCopyStaticPlanInput {
  systemStaticFiles: PassthroughFile[];
  systemTemplateStaticFiles: PassthroughFile[];
  userStaticFiles: PassthroughFile[];
  userTemplateFiles: PassthroughFile[];
}

export interface CopyStaticPlan {
  items: CopyStaticPlanItem[];
}

export interface CopyStaticPlanItem {
  fromPath: string;
  toPath: string;
}

export interface CandidateCopyFile extends PassthroughFile {
  relativePathToCopyRoot: string;
}

export function getCopyStaticPlan(input: GetCopyStaticPlanInput): CopyStaticPlan {
  const userFiles: CandidateCopyFile[] = input.userStaticFiles.map((file) => ({
    ...file,
    relativePathToCopyRoot: path.relative(USER_STATIC_DIR, file.path),
  }));

  const effectiveSystemTemplateStaticFiles = input.userTemplateFiles.length ? [] : input.systemTemplateStaticFiles;
  const systemFiles: CandidateCopyFile[] = [...effectiveSystemTemplateStaticFiles, ...input.systemStaticFiles].map(
    (file) => ({
      ...file,
      relativePathToCopyRoot: path.relative(path.join(ENTRY_DIR, SYSTEM_STATIC_DIR), file.path),
    })
  );

  /* The order of array items matters! First come first serve */
  const deduplicatedCopyFiles = [...userFiles, ...systemFiles].reduce<CandidateCopyFile[]>((files, currentFile) => {
    if (!files.some((file) => file.relativePathToCopyRoot === currentFile.relativePathToCopyRoot)) {
      files.push(currentFile);
    }
    return files;
  }, []);

  const copyItems: CopyStaticPlanItem[] = deduplicatedCopyFiles.map((file) => ({
    fromPath: file.path,
    toPath: path.resolve(PUBLIC_ROOT_DIR, file.relativePathToCopyRoot),
  }));

  return {
    items: copyItems,
  };
}
