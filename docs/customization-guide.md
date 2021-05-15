# Customization guide

## Frontend customization

### Add static files

Add any file to the `static` directory. The builder will copy those files to the root of your site. This is useful for

- Configure custom domain with `CNAME`
- Override the default `favicon.ico` with a custom one.

```
repo-root/
├── static/
│   ├── CNAME
│   └── favicon.ico
├── osmosfeed.yaml
└── package.json
```

### Extend the default template with inline HTML

You can inject arbitrary content into 3 predefined slots in the default template.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>osmos::feed</title>
    <link href="assets/styles.css" rel="stylesheet" />
    <!-- %before-head-end.html% -->
  </head>
  <body>
    <!-- %after-body-begin.html% -->
    <!-- %MAIN_CONTENT% -->
    <script src="assets/index.js"></script>
    <!-- %before-body-end.html% -->
  </body>
</html>
```

The builder will scan the `includes` folder to see if there are any matching files to inject.

```
repo-root/
├── includes/
│   ├── after-body-begin.html
│   ├── before-body-end.html
│   └── before-head-end.html
├── osmosfeed.yaml
└── package.json
```

With this technique, you can

- Customize the parameters in the current theme. See [detailed guide below](#theming-guide).
- Add custom CSS by injecting a `<style>` tag using `before-head-end.html`.
- Run custom JavaScript by injecting a `<script>` tag using `before-body-end.html`.

### Theming guide

⚠ The Template Extensibility API is not ready yet. Once available, it will allow complete freedom in changing the content and structure of the page. Until then, your theming options are limited to what the default template allows.

- Find the `:root` selector from the [default css file](https://github.com/osmoscraft/osmosfeed/blob/v1.6.0/src/system-static/styles.css). Copy any variables you want to change into your `before-head-end.html`.
- To replace the default `gruvbox-dark-medium` theme with other [base16](https://github.com/chriskempson/base16) themes, fill `base00`, `base01`, ... `base0F` in the `Palette` section with the colors from the theme you want.
- For inspirations, try [this tool](https://terminal.sexy/).
- To change font family and size, adjust variables in the `Typograph` section.
- To tweak other aspects of the UI, adjust variables in the `Components` section.
- A final result might look like [this](https://github.com/osmoscraft/osmosfeed-examples/blob/main/examples/default-solarized-light/includes/before-head-end.html).

### Theming examples

- Default template, gruvbox light theme. [Demo](https://osmoscraft.github.io/osmosfeed-examples/default-gruvbox-light/) | [Source](https://github.com/osmoscraft/osmosfeed-examples/tree/main/examples/default-gruvbox-light)
- Default template, solarized light theme. [Demo](https://osmoscraft.github.io/osmosfeed-examples/default-solarized-light/) | [Source](https://github.com/osmoscraft/osmosfeed-examples/tree/main/examples/default-solarized-light)
- Default template, solarized dark theme. [Demo](https://osmoscraft.github.io/osmosfeed-examples/default-solarized-dark/) | [Source](https://github.com/osmoscraft/osmosfeed-examples/tree/main/examples/default-solarized-dark)

### Templating guide

```js
/** Hierarchy options:
 * - articles
 * - dates
 *   - articles
 *   - sources
 *     - articles
 * - sources
 *   - dates
 *     - articles
 *   - articles
 */
```

### Templating examples

## Backend customization

(TBD)
