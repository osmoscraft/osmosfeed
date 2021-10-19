import { fc } from "../../lib/functional-component";

export const ArticleCard = fc("osmos-article-card").renderChild(
  ({ innerHTML }) => `
<article>${innerHTML}</article>
`
);
