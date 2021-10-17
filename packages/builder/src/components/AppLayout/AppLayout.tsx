import React from "react";
import styled from "styled-components";

interface Props {
  header: JSX.Element;
  main: JSX.Element;
  footer: JSX.Element;
}

export const AppLayout: React.FC<Props> = (props) => {
  return (
    <AppLayoutGrid>
      <HeaderArea>{props.header}</HeaderArea>
      <MainArea>{props.main}</MainArea>
      <FooterArea>{props.footer}</FooterArea>
    </AppLayoutGrid>
  );
};

const AppLayoutGrid = styled.div`
  display: grid;
  min-height: 100vh;

  grid-template:
    "header" auto
    "main" 1fr
    "footer" auto / 1fr;
`;

const HeaderArea = styled.div`
  grid-area: header;
`;

const MainArea = styled.div`
  grid-area: main;
`;
const FooterArea = styled.div`
  grid-area: footer;
`;
