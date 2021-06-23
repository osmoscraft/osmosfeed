# unreleased

- Changed: Default HTML template meta tag adjusted to match convention
- Changed: `sources` in template data is now ordered by last update timestamp (as opposed to alphabetical)

# v1.10.2

- Added: testing and CI/CD workflows

# v1.9.0

- Added: experimental support for podcast sources. You can render an audio control to play the mp3 file and display iTunes episode duration. Caveats:
  - 1. This feature is currently only available through custom template.
  - 2. iTunes has no strict format requirement for `duration`. The unit is most likely seconds. A future version may expose a human readable string to the template.
  - 3. No image support yet. Some shows might have disabled CORS or use a relative URL for image, which forces osmosfeed to download the image during build. A future version may support it.
  - 4. You can't republish the podcast in the feed output. Supporting this goes beyond the scope of the project at the moment.
- Fixed: the `articles` in template data were not sorted.
- Thank you: @Zenigata

# v1.8.1

- Fixed: `UnhandledPromiseRejectionWarning: Error: At least one option must be a string`

# v1.8.0

- Changed: Smart summary truncation. When there is no dedicated `summary` (only Atom feed has it, and many sites don't use it) from the source, we check if the content/description (Both Atom and RSS) field is long enough to be full text. If so, it will be truncated into a "pseudo" summary. If not, we assume the source used the `content` field as summary, and it will be displayed in full length.
- Thank you: @LooperXX.

# v1.7.3

- This release has no user facing changes. It is created for recording keeping and won't be published.
- Chore: Refactoring initialization and filesystem io.
- Chore: Removed dependency `fs-extra`.

# v1.7.2

- ⚠ Deprecated: To accommodate the monorepo setup, the node version in all templates/demos/examples has changed from 14 to 16. This is not a breaking change as our compile target is still node 14, and node 16 is backward compatible. We still recommend you start using `node-version: "16"` in your `.github/workflows/update-feed.yaml` today to get the performance/security improvements from the newer node. [See example](https://github.com/osmoscraft/osmosfeed-template/blob/main/.github/workflows/update-feed.yaml#L22).
- Chore: Reorganize to monorepo with npm workspace.

# v1.7.1

- Fixed: Static files were unnecessarily copied for custom templates.

# v1.7.0

- Added: Templating system. [Demo](https://osmoscraft.github.io/osmosfeed-examples/articles-unstyled/) | [Source](https://github.com/osmoscraft/osmosfeed-examples/tree/main/examples/articles-unstyled) | [Docs](https://github.com/osmoscraft/osmosfeed/blob/master/docs/customization-guide.md#template-customization-guide)
- Chore: Rendering logic refactoring. Adopting functional paradigm.
- Thank you @tianheg, @onnyyonn

# v1.6.0

- Added: Link from the title of a subscription to its website.
- Added: Store `feedUrl` and `siteUrl` for each source in cache.
- Added: Semantic element (`<time>`) for timestamp on the UI.
- Added: Semantic API for theming the default template.
- Changed: Moved feed metadata from article level to feed level in cache.
- Fixed: Any html-like text was stripped from title. Fixed with encoded text.
- Removed: `href` for each source in cache. The value was never used so it's not a breaking change.

# v1.5.0

- Added: Atom feed generator
- Added: Customizable site title
- Added: Copy all files from `static` directory to the root of the site.
- Changed: Favicon, css, and js assets now existing at site root level.
- Chore: Excluded testing files from repo.

# v1.4.0

- Added: Basic theme customization. See [documentation](docs/customization-guide.md).

# v1.3.1

- Fixed: Avoid crwalers.
- Fixed: Error logging from XML parser.
- Fixed: Typo in docs.
- Thank you: @dym-sh, @tabokie, @cheese1

# v1.3.0

- Added: Customize cache lifespan with `cacheMaxDays` property in `osmosfeed.yaml`.
- Added: [Documentation](docs/osmosfeed-yaml-reference.md) for `osmosfeed.yaml`.
- Fixed: More intuitive logging during build.
- Chore: Refactored parameter passing for `enrich` step.

# v1.2.3

- Changed: favicon update.

# v1.2.1

- Added: Display CLI version in footer.

# v1.1.6

- Fixed: The output website didn't have favicon.

# v1.1.1

- Fixed: Item description didn't use the `description` property from feed item.

# v1.1.0

- Added: MIT license
- Added: `cache.json` is stamped with the version of the builder. This allows future builder with breaking change to ignore incompatible cache.
- Added: Feed source retry on fetch error (3 times total, 15 seconds timeout).
- Added: Item enrichment retry on fetch error (3 times total, 15 seconds timeout).
- Added: Console log for cache restore and update behavior.
- Added: npx command: `npx osmosfeed`
- Changed: Improved console log that breaks down rendered item count into "new" and "cached".
- Fixed: Item enrichment timeout could crash the build.

# v1.0.0

- Changed: Runtime dependencies are moved out of devDependencies. This is not a breaking change, but to receive performance benefit, you need to make sure `@osmoscraft/osmosfeed` is listed as `dependencies` instead of `devDependencies` in the `package.json` of your rss reader site.
- Changed: Build target from node12 to node14.
- Changed: Switched to a more robust rss parser: [rss-parser](https://github.com/rbren/rss-parser)
- Fixed: RSS 1.0 feed `<dc:date>` was not parsed as publish date.
- Chore: npm dependencies version updates.

# v0.0.17 and below

- Pre-releases and prototypes.
