TODO: ts-node-dev from another project cannot import `.d.ts` file, hence we are using `.ts` even for pure typings.

Potential fix:

1. Involve a tsc compile step that emits declaration file based on `index.ts` and emit javascript file
2. Use ambient type and type references instead
