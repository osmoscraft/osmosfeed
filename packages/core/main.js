import { osmosfeed } from "./dist/index.js";

const sources = [
  "https://css-tricks.com/feed/",
  "https://developers.google.com/web/updates/rss.xml"
]

osmosfeed(sources);