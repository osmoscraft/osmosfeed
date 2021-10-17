import React from "react";
import styled from "styled-components";

interface Props {}

export const AppGrid: React.FC<Props> = (props) => {
  return <AppLayoutGrid>{props.children}</AppLayoutGrid>;
};

const AppLayoutGrid = styled.div`
  display: grid;
  min-height: 100vh;

  grid-template:
    "header" auto
    "main" 1fr
    "footer" auto / 1fr;

  .c-app-layout__header {
    grid-area: header;
  }

  .c-app-layout__main {
    grid-area: main;
  }
  .c-app-layout__footer {
    grid-area: footer;
  }
`;
