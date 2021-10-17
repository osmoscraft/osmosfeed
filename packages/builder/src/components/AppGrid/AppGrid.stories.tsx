import { AppGrid } from "./AppGrid";
import React from "react";
import { getMockContent } from "../../dev-tools/getMockContent";
import { WithGlobalStyles } from "../../dev-tools/WithGlobalStyles";

export default {
  title: "Component/AppGrid",
  component: AppGrid,
};

export const Default = () => (
  <WithGlobalStyles>
    <AppGrid>
      <div className="c-app-layout__header">
        ---HEADER---
        <br />
        {getMockContent(100)}
        <br />
        ---HEADER END---
      </div>
      <div className="c-app-layout__main">
        ---MAIN---
        <br />
        {getMockContent()}
        <br />
        ---MAIN END---
      </div>
      <div className="c-app-layout__footer">
        ---FOOTER---
        <br />
        {getMockContent(100)}
        <br />
        ---FOOTER END---
      </div>
    </AppGrid>
  </WithGlobalStyles>
);
