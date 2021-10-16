import React from "react";
import { Header } from "../../components/Header";
import jsFile from "./app.js?url";
import "./Plato.css";

export interface PlatoTemplateProps {
  feed?: any;
}

export const Plato: React.FC<PlatoTemplateProps> = (props) => (
  <>
    <Header>Plato template</Header>
    <script type="module" src={jsFile}></script>
  </>
);
