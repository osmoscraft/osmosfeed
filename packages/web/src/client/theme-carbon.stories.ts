import ".";
import { AppLayout } from "../components/app-layout/app-layout";
import { Header } from "../components/header/header";

export default {
  title: "Themes/Carbon",
};

export const Default = () => {
  document.body.dataset.theme = "carbon";

  return `${AppLayout.innerHTML(`
    ${Header.innerHTML(`osmoscraft / carbon theme`)}
  `)}`;
};
