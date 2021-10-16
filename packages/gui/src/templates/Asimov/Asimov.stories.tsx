import { Asimov, render } from "@osmoscraft/osmosfeed-gui";
import { Meta } from "@storybook/react";
import { ServerPreivew } from "../../dev-tools/ServerPreview";

export default {
  title: "Templates/Asimov",
} as Meta;

export const Default = () => {
  const ssrHtml = render(Asimov);
  return <ServerPreivew html={ssrHtml} cssPath="templates/Asimov/style.css" />;
};
