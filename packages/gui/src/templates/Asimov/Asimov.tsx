import React from "react";
import "./Asimov.css";

export const Asimov: React.FC = (props) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <title></title>
    </head>
    <body>{props.children}</body>
  </html>
);
