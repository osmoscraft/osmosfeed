import { useCacheReader, useCacheWriter } from "./modules/cache/cache";
import { useConfig } from "./modules/config/config";
import { useDownload } from "./modules/download/download";
import { useMerge } from "./modules/merge/merge";
import { useNormalize } from "./modules/normalize/normalize";
import { useParse } from "./modules/parse/parse";
import type { PipeFeed } from "./modules/types";
import { asyncVectorPipeFactory } from "./utils/async-vector-pipe";

const pipe = asyncVectorPipeFactory<PipeFeed>(
  useConfig(),
  useDownload(),
  useParse(),
  useNormalize(),
  useCacheReader(),
  useMerge(),
  useCacheWriter()
);

async function main() {
  const out = await pipe([
    {
      config: {
        url: "https://css-tricks.com/feed/",
      },
    },
  ]);

  console.log(
    JSON.parse(JSON.stringify(out, (k, v) => (k === "content" ? v.slice(0, 100) + " | result truncated..." : v), 2))
  );
}

main();
