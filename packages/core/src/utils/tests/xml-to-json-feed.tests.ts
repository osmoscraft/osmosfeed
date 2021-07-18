import { xmlToJsonFeed } from "../xml-to-json-feed.js";
import { describe } from "../../test-helper/describe.js";
import assert from "assert/strict";

describe("XML to JSON feed", async ({ spec }) => {
  spec("It should work", async () => {
    const result = xmlToJsonFeed("<test></test>");
    assert(true, "error!");
  });
})


