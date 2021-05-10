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

- Customize the parameters in the current theme. See `includes/before-head-end.html` file in the [Source](https://github.com/osmoscraft/osmosfeed-examples/tree/main/examples/default-gruvbox-light).
  - See [detailed guide below](#theming-guide)
  - For other themes and inspirations, consider learning [base16](https://github.com/chriskempson/base16) and trying out [this tool](https://terminal.sexy/).
- Add custom CSS by injecting a `<style>` tag using `before-head-end.html`.
- Run custom JavaScript by injecting a `<script>` tag using `before-body-end.html`.

### Theming guide

⚠ The Template Extensibility API is coming soon. It will allow much more freedom in changing the content and structure of the page. Until then, your theming options are limited to what the default template allows.

- Find the `:root` selector from the [default css file](https://github.com/osmoscraft/osmosfeed/blob/v1.6.0/src/system-static/styles.css). Copy any variables you want to change into your `before-head-end.html`.
- If you want to replace the default `gruvbox-dark-medium` theme with other [base16](https://github.com/chriskempson/base16) themes, provide the new theme in the `Palette` section in the CSS.
- If you want to change font family and size, adjust the `Typograph` section in the CSS.
- If you want to adjust specifics of the UI, adjust the `Components` section in the CSS.
- A final result might look like [this](https://github.com/osmoscraft/osmosfeed-examples/tree/main/examples/default-gruvbox-light).

### Theming examples

- Default template, gruvbox light theme. [Demo](https://osmoscraft.github.io/osmosfeed-examples/default-gruvbox-light/) | [Source](https://github.com/osmoscraft/osmosfeed-examples/tree/main/examples/default-gruvbox-light)
- Default template, solarized light theme. [Demo](https://osmoscraft.github.io/osmosfeed-examples/default-solarized-light/) | [Source](https://github.com/osmoscraft/osmosfeed-examples/tree/main/examples/default-solarized-light)
- Default template, solarized dark theme. [Demo](https://osmoscraft.github.io/osmosfeed-examples/default-solarized-dark/) | [Source](https://github.com/osmoscraft/osmosfeed-examples/tree/main/examples/default-solarized-dark)

### Use different HTML template

(TBD)

## Backend customization

(TBD)
