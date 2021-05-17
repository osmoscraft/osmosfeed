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

Currently no CI/CD integration. To publish a new version you must have permission to the `@osmoscraft` org in npm.

```bash
cd packages/cli

# Choose one of the three
npm version prerelease --preid=beta # starting a new beta
npm version prerelease              # bumping up an existing beta
npm version patch|minor|major       # update official release to new semver

npm run build
npm publish --access public
git push origin vX.Y.Z
```

Afterwards, remember to

1. Update `CHANGELOG.md` to include the latest stable version
2. Add changelog as release notes in [GitHub Releases](https://github.com/osmoscraft/osmosfeed/tags).
