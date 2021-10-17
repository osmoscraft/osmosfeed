import { createGlobalStyle } from "styled-components";

export const CarbonThemeStyles = createGlobalStyle`
body[data-theme="carbon"] {
  --defaultTextColor: #fff;
  --pageBackground: #333231;
  --cardBackground: #333231;
}
`;
