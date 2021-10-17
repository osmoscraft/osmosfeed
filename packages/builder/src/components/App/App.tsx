import React from "react";
import styled from "styled-components";
import { AppMenu } from "../AppMenu/AppMenu";
import { GlobalStyles } from "./GlobalStyles";

export function App() {
  return (
    <StyledApp className="App">
      <GlobalStyles />
      <AppMenu />
    </StyledApp>
  );
}

const StyledApp = styled.div``;
