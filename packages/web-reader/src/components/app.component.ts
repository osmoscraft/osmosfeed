import { JsonFeedChannel } from "@osmoscraft/osmosfeed-core";
import { Channel } from "./channel.component";

export interface AppModel {
  data: JsonFeedChannel[];
  assets: Asset[];
}

export interface Asset {
  type: "script" | "stylesheet";
  href: string;
}

export function App(model: AppModel) {
  return `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>osmos::feed</title>
    ${model.assets
      .filter((asset) => asset.type === "stylesheet")
      .map((asset) => `<link rel="stylesheet" href="${asset.href}">`)
      .join("\n")}
	</head>
	<body>
    <osmos-app>
      <div class="c-feed-list">
      ${model.data.map((channel) => Channel({ parent: model, data: channel })).join("\n")}
      </div>
    </osmos-app>
    ${model.assets
      .filter((asset) => asset.type === "script")
      .map((asset) => `<script type="module" src="${asset.href}"></script>`)
      .join("\n")}
	</body>
</html>
`.trim();
}
