import {from, mergeMap, map, tap} from "rxjs"
import { get } from "./utils/http-get.js"
import { parseXml } from "./utils/parse-xml.js";

const sources = [
  "https://css-tricks.com/feed/",
  "https://developers.google.com/web/updates/rss.xml"
]

// internal

from(sources).pipe(
  mergeMap(source => get(source)),
  tap(rawXml => console.log(rawXml)),
  map(rawXml => parseXml(rawXml))
).subscribe();
