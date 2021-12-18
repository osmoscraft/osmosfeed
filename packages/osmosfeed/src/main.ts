import {
  build,
  useFeedDownloader,
  useHtmlPageCrawler,
  useIncrementalFeedStorage,
  useInlineConfig,
  useJsonFeedParser,
  useWebReader,
} from "@osmosfeed/feed-builder";
import { loadProject } from "./lib/load-project";
import { log } from "./lib/log";
import { scanDir } from "./lib/scan-dir";

async function run() {
  log.heading("01 Load project");
  const cwd = process.cwd();
  log.trace("cwd", cwd);

  const projectDir = await scanDir(cwd);
  const project = await loadProject(projectDir.files, projectDir.root);
  log.trace("config", project.config);

  log.heading("02 Run builder");

  // TODO add progress reporter
  // TODO incrementalFeedStorage should also handle truncation
  // TODO add yml config plugin
  const { feeds, errors } = await build({
    plugins: [
      useInlineConfig(project.config),
      useFeedDownloader(),
      useJsonFeedParser(),
      useIncrementalFeedStorage(),
      useHtmlPageCrawler(),
      useWebReader(),
    ],
  });

  if (!feeds) throw new Error("No feed data available. Skipping site generation.");
  if (errors) console.error(errors);

  // TODO the App function itself should be a plugin
  // But keep client file I/O external to it
  log.info(`Site successfully built`);
}

run();
