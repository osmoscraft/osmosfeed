import React, { useEffect } from "react";
import { GlobalStyles } from "../components/App/GlobalStyles";
import { CarbonThemeStyles } from "../themes/Carbon";
import { PlatoThemeStyles } from "../themes/Plato";

export const WithGlobalStyles: React.FC = (props) => {
  useEffect(() => {
    if (!document.body.dataset.theme) {
      document.body.dataset.theme = "plato";
    }
  }, []);

  return (
    <>
      <PlatoThemeStyles />
      <CarbonThemeStyles />
      <GlobalStyles />
      {props.children}
    </>
  );
};