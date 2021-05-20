[![image](./docs/media/osmosfeed-square-badge.svg)](#get-started)

# 奥斯莫::源系统

利用GitHub搭建个人RSS阅读器

- 利用[GitHub Pages](https://pages.github.com/)实现Hosting
- 利用[GitHub Actions](https://github.com/features/actions)实现内容定期自动更新
- 前端由Node.js静态生成
- 使用Handlebars模板和CSS自定义变量实现主题自定义
- 开源，免费，无第三方追踪

## 展示

[![image](https://user-images.githubusercontent.com/1895289/114334657-e4268600-9aff-11eb-90c6-184284b90be2.png)](https://osmoscraft.github.io/osmosfeed-demo/)

- [官方模板 + Gruvbox dark](https://osmoscraft.github.io/osmosfeed-demo/) | [源代码](https://github.com/osmoscraft/osmosfeed-demo)
- [官方模板 + Solarized dark](https://osmoscraft.github.io/osmosfeed-examples/default-solarized-dark/)
- [官方模板 + Gruvbox light](https://osmoscraft.github.io/osmosfeed-examples/default-gruvbox-light/)
- [社区模板 + Nord dark](https://onnyyonn.github.io/feed/) | [源代码](https://github.com/onnyyonn/feed) | 作者 [onnyyonn](https://github.com/onnyyonn)
- [极简模板 (无皮肤)](https://osmoscraft.github.io/osmosfeed-examples/articles-unstyled/) 用于进阶自主设计

## 快速上手

### 创建新仓库

1. [使用osmosfeed-template官方模板创建仓库](https://github.com/osmoscraft/osmosfeed-template/generate).
2. 将可见性设为**Public（公共）**.
3. 单击**Create repository from template（从模板创建仓库）**

### 部署GitHub Pages

1. 打开刚才创建的仓库，在仓库名称下，单击 **Settings（设置）**, 在左侧边栏中，单击**Pages（页面）**
2. 在“GitHub Pages”下，使用 None（无）下拉菜单选择发布源。选择 `gh-pages`, 单击 Save（保存）。在初次访问该页面的时候，`gh-pages` 可能不会立即出现。等待1－3分钟，刷新即可。  
   ![image](https://user-images.githubusercontent.com/1895289/114324508-3dca8880-9adf-11eb-98c9-0a0779f5fd7a.png)

3. 刷新页面，直到界面上出现 `Your site is published at https://<github_username>.github.io/<repo>`的确认信息（最多等待1－3分钟）即可离开。就此部署成功。  
   ![image](https://user-images.githubusercontent.com/1895289/114324153-75383580-9add-11eb-81a6-186cb18d0851.png)

### 配置订阅

1. 进入仓库的根目录，打开`osmosfeed.yaml`文件, 单击有铅笔图标的Edit this file（编辑此文件）按钮。
2. 删除 `# ` 从而取消`cacheUrl`一行的注释。将`<github_username>`替换为你的GitHub用户名，将`<repo>`替换为仓库名.
3. 在`sources:`(订阅源)下，添加你想要的RSS/Atom源。

   ```yaml
   cacheUrl: https://<github_username>.github.io/<repo>/cache.json
   sources:
     - href: https://my-rss-source-1/feed/
     - href: https://my-rss-source-2/rss/
     - href: https://my-rss-source-3/feed
     - href: https://my-rss-source-4/news/rss
     - href: https://my-rss-source-5/rss/
   ```

4. 单击页面底部的Commit changes（提交更改）按钮。
5. 等待前端自动静态生成（1－3分钟）。阅读器将在`https://<github_username>.github.io/<repo>`接受访问。

## 指南与参考

- [自定义指南（英文）](./docs/customization-guide.md)
  - 更换皮肤
  - 更换模板
  - 添加内联HTML, CSS, JavaScript
  - 添加静态拷贝文件
- [设置参考（英文）](./docs/osmosfeed-yaml-reference.md)
- [无前端使用指南（英文）](./docs/headless-usage-guide.md)

## 贡献

- [如何贡献（英文）](./CONTRIBUTING.md)
- [开发者指南（英文）](./docs/developer-guide.md)

## 常见问题

### Can I update the content more frequently?

> Yes, you can make it as frequent as you want. In the `.github/workflows/update-feed.yaml` file, change the [cron schedule](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#schedule). But be aware that there is a [limit](<(https://docs.github.com/en/github/setting-up-and-managing-billing-and-payments-on-github/about-billing-for-github-actions)>) to the free tier of GitHub Actions. My rough estimate shows that even with hourly update, you should still have plenty of unused time. You can monitor spending on [Billing & plans page in Account settings](https://github.com/settings/billing).

### Can I make the site private so only I can see it?

> It is not possible with GitHub Pages. However, if you move the site to a different hosting service, you should be able to set up authorization on the host level. For example, if you [deploy to Netlify](./docs/guide-deploy-to-netlify), there is a paid plan for [password protection](https://docs.netlify.com/visitor-access/password-protection/).

### Do I have to type `index.html` at the end of the URL?

> No. There is a known issue with GitHub, so you might have to type it until it starts to work. See [discussion from GitHub Community](https://github.community/t/my-github-page-doesnt-redirect-to-index-html/10367/24) and [some solutions from Stack Overflow](https://stackoverflow.com/questions/45362628/github-pages-site-not-detecting-index-html)

### How to trigger a manual site update?

> You can make some changes to the `osmosfeed.yaml` file to trigger an update. For example, add an empty comment like this `# ` on a new line.

### How to build the site without using cache?

> You can comment out the `cacheUrl` property in the `osmosfeed.yaml`. Note that after the build, cache will still be created, except it won't contain any content from the previous cache.

## 生态系统

奥斯莫::源系统是[奥斯莫::工艺系统](https://osmoscraft.org)的一员。如果你觉得这个工具好用，不妨认识一下它的“朋友”？

- [奥斯莫::浏览器书签](https://github.com/osmoscraft/osmosmemo): 能够快速创建和搜索的浏览器书签。
- [奥斯莫::知识笔记](https://github.com/osmoscraft/osmosnote): 以Git作为存储媒介，支持双向超链接的文本编辑器。
