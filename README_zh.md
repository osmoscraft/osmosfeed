[![image](./docs/media/osmosfeed-square-badge.svg)](#快速上手)

[English](./README.md)

# 奥斯莫::源系统

利用GitHub搭建个人RSS阅读器

- 利用[GitHub Pages](https://pages.github.com/)实现Hosting
- 利用[GitHub Actions](https://github.com/features/actions)实现内容定期自动更新
- 前端由Node.js静态生成
- 使用Handlebars模板和CSS自定义变量实现主题自定义
- 开源，免费，无第三方追踪

## 展示

[![image](https://user-images.githubusercontent.com/1895289/153740570-26ac58de-373c-4804-9198-0a3d7fadf1c0.png)](https://osmoscraft.github.io/osmosfeed-demo/)

- [官方模板 + Gruvbox dark](https://osmoscraft.github.io/osmosfeed-demo/) | [源代码](https://github.com/osmoscraft/osmosfeed-demo)
- [官方模板 + Solarized dark](https://osmoscraft.github.io/osmosfeed-examples/default-solarized-dark/)
- [官方模板 + Solarized light](https://osmoscraft.github.io/osmosfeed-examples/default-solarized-light/)
- [极简模板 (无皮肤)](https://osmoscraft.github.io/osmosfeed-examples/articles-unstyled/) 用于进阶自主设计
- [更多展示及源代码](https://github.com/osmoscraft/osmosfeed-examples)

## 快速上手

### 创建新仓库

1. [使用osmosfeed-template官方模板创建仓库](https://github.com/osmoscraft/osmosfeed-template/generate)
2. 将可见性设为Public（公共）。  
   ![image](https://user-images.githubusercontent.com/1895289/118917672-3d938900-b8e6-11eb-892c-6bb9203c7419.png)
3. 单击Create repository from template（从模板创建仓库）

### 部署GitHub Pages

1. 打开刚才创建的仓库，在仓库名称下，单击Settings（设置）, 在左侧边栏中，单击Pages（页面）
2. 在“GitHub Pages”下，使用 None（无）下拉菜单选择发布源。选择 `gh-pages`, 单击 Save（保存）。如果在初次访问该页面的时候`gh-pages`并不存在，等待1－2分钟，刷新之后选项便会出现。  
   ![image](https://user-images.githubusercontent.com/1895289/114324508-3dca8880-9adf-11eb-98c9-0a0779f5fd7a.png)

3. 刷新页面，直到界面上出现 `Your site is published at https://<github_username>.github.io/<repo>`的确认信息（最多等待1－3分钟）即可离开。部署就此成功。  
   ![image](https://user-images.githubusercontent.com/1895289/114324153-75383580-9add-11eb-81a6-186cb18d0851.png)

### 配置订阅

1. 进入仓库的根目录，打开`osmosfeed.yaml`文件, 单击有铅笔图标的Edit this file（编辑此文件）按钮。
2. 删除 `# ` 从而取消`cacheUrl`一行的注释。将`<github_username>`替换为GitHub用户名，将`<repo>`替换为仓库名.
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
- [源生成指南（英文）](./docs/headless-usage-guide.md)

## 贡献

- [如何贡献（英文）](./CONTRIBUTING.md)
- [开发者指南（英文）](./docs/developer-guide.md)

## 常见问题

### 可以更加频繁的更新内容吗？

> 可以。更新频率没有特定限制。只需在工作流程设置文件`.github/workflows/update-feed.yaml`中改变[cron schedule](https://docs.github.com/cn/actions/reference/events-that-trigger-workflows)。但不要太贪心哟。GitHub对于每月工作流程运行的总时间有[限制](https://docs.github.com/cn/github/setting-up-and-managing-billing-and-payments-on-github/managing-billing-for-github-actions/about-billing-for-github-actions)。我掐指算了算，即便是每小时更新一次，每月将仍有不少分钟数盈余。你可以在[设置界面](https://github.com/settings/billing)随时查看本月剩余分钟数。

### 我可以将仓库可见性设为Private（私人）吗？

> 目前GitHub Pages建站暂不兼容私人仓库。如果你将静态生成的网站部署到其它虚拟主机或者存储服务器上的话，他们可能会提供密码保护。

### 我在部署GitHub Pages之后访问阅读器，等到了海枯石烂也只能看到404。

> 在地址后加上`index.html`试试看？比如`https://<github_username>.github.io/<repo>／index.html`。GitHub有已知缺陷，详见[社区讨论](https://github.community/t/my-github-page-doesnt-redirect-to-index-html/10367/24)和[Stack Overflow上的解决方案](https://stackoverflow.com/questions/45362628/github-pages-site-not-detecting-index-html)。笔者亲测，随便提交一些空白的更新，重新触发工作流程便可解决问题。

### 如何手动触发内容更新？

> 提交任意源代码更改即可。比如在`osmosfeed.yaml`文件中另起一行，添加空白注释`# `。

### 如何清空内容缓存？

> 进入GitHub仓库里的`gh-pages`分支，（地址`https://github.com/<owner>/<repo>/tree/gh-pages`）。手动删除`cache.json`文件。触发一次内容更新即可。

## 生态系统

奥斯莫::源系统是[奥斯莫::工艺系统](https://osmoscraft.org)的一员。如果你觉得这个工具好用，不妨认识一下它的“朋友”？

- [奥斯莫::浏览器书签](https://github.com/osmoscraft/osmosmemo): 能够快速创建和搜索的浏览器书签。
- [奥斯莫::知识笔记](https://github.com/osmoscraft/osmosnote): 以Git作为存储媒介，支持双向超链接的文本编辑器。

（翻译若有不妥请多多见谅。欢迎提供修改意见。如有疑问或想贡献文档翻译，请在[Disucssion](https://github.com/osmoscraft/osmosfeed/discussions/categories/ideas)创建新话题。谢谢。）
