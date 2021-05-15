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

### Extend the default template with inline HTML snippets

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

#### Examples

- `default-gruvbox-light`: Default template, gruvbox light theme. [Demo](https://osmoscraft.github.io/osmosfeed-examples/default-gruvbox-light/)
- `default-solarized-light`: Default template, solarized light theme. [Demo](https://osmoscraft.github.io/osmosfeed-examples/default-solarized-light/)
- `default-solarized-dark`: Default template, solarized dark theme. [Demo](https://osmoscraft.github.io/osmosfeed-examples/default-solarized-dark/)

[Sources and more examples](https://github.com/osmoscraft/osmosfeed-examples)

#### Steps

- Find the `:root` selector from the [default css file](https://github.com/osmoscraft/osmosfeed/blob/v1.6.0/src/system-static/styles.css). Copy any variables you want to change into your `before-head-end.html`.
- To replace the default `gruvbox-dark-medium` theme with other [base16](https://github.com/chriskempson/base16) themes, fill `base00`, `base01`, ... `base0F` in the `Palette` section with the colors from the theme you want.
- For inspirations, try [this tool](https://terminal.sexy/).
- To change font family and size, adjust variables in the `Typograph` section.
- To tweak other aspects of the UI, adjust variables in the `Components` section.
- A final result might look like [this](https://github.com/osmoscraft/osmosfeed-examples/blob/main/examples/default-solarized-light/includes/before-head-end.html).

### Template customization guide

Template allows you to fully customize the output of the HTML. Unlike the [inline HTML snippet approach](extend-the-default-template-with-inline-html-snippets) where you extend the existing HTML, customizating template means starting from scratch to build your own frontend.

#### Prerequisite

- Basic html and css programming skills are assumed.
- Learning the basics of [Handlebars](https://handlebarsjs.com/guide/).

#### Examples

- `articles-unstyled`: Flat list of articles, no theme [Demo](https://osmoscraft.github.io/osmosfeed-examples/articles-unstyled/)
- `articles-daily-unstyled`: Articles grouped by day, no theme [Demo](https://osmoscraft.github.io/osmosfeed-examples/articles-daily-unstyled/)
- `sources-daily-unstyled`: Articles grouped by source, then grouped by day, no theme [Demo](https://osmoscraft.github.io/osmosfeed-examples/sources-daily-unstyled/)

[Sources and more examples](https://github.com/osmoscraft/osmosfeed-examples)

#### Steps

- Consider using one of the unstyled examples as the starting point for your template. They show the variables available in the template.
- Alternatively, you can start with the [default template](https://github.com/osmoscraft/osmosfeed/blob/master/src/system-templates/index.hbs).
- In your repo, create an `includes` directory. Add your template to `index.hbs`. The template will be used to generate `index.html`.
- If you reference any `css` or `js` files in your template, make sure to add them to the `static` folder. Conventions for [adding static files](#add-static-files) also apply to your customized template.
  - To add your own styles
    - Add `<style></style>` inline in the template, or
    - Add a external stylesheet with `<link href="{filename}.css" rel="stylesheet" />` to the `<head>` section of the your html, then place `{filename}.css` inside `static` folder.
  - To use your own JavaScript
    - Add `<script> /** you_code_here */</script>` inline in the template, or
    - Add `<script src="{filename}.js"></script>` just before `<body>` section ends, then place `{filename}.js` inside `static` folder.
    - If you want to use es6 module `import` syntax, use `<script type="module" src="{filename}.js"></script>`.
- Use one of these content structure to pull data into your template:
  1. A flat list of articles, sorted by publish time.  [Demo](https://osmoscraft.github.io/osmosfeed-examples/articles-unstyled/) | [Source](https://github.com/osmoscraft/osmosfeed-examples/blob/main/examples/articles-unstyled/includes/index.hbs)
  2. A list of dates, with articles inside each date. [Demo](https://osmoscraft.github.io/osmosfeed-examples/articles-daily-unstyled/) | [Source](https://github.com/osmoscraft/osmosfeed-examples/blob/main/examples/articles-daily-unstyled/includes/index.hbs)
  3. A list of dates, with a list of sources inside each date, with a list of articles inside each source. [Demo](https://osmoscraft.github.io/osmosfeed-examples/sources-daily-unstyled/) | [Source](https://github.com/osmoscraft/osmosfeed-examples/blob/main/examples/sources-daily-unstyled/includes/index.hbs)
  4. A list of sources, with articles inside each source
  5. A list of sources, with a list of dates inside each source, with a list of articles inside each date
- Refer to [source code](https://github.com/osmoscraft/osmosfeed/blob/master/src/lib/get-template-data.ts) for all the data available to the template
- Need help? You can raise a question on the [Q&A discussions](https://github.com/osmoscraft/osmosfeed/discussions/categories/q-a) page.
