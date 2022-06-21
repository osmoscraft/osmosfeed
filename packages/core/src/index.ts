import { useDownload } from "./mods/download/download";
import { useParse } from "./mods/parse/parse";
import type { PipeFeed } from "./mods/pipe-feed";
import { asyncVectorPipeFactory } from "./utils/async-vector-pipe";

const pipe = asyncVectorPipeFactory<PipeFeed>(useDownload(), useParse());

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
