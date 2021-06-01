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

## Test

- `cd` to the root of the repo. Then run `npm run test`.
- Tests are located in `packages/test`.
  - Each test scenario simulates the root of a repo. Add new new scenarios in `packages/test/scenarios`.
  - Each spec validates a single behavior in a specific senario. Add new spec in `packages/test/test.js`.
- To debug with breakpoints
  1. Use Visual Studio Code to set breakpoints in either test code in `packages/test` or CLI code in `packages/cli`.
  2. Open debug menu, execute `Debug tests` launch task.

## Debug

1. Use vscode to set break point.
2. "Run and Debug".

## CI/CD

- Build and test are automatically executed for pull requests.
- npm publish is triggered by when git tags are added to master branch.

### To publish

```bash
cd packages/cli

# Choose one of the three
npm version preminor --preid=beta # starting a new beta (use prepatch|preemajor as needed)
npm version prerelease              # bumping up an existing beta
npm version patch|minor|major       # update official release to new semver

git tag vX.Y.X                      # npm might have automatically added a tag. If not, perform the step manually
git push origin vX.Y.Z
```

This cause GitHub action to build and publish to npm.

Afterwards, remember to

1. Update `CHANGELOG.md` to include the latest stable version
2. Add changelog as release notes in [GitHub Releases](https://github.com/osmoscraft/osmosfeed/tags).
