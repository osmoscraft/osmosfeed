import * as React from "react";
import * as ReactDOMServer from "react-dom/server";

export type { Asimov } from "../templates/Asimov/Asimov";
export type { Plato } from "../templates/Plato/Plato";

export function render(TemplateComponent: React.FC) {
  return ReactDOMServer.renderToStaticMarkup(<TemplateComponent />);
}
