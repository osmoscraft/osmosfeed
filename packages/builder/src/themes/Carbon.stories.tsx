import React, { useEffect } from "react";
import { App } from "../components/App/App";
import { GlobalStyles } from "../components/App/GlobalStyles";
import { CarbonThemeStyles } from "./Carbon";

export default {
  title: "Themes/Carbon",
};

export const Default = () => {
  useEffect(() => {
    document.body.dataset.theme = "carbon";
  }, []);

  return (
    <>
      <CarbonThemeStyles />
      <GlobalStyles />
      <App />
    </>
  );
};
