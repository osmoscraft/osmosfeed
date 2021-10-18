import "../client";
import { Header } from "../components/header/header.server";

export default {
  title: "Themes/Plato",
};

export const Default = () => {
  document.body.dataset.theme = "plato";

  return `${Header.class("big").attr({ foo: 42 }).innerHTML(`
    hello header
`)}`;
};
