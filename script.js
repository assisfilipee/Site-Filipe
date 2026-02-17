/* ==================================================
   SCRIPT.JS (LIMPO) - Filipe Assis
   - Header: transparente no topo (body.is-top)
   - Sobre: carrossel (auto + bolinhas + contador + progress)
   - Whats Modal: abre/fecha + prefill por página + ESC + envia wa.me
   - GA4:
     - whatsapp_click (delegation)
   - Footer reveal: anima 1x
   - Reveal on scroll: [data-reveal] -> .is-revealed
   - Parallax: [data-parallax] background-position
   - FAQ: mantém 1 aberto por coluna (ou 1 total se 1 coluna)
================================================== */

"use strict";

/* ==================================================
   HEADER: transparente só no topo
================================================== */
(() => {
  try {
    const threshold = 10;

    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      document.body.classList.toggle("is-top", y <= threshold);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  } catch (err) {
    console.error("[header] erro:", err);
  }
})();

/* ==================================================
   GA4 - Helper (debug opcional com ?debug=1)
================================================== */
(() => {
  try {
    const isDebug = new URLSearchParams(window.location.search).get("debug") === "1";

    window.__ga4Send = function (eventName, params) {
      if (typeof gtag !== "function") return;
      const payload = Object.assign({}, params || {});
      if (isDebug) payload.debug_mode = true;
      gtag("event", eventName, payload);
    };
  } catch (err) {
    console.error("[ga4-helper] erro:", err);
  }
})();

/* ==================================================
   GA4 - WhatsApp click (delegation)
================================================== */
(() => {
  try {
    document.addEventListener(
      "click",
      (e) => {
        const a = e.target.closest?.("a");
        if (!a) return;

        const href = (a.getAttribute("href") || "").toLowerCase();
        if (!href) return;

        const isWhats = href.includes("wa.me/") || href.includes("api.whatsapp.com");
        if (!isWhats) return;

        window.__ga4Send?.("whatsapp_click", {
          event_category: "engagement",
          event_label: "Clique no WhatsApp",
        });
      },
      { capture: true }
    );
  } catch (err) {
    console.error("[ga4-whatsapp] erro:", err);
  }
})();

/* ==================================================
   About Carousel — Agency
================================================== */
(() => {
  try {
    const carousels = Array.from(document.querySelectorAll("[data-carousel]"));
    if (!carousels.length) return;

    const pad2 = (n) => String(n).padStart(2, "0");

    carousels.forEach((carousel) => {
      const track = carousel.querySelector(".about__track");
      const slides = Array.from(carousel.querySelectorAll(".about__slide"));
      const dots = Array.from(carousel.querySelectorAll("[data-dot]"));
      const btnPrev = carousel.querySelector("[data-prev]");
      const btnNext = carousel.querySelector("[data-next]");
      const countNow = carousel.querySelector("[data-count-now]");
      const countAll = carousel.querySelector("[data-count-all]");
      const progress = carousel.querySelector("[data-progress]");

      if (!track || slides.length < 2) return;

      const interval = Number(carousel.getAttribute("data-interval")) || 4000;

      let index = slides.findIndex((s) => s.classList.contains("is-active"));
      if (index < 0) index = 0;

      let timer = null;
      let paused = false;

      if (countAll) countAll.textContent = pad2(slides.length);

      const setActive = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;

        slides.forEach((s, i) => s.classList.toggle("is-active", i === index));
        dots.forEach((d, i) => d.classList.toggle("is-active", i === index));

        if (countNow) countNow.textContent = pad2(index + 1);

        if (progress) {
          progress.style.animation = "none";
          progress.offsetHeight; // reflow
          progress.style.animation = `aboutProgress ${interval}ms linear forwards`;
        }
      };

      const next = () => setActive(index + 1);
      const prev = () => setActive(index - 1);

      const stop = () => {
        if (timer) clearTimeout(timer);
        timer = null;
      };

      const loop = () => {
        stop();
        if (paused) return;

        timer = setTimeout(() => {
          next();
          loop();
        }, interval);
      };

      const pause = () => {
        paused = true;
        stop();
        if (progress) progress.style.animationPlayState = "paused";
      };

      const resume = () => {
        paused = false;
        if (progress) progress.style.animationPlayState = "running";
        loop();
      };

      dots.forEach((dot) => {
        dot.addEventListener("click", () => {
          const i = Number(dot.getAttribute("data-dot"));
          if (Number.isFinite(i)) {
            setActive(i);
            loop();
          }
        });
      });

      btnPrev?.addEventListener("click", () => { prev(); loop(); });
      btnNext?.addEventListener("click", () => { next(); loop(); });

      carousel.addEventListener("mouseenter", pause);
      carousel.addEventListener("mouseleave", resume);
      carousel.addEventListener("focusin", pause);
      carousel.addEventListener("focusout", resume);

      carousel.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") { e.preventDefault(); prev(); loop(); }
        if (e.key === "ArrowRight") { e.preventDefault(); next(); loop(); }
      });

      setActive(index);
      loop();
    });
  } catch (err) {
    console.error("[carousel] erro:", err);
  }
})();

