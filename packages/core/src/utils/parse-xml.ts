import { create } from "xmlbuilder2";

export function parseXml(input: string) {
  // TODO switch to htmlparser2 for lower level control and speed
  const doc = create(input);
  return doc.end({ format: "object" });
}
