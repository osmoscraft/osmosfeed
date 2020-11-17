/**
 * Credit:
 * https://github.com/rbren/rss-parser/blob/master/lib/utils.js
 * rbren + multiple contributors
 * MIT License
 */
export function htmlToPlainText(htmlString: string): string {
  // Replace block element with line break
  let str = htmlString.replace(
    /([^\n])<\/?(h|br|p|ul|ol|li|blockquote|section|table|tr|div)(?:.|\n)*?>([^\n])/gm,
    "$1\n$3"
  );

  // Remove all other tags
  str = str.replace(/<(?:.|\n)*?>/gm, "");

  return str.trim();
}
