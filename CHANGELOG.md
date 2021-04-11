# v1.1.0

- Added: MIT license
- Added: `cache.json` is stamped with the version of the builder. This allows future builder with breaking change to ignore incompatible cache.
- Added: Item enrichment retry on fetch error (3 times total, 15 seconds timeout).
- Added: Console log for cache restore and update behavior.
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