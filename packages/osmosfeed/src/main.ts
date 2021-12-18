import {
  build,
  useFeedDownloader,
  useHtmlPageCrawler,
  useIncrementalFeedStorage,
  useInlineConfig,
  useJsonFeedParser,
  useWebReader,
  WebReaderConfig,
} from "@osmosfeed/feed-builder";
import path from "path";
import { loadClient } from "./lib/load-client";
import { loadProject } from "./lib/load-project";
import { log } from "./lib/log";
import { scanDir } from "./lib/scan-dir";

async function run() {
  // const progressTracker = new ProgressTracker();

  log.heading("01 Load files");

  const clientDir = await scanDir(path.resolve(__dirname, "client/"));
  const client = await loadClient(clientDir.files, clientDir.root);
  log.trace(
    "client files",
    client.files.map((file) => file.metadata.path)
  );

  // TODO need to encapsulate plugin asset within the plugin
  const webReaderConfig: WebReaderConfig = {
    scripts: client.files
      .filter((file) => path.join("/", file.relativePath) === "/index.js")
      .map((file) => ({ content: file.content.toString("utf-8") })),
    stylesheets: client.files
      .filter((file) => path.join("/", file.relativePath) === "/index.css")
      .map((file) => ({ content: file.content.toString("utf-8") })),
    favicon: client.files
      .filter((file) => path.join("/", file.relativePath) === "/favicon.png")
      .map((file) => ({ content: file.content, mime: file.metadata.mime! }))?.[0],
  };

  const cwd = process.cwd();
  log.trace("cwd", cwd);

  const projectDir = await scanDir(cwd);
  const project = await loadProject(projectDir.files, projectDir.root);
  log.trace("config", project.config);

  // TODO load cache separately from project. Unlike project files, cache is highly mutable

  log.heading("02 Fetch and parse feeds");

  // TODO add progress reporter
  // TODO incrementalFeedStorage should also handle truncation
  // TODO page crawler associated id should be written in json feed output
  const { feeds, errors } = await build({
    plugins: [
      useInlineConfig(project.config),
      useFeedDownloader(),
      useJsonFeedParser(),
      useIncrementalFeedStorage(),
      useHtmlPageCrawler(),
      useWebReader(webReaderConfig),
    ],
  });

  if (!feeds) throw new Error("No feed data available. Skipping site generation.");
  if (errors) console.error(errors);

  // TODO the App function itself should be a plugin
  // But keep client file I/O external to it
  log.info(`Site successfully built`);
}

run();
