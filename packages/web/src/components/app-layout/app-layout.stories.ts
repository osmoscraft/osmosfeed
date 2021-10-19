import { mockText } from "../../dev-tools/mock-text";
import { AppLayout } from "./app-layout";

export default {
  title: "Components/AppLayout",
};

export const Default = () =>
  `${AppLayout.innerHTML(`
<div class="app-layout__header">
---HEADER---
<br />
${mockText(100)}
<br />
---HEADER END---
</div>
<div class="app-layout__main">
---MAIN---
<br />
${mockText()}
<br />
---MAIN END---
</div>
<div class="app-layout__footer">
---FOOTER---
<br />
${mockText(100)}
<br />
---FOOTER END---
</div>
`)}`;
