import { useConfig } from "./mods/config/config";
import { useDownload } from "./mods/download/download";
import { useNormalize } from "./mods/normalize/normalize";
import { useParse } from "./mods/parse/parse";
import type { PipeFeed } from "./mods/types";
import { asyncVectorPipeFactory } from "./utils/async-vector-pipe";

const pipe = asyncVectorPipeFactory<PipeFeed>(useConfig(), useDownload(), useParse(), useNormalize());

async function main() {
  const out = await pipe([
    {
      config: {
        url: "https://css-tricks.com/feed/",
      },
    },
  ]);

  console.log(out);
}

main();
