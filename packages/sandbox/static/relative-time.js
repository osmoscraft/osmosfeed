const UNITS = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
};

const now = new Date();

const relativeTimeFormat = new Intl.RelativeTimeFormat(navigator.languages, { numeric: "auto" });

function getRelativeTime(when, now) {
  const elapsed = when - now;

  // "Math.abs" accounts for both "past" & "future" scenarios
  for (var u in UNITS)
    if (Math.abs(elapsed) > UNITS[u] || u == "second")
      return relativeTimeFormat.format(Math.round(elapsed / UNITS[u]), u);
}

document.querySelectorAll(".js-relative-time").forEach((timeElement) => {
  const publishDate = new Date(timeElement.getAttribute("datetime"));
  timeElement.textContent = getRelativeTime(publishDate, now);
});
