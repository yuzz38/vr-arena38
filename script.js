"use strict";
const { catalog, reviews } = window.ARENA_DATA;
const burger = document.querySelector(".burger"),
  nav = document.querySelector("#navigation");
function setMenu(open) {
  nav.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  document.body.classList.toggle("locked", open);
}
burger.addEventListener("click", () =>
  setMenu(burger.getAttribute("aria-expanded") !== "true"),
);
nav
  .querySelectorAll("a")
  .forEach((a) => a.addEventListener("click", () => setMenu(false)));
matchMedia("(min-width:801px)").addEventListener("change", (e) => {
  if (e.matches) setMenu(false);
});
document.addEventListener("keydown", (e) => {
  if (burger.getAttribute("aria-expanded") !== "true") return;
  if (e.key === "Escape") {
    setMenu(false);
    burger.focus();
  }
  if (e.key === "Tab") {
    const links = [...nav.querySelectorAll("a"), burger],
      first = links[0],
      last = links.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
function filter(category) {
  document.querySelectorAll(".filter").forEach((b) => {
    const selected = b.dataset.filter === category;
    b.classList.toggle("active", selected);
    b.setAttribute("aria-pressed", String(selected));
  });
  let count = 0;
  document.querySelectorAll(".game-card").forEach((c) => {
    c.hidden = category !== "Все" && c.dataset.category !== category;
    if (!c.hidden) count++;
  });
  document.querySelector(".catalog-result").textContent =
    "Показано: " + count + " из " + catalog.length;
}
document
  .querySelectorAll(".filter")
  .forEach((b) => b.addEventListener("click", () => filter(b.dataset.filter)));
document.querySelector("[data-quest-filter]").addEventListener("click", () => {
  filter("Квесты");
  document.querySelector(".filters").scrollIntoView({
    behavior: matchMedia("(prefers-reduced-motion:reduce)").matches
      ? "instant"
      : "smooth",
    block: "start",
  });
});
const dialog = document.querySelector("#game-dialog");
let lastGame = null;
document.querySelectorAll("[data-game]").forEach((b) =>
  b.addEventListener("click", () => {
    const g = catalog[Number(b.dataset.game)];
    lastGame = b;
    document.querySelector("#dialog-title").textContent = g.title;
    document.querySelector("#dialog-genre").textContent = g.genre;
    const image = document.querySelector("#dialog-image");
    image.src = "assets/" + g.image + ".webp";
    image.alt = g.title;
    const desc = document.querySelector("#dialog-description");
    desc.replaceChildren(
      ...g.description.map((t) => {
        const p = document.createElement("p");
        p.textContent = t.replace(/(\d)([а-яА-Я])/g, "$1 $2");
        return p;
      }),
    );
    document.querySelector("#dialog-note").textContent =
      g.kind === "quest"
        ? "Квест для 2–4 участников. Возрастную рекомендацию уточните у администратора."
        : "Подберём игру по возрасту и опыту. Наличие сценария уточните при бронировании.";
    document.querySelector("#dialog-source").href =
      "assets/sources/source-" + g.source + ".webp";
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add("locked");
    document.querySelector(".modal-close").focus();
  }),
);
function closeDialog() {
  dialog.close();
}
document.querySelector(".modal-close").addEventListener("click", closeDialog);
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      closeDialog();
  }
});
dialog.addEventListener("close", () => {
  document.body.classList.remove("locked");
  lastGame?.focus();
});
const money = (n) => n.toLocaleString("ru-RU") + " ₽";
const plans = {
  hour: { title: "Поиграть на арене", day: 5000, evening: 6000, night: 8000 },
  mini: { title: "Пакет «Мини»", day: 14000, evening: 16000, hours: 2, vr: 1 },
  standard: {
    title: "Пакет «Стандарт»",
    day: 20000,
    evening: 22000,
    hours: 3,
    vr: 2,
  },
  max: {
    title: "Пакет «Максимум»",
    day: 30000,
    evening: 33000,
    hours: 4,
    vr: 2,
  },
};
let requestText = "";
function calculate() {
  const plan = document.querySelector("input[name=plan]:checked").value;
  const night = document.querySelector("input[name=time][value=night]");
  night.disabled = plan !== "hour";
  if (night.disabled && night.checked)
    document.querySelector("input[name=time][value=day]").checked = true;
  const time = document.querySelector("input[name=time]:checked").value;
  const guests = Number(document.querySelector("#guests").value),
    hoursEl = document.querySelector("#hours");
  hoursEl.min = time === "night" ? "2" : "1";
  if (Number(hoursEl.value) < Number(hoursEl.min)) hoursEl.value = hoursEl.min;
  const hours = Number(hoursEl.value),
    p = plans[plan];
  document.querySelector("#hours-wrap").hidden = plan !== "hour";
  document.querySelector("#addon-fieldset").hidden = plan === "hour";
  const bear = document.querySelector("#bear"),
    trampoline = document.querySelector("#trampoline");
  if (plan === "hour") {
    bear.checked = false;
    trampoline.checked = false;
  }
  const cost =
    (plan === "hour" ? p[time] * hours : p[time]) +
    (bear.checked ? 1000 : 0) +
    (trampoline.checked ? 5000 : 0);
  const people = guests + " " + (guests < 5 ? "человека" : "человек");
  document.querySelector("#guests-value").value = people;
  document.querySelector("#hours-value").value =
    hours + " " + (hours === 1 ? "час" : hours < 5 ? "часа" : "часов");
  document.querySelector("#summary-title").textContent = p.title;
  const period = {
    day: "День, 11:00–17:00",
    evening: "Вечер, 18:00–23:00",
    night: "Ночь, 00:00–05:00",
  }[time];
  const duration =
    plan === "hour"
      ? hours + " ч VR"
      : p.hours +
        " ч отдыха · " +
        p.vr +
        " ч VR" +
        (plan === "max" ? " · 1 ч батутов" : "");
  document.querySelector("#summary-detail").textContent =
    period +
    " / " +
    people +
    " / " +
    duration +
    (bear.checked ? " / Белый медведь, 15 мин" : "") +
    (trampoline.checked ? " / Дополнительно батуты, 30 мин" : "");
  document.querySelector("#total").textContent = money(cost);
  document.querySelector("#per-person").textContent =
    "Около " +
    money(Math.ceil(cost / guests)) +
    " на человека при таком составе";
  requestText =
    "Здравствуйте! Хотим в VR ARENA ONLINE. " +
    p.title +
    ". " +
    document.querySelector("#summary-detail").textContent +
    ". Предварительно " +
    money(cost) +
    ". Подскажите свободные даты и подтвердите итоговую стоимость и условия бронирования.";
  document.querySelector("#copy-state").textContent = "";
  document.querySelector("#copy-fallback").hidden = true;
  document.querySelector("#admin-chat-fallback").hidden = true;
}
document.querySelector("#planner-form").addEventListener("input", calculate);
document.querySelector("#planner-form").addEventListener("change", calculate);
document
  .querySelector("#planner-form")
  .addEventListener("submit", (e) => e.preventDefault());
