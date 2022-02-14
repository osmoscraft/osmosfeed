closeAccordionByIds(getClosedAccordionIdsFromStorage());
handleAllClickEvents();
renderBuildTimestamp();
renderWeekday();

/**
 * ====== UTILS ======
 **/

function getClosedAccordionIdsFromPage() {
  /**
   * @type {HTMLDetailsElement[]}
   */
  const accordions = [...document.querySelectorAll("[data-accordion-key]")];
  const ids = accordions
    .filter((element) => !element.open)
    .map((element) => element.getAttribute("data-accordion-key"));
  return [...new Set(ids)];
}

function closeAccordionByIds(ids) {
  ids.forEach((id) => {
    const element = document.querySelector(`[data-accordion-key="${id}"]`);
    if (element) element.open = false;
  });
}

function storeClosedAccordionIds(ids) {
  localStorage.setItem("closedAccordionIds", JSON.stringify(ids));
}

function getClosedAccordionIdsFromStorage() {
  const stateString = localStorage.getItem("closedAccordionIds");
  try {
    const parsed = JSON.parse(stateString);
    if (!parsed?.length) return [];
    return parsed;
  } catch {
    return [];
  }
}

/**
 * Add a few event handlers as possible to ensure healthy performance scaling
 */
function handleAllClickEvents() {
  document.addEventListener("click", (event) => {
    // Activate daily title as expanders
    const action = event.target.closest("[data-action]");
    if (action) {
      switch (action.getAttribute("data-action")) {
        case "toggle-accordions":
          handleToggleAccordions(event);
          break;
        case "toggle-native-accordion":
          handleToggleNativeAccordion(event);
          break;
      }
    }
  });
}

/**
 * @param {KeyboardEvent=} event
 */
function handleToggleAccordions(event) {
  // when ctrl is held, toggle every accordion in the document
  const scope = event?.ctrlKey ? document : event.target.closest(".js-toggle-accordions-scope");
  const detailsElements = [...scope.querySelectorAll("details")];
  const isAnyOpen = detailsElements.some((element) => element.open);
  detailsElements.forEach((element) => (element.open = !isAnyOpen));

  storeClosedAccordionIds(getClosedAccordionIdsFromPage());
}

/**
 * @param {KeyboardEvent=} event
 */
function handleToggleNativeAccordion() {
  // wait until event settled
  setTimeout(() => storeClosedAccordionIds(getClosedAccordionIdsFromPage()), 0);
}

/**
 * Convert machine readable timestamp to locale time
 */
function renderBuildTimestamp() {
  const timestamp = document.getElementById("build-timestamp");
  timestamp.innerText = new Date(timestamp.getAttribute("datetime")).toLocaleString();
}

/**
 * Convert the server timestamp to human readable weekday and dates.
 * Note: the server is responsible for shifting the date based on config file.
 * The client should parse the date as if it is in UTC timezone.
 */
function renderWeekday() {
  document.querySelectorAll(".js-offset-weekday").forEach((element) => {
    const weekday = new Date(element.getAttribute("data-offset-date")).toLocaleString(window.navigator.language, {
      weekday: "long",
      timeZone: "UTC",
    });
    element.innerText = weekday;
  });
  document.querySelectorAll(".js-offset-date").forEach((element) => {
    const date = new Date(element.getAttribute("data-offset-date")).toLocaleString(window.navigator.language, {
      month: "numeric",
      day: "numeric",
      timeZone: "UTC",
    });
    element.innerText = date;
  });
}
