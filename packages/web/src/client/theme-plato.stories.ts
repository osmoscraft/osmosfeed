import ".";
import { AppLayout } from "../components/app-layout/app-layout.server";
import { Header } from "../components/header/header.server";

export default {
  title: "Themes/Plato",
};

export const Default = () => {
  document.body.dataset.theme = "plato";

  return `${AppLayout.innerHTML(`
    ${Header.innerHTML(`osmoscraft / plato theme`)}
  `)}`;
};
