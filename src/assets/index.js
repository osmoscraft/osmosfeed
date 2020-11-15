document.addEventListener("click", (event) => {
  const actionButton = event.target.closest(`[data-action]`);

  if (actionButton) {
    actionButton.closest("article").classList.toggle("expanded");
  }
});
