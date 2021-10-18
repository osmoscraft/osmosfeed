import { Header } from "./header.server";
import "../../client";

export default {
  title: "Components/Header",
};

export const Default = () => `${Header.innerHTML("hello world")}`;
