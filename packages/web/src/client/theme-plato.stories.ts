import ".";
import { AppLayout } from "../components/app-layout/app-layout";
import { Header } from "../components/header/header";

export default {
  title: "Themes/Plato",
};

export const Default = () => {
  document.body.dataset.theme = "plato";

  return `${AppLayout.innerHTML(`
    ${Header.innerHTML(`osmoscraft / plato theme`)}
  `)}`;
};
