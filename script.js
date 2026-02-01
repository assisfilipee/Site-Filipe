/* ==================================================
   SCRIPT.JS (COMPLETO) - Filipe Assis
   - Header: transparente no topo (classe body.is-top)
   - Sobre: carrossel (auto + bolinhas)
   - Whats Float Bubble: mostra após 5s, some após 3s, oculta no #contato
   - Form Contato: envia para WhatsApp
================================================== */

"use strict";

/* ==================================================
   HEADER: transparente só no topo
================================================== */
(() => {
  try {
    const threshold = 10;

    const onScroll = () => {
      const y =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;

      document.body.classList.toggle("is-top", y <= threshold);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  } catch (err) {
    console.error("[header] erro:", err);
  }
})();

/* ==================================================
   SOBRE: carousel (slides + dots) - compatível com data-dot="0"
================================================== */
(() => {
  try {
    const carousel =
      document.querySelector(".about__carousel[data-carousel]") ||
      document.querySelector("[data-carousel]");

    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll(".about__slide"));
    const dots = Array.from(carousel.querySelectorAll("button[data-dot]"));
    const interval = Number(carousel.getAttribute("data-interval") || 4000);

    if (slides.length <= 1) return;

    // Se tiver dots, precisa bater com qtd de slides
    const hasDots = dots.length === slides.length;

    let index = 0;
    let timer = null;

    const setActive = (i) => {
      index = (i + slides.length) % slides.length;

      slides.forEach((s, idx) => s.classList.toggle("is-active", idx === index));
      if (hasDots) dots.forEach((d, idx) => d.classList.toggle("is-active", idx === index));
    };

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    const start = () => {
      stop();
      timer = setInterval(() => setActive(index + 1), interval);
    };

    // Clique nos dots
    if (hasDots) {
      dots.forEach((dot) => {
        dot.addEventListener("click", () => {
          const i = Number(dot.dataset.dot);
          if (!Number.isFinite(i)) return;
          setActive(i);
          start(); // reinicia após clique
        });
      });
    }

    // pausa quando a aba não está visível
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    // inicia
    setActive(0);
    start();
  } catch (err) {
    console.error("[carousel] erro:", err);
  }
})();

/* ==================================================
   WHATS FLOAT: balão FIXO no body + oculta no Contato
================================================== */
(() => {
  try {
    const whats = document.querySelector(".whats-float");
    const contato = document.querySelector("#contato");
    if (!whats) return;

    const SHOW_AFTER_MS = 5000;
    const VISIBLE_FOR_MS = 3000;
    const GAP_PX = 12;

    let contatoVisivel = false;
    let showTimer = null;
    let hideTimer = null;

    let bubble = document.querySelector(".whats-float-bubble");
    if (!bubble) {
      bubble = document.createElement("div");
      bubble.className = "whats-float-bubble";
      bubble.textContent = "Pedir orçamento";
      document.body.appendChild(bubble);
    }

    const clearTimers = () => {
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
      showTimer = null;
      hideTimer = null;
    };

    const isWhatsVisibleInViewport = () => {
      const r = whats.getBoundingClientRect();
      return r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth;
    };

    const positionBubble = () => {
      const r = whats.getBoundingClientRect();
      if (!isWhatsVisibleInViewport()) return;

      bubble.style.top = `${r.top + r.height / 2}px`;
      bubble.style.left = `${r.left - GAP_PX}px`;
      bubble.style.transform = "translate(-100%, -50%)";
    };

    const hideBubble = () => bubble.classList.remove("is-on");

    const showBubble = () => {
      if (contatoVisivel) return;
      if (!isWhatsVisibleInViewport()) return;
      positionBubble();
      bubble.classList.add("is-on");
    };

    const schedule = () => {
      clearTimers();
      hideBubble();
      if (contatoVisivel) return;

      showTimer = setTimeout(() => {
        if (contatoVisivel) return;

        showBubble();

        hideTimer = setTimeout(() => {
          hideBubble();
        }, VISIBLE_FOR_MS);
      }, SHOW_AFTER_MS);
    };

    window.addEventListener(
      "scroll",
      () => {
        if (bubble.classList.contains("is-on")) positionBubble();
      },
      { passive: true }
    );

    window.addEventListener(
      "resize",
      () => {
        if (bubble.classList.contains("is-on")) positionBubble();
      },
      { passive: true }
    );

    if (contato && "IntersectionObserver" in window) {
      const obs = new IntersectionObserver(
        ([entry]) => {
          contatoVisivel = !!entry && entry.isIntersecting;

          if (contatoVisivel) {
            clearTimers();
            hideBubble();
          } else {
            schedule();
          }
        },
        { threshold: 0.15 }
      );

      obs.observe(contato);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearTimers();
        hideBubble();
      } else {
        schedule();
      }
    });

    schedule();
  } catch (err) {
    console.error("[whats-bubble] erro:", err);
  }
})();

/* ==================================================
   FORM CONTATO -> WhatsApp
================================================== */
(() => {
  try {
    const form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const phone = (data.get("phone") || "").toString().trim();
      const service = (data.get("service") || "").toString().trim();
      const message = (data.get("message") || "").toString().trim();

      const text =
        `Oi Filipe! Meu nome é ${name}.\n` +
        `WhatsApp: ${phone}\n` +
        `Preciso de: ${service}\n` +
        `Mensagem: ${message}`;

      const url = `https://wa.me/5551992932891?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    });
  } catch (err) {
    console.error("[form] erro:", err);
  }
})();
