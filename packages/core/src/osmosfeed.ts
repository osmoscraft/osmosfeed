import { from, map, mergeMap } from "rxjs";
import { fromHttpGet } from "./utils/from-http-get.js";
import { parseFeed } from "./utils/parse-feed.js";

export function osmosfeed(sources: string[]) {
  from(sources).pipe(
    mergeMap(fromHttpGet),
    map(response => response?.raw),
    map(parseFeed)
  )
    .subscribe(result => console.log(result))
}
