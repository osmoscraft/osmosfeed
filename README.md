![image](https://user-images.githubusercontent.com/1895289/115334130-aa80fb00-a14f-11eb-9f9a-e0d2b8a15851.png)

# osmos::feed

A web-based RSS reader running entirely from your GitHub repo.

- The feed is statically hosted as [GitHub Pages](https://pages.github.com/). The content stays the same until the next build.
- The feed is rebuilt periodically by [GitHub Actions](https://github.com/features/actions), configured in [.github/workflows/update-feed.yaml](https://github.com/osmoscraft/osmosfeed-demo/blob/main/.github/workflows/update-feed.yaml).
- During a rebuild, [cache from the previous build](https://osmoscraft.github.io/osmosfeed-demo/cache.json) is used, so only new content will be downloaded.
- The source of the content can be any RSS feed URL, configured in [osmosfeed.yaml](https://github.com/osmoscraft/osmosfeed-demo/blob/main/osmosfeed.yaml).
- The content fetching and static site generation is powered by a custom [node.js script](https://github.com/osmoscraft/osmosfeed/blob/master/src/main.ts) optimized for speed.

## Demo

[![image](https://user-images.githubusercontent.com/1895289/114334657-e4268600-9aff-11eb-90c6-184284b90be2.png)](https://osmoscraft.github.io/osmosfeed-demo/)

- [Open demo](https://osmoscraft.github.io/osmosfeed-demo/) | [View source](https://github.com/osmoscraft/osmosfeed-demo)

## Get started

### Create a repository

1. Open [Create a new repository from osmosfeed-template](https://github.com/osmoscraft/osmosfeed-template/generate).
2. Set visibility to "Public".
3. Click "Create repository from template" button.

### Turn on GitHub Pages

1. In the repository you just created, navigate to **Settings** tab > **Pages** section.
2. In **Source** option, select `gh-pages`, click "Save" button. If `gh-pages` doesn't exist, wait for a couple of seconds and refresh the page. It will eventually show up.  
   ![image](https://user-images.githubusercontent.com/1895289/114324508-3dca8880-9adf-11eb-98c9-0a0779f5fd7a.png)

3. Refresh the page until it shows `Your site is published at https://GITHUB_USERNAME.github.io/REPO_NAME`. This may take up to a minute.  
   ![image](https://user-images.githubusercontent.com/1895289/114324153-75383580-9add-11eb-81a6-186cb18d0851.png)

### Customize the feed

1. In the repository root, open `osmosfeed.yaml` file, click the "Pencil (Edit this file)" button to edit.
2. Remove `# ` to uncommend the `cacheUrl` property, replace `GITHUB_USERNAME` with your GitHub username, and replace `REPO_NAME` with your GitHub username.
3. In the sources, update the items to the sources you want to follow. The final content of the file should look similar to this:

   ```yaml
   cacheUrl: https://REPLACED_GITHUB_USERNAME.github.io/REPLACED_REPO_NAME/cache.json
   sources:
     - href: https://my-rss-source-1/feed/
     - href: https://my-rss-source-2/rss/
     - href: https://my-rss-source-3/feed
     - href: https://my-rss-source-4/news/rss
     - href: https://my-rss-source-5/rss/
   ```

4. Scroll to the bottom of the page, click "Commit changes" button.
5. Once the rebuild finishes, your feed will be available at `https://REPLACED_GITHUB_USERNAME.github.io/REPLACED_REPO_NAME`.

## Guides and references

- [Configuration reference](./docs/osmosfeed-yaml-reference.md)
- [Customization guide](./docs/customization-guide.md)
- [Developer guide](./docs/developer-guide.md)
- [(coming soon) How to customize refresh schedule](./docs/how-to-customize-refresh-schedule.md)
- [(coming soon) How to deploy to other hosts](./docs/how-to-deploy-to-other-hosts.md)

## To contribute
For questions, bug reports, feature requests, translation: [How to contribution](./CONTRIBUTING.md)

## FAQ

### Can I update the content more frequently?

> Yes, you can make it as frequent as you want. But be aware that there is a [limit](<(https://docs.github.com/en/github/setting-up-and-managing-billing-and-payments-on-github/about-billing-for-github-actions)>) to the free tier of GitHub Actions. My rough estimate shows that even with hourly update, you should still have plenty of unused time. You can monitory spending on [Billing & plans page in Account settings](https://github.com/settings/billing).

### Can I make the site private so only I can see it?

> It is not possible with GitHub Pages. However, if you move the site to a different hosting service, you should be able to set up authorization on the host level. For example, if you [deploy to Netlify](./docs/guide-deploy-to-netlify), there is a paid plan for [password protection](https://docs.netlify.com/visitor-access/password-protection/).

### Do I have to type `index.html` at the end of the URL?

> No. But there is a known issue with GitHub. See [discussion from GitHub Community](https://github.community/t/my-github-page-doesnt-redirect-to-index-html/10367/24) and [some solutions from Stack Overflow](https://stackoverflow.com/questions/45362628/github-pages-site-not-detecting-index-html)

### How to trigger a manual site update?

> You can make some changes to the `osmosfeed.yaml` file to trigger an update. For example, add an empty comment like this `# ` on a new line.

### How to build the site without using cache?

> You can comment out the `cacheUrl` property in the `osmosfeed.yaml`. Note that after the build, cache will still be created, except it won't contain any content from the previous cache.

## Ecosystem

osmos::feed is part of the [osmos::craft](https://osmoscraft.org) ecosystem. If you enjoy this tool, you might also like:

- [osmos::memo](https://github.com/osmoscraft/osmosmemo): An in-browser bookmark manager optimized for tagging and retrieval speed.
- [osmos::note](https://github.com/osmoscraft/osmosnote): A web-based text editor for networked note-taking, self-hostable on any Git repository.
