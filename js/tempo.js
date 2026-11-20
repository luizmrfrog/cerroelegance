const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const section = document.querySelector(".tempo");
const canvas = document.getElementById("tempoRain");

document.documentElement.classList.add("js");

if (section && !reduceMotion.matches && "IntersectionObserver" in window) {
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) section.classList.add("is-in");
    });
  }, { threshold: 0.12 });
  reveal.observe(section);
} else if (section) {
  section.classList.add("is-in");
}

document.querySelectorAll("[data-reveal]").forEach((block) => {
  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    block.classList.add("is-in");
    return;
  }
  const watch = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) block.classList.add("is-in");
    });
  }, { threshold: 0.12 });
  watch.observe(block);
});

if (section && canvas && !reduceMotion.matches) {
  const ctx = canvas.getContext("2d");
  const blooms = section.querySelectorAll("[data-bloom]");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let drops = [];
  let splashes = [];
  let roofs = [];
  let frame = 0;
  let wind = 0;
  let running = false;
  let onScreen = false;
  const pointer = { x: -9999, y: -9999, inside: false };
  const count = () => (window.innerWidth < 768 ? 40 : 70);

  const resize = () => {
    const box = section.getBoundingClientRect();
    width = box.width;
    height = box.height;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    roofs = [];
    section.querySelectorAll("[data-rise]").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 24 || rect.height < 12) return;
      roofs.push({
        left: rect.left - box.left,
        right: rect.right - box.left,
        top: rect.top - box.top,
      });
    });
  };

  const makeDrop = (fromTop) => {
    const near = pointer.inside && Math.random() < 0.35;
    const roll = Math.random();
    return {
      x: near ? pointer.x + (Math.random() - 0.5) * 180 : Math.random() * (width + 400) - 200,
      y: fromTop ? -30 : Math.random() * height,
      py: fromTop ? -30 : 0,
      vy: Math.random() * 8 + 12,
      length: Math.random() * 12 + 15,
      weight: Math.random() * 0.8 + 0.8,
      color: roll < 0.6 ? "#657159" : roll < 0.8 ? "#232427" : "#8B5F40",
    };
  };

  const splash = (x, y, color) => {
    const total = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < total; i += 1) {
      splashes.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4 + wind * 0.3,
        vy: -Math.random() * 3 - 1,
        r: Math.random() * 0.8 + 0.5,
        color,
        life: 1,
      });
    }
  };

  const seed = () => {
    drops = [];
    const total = count();
    for (let i = 0; i < total; i += 1) drops.push(makeDrop(false));
  };

  const tick = () => {
    if (!running) return;
    if (!onScreen || document.hidden) {
      running = false;
      return;
    }

    ctx.clearRect(0, 0, width, height);
    frame += 1;
    if (frame % 40 === 0) {
      const box = section.getBoundingClientRect();
      roofs = [];
      section.querySelectorAll("[data-rise]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 24 || rect.height < 12) return;
        roofs.push({
          left: rect.left - box.left,
          right: rect.right - box.left,
          top: rect.top - box.top,
        });
      });
    }

    const targetWind = pointer.inside ? (pointer.x / width - 0.5) * 14 : 0;
    wind += (targetWind - wind) * 0.04;

    drops.forEach((drop) => {
      drop.py = drop.y;
      drop.x += wind * (drop.vy / 16);
      drop.y += drop.vy;

      let hit = false;
      for (let i = 0; i < roofs.length; i += 1) {
        const roof = roofs[i];
        if (drop.y >= roof.top && drop.py < roof.top && drop.x >= roof.left && drop.x <= roof.right) {
          splash(drop.x, roof.top, drop.color);
          Object.assign(drop, makeDrop(true));
          hit = true;
          break;
        }
      }

      if (!hit && drop.y > height - 10) {
        splash(drop.x, height - 10, drop.color);
        Object.assign(drop, makeDrop(true));
        hit = true;
      }

      if (!hit) {
        ctx.beginPath();
        ctx.strokeStyle = drop.color;
        ctx.lineWidth = drop.weight;
        ctx.lineCap = "round";
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - wind * (drop.length / 16), drop.y - drop.length);
        ctx.stroke();
      }
    });

    for (let i = splashes.length - 1; i >= 0; i -= 1) {
      const fleck = splashes[i];
      fleck.x += fleck.vx;
      fleck.y += fleck.vy;
      fleck.vy += 0.2;
      fleck.life -= 0.04;
      if (fleck.life <= 0) {
        splashes.splice(i, 1);
      } else {
        ctx.save();
        ctx.globalAlpha = Math.max(0, fleck.life);
        ctx.fillStyle = fleck.color;
        ctx.beginPath();
        ctx.arc(fleck.x, fleck.y, fleck.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    requestAnimationFrame(tick);
  };

  const start = () => {
    if (running || reduceMotion.matches) return;
    running = true;
    requestAnimationFrame(tick);
  };

  section.addEventListener("pointermove", (event) => {
    const box = section.getBoundingClientRect();
    pointer.x = event.clientX - box.left;
    pointer.y = event.clientY - box.top;
    pointer.inside = true;
    const driftX = (event.clientX / window.innerWidth - 0.5) * 26;
    const driftY = (event.clientY / window.innerHeight - 0.5) * 20;
    blooms.forEach((bloom) => {
      bloom.style.transform = `translate(${driftX}px, ${driftY}px)`;
    });
  }, { passive: true });

  section.addEventListener("pointerleave", () => {
    pointer.inside = false;
  });

  const watch = new IntersectionObserver((entries) => {
    onScreen = entries.some((entry) => entry.isIntersecting);
    if (onScreen) start();
  }, { rootMargin: "120px" });

  resize();
  seed();
  watch.observe(section);
  window.addEventListener("resize", () => {
    resize();
    seed();
  }, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && onScreen) start();
  });
  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches) {
      running = false;
      ctx.clearRect(0, 0, width, height);
    } else if (onScreen) {
      start();
    }
  });
}
