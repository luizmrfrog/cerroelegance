(() => {
  const contato = {
    whatsapp: "",
    instagram: "",
    email: "",
  };

  const mensagem = "Olá! Vim pelo site e quero saber mais sobre o Cerro Élégance.";
  const abertura = new Date("2027-01-15T00:00:00-03:00");

  const whatsappUrl = () => {
    const numero = contato.whatsapp.replace(/\D/g, "");
    if (!numero) return "";
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  };

  document.querySelectorAll("[data-contato]").forEach((el) => {
    const tipo = el.dataset.contato;
    let href = "";
    if (tipo === "whatsapp") href = whatsappUrl();
    if (tipo === "instagram" && contato.instagram) href = contato.instagram;
    if (tipo === "email" && contato.email) href = `mailto:${contato.email}`;
    if (!href) return;
    el.href = href;
    if (tipo === "whatsapp" || tipo === "instagram") {
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    }
  });

  const pre = document.querySelector(".fecho-pre");
  const pos = document.querySelector(".fecho-pos");
  if (pre && pos && Date.now() >= abertura.getTime()) {
    pre.hidden = true;
    pos.hidden = false;
  }

  const tela = document.querySelector("#fechoPetalas");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!tela || reduced) return;

  const section = tela.parentElement;
  const ctx = tela.getContext("2d");
  const cores = ["#BFB091", "#D5CCB8", "#ECE9DF", "#B79D88"];
  let largura = 0;
  let altura = 0;
  let petalas = [];
  let visivel = false;
  let quadro = 0;

  const petala = (renasce) => ({
    x: Math.random() * largura,
    y: renasce ? -20 : Math.random() * altura,
    size: Math.random() * 8 + 6,
    vx: Math.random() * 0.5 + 1.2,
    vy: Math.random() * 0.5 + 0.8,
    angle: Math.random() * Math.PI * 2,
    rot: (Math.random() - 0.5) * 0.04,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: Math.random() * 0.02 + 0.01,
    color: cores[Math.floor(Math.random() * cores.length)],
  });

  const medida = () => {
    largura = section.offsetWidth;
    altura = section.offsetHeight;
    const dpr = window.devicePixelRatio || 1;
    tela.width = largura * dpr;
    tela.height = altura * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const desenha = () => {
    if (!visivel || document.hidden) return;
    ctx.clearRect(0, 0, largura, altura);
    petalas.forEach((p) => {
      p.x += p.vx + Math.sin(p.sway) * 1.5;
      p.y += p.vy;
      p.angle += p.rot;
      p.sway += p.swaySpeed;
      if (p.y > altura + 30 || p.x > largura + 30) {
        Object.assign(p, petala(true));
        p.x = Math.random() * largura;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(p.size, -p.size, p.size, 0);
      ctx.quadraticCurveTo(p.size, p.size, 0, 0);
      ctx.fill();
      ctx.restore();
    });
    quadro = requestAnimationFrame(desenha);
  };

  medida();
  petalas = Array.from({ length: 35 }, () => petala(false));
  window.addEventListener("resize", medida);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(quadro);
      return;
    }
    if (visivel) quadro = requestAnimationFrame(desenha);
  });
  new IntersectionObserver((entries) => {
    visivel = entries[0].isIntersecting;
    cancelAnimationFrame(quadro);
    if (visivel) quadro = requestAnimationFrame(desenha);
  }).observe(section);
})();
