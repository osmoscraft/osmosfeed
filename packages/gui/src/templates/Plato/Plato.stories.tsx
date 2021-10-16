import { Meta } from "@storybook/react";
import { Header } from "../../components/Header";
import { Plato } from "./Plato";

export default {
  title: "Templates/Plato",
} as Meta;

export const Default = () => (
  <Plato>
    <Header>Hello Plato</Header>
  </Plato>
);
