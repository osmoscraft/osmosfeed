import { fxc } from "../../lib/functional-component";

export const Header = fxc(function ({ child }) {
  return `
  <osmos-header>${child}</osmos-header>
  `;
});
