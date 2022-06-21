import { asyncVectorPipeFactory } from "./kernel/async-vector-pipe";
import { useDownload } from "./mods/download";
import type { PipeFeed } from "./mods/pipe-feed";

const pipe = asyncVectorPipeFactory<PipeFeed>(useDownload());

async function main() {
  const out = await pipe([
    {
      configResult: {
        url: "https://www.google.com",
      },
    },
  ]);

  console.log(out);
}

main();
