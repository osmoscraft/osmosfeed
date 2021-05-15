# Customization guide

## Concpets

- **Theming**: Changing CSS to achieve different look and feel on the same HTML content.
- **Templating**: Changing both HTML and CSS to achieve different layout and content structure on the same feed data.

## Theming guide

⚠ Note: This documentation applies to the default template. Other template may have a different workflow.

### Examples

- `default-gruvbox-light`: Default template, gruvbox light theme. [Demo](https://osmoscraft.github.io/osmosfeed-examples/default-gruvbox-light/)
- `default-solarized-light`: Default template, solarized light theme. [Demo](https://osmoscraft.github.io/osmosfeed-examples/default-solarized-light/)
- `default-solarized-dark`: Default template, solarized dark theme. [Demo](https://osmoscraft.github.io/osmosfeed-examples/default-solarized-dark/)

[Sources and more examples](https://github.com/osmoscraft/osmosfeed-examples)

### Steps

1. Create `includes/before-head-end.html` in your repo.
2. Copy the `:root` block from the [default css file](https://github.com/osmoscraft/osmosfeed/blob/v1.6.0/src/system-static/styles.css) into `before-head-end.html`.
   ```css
   <style>
   :root {
     /** rules */
   }
   </style>
   ```
3. To replace the default `gruvbox-dark-medium` theme with other [base16](https://github.com/chriskempson/base16) themes, fill `base00`, `base01`, ... `base0F` in the `Palette` section with the colors from the theme you want.
4. For inspirations, try [this tool](https://terminal.sexy/).
5. To change font family and size, adjust variables in the `Typograph` section.
6. To tweak other aspects of the UI, adjust variables in the `Components` section.
7. A final result might look like [this](https://github.com/osmoscraft/osmosfeed-examples/blob/main/examples/default-solarized-light/includes/before-head-end.html).

## Template customization guide

Template allows you to fully customize the output of the HTML. Unlike the [theming](#theming-guide) where you reuse the existing HTML, customizating template means generating your own HTML and writing your own CSS.

### Prerequisite

- Basic knowledge in HTML and CSS is assumed.
- Learning the basics of [Handlebars](https://handlebarsjs.com/guide/).

### Examples

- `articles-unstyled`: Flat list of articles, no theme [Demo](https://osmoscraft.github.io/osmosfeed-examples/articles-unstyled/)
- `articles-daily-unstyled`: Articles grouped by day, no theme [Demo](https://osmoscraft.github.io/osmosfeed-examples/articles-daily-unstyled/)
- `sources-daily-unstyled`: Articles grouped by source, then grouped by day, no theme [Demo](https://osmoscraft.github.io/osmosfeed-examples/sources-daily-unstyled/)

[Sources and more examples](https://github.com/osmoscraft/osmosfeed-examples)

### Steps

1. In your repo, create an `includes` directory. Then create `index.hbs`. This is the Handlebars template for generating `index.html`.
2. Copy content to `includes/index.hbs` from one of these starter templates:
   1. A flat list of articles, sorted by publish time. [Demo](https://osmoscraft.github.io/osmosfeed-examples/articles-unstyled/) | [Source](https://github.com/osmoscraft/osmosfeed-examples/blob/main/examples/articles-unstyled/includes/index.hbs)
   2. A list of dates, with articles inside each date. [Demo](https://osmoscraft.github.io/osmosfeed-examples/articles-daily-unstyled/) | [Source](https://github.com/osmoscraft/osmosfeed-examples/blob/main/examples/articles-daily-unstyled/includes/index.hbs)
   3. A list of dates, with a list of sources inside each date, with a list of articles inside each source. [Demo](https://osmoscraft.github.io/osmosfeed-examples/sources-daily-unstyled/) | [Source](https://github.com/osmoscraft/osmosfeed-examples/blob/main/examples/sources-daily-unstyled/includes/index.hbs)
3. Alternatively, you can start with the [default template](https://github.com/osmoscraft/osmosfeed/blob/master/src/system-templates/index.hbs).
4. Refer to [source code](https://github.com/osmoscraft/osmosfeed/blob/master/src/lib/get-template-data.ts) for all the data available to the template.
5. If you reference any `css` or `js` files in your template, make sure to add them to the `static` folder. Conventions for [adding static files](#add-static-files) also apply to your customized template. Example `index.hbs`:

   ```hbs
   <head>
     <!-- more head content omitted -->

     <!-- css option 1: embed styles -->
     <style>/** rules */</style>

     <!-- css option 2: external stylesheet -->
     <link href="{filename}.css" rel="stylesheet" />
   </head>
   <body>
     <!-- more body content omitted -->

     <!-- javascript option 1: embed source code -->
     <script>/** js code */</script>

     <!-- javascript option 2: external script file -->
     <script src="{filename}.js"></script>
     <!-- javascript option 2: external script file (allow es6 `import` syntax) -->
     <script type="module" src="{filename}.js"></script>
   </body>
   ```

6. After customization, your folder structure might look like this
   ```
   repo-root/
   ├── includes/
   │   └── index.hbs
   ├── static/
   │   ├── index.css
   │   └── index.js
   ├── osmosfeed.yaml
   └── package.json
   ```
7. Need help? You can raise a question on the [Q&A discussions](https://github.com/osmoscraft/osmosfeed/discussions/categories/q-a) page.

## Add static files

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

## Add inline HTML and CSS

You can inject arbitrary content into 3 predefined slots in the default template.

⚠ Note: These slots may not exist for custom templates. The template author is responsible for deciding whether they want to support this.

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

- Customize the parameters in the current theme. See [theming guide](#theming-guide).
- Add custom CSS by injecting a `<style>` tag using `before-head-end.html`.
- Run custom JavaScript by injecting a `<script>` tag using `before-body-end.html`.
