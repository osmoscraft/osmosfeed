import ".";
import { AppLayout } from "../components/app-layout/app-layout";
import { ArticleCard } from "../components/article-card/article-card";
import { ArticlesRow } from "../components/articles-row/articles-row";
import { Header } from "../components/header/header";
import { mockText } from "../dev-tools/mock-text";

export default {
  title: "Themes/Carbon",
};

export const Default = () => {
  document.body.dataset.theme = "carbon";

  return `${AppLayout.innerHTML(`
    ${Header.class("app-layout__header").innerHTML(`osmoscraft / carbon theme demo`)}
    <div class="app-layout__main">
      ${ArticlesRow.innerHTML(`
        ${ArticleCard.innerHTML(mockText(255))}
        ${ArticleCard.innerHTML(mockText(255))}
        ${ArticleCard.innerHTML(mockText(255))}
      `)}
      <br>
      ${ArticlesRow.innerHTML(`
        ${ArticleCard.innerHTML(mockText(255))}
        ${ArticleCard.innerHTML(mockText(255))}
        ${ArticleCard.innerHTML(mockText(255))}
      `)}
    </div>
    <footer>osmosfeed lab</footer>
  `)}`;
};
