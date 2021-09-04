import type { JsonFeed } from "../parse/parse-xml-feed";

export function render(jsonFeeds: JsonFeed[]) {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>title</title>
      <link rel="stylesheet" href="style.css">
      <script src="script.js"></script>
    </head>
    <body>
      TODO: render the feed
    </body>
  </html>
`.trim();
}
