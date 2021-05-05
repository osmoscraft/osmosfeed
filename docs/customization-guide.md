# Customization guide

## Examples

- Default template, gruvbox light theme. [Demo](https://osmoscraft.github.io/osmosfeed-examples/default-gruvbox-light/) | [Source](https://github.com/osmoscraft/osmosfeed-examples/tree/main/examples/default-gruvbox-light)

## Frontend customization

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

- Add custom CSS by injecting a `<style>` tag using `before-head-end.html`.
- Run custom JavaScript by injecting a `<script>` tag using `before-body-end.html`.

### Use different HTML template

(TBD)

## Backend customization

(TBD)
