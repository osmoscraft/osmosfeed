import { JsonFeedChannel } from "@osmoscraft/feed-parser";
import { Channel } from "./channel.component";

export interface AppModel {
  data: JsonFeedChannel[];
  embeddedScripts: EmbeddedResource[];
  embeddedStylesheets: EmbeddedResource[];
  favicon?: EmbeddedResource; // TODO implement
}

export interface EmbeddedResource {
  content: Buffer;
}

export function App(model: AppModel) {
  return `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>osmos::feed</title>
    ${model.embeddedStylesheets.map((resource) => `<style>${resource.content}</style>`).join("\n")}
	</head>
	<body>
    <osmos-app>
      <div class="c-feed-list">
      ${model.data.map((channel) => Channel({ parent: model, data: channel })).join("\n")}
      </div>
    </osmos-app>
    ${model.embeddedScripts.map((resource) => `<script type="module">${resource.content}</script>`).join("\n")}
	</body>
</html>
`.trim();
}
