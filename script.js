/* ==================================================
   HEADER: transparente só no topo
================================================== */
(() => {
  const threshold = 10;

  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.classList.toggle("is-top", y <= threshold);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

/* ==================================================
   WHATS FLOAT: balão FIXO no body + oculta no Contato
   - Mostra após 5s, some após 3s
   - Se #contato estiver visível, não mostra / esconde
   - Balão não é cortado por overflow/transform do layout
================================================== */
(() => {
  const whats = document.querySelector(".whats-float");
  const contato = document.querySelector("#contato");
  if (!whats) return;

  const SHOW_AFTER_MS = 5000;
  const VISIBLE_FOR_MS = 3000;

  let contatoVisivel = false;
  let showTimer = null;
  let hideTimer = null;

  // Cria (ou reutiliza) o balão no <body>
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

  const positionBubble = () => {
    const r = whats.getBoundingClientRect();

    // Centraliza verticalmente no botão
    bubble.style.top = `${r.top + r.height / 2}px`;

    // Encosta à esquerda do botão com um gap
    const gap = 12;
    bubble.style.left = `${r.left - gap}px`;

    // Move o balão para a esquerda do ponto (left) e centraliza no meio do botão
    bubble.style.transform = "translate(-100%, -50%)";
  };

  const hideBubble = () => {
    bubble.classList.remove("is-on");
  };

  const showBubble = () => {
    if (contatoVisivel) return;
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

  // Reposiciona enquanto visível (scroll/resize)
  window.addEventListener(
    "scroll",
    () => {
      if (bubble.classList.contains("is-on")) positionBubble();
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    if (bubble.classList.contains("is-on")) positionBubble();
  });

  // Observer do contato
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

  // Troca de aba
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearTimers();
      hideBubble();
    } else {
      schedule();
    }
  });

  // start
  schedule();
})();

(() => {
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
    window.open(url, "_blank", "noopener");
  });
})();
