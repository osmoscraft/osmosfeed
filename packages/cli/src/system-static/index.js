// Render build timestamp
const timestamp = document.getElementById("build-timestamp");
timestamp.innerText = new Date(timestamp.getAttribute("datetime")).toLocaleString();

// Handle input events
document.addEventListener("click", (event) => {
  // Activate daily title as expanders
  const action = event.target.closest("[data-action]");
  if (action) {
    switch (action.getAttribute("data-action")) {
      case "toggle-accordions":
        handleToggleDailyExpand(event);
        break;
    }
  }
});

/**
 * @param {KeyboardEvent} event
 */
function handleToggleDailyExpand(event) {
  // when ctrl is held, toggle every accordion in the document
  const scope = event.ctrlKey ? document : event.target.closest(".js-toggle-accordions-scope");
  const detailsElements = [...scope.querySelectorAll("details")];
  const isAnyOpen = detailsElements.some((element) => element.open);
  detailsElements.forEach((element) => (element.open = !isAnyOpen));
}
