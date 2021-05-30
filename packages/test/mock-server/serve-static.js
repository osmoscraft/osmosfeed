const path = require("path");
const http = require("http");
const promises = require("fs/promises");
const readFileAsync = promises.readFile;

const PORT = 12321;
const MOCK_CONTENT_DIR = "mock-content";

const mockContentDir = path.join(process.cwd(), MOCK_CONTENT_DIR);

console.log(`[serve-static] content dir:`, mockContentDir);

http
  .createServer(async function (req, res) {
    try {
      const data = await readFileAsync(path.join(mockContentDir, req.url));
      res.writeHead(200);
      res.end(data);
    } catch (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
    }
  })
  .listen(PORT);
