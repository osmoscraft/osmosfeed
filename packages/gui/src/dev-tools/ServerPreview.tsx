export interface SsrPreviewProps {
  html: string;
  cssPath: string;
}

export const ServerPreivew: React.FC<SsrPreviewProps> = (props) => {
  const html = `
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>blah</title>
  </head>
  <body>
    <link rel="stylesheet" href="${props.cssPath}" />
    ${props.html}
</html>
    `;

  return <iframe style={{ border: "none", width: "100%", height: "100%" }} srcDoc={html} />;
};
