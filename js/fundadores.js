const target = new Date("2027-01-10T00:00:00-03:00");
const units = {
  days: document.querySelector('[data-unit="days"]'),
  hours: document.querySelector('[data-unit="hours"]'),
  minutes: document.querySelector('[data-unit="minutes"]'),
  seconds: document.querySelector('[data-unit="seconds"]'),
};
const labels = {
  days: document.querySelector('[data-label="days"]'),
  hours: document.querySelector('[data-label="hours"]'),
  minutes: document.querySelector('[data-label="minutes"]'),
  seconds: document.querySelector('[data-label="seconds"]'),
};
const reading = document.querySelector("#fundadores-leitura");
const names = {
  days: ["dia", "dias"],
  hours: ["hora", "horas"],
  minutes: ["minuto", "minutos"],
  seconds: ["segundo", "segundos"],
};

let clock = 0;
let announcedMinute = -1;

const remaining = () => Math.max(0, target.getTime() - Date.now());

const paintClock = () => {
  const total = Math.floor(remaining() / 1000);
  const parts = {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };

  Object.entries(parts).forEach(([key, value]) => {
    if (units[key]) units[key].textContent = key === "days" ? String(value) : String(value).padStart(2, "0");
    if (labels[key]) labels[key].textContent = names[key][value === 1 ? 0 : 1];
  });

  if (reading && parts.minutes !== announcedMinute) {
    announcedMinute = parts.minutes;
    reading.textContent = total === 0
      ? "10 de janeiro de 2027."
      : `Faltam ${parts.days} ${names.days[parts.days === 1 ? 0 : 1]}, ${parts.hours} ${names.hours[parts.hours === 1 ? 0 : 1]} e ${parts.minutes} ${names.minutes[parts.minutes === 1 ? 0 : 1]} para 10 de janeiro de 2027.`;
  }

  if (total === 0) window.clearInterval(clock);
};

if (units.days) {
  paintClock();
  clock = window.setInterval(paintClock, 1000);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.clearInterval(clock);
      clock = 0;
      return;
    }
    paintClock();
    if (remaining() > 0) clock = window.setInterval(paintClock, 1000);
  });
}

const form = document.querySelector("#lista-fundadores");

if (form) {
  const outroCampo = document.querySelector("#fundador-outro-campo");
  const outro = document.querySelector("#fundador-outro");
  const status = document.querySelector("#fundadores-status");

  const setError = (input, message) => {
    const error = document.querySelector(`#${input.getAttribute("aria-describedby")}`);
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (!error) return;
    error.hidden = !message;
    error.textContent = message;
  };

  const phoneDigits = (value) => value.replace(/\D/g, "");

  const validPhone = (value) => {
    const digits = phoneDigits(value);
    if (digits.length === 10 || digits.length === 11) return true;
    return (digits.length === 12 || digits.length === 13) && digits.startsWith("55");
  };

  form.addEventListener("change", (event) => {
    if (event.target.name !== "momento" || !outroCampo || !outro) return;
    const show = event.target.value === "Outro";
    outroCampo.hidden = !show;
    outro.required = show;
    if (!show) setError(outro, "");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const nome = form.querySelector("#fundador-nome");
    const whatsapp = form.querySelector("#fundador-whatsapp");
    const email = form.querySelector("#fundador-email");
    const momento = form.querySelector('input[name="momento"]:checked');
    const momentoErro = document.querySelector("#fundador-momento-erro");
    let invalid = null;

    const nomeErro = nome.value.trim().length < 2 ? "Escreva o seu nome." : "";
    const whatsappErro = validPhone(whatsapp.value) ? "" : "Escreva um WhatsApp com DDD.";
    const emailErro = email.validity.valid && email.value.trim() !== "" ? "" : "Escreva um e-mail válido.";
    const momentoMensagem = momento ? "" : "Escolha um momento.";
    const outroErro = momento && momento.value === "Outro" && outro.value.trim().length < 2
      ? "Conte qual momento."
      : "";

    setError(nome, nomeErro);
    setError(whatsapp, whatsappErro);
    setError(email, emailErro);
    if (momentoErro) {
      momentoErro.hidden = !momentoMensagem;
      momentoErro.textContent = momentoMensagem;
    }
    if (outro) setError(outro, outroErro);

    if (nomeErro) invalid = nome;
    else if (whatsappErro) invalid = whatsapp;
    else if (emailErro) invalid = email;
    else if (momentoMensagem) invalid = form.querySelector('input[name="momento"]');
    else if (outroErro) invalid = outro;

    if (invalid) {
      if (status) status.textContent = "";
      invalid.focus();
      return;
    }

    if (status) {
      status.textContent = "A lista ainda não tem um destino. Os dados ficaram neste formulário e nada foi enviado.";
    }
  });
}
