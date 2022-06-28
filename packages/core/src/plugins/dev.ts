import { startDevServer } from "@web/dev-server";
import chokidar from "chokidar";
import path from "path";
import type { ProjectTask } from "../engine/build";
import type { Project } from "./types";

export interface devConfig {
  onChange?: (path: string) => any;
}
export function dev(config?: devConfig): ProjectTask<Project> {
  return (project) =>
    new Promise(async (_resolve) => {
      let trimmedOutDir = project.outDir;

      while (trimmedOutDir.startsWith("/")) trimmedOutDir = trimmedOutDir.slice(1);
      while (trimmedOutDir.endsWith("/")) trimmedOutDir = trimmedOutDir.slice(0, -1);

      const watchedDir = process.cwd();
      const ignorePaths = `${path.join(watchedDir, project.outDir)}/**`;

      console.log(`[watch] watching ${watchedDir}, ignoring ${ignorePaths}`);

      const watcher = chokidar.watch(watchedDir, { ignored: ignorePaths, ignoreInitial: true });

      const server = await startDevServer({
        config: {
          rootDir: path.join(process.cwd(), project.outDir),
          watch: true,
          open: true,
          clearTerminalOnReload: false,
        },
      });

      watcher.on("change", (path) => config?.onChange?.(path));
      watcher.on("add", (path) => config?.onChange?.(path));
      watcher.on("unlink", (path) => config?.onChange?.(path));
    });
}
