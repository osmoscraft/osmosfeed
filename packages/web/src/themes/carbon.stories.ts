import "../client";
import { Header } from "../components/header/header.server";

export default {
  title: "Themes/Carbon",
};

export const Default = () => {
  document.body.dataset.theme = "carbon";

  return `${Header.class("big").attr({ foo: 42 }).child(`
    hello header
`)}`;
};
