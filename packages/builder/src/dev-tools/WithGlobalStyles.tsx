import React from "react";
import { GlobalStyles } from "../components/App/GlobalStyles";

export const WithGlobalStyles: React.FC = (props) => {
  return (
    <>
      <GlobalStyles />
      {props.children}
    </>
  );
};
