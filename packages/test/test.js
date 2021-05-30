// for each spec folder
// 1. spin up test server
// 2. run build
// 3. assert
const { spawn } = require("child_process");
const promises = require("fs/promises");
const assert = require("assert/strict");

const readFileAsync = promises.readFile;

const mockServerThread = spawn("node", ["../../mock-server/serve-static.js"], { cwd: "specs/single-empty-source" });
mockServerThread.stdout.on("data", function (msg) {
  console.log(msg.toString());
});

const builderThread = spawn("npm", ["run", "build"], { cwd: "specs/single-empty-source" });
builderThread.stdout.on("data", function (msg) {
  console.log(msg.toString());
});
builderThread.on("exit", () => {
  mockServerThread.kill();
});

async function assertOutput() {
  const cacheOutput = await readJsonAsync("specs/single-empty-source/public/cache.json");
  const cacheSnapshot = await readJsonAsync("specs/single-empty-source/snapshots/cache.json");
  assert.deepEqual(cacheOutput, cacheSnapshot);
}

assertOutput();

async function readJsonAsync(path) {
  const data = await readFileAsync(path, "utf-8");
  const object = JSON.parse(data);
  return object;
}
