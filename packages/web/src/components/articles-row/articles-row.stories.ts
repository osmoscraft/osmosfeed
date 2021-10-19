import { mockText } from "../../dev-tools/mock-text";
import { ArticlesRow } from "./articles-row";

export default {
  title: "Components/ArticlesRow",
};

export const Default = () =>
  `${ArticlesRow.innerHTML(`
<article>
  <img src="https://via.placeholder.com/300x200">
  <p>${mockText(255)}</p>
</article>
<article>
  <img src="https://via.placeholder.com/300x200">
  <p>${mockText(255)}</p>
</article>
<article>
  <img src="https://via.placeholder.com/300x200">
  <p>${mockText(255)}</p>
</article>
<article>
  <img src="https://via.placeholder.com/300x200">
  <p>${mockText(255)}</p>
</article>
<article>
  <img src="https://via.placeholder.com/300x200">
  <p>${mockText(255)}</p>
</article>
<article>
  <img src="https://via.placeholder.com/300x200">
  <p>${mockText(255)}</p>
</article>
`)}`;
