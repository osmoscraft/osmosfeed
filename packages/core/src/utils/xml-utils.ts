import { decodeHTML } from "entities";
import htmlparser2 from "htmlparser2";

// TODO deprecate as needed

function xmlFieldToPlaintext(xmlField: any) {
  if (!xmlField) return undefined;
  return htmlToPlaintext(unescapeHtml(unwrapCdataIfExists(xmlField)));
}

function unwrapCdataIfExists(maybeCdataField: any): string {
  return maybeCdataField.$ ?? maybeCdataField;
}

function unescapeHtml(html: string) {
  return decodeHTML(html);
}

function htmlToPlaintext(html: string) {
  const dom = htmlparser2.parseDocument(html);
  // TODO investigate cheerio built-in options
  //
  // const text = innerText(dom.children);
  // return text;
  return "";
}
