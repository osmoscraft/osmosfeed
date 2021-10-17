import React from "react";
import { getMockContent } from "../../dev-tools/getMockContent";
import { WithGlobalStyles } from "../../dev-tools/WithGlobalStyles";
import { Card } from "./Card";

export default {
  title: "Component/Card",
  component: Card,
};

export const Default = () => (
  <WithGlobalStyles>
    <Card>{getMockContent(256)}</Card>
  </WithGlobalStyles>
);
