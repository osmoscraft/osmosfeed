const path = require("path");
const fs = require("fs-extra");
const ncc = require("@vercel/ncc");

ncc(path.resolve("src/main.ts")).then(({ code }) => {
  const outputPath = path.resolve("bin/main.js");
  fs.ensureFileSync(outputPath);
  fs.writeFileSync(outputPath, code);

  fs.copySync(path.resolve("src/index-template.html"), path.resolve("bin/index-template.html"));
  fs.copySync(path.resolve("src/assets"), path.resolve("bin/assets"));
});
