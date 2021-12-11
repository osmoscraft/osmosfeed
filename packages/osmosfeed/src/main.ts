import path from "path";
import { loadClient } from "./lib/load-client";
import { loadProject } from "./lib/load-project";
import { log } from "./lib/log";
import { scanDir } from "./lib/scan-dir";
import {
  build,
  useHttpFeedDownloader,
  useIncrementalFeedStorage,
  useInlineConfig,
  useJsonFeedParser,
} from "@osmoscraft/feed-builder";
import { App } from "@osmoscraft/osmosfeed-web-reader";
import { concurrentWrite } from "./lib/concurrent-write";

async function run() {
  // const progressTracker = new ProgressTracker();

  log.heading("01 Load files");

  const clientDir = await scanDir(path.resolve(__dirname, "client/"));
  const client = await loadClient(clientDir.files, clientDir.root);
  log.trace(
    "client files",
    client.files.map((file) => file.metadata.path)
  );

  const cwd = process.cwd();
  log.trace("cwd", cwd);

  const projectDir = await scanDir(cwd);
  const project = await loadProject(projectDir.files, projectDir.root);
  log.trace("config", project.config);

  // TODO load cache separately from project. Unlike project files, cache is highly mutable

  log.heading("02 Fetch and parse feeds");

  const { feeds, errors } = await build({
    plugins: [
      useInlineConfig(project.config),
      useHttpFeedDownloader(),
      useJsonFeedParser(),
      useIncrementalFeedStorage(),
    ],
  });

  log.heading("03 Generate site");

  if (!feeds) throw new Error("No feed data available. Skipping site generation.");
  if (errors) console.error(errors);

  const html = App({
    data: feeds,
    embeddedScripts: client.files
      .filter((file) => path.join("/", file.relativePath) === "/index.js")
      .map((file) => ({ content: file.content })),
    embeddedStylesheets: client.files
      .filter((file) => path.join("/", file.relativePath) === "/index.css")
      .map((file) => ({ content: file.content })),
    embeddedFavicon: client.files
      .filter((file) => path.join("/", file.relativePath) === "/favicon.png")
      .map((file) => ({ content: file.content, mime: file.metadata.mime! }))?.[0],
  });

  await concurrentWrite([{ fromMemory: html, toPath: path.join(cwd, "index.html") }]);

  log.info(`Site successfully built`);
}

run();
