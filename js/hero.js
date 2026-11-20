const video = document.querySelector(".hero-video");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

const holdStill = () => {
  if (!reduce.matches) return;
  video.pause();
  video.removeAttribute("autoplay");
};

holdStill();
reduce.addEventListener("change", holdStill);

const capsule = document.getElementById("navCapsule");
const onScroll = () => capsule.classList.toggle("is-scrolled", window.scrollY > 40);

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });
