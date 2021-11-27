import { loadProjectFiles } from "./lib/load-project-files";

async function run() {
  const cwd = process.cwd();

  const projectFiles = await loadProjectFiles(cwd);
  console.log(projectFiles);
}

run();
