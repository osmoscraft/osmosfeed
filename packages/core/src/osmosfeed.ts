import { from, map, mergeMap } from "rxjs";
import { fromHttpGet } from "./utils/from-http-get.js";
import { parseXml } from "./utils/parse-xml.js";

export function osmosfeed(sources: string[]) {
  from(sources).pipe(
    mergeMap(fromHttpGet),
    map(response => response?.raw),
    map(parseXml)
  )
    .subscribe(result => console.log(result))
}
