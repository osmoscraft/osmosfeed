import { create } from "xmlbuilder2";

export function parseXml(input) {
  const doc = create(input);
  return doc.end({format: "object"});
}