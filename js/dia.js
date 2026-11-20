const scroller = document.querySelector(".dia-scroll");
const previous = document.querySelector(".dia-prev");
const next = document.querySelector(".dia-next");

if (scroller && previous && next) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const step = () => {
    const card = scroller.querySelector(".dia-track > li");
    if (!card) return scroller.clientWidth * 0.8;
    const styles = getComputedStyle(scroller.querySelector(".dia-track"));
    const gap = parseFloat(styles.columnGap || styles.gap) || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const update = () => {
    const max = scroller.scrollWidth - scroller.clientWidth;
    previous.disabled = scroller.scrollLeft <= 2;
    next.disabled = scroller.scrollLeft >= max - 2;
  };

  const move = (direction) => {
    scroller.scrollBy({
      left: direction * step(),
      behavior: reduceMotion.matches ? "auto" : "smooth",
    });
  };

  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  scroller.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}
