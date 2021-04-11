# v1.0.0

- Changed: Runtime dependencies are moved out of devDependencies. This is not a breaking change, but to receive performance benefit, you need to make sure `@platojar/cli` is listed as `dependencies` instead of `devDependencies` in the `package.json` of your rss reader site.
- Changed: Build target from node12 to node14.
- Changed: Switched to a more robust rss parser: [rss-parser](https://github.com/rbren/rss-parser)
- Fixed: RSS 1.0 feed `<dc:date>` was not parsed as publish date.
- Chore: npm dependencies version updates.

# v0.0.17 and below

- Pre-releases and prototypes.
