import "./header.css";

customElements?.define(
  "osmos-header",
  class extends HTMLElement {
    connectedCallback() {
      console.log("client live");
    }
  }
);
