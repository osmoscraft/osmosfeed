formatDatetime();
observeSlideVisibility();
handleSlideControl();

function formatDatetime() {
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  [...document.querySelectorAll(".js-datetime")].forEach((datetime) => {
    const currentEpoc = Date.now();
    const sourceEpoc = new Date(datetime.dateTime).getTime();
    const relativeDays = Math.floor((sourceEpoc - currentEpoc) / 1000 / 60 / 60 / 24);
    datetime.innerText = rtf.format(relativeDays, "day");
  });
}

function handleSlideControl() {
  document.addEventListener("click", (e) => {
    const isForward = e.target.closest(".js-horizontal-scroll__forward") !== null;
    const isBackward = e.target.closest(".js-horizontal-scroll__backward") !== null;
    if (isForward || isBackward) {
      const scrollAssembly = e.target.closest(".js-horizontal-scroll");
      const list = scrollAssembly.querySelector(".js-horizontal-scroll__list");
      if (isForward) {
        list.scroll({
          left: list.scrollLeft + list.offsetWidth,
          behavior: "smooth",
        });
      } else {
        list.scroll({
          left: list.scrollLeft - list.offsetWidth,
          behavior: "smooth",
        });
      }
    }
  });
}

function observeSlideVisibility() {
  const lists = document.querySelectorAll(".js-horizontal-scroll__list");

  lists.forEach((list) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const group = e.target.closest(".js-horizontal-scroll");
          const siblings = [...group.querySelectorAll(".js-horizontal-scroll__item")];
          const index = siblings.indexOf(e.target);
          if (index === 0) {
            group.classList.toggle("has-backward", !e.isIntersecting);
          }
          if (index === siblings.length - 1) {
            group.classList.toggle("has-forward", !e.isIntersecting);
          }

          e.target.classList.toggle("is-visible", e.isIntersecting);
        });
      },
      {
        root: list,
        rootMargin: "0px",
        threshold: 0.98, // using 1 causes the false positive occasionally
      }
    );

    const items = [...list.querySelectorAll(".js-horizontal-scroll__item")];
    if (!items.length) return; // no content

    const terminalItems = [...new Set([items[0], items[items.length - 1]])];
    terminalItems.forEach((i) => observer.observe(i));
  });
}
