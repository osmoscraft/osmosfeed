import { AppLayout } from "./AppLayout";
import React from "react";
import { getMockContent } from "../../dev-tools/getMockContent";
import { WithGlobalStyles } from "../../dev-tools/WithGlobalStyles";

export default {
  title: "Component/AppLayout",
  component: AppLayout,
};

export const Default = () => (
  <WithGlobalStyles>
    <AppLayout
      header={
        <div>
          ---HEADER---
          <br />
          {getMockContent(100)}
          <br />
          ---HEADER END---
        </div>
      }
      main={
        <div>
          ---MAIN---
          <br />
          {getMockContent()}
          <br />
          ---MAIN END---
        </div>
      }
      footer={
        <div>
          ---FOOTER---
          <br />
          {getMockContent(100)}
          <br />
          ---FOOTER END---
        </div>
      }
    />
  </WithGlobalStyles>
);
