import { Plato, render } from "@osmoscraft/osmosfeed-gui";
import { Meta } from "@storybook/react";
import { ServerPreivew } from "../../dev-tools/ServerPreview";

export default {
  title: "Templates/Plato",
} as Meta;

export const Default = () => {
  const ssrHtml = render(Plato);
  return <ServerPreivew html={ssrHtml} cssPath="templates/Plato/style.css" />;
};
