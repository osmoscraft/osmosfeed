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
      });
    },
    {
      root: list,
      rootMargin: "0px",
      threshold: 0.98, // using 1 causes the false positive occasionally
    }
  );

  const items = [...list.querySelectorAll(".js-horizontal-scroll__item")];
  const terminalItems = [...new Set([items[0], items[items.length - 1]])];
  terminalItems.forEach((i) => observer.observe(i));
});
