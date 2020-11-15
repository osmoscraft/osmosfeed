const tagsToReplace: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
};

function replaceTag(tag: string): string {
  return tagsToReplace[tag] || tag;
}

export function replaceHtmlTags(htmlString: string): string {
  return htmlString.replace(/[&<>]/g, replaceTag);
}
