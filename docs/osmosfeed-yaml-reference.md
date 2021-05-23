# `osmosfeed.yaml` configuration reference

- `required` properties contain **example** values.
- `optional` properties contain **default** values.

```yaml
# `cacheUrl`: A URL that contains previous build output. (required)
cacheUrl: https://<github_username>.github.io/<github_repo>/cache.json

# `sources`: An array of RSS subscriptions. (required)
sources:
  # `href`: A URL that returns content in RSS 1.0, RSS 2.0, or Atom format. (required for each source)
  - href: https://example-website-1.com/feed/
  - href: https://example-website-2.com/feed/
  - href: https://example-website-3.com/feed/

# `siteTitle`: Title to use in the browser tab and the machine readable feed output. (optional)
siteTitle: "osmos::feed"

# `cacheMaxDays` Max number of days to keep the feed content in cache. A very large value can increase the initial load time of the site. (optional)
cacheMaxDays: 30
```
