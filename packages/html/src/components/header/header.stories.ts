import { Header } from "./header.server";
import "../../client";

export default {
  title: "Components/Header",
};

export const defaultHeader = () =>
  `${Header.class("big").attr({ foo: 42 }).child(`
    hello header
`)}`;
