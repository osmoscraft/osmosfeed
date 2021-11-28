import { JsonFeedChannel } from "@osmoscraft/feed-parser";
import { Channel } from "./channel.component";

export interface AppModel {
  data: JsonFeedChannel[];
  entryScripts: Asset[];
  entryStylesheets: Asset[];
  favicon?: Asset; // TODO implement
}

export interface Asset {
  href: string;
}

export function App(model: AppModel) {
  return `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>osmos::feed</title>
    ${model.entryScripts.map((asset) => `<link rel="stylesheet" href="${asset.href}">`).join("\n")}
	</head>
	<body>
    <osmos-app>
      <div class="c-feed-list">
      ${model.data.map((channel) => Channel({ parent: model, data: channel })).join("\n")}
      </div>
    </osmos-app>
    ${model.entryStylesheets.map((asset) => `<script type="module" src="${asset.href}"></script>`).join("\n")}
	</body>
</html>
`.trim();
}
