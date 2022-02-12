# Security Policy

## Risk factors

1. The CLI has access to some of your GitHub credential for managing the hosting repo.
2. The generated feed might render unwanted html from sources.
3. The generated feed might render unwanted html when the builder script is compromised.

## Supported Versions

The default GitHub action script uses no-cache install to ensure the latest version is downloaded for each build. If you have locked your version in the npm file, it is possible an out-dated version of osmosfeed may expose you to security risks.

## Reporting a Vulnerability

Please [file a bug](https://github.com/osmoscraft/osmosfeed/issues/new/choose)
