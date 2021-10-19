import { mockText } from "../../dev-tools/mock-text";
import { ArticleCard } from "./article-card";

export default {
  title: "Components/ArticleCard",
};

export const Default = () =>
  `${ArticleCard.innerHTML(`
<img src="https://via.placeholder.com/300x200">
<h1>Hello world!</h1>
<p>${mockText(255)}</p>
`)}`;
