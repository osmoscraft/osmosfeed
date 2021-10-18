import ".";
import { AppLayout } from "../components/app-layout/app-layout.server";
import { Header } from "../components/header/header.server";

export default {
  title: "Themes/Carbon",
};

export const Default = () => {
  document.body.dataset.theme = "carbon";

  return `${AppLayout.innerHTML(`
    ${Header.innerHTML(`osmoscraft / carbon theme`)}
  `)}`;
};
