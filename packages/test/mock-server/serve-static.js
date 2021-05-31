import path from "path";
import http from "http";
import promises from "fs/promises";
const readFileAsync = promises.readFile;
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = 12321;
const MOCK_CONTENT_DIR = "feeds";

const mockContentDir = path.resolve(__dirname, MOCK_CONTENT_DIR);

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
