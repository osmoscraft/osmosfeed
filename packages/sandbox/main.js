//@ts-check
import { build, cache, configFileYaml, configInline, download, merge, normalize, parse } from "@osmosfeed/runtime";

const _configResult = configInline({
  feeds: [{ url: "https://news.ycombinator.com/rss" }],
});

build({
  preProjectTasks: [configFileYaml()],
  preFeedTasks: [download(), parse(), normalize(), merge(), cache()],
}).then((out) =>
  console.log(
    JSON.parse(JSON.stringify(out, (k, v) => (k === "content" ? v.slice(0, 100) + " | result truncated..." : v), 2))
  )
);
