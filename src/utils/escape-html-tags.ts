const tagsToReplace = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
};

function replaceTag(tag) {
  return tagsToReplace[tag] || tag;
}

export function replaceHtmlTags(str) {
  return str.replace(/[&<>]/g, replaceTag);
}
