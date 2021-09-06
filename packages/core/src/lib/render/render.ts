import type { JsonFeed, JsonFeedItem } from "../parse/parse-xml-feed";

export function render(jsonFeeds: JsonFeed[], css: string) {
  return `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>osmos::feed</title>
		<link rel="stylesheet" href="style.css">
		<script src="script.js"></script>
	</head>
	<body>
		<style>${css}</style>
		<div class="feed-list">
			${jsonFeeds.map((feed) => renderFeed(feed)).join("\n")}
		</div>
	</body>
</html>
`.trim();
}

function renderFeed(feed: JsonFeed) {
  return `
	<section class="feed">
		<h1 class="feed-title-group">
			<img class="feed-icon" src="${feed.icon}" width="32" height="32" onError="this.remove()">
			<a class="reset-link" href="${feed.feed_url}">${feed.title}</a>
		</h1>
		<div class="article-list">
			${feed.items.map(renderArticle).join("\n")}
		</div>
	</section>
`.trim();
}

function renderArticle(item: JsonFeedItem) {
  return `
<article class="article">
	<a class="reset-link" href="${item.url}">
		<img class="article__image" src="${item.image}" onError="this.remove()">
		<h2 class="article__title">${item.title}</h2>
    <time datetime="${item.date_published}">${item.date_published}</time>
		<p class="article__summary">${item.summary}</p>
	</a>
</article>
`.trim();
}
