import { useCacheReader, useCacheWriter } from "./modules/cache";
import { useConfigFile } from "./modules/config";
import { useDownload } from "./modules/download";
import { useMerge } from "./modules/merge";
import { useNormalize } from "./modules/normalize";
import { useParse } from "./modules/parse";
import { pipe } from "./utils/pipe";

export { useCacheReader, useCacheWriter } from "./modules/cache";
export { useConfigInline } from "./modules/config";
export { useDownload } from "./modules/download";
export { useMerge } from "./modules/merge";
export { useNormalize } from "./modules/normalize";
export { useParse } from "./modules/parse";
export type { PipeFeed } from "./modules/types";
export { pipe } from "./utils/pipe";

export const defaultPipe = pipe(
  useConfigFile(),
  useDownload(),
  useParse(),
  useNormalize(),
  useCacheReader(),
  useMerge(),
  useCacheWriter()
);