calculate();
document.querySelector("#copy-plan").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(requestText);
    document.querySelector("#copy-state").textContent =
      "План скопирован. Открываем чат администратора — вставьте сообщение.";
    window.location.assign("https://vk.ru/vrarenairk");
  } catch {
    const t = document.querySelector("#copy-fallback");
    t.value = requestText;
    t.hidden = false;
    t.focus();
    t.select();
    document.querySelector("#copy-state").textContent =
      "Скопируйте выделенный текст вручную, затем откройте чат администратора.";
    document.querySelector("#admin-chat-fallback").hidden = false;
  }
});
document.querySelectorAll("[data-price-time]").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll("[data-price-time]").forEach((x) => {
      x.classList.toggle("active", x === b);
      x.setAttribute("aria-pressed", String(x === b));
    });
    document
      .querySelectorAll("[data-price-day]")
      .forEach(
        (n) =>
          (n.textContent = money(
            Number(
              b.dataset.priceTime === "day"
                ? n.dataset.priceDay
                : n.dataset.priceEvening,
            ),
          )),
      );
  }),
);
document
  .querySelectorAll("[data-price-day]")
  .forEach((n) => (n.textContent = money(Number(n.dataset.priceDay))));
let reviewIndex = 0;
const reviewMedia = matchMedia("(max-width:800px)");
function renderReviews() {
  const size = reviewMedia.matches ? 1 : 3;
  const list = document.querySelector("#review-list");
  list.replaceChildren();
  for (let i = 0; i < size; i++) {
    const idx = (reviewIndex + i) % reviews.length;
    const article = document.createElement("article");
    article.className = "review-card";
    const mark = document.createElement("span");
    mark.className = "review-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "“";
    const quote = document.createElement("blockquote");
    quote.textContent = reviews[idx][1];
    const author = document.createElement("p");
    author.className = "review-author";
    author.textContent = reviews[idx][0];
    const source = document.createElement("small");
    source.textContent = "Отзыв гостя в 2ГИС";
    article.append(mark, quote, author, source);
    list.append(article);
  }
  const indices = Array.from(
    { length: size },
    (_, i) => ((reviewIndex + i) % 10) + 1,
  );
  document.querySelector("#review-counter").textContent =
    indices.join(", ") + " / 10";
}
document.querySelector("#review-prev").addEventListener("click", () => {
  reviewIndex = (reviewIndex - 1 + 10) % 10;
  renderReviews();
});
document.querySelector("#review-next").addEventListener("click", () => {
  reviewIndex = (reviewIndex + 1) % 10;
  renderReviews();
});
reviewMedia.addEventListener("change", renderReviews);
renderReviews();
let swipe = 0;
const reviewList = document.querySelector("#review-list");
reviewList.addEventListener(
  "touchstart",
  (e) => (swipe = e.changedTouches[0].clientX),
  { passive: true },
);
reviewList.addEventListener(
  "touchend",
  (e) => {
    const dx = e.changedTouches[0].clientX - swipe;
    if (Math.abs(dx) > 60) {
      reviewIndex = (reviewIndex + (dx < 0 ? 1 : 9)) % 10;
      renderReviews();
    }
  },
  { passive: true },
);
const frame = document.querySelector(".video-frame"),
  video = frame.querySelector("video"),
  play = frame.querySelector(".play-video"),
  pause = document.querySelector("#video-pause"),
  seek = document.querySelector("#video-seek");
