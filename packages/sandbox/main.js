//@ts-check
import {
  asyncVectorPipe,
  useCache,
  useDownload,
  useInlineConfig,
  useMerge,
  useNormalize,
  useParse,
} from "@osmosfeed/core";

/** @type {import("@osmosfeed/core/src/modules/types").ProjectConfig} */
const config = { feeds: [{ url: "https://css-tricks.com/feed/" }] };

const pipe = asyncVectorPipe(
  useInlineConfig(config),
  useDownload(),
  useParse(),
  useNormalize(),
  useCache.reader(),
  useMerge(),
  useCache.writer()
);

pipe().then((out) =>
  console.log(
    JSON.parse(JSON.stringify(out, (k, v) => (k === "content" ? v.slice(0, 100) + " | result truncated..." : v), 2))
  )
);
