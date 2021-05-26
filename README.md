[![image](./docs/media/osmosfeed-square-badge.svg)](#get-started)

[中文](./README_zh.md)

# osmos::feed

An RSS reader running entirely from your GitHub repo.

- Free hosting on [GitHub Pages](https://pages.github.com/). No ads. No third party tracking.
- No need for backend. Content updates via [GitHub Actions](https://github.com/features/actions).
- Customizable layouts and styles via templating and theming API. Just bring your HTML and CSS.
- Free and open source. No third-party tracking.

## Demos

[![image](https://user-images.githubusercontent.com/1895289/114334657-e4268600-9aff-11eb-90c6-184284b90be2.png)](https://osmoscraft.github.io/osmosfeed-demo/)

- [Default template + Gruvbox dark](https://osmoscraft.github.io/osmosfeed-demo/) | [View source](https://github.com/osmoscraft/osmosfeed-demo)
- [Default template + Solarized dark](https://osmoscraft.github.io/osmosfeed-examples/default-solarized-dark/)
- [Default template + Solarized light](https://osmoscraft.github.io/osmosfeed-examples/default-solarized-light/)
- [Custom template + Nord dark](https://onnyyonn.github.io/feed/) | [View source](https://github.com/onnyyonn/feed) | by [onnyyonn](https://github.com/onnyyonn)
- [An unstyled minimalist template](https://osmoscraft.github.io/osmosfeed-examples/articles-unstyled/) for building from scratch.  
- [Sources and more examples](https://github.com/osmoscraft/osmosfeed-examples)

## Get started

### Create a repository

1. Open [Create a new repository from osmosfeed-template](https://github.com/osmoscraft/osmosfeed-template/generate).
2. Set visibility to "Public".  
   ![image](https://user-images.githubusercontent.com/1895289/118917672-3d938900-b8e6-11eb-892c-6bb9203c7419.png)
3. Click "Create repository from template" button.

### Turn on GitHub Pages

1. In the repository you just created, navigate to **Settings** tab > **Pages** section.
2. In **Source** option, select `gh-pages`, click "Save" button. If `gh-pages` doesn't exist, wait for a couple of seconds and refresh the page. It will eventually show up.  
   ![image](https://user-images.githubusercontent.com/1895289/114324508-3dca8880-9adf-11eb-98c9-0a0779f5fd7a.png)

3. Refresh the page until it shows `Your site is published at https://<github_username>.github.io/<repo>`. This may take up to a minute.  
   ![image](https://user-images.githubusercontent.com/1895289/114324153-75383580-9add-11eb-81a6-186cb18d0851.png)

### Customize the feed

1. In the repository root, open `osmosfeed.yaml` file, click the "Pencil (Edit this file)" button to edit.
2. Remove `# ` to uncommend the `cacheUrl` property, replace `<github_username>` with your GitHub username, and replace `<repo>` with your GitHub repo name.
3. In the sources, update the items to the sources you want to follow. The final content of the file should look similar to this:

   ```yaml
   cacheUrl: https://<github_username>.github.io/<repo>/cache.json
   sources:
     - href: https://my-rss-source-1/feed/
     - href: https://my-rss-source-2/rss/
     - href: https://my-rss-source-3/feed
     - href: https://my-rss-source-4/news/rss
     - href: https://my-rss-source-5/rss/
   ```

4. Scroll to the bottom of the page, click "Commit changes" button.
5. Once the rebuild finishes, your feed will be available at `https://<github_username>.github.io/<repo>`.

## Guides and references

- [Customization guide](./docs/customization-guide.md)
  - Changing theme
  - Changing template
  - Add inline HTML, CSS, JavaScript
  - Add static files
- [Configuration reference](./docs/osmosfeed-yaml-reference.md)
- [Headless usage guide](./docs/headless-usage-guide.md)

## To contribute

- [How to contribute](./CONTRIBUTING.md)
- [Developer guide](./docs/developer-guide.md)

## FAQ

### Can I update the content more frequently?

> Yes, you can make it as frequent as you want. In the `.github/workflows/update-feed.yaml` file, change the [cron schedule](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#schedule). But be aware that there is a [limit](<(https://docs.github.com/en/github/setting-up-and-managing-billing-and-payments-on-github/about-billing-for-github-actions)>) to the free tier of GitHub Actions. My rough estimate shows that even with hourly update, you should still have plenty of unused time. You can monitor spending on [Billing & plans page in Account settings](https://github.com/settings/billing).

### Can I make the site private so only I can see it?

> It is not possible with GitHub Pages. However, if you move the site to a different hosting service, you should be able to set up authorization on the host level. For example, if you [deploy to Netlify](./docs/guide-deploy-to-netlify), there is a paid plan for [password protection](https://docs.netlify.com/visitor-access/password-protection/).

### Do I have to type `index.html` at the end of the URL?

> No. There is a known issue with GitHub, so you might have to type it until it starts to work. See [discussion from GitHub Community](https://github.community/t/my-github-page-doesnt-redirect-to-index-html/10367/24) and [some solutions from Stack Overflow](https://stackoverflow.com/questions/45362628/github-pages-site-not-detecting-index-html)

### How to trigger a manual site update?

> You can make some changes to the `osmosfeed.yaml` file to trigger an update. For example, add an empty comment like this `# ` on a new line.

### How to reset cache?

> You can browse to the `gh-pages` branch on GitHub at `https://github.com/<owner>/<repo>/tree/gh-pages`. Manually delete the `cache.json` file. Then trigger a manual site update.

## Ecosystem

osmos::feed is part of the [osmos::craft](https://osmoscraft.org) ecosystem. If you enjoy this tool, you might also like:

- [osmos::memo](https://github.com/osmoscraft/osmosmemo): An in-browser bookmark manager optimized for tagging and retrieval speed.
- [osmos::note](https://github.com/osmoscraft/osmosnote): A web-based text editor for networked note-taking, self-hostable on any Git repository.