async function startVideo() {
  try {
    await video.play();
    document.querySelector("#video-error").textContent = "";
  } catch {
    document.querySelector("#video-error").textContent =
      "Видео не запустилось. Попробуйте ещё раз.";
  }
}
play.addEventListener("click", startVideo);
pause.addEventListener("click", () =>
  video.paused ? startVideo() : video.pause(),
);
video.addEventListener("play", () => {
  frame.classList.add("playing", "started");
  pause.textContent = "Ⅱ";
  pause.setAttribute("aria-label", "Пауза");
});
video.addEventListener("pause", () => {
  frame.classList.remove("playing");
  pause.textContent = "▶";
  pause.setAttribute("aria-label", "Продолжить");
});
video.addEventListener("ended", () => {
  frame.classList.remove("playing");
  video.currentTime = 0;
});
video.addEventListener("timeupdate", () => {
  seek.value = video.duration ? (100 * video.currentTime) / video.duration : 0;
});
seek.addEventListener("input", () => {
  if (Number.isFinite(video.duration))
    video.currentTime = (Number(seek.value) * video.duration) / 100;
});
document.querySelector("#video-sound").addEventListener("click", (e) => {
  video.muted = !video.muted;
  e.target.textContent = video.muted ? "Без звука" : "Звук";
  e.target.setAttribute(
    "aria-label",
    video.muted ? "Включить звук" : "Выключить звук",
  );
});
document.querySelector("#video-full").addEventListener("click", async () => {
  try {
    if (frame.requestFullscreen) await frame.requestFullscreen();
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
  } catch {
    document.querySelector("#video-error").textContent =
      "Полноэкранный режим недоступен в этом браузере.";
  }
});
const reduced = matchMedia("(prefers-reduced-motion:reduce)").matches;
if (window.gsap && !reduced) {
  const h = document.querySelector("h1");
  const lines = [...h.childNodes];
  for (const node of lines) {
    if (node.nodeType === 3 && node.textContent.trim()) {
      const span = document.createElement("span");
      span.className = "hero-line";
      span.setAttribute("aria-label", node.textContent);
      [...node.textContent].forEach((ch) => {
        const c = document.createElement("span");
        c.textContent = ch;
        c.style.display = "inline-block";
        c.style.whiteSpace = "pre";
        c.setAttribute("aria-hidden", "true");
        c.className = "letter";
        span.append(c);
      });
      node.replaceWith(span);
    }
  }
  gsap.from(".hero-line .letter", {
    y: 24,
    opacity: 0.25,
    stagger: 0.025,
    duration: 0.7,
    ease: "power3.out",
  });
  gsap.from(".hero-intro", {
    y: 18,
    opacity: 0.4,
    duration: 0.8,
    delay: 0.3,
    ease: "power3.out",
  });
  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray("section:not(.hero) h2").forEach((el) =>
      gsap.from(el, {
        y: 20,
        opacity: 0.4,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
      }),
    );
    gsap.to(".hero-image img", {
      y: 65,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }
}
if (matchMedia("(pointer:fine)").matches && !reduced) {
  const ring = document.querySelector(".pointer-ring");
  document.addEventListener("pointermove", (e) => {
    ring.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
    ring.classList.toggle("over", !!e.target.closest("a,button"));
  });
  const magnetic = document.querySelector(".hero-actions .btn");
  magnetic.addEventListener("pointermove", (e) => {
    const r = magnetic.getBoundingClientRect();
    magnetic.style.transform =
      "translate(" +
      (e.clientX - r.left - r.width / 2) * 0.08 +
      "px," +
      (e.clientY - r.top - r.height / 2) * 0.1 +
      "px)";
  });
  magnetic.addEventListener(
    "pointerleave",
    () => (magnetic.style.transform = ""),
  );
}

document.querySelectorAll("[data-plan]").forEach((a) =>
  a.addEventListener("click", () => {
    document.querySelector(
      'input[name="plan"][value="' + a.dataset.plan + '"]',
    ).checked = true;
    const selected = document.querySelector("[data-price-time].active");
    if (selected)
      document.querySelector(
        'input[name="time"][value="' + selected.dataset.priceTime + '"]',
      ).checked = true;
    calculate();
  }),
);
