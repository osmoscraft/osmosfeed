const path = require("path");
const promises = require("fs/promises");

const readDirAsync = promises.readdir;
const mkdirAsync = promises.mkdir;
const copyFileAsync = promises.copyFile;

require("esbuild")
  .build({
    platform: "node",
    entryPoints: ["src/main.ts"],
    sourcemap: true,
    bundle: true,
    /** TODO Although demo template and examples are using node 16 in GitHub Action, earlier users are still using 14. Upgrade requires major release */ 
    target: "node14",
    outfile: "bin/main.js",
  })
  .catch(() => process.exit(1));

copy();


async function copy() {
  await Promise.all([
    copyFileDeepAsync(path.resolve("src/index-template.html"), path.resolve("bin/index-template.html")),
    copyDirRecursiveAsync(path.resolve("src/system-static"), path.resolve("bin/system-static")),
    copyDirRecursiveAsync(path.resolve("src/system-templates"), path.resolve("bin/system-templates")),
  ]);
}

async function copyDirRecursiveAsync(srcDir, destDir) {
  const copyPaths = await readDirDeepAsync(srcDir);
  const copyTasksAsync = copyPaths.map(copyPath => copyFileDeepAsync(
    path.resolve(srcDir, copyPath), path.resolve(destDir, copyPath)
  ));

  return Promise.all(copyTasksAsync);
}

async function copyFileDeepAsync(src, dest) {
  const dir = path.dirname(dest);

  await mkdirAsync(dir, { recursive: true });
  return copyFileAsync(src, dest);
}

async function readDirDeepAsync(dir) {
  const absolutePaths = await readDirDeepHelper(dir);
  const relativePaths = absolutePaths.map((absPath) => path.relative(dir, absPath));

  return relativePaths;
}

async function readDirDeepHelper(dir) {
  const dirents = await readDirAsync(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(async (dirent) => {
      const res = path.join(dir, dirent.name);
      return dirent.isDirectory() ? await readDirDeepHelper(res) : res;
    })
  );
  return files.flat();
}
