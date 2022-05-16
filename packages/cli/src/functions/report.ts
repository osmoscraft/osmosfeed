import type { FeedProgress } from "./build-feed";
import type { CopyItem } from "./copy";
import type { FileHandle } from "./fs";

export interface FileDiscoveryResult {
  systemStatic: FileHandle[];
  systemIncludes: FileHandle[];
  userStatic: FileHandle[];
  userIncludes: FileHandle[];
  userCache?: FileHandle;
}
export function reportFileDiscovery(discoveryResult: FileDiscoveryResult) {
  console.log(`[file-discovery] system static: ${discoveryResult.systemStatic.length}`);
  console.log(`[file-discovery] system includes: ${discoveryResult.systemIncludes.length}`);
  console.log(`[file-discovery] user static: ${discoveryResult.userStatic.length}`);
  console.log(`[file-discovery] user includes: ${discoveryResult.userIncludes.length}`);
  console.log(`[file-discovery] cache: ${discoveryResult.userCache ? "found" : "missing"}`);
}

export function reportFeedProgress(progress: FeedProgress) {
  console.log(
    `[build-feed] ${(progress.updated + progress.unchanged).toString().padStart(3)}|${progress.added
      .toString()
      .padStart(3)}+|${progress.removed.toString().padStart(3)}-|${(progress.duration / 1000)
      .toFixed(2)
      .toString()
      .padStart(5)}s|${new URL(progress.url).hostname}${new URL(progress.url).pathname}`
  );
}

export function reportTemplateRegistration(templateName: string, handle: FileHandle) {
  console.log(`[template] Registered ${templateName}:`, handle.fullPath);
}

export function reportCopy(item: CopyItem) {
  console.log(`[asset] Copied ${item.fullPath}`);
}
