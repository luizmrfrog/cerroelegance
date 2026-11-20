(() => {
  const headings = document.querySelectorAll(".scroll-reveal");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!headings.length || reduced) return;
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const touch =
    window.matchMedia("(hover: none), (pointer: coarse)").matches ||
    navigator.maxTouchPoints > 0;

  if (touch) {
    ScrollTrigger.normalizeScroll({
      allowNestedScroll: true,
      lockAxis: true,
      type: "touch,pointer",
    });
  }

  const split = (el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((textNode) => {
      const parts = textNode.nodeValue.split(/(\s+)/);
      const fragment = document.createDocumentFragment();
      parts.forEach((part) => {
        if (!part) return;
        if (!part.trim()) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }
        const word = document.createElement("span");
        word.className = "reveal-word";
        word.textContent = part;
        word.style.opacity = "0.1";
        word.style.filter = "blur(8px)";
        word.style.transform = "translateY(20px)";
        fragment.appendChild(word);
      });
      textNode.parentNode.replaceChild(fragment, textNode);
    });
  };

  headings.forEach((el) => {
    split(el);
    gsap.to(el.querySelectorAll(".reveal-word"), {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      stagger: 0.08,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        end: "bottom 60%",
        scrub: 1,
      },
    });
  });
})();
