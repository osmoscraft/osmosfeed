# To develop

Use `npm run dev`. It uses ts-node to spin up the feed builder script. It uses `platojar.yaml` in the project root.
To test remote caching, enable/update the cache url option inside `platojar.yaml`

# To publish

Currently no CI/CD integration. To publish a new version:

1. `npm run build` - this generates the latest binary in `bin` dir.
2. `npm version patch|minor|major` - updates version
3. `npm publish`

The consumer of the builder script may need to update the dependency version to receive the latest builder script.
