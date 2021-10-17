import React, { useEffect } from "react";
import { App } from "../components/App/App";
import { GlobalStyles } from "../components/App/GlobalStyles";
import { PlatoThemeStyles } from "../themes/Plato";

export default {
  title: "Themes/Plato",
};

export const Default = () => {
  useEffect(() => {
    document.body.dataset.theme = "plato";
  }, []);

  return (
    <>
      <PlatoThemeStyles />
      <GlobalStyles />
      <App />
    </>
  );
};