/* ==================================================
   WHATSAPP MODAL (ÚNICO)
================================================== */
(() => {
  try {
    const WHATSAPP_NUMBER = "5548988263159";

    const openBtn = document.getElementById("openWapp");
    const modal = document.getElementById("wappModal");
    const closeBtn = document.getElementById("closeWapp");
    const form = document.getElementById("wappForm");

    if (!openBtn || !modal || !closeBtn || !form) return;

    const nameInput = form.querySelector('input[name="name"]');
    const msgInput = form.querySelector('textarea[name="message"]');
    const backdrop = modal.querySelector('[data-close="wapp"]');

    const getPrefilledMessage = () => {
      const path = (location.pathname || "").toLowerCase();

      if (path.includes("criacao-de-sites-em-florianopolis")) {
        return "Olá! Vi seu site e quero um orçamento para criação de site em Florianópolis. Pode me explicar prazos e valores?";
      }
      if (path.includes("criacao-de-sites-em-sao-jose")) {
        return "Olá! Quero um site para minha empresa em São José/SC. Você pode me enviar uma proposta com prazos e valores?";
      }
      if (path.includes("criacao-de-sites-em-palhoca")) {
        return "Olá! Quero criar um site para minha empresa em Palhoça/SC. Como funciona o processo e quais os valores?";
      }
      return "Olá! Quero fechar um projeto de site com você. Podemos conversar?";
    };

    const buildWhatsUrl = (name, message) => {
      const text = [name ? `Meu nome é ${name}.` : null, message].filter(Boolean).join(" ");
      return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    };

    const OPEN_CLASS = "is-open";
    const ANIM_MS = 180;

    const openModal = () => {
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      document.documentElement.style.overflow = "hidden";

      // prefill só se vazio
      if (msgInput && !msgInput.value.trim()) msgInput.value = getPrefilledMessage();

      // animação no próximo frame
      requestAnimationFrame(() => modal.classList.add(OPEN_CLASS));

      setTimeout(() => (nameInput || msgInput)?.focus?.(), 80);
    };

    const closeModal = () => {
      modal.classList.remove(OPEN_CLASS);
      modal.setAttribute("aria-hidden", "true");
      document.documentElement.style.overflow = "";

      setTimeout(() => { modal.hidden = true; }, ANIM_MS);
    };

    openBtn.addEventListener("click", (e) => { e.preventDefault(); openModal(); });
    closeBtn.addEventListener("click", (e) => { e.preventDefault(); closeModal(); });

    backdrop?.addEventListener("click", (e) => { e.preventDefault(); closeModal(); });

    document.addEventListener("keydown", (e) => {
      if (!modal.hidden && e.key === "Escape") closeModal();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = (nameInput?.value || "").trim();
      const message = (msgInput?.value || "").trim();

      if (!message) {
        msgInput?.focus?.();
        msgInput?.classList?.add("is-invalid");
        return;
      }
      msgInput?.classList?.remove("is-invalid");

      window.open(buildWhatsUrl(name, message), "_blank", "noopener,noreferrer");

      closeModal();
      form.reset();
    });
  } catch (err) {
    console.error("[wapp-modal] erro:", err);
  }
})();

