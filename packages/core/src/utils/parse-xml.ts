import { create } from "xmlbuilder2";

export function parseXml(input: string) {
  const doc = create(input);
  return doc.end({format: "object"});
}