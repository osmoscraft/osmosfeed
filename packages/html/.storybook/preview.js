import "../src/client/style.css";

// apply default theme
document.body.dataset.theme = "plato";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  layout: "fullscreen",
  options: {
    storySort: {
      method: "alphabetical",
      order: ["Themes", "Components"],
    },
  },
};