/* ==================================================
   FOOTER reveal on scroll (anima 1x)
================================================== */
(() => {
  try {
    const footer = document.querySelector(".site-footer");
    if (!footer) return;

    if (!("IntersectionObserver" in window)) {
      footer.classList.add("is-visible");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          footer.classList.add("is-visible");
          io.disconnect();
          break;
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );

    io.observe(footer);
  } catch (err) {
    console.error("[footer-reveal] erro:", err);
  }
})();

/* ==================================================
   REVEAL + PARALLAX
================================================== */
(() => {
  try {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reveal
    const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!prefersReduced && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add("is-revealed");
            obs.unobserve(e.target);
          });
        },
        { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
      );
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-revealed"));
    }

    // Parallax
    const parallaxEls = Array.from(document.querySelectorAll("[data-parallax]"));
    if (prefersReduced || parallaxEls.length === 0) return;

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const state = new Map();

    parallaxEls.forEach((el) => {
      state.set(el, { mx: 0, my: 0, sy: 0 });
      el.style.willChange = "background-position";
    });

    let raf = 0;
    const render = () => {
      raf = 0;
      parallaxEls.forEach((el) => {
        const s = state.get(el);
        if (!s) return;
        el.style.backgroundPosition = `calc(50% + ${s.mx}px) calc(50% + ${s.my + s.sy}px)`;
      });
    };
    const requestRender = () => { if (!raf) raf = requestAnimationFrame(render); };

    const canMouseParallax = window.matchMedia("(pointer:fine)").matches;
    if (canMouseParallax) {
      window.addEventListener("mousemove", (ev) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const nx = (ev.clientX - cx) / cx;
        const ny = (ev.clientY - cy) / cy;

        parallaxEls.forEach((el) => {
          const s = state.get(el);
          if (!s) return;
          s.mx = clamp(nx * 10, -10, 10);
          s.my = clamp(ny * 8, -8, 8);
        });

        requestRender();
      }, { passive: true });
    }

    const onScroll = () => {
      const vh = window.innerHeight;

      parallaxEls.forEach((el) => {
        const s = state.get(el);
        if (!s) return;

        const r = el.getBoundingClientRect();
        const t = (r.top + r.height / 2 - vh / 2) / (vh / 2);
        const prog = clamp(t, -1, 1);
        s.sy = prog * 10;
      });

      requestRender();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
  } catch (err) {
    console.error("[reveal/parallax] erro:", err);
  }
})();

/* ==================================================
   FAQ — 1 aberto por coluna
================================================== */
(() => {
  try {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const faq = document.querySelector(".faq");
    if (!faq) return;

    const items = Array.from(faq.querySelectorAll(".faq__item"));

    const getColumnIndex = (el) => {
      const rect = el.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;

      const faqRect = faq.getBoundingClientRect();
      const relX = midX - faqRect.left;

      const colCountRaw = getComputedStyle(faq).columnCount || "1";
      const cols = Math.max(1, parseInt(colCountRaw, 10) || 1);

      const colW = faqRect.width / cols;
      return Math.min(cols - 1, Math.max(0, Math.floor(relX / colW)));
    };

    faq.addEventListener("toggle", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLDetailsElement)) return;
      if (!target.open) return;

      const col = getColumnIndex(target);

      items.forEach((it) => {
        if (it === target) return;
        if (getColumnIndex(it) === col) it.open = false;
      });

      if (!prefersReduced) {
        const top = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: Math.max(0, top - 120), behavior: "smooth" });
      }
    });
  } catch (err) {
    console.error("[faq] erro:", err);
  }
})();
