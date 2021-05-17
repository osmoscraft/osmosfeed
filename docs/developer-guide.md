# Developer guide

## Prerequisite

- Node v16

## Develop

### First-time install

```bash
# --- Step start (This step is temporarily added, due to [this npm bug](https://github.com/npm/cli/issues/2632)).
cd packages/cli
npm install
npm run build
# --- Step end

cd ../../ # back to repo root
npm install
```

### Development loop

- Make changes to TypeScript files in the `packages/cli` folder.
- In repo root, run `npm start`. This will build latest cli and run it inside the sandbox.
- To debug with breakpoints
  1. Use Visual Studio Code to set breakpoints in any TypeScript file within `packages/cli`.
  2. Open debug menu, execute `Debug with sandbox` launch task.
- Validate build output in `packages/sandbox/public`.

### Simulate use cases

- To test remote caching, enable/update the cache url option inside `packages/sandbox/osmosfeed.yaml`.
- To test customization, create an `packages/sandbox/includes` directory and add snippets.
- To test static file copying, create a `packages/sandbox/static` directory and add files.

### Clean-up

- If you need to use the latest cli from npm (insteald of from local machine), run `npm uninstall -g @osmoscraft/osmosfeed`

## Test

(WIP)

## Debug

1. Use vscode to set break point.
2. "Run and Debug".

## Publish

Currently no CI/CD integration. To publish a new version:

1. You must have permission to publish to the npm feed.
2. `npm version patch|minor|major` - updates version.
3. `npm run build` - this generates the latest binary in `bin` dir.
4. `npm publish --access public` - push to npm registry.
5. Update `CHANGELOG.md` to include the latest stable version
6. `git push origin vX.Y.Z` - publish tag to remote.
7. Add changelog as release notes in [GitHub Releases](https://github.com/osmoscraft/osmosfeed/tags).

The consumer of the builder script may need to update the dependency version to receive the latest builder script.
