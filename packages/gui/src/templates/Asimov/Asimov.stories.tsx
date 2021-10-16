import { Meta } from "@storybook/react";
import { Header } from "../../components/Header";
import { Asimov } from "./Asimov";

export default {
  title: "Templates/Asimov",
} as Meta;

export const Default = () => (
  <Asimov>
    <Header>Hello Plato</Header>
  </Asimov>
);
