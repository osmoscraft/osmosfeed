import htmlparser2 from "htmlparser2";
import { getConverter } from "./get-converter.js";

export function xmlToJsonFeed(input: string) {
  const dom = htmlparser2.parseDocument(input, { xmlMode: true, decodeEntities: true });

  const converter = getConverter(dom);

  return converter.convert();
}
