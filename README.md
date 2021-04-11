# Demo

# Get started

## Create a repository

1. Open [Create a new repository from osmosfeed-template](https://github.com/osmoscraft/osmosfeed-template/generate).
2. Set visibility to "Public".
3. Click "Create repository from template" button.

## Turn on GitHub Pages

1. In the repository you just created, navigate to "Settings" tab > "Pages" section.
2. In "Source" option, select `gh-pages`, click "Save" button. If `gh-pages` doesn't exist, wait for a couple of seconds and refresh the page. It will eventually show up.
3. Your feed is now available at `https://GITHUB_USERNAME.github.io/REPO_NAME/index.html`

## Customize the feed

1. In the repository root, open `osmosfeed.yaml` file, click the "Pencil (Edit this file)" button to edit.
2. Remove `# ` to uncommend the `cacheUrl` property, replace `GITHUB_USERNAME` with your GitHub username, and replace `REPO_NAME` with your GitHub username.
3. In the sources, update the items to the sources you want to follow. The final file content should look similar to this:

   ```yaml
   cacheUrl: https://GITHUB_USERNAME.github.io/REPO_NAME/cache.json
   sources:
     - href: https://my-rss-source-1/feed/
     - href: https://my-rss-source-2/rss/
     - href: https://my-rss-source-3/feed
     - href: https://my-rss-source-4/news/rss
     - href: https://my-rss-source-5/rss/
   ```

4. Scroll to the bottom of the page, click "Commit changes" button.
5. Once the rebuild finishes, your feed will be available at https://YOUR_GITHUB_USERNAME.github.io/REPO_NAME

## Next steps

- [Customize refresh schedule](./docs/guide-customize-refresh-schedule)
- [Deploy to Netlify](./docs/guide-deploy-to-netlify)
- [Developer guide](./docs/guide-development)

## FAQ

### Can I make the site private so only I can visit it?

It is not possible with GitHub Pages. However, if you move the site to a different hosting service, you should be able to set up authorization on the host level. For example, if you [deploy to Netlify](./docs/guide-deploy-to-netlify), there is paid plan for [password protection](https://docs.netlify.com/visitor-access/password-protection/).

### Do I have to type `index.html` at the end of the URL?

No. But there is a long running issue with GitHub. See [discussion from GitHub Community](https://github.community/t/my-github-page-doesnt-redirect-to-index-html/10367/24) and [some solutions from Stack Overflow](https://stackoverflow.com/questions/45362628/github-pages-site-not-detecting-index-html)
