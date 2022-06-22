//@ts-check
import {
  pipe,
  useCacheReader,
  useCacheWriter,
  useConfigInline,
  useDownload,
  useMerge,
  useNormalize,
  useParse,
} from "@osmosfeed/core";
import { useConfigFile } from "@osmosfeed/core/src/modules/config";

/** @type {import("@osmosfeed/core/src/modules/types").ProjectConfig} */
const config = { feeds: [{ url: "https://news.ycombinator.com/rss" }, { url: "https://css-tricks.com/feed/" }] };

const useConfig = () => (true ? useConfigFile() : useConfigInline(config));
const customPipe = pipe(
  useConfig(),
  useDownload(),
  useParse(),
  useNormalize(),
  useCacheReader(),
  useMerge(),
  useCacheWriter()
);

customPipe().then((out) =>
  console.log(
    JSON.parse(JSON.stringify(out, (k, v) => (k === "content" ? v.slice(0, 100) + " | result truncated..." : v), 2))
  )
);
