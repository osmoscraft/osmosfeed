import { useCacheReader, useCacheWriter } from "./mods/cache/cache";
import { useConfig } from "./mods/config/config";
import { useDownload } from "./mods/download/download";
import { useMerge } from "./mods/merge/merge";
import { useNormalize } from "./mods/normalize/normalize";
import { useParse } from "./mods/parse/parse";
import type { PipeFeed } from "./mods/types";
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
