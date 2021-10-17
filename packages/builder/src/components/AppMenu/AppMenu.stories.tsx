import React from "react";
import { WithGlobalStyles } from "../../dev-tools/WithGlobalStyles";
import { AppMenu } from "./AppMenu";

export default {
  title: "Component/AppMenu",
  component: AppMenu,
};

export const Default = () => (
  <WithGlobalStyles>
    <AppMenu>test</AppMenu>
  </WithGlobalStyles>
);
