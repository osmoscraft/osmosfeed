import htmlparser2 from "htmlparser2";

export function xmlToJsonFeed(input: string) {
  const dom = htmlparser2.parseDocument(input);

  console.log(dom);
}
