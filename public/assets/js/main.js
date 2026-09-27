// Ajout de l'annee actuelle dans le footer
const initializedElements = new WeakSet();
let revealObserver;
let dismissListenersInitialized = false;

const syncPersistedHeader = (event) => {
  const incomingHeader = event.newDocument?.querySelector(".top-nav");
  const currentHeader = document.querySelector(".top-nav");
  if (!incomingHeader || !currentHeader) return;

  const incomingLinks = incomingHeader.querySelectorAll("a.nav-link");
  currentHeader.querySelectorAll("a.nav-link").forEach((link) => {
    const incomingLink = Array.from(incomingLinks).find(
      (candidate) => candidate.getAttribute("href") === link.getAttribute("href")
    );
    if (!incomingLink) return;

    link.classList.toggle("active", incomingLink.classList.contains("active"));
    if (incomingLink.hasAttribute("aria-current")) {
      link.setAttribute("aria-current", incomingLink.getAttribute("aria-current"));
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const currentDiscoverToggle = currentHeader.querySelector(".nav-discover-toggle");
  const incomingDiscoverToggle = incomingHeader.querySelector(".nav-discover-toggle");
  currentDiscoverToggle?.classList.toggle(
    "active",
    incomingDiscoverToggle?.classList.contains("active") ?? false
  );

  const nav = currentHeader.querySelector(".nav-links");
  const menuButton = currentHeader.querySelector(".menu-toggle");
  nav?.classList.remove("open");
  menuButton?.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");

  const discover = currentHeader.querySelector(".nav-discover");
  discover?.classList.remove("is-open");
  currentDiscoverToggle?.setAttribute("aria-expanded", "false");
};

document.addEventListener("astro:before-swap", syncPersistedHeader);

const initializePage = () => {
  const yearSpanList = document.querySelectorAll(".js-year");
  const year = new Date().getFullYear();
  yearSpanList.forEach((span) => (span.textContent = year));

  const btn = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  const discover = document.querySelector(".nav-discover");
  const discoverToggle = discover?.querySelector(".nav-discover-toggle");

  const setDiscoverState = (isOpen) => {
    if (!discover || !discoverToggle) return;
    discover.classList.toggle("is-open", isOpen);
    discoverToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  };

  if (discover && discoverToggle && !initializedElements.has(discoverToggle)) {
    initializedElements.add(discoverToggle);
    discoverToggle.addEventListener("click", () => {
      setDiscoverState(!discover.classList.contains("is-open"));
    });

    discover.addEventListener("focusout", (event) => {
      if (!discover.contains(event.relatedTarget)) setDiscoverState(false);
    });

    document.addEventListener("pointerdown", (event) => {
      if (!discover.contains(event.target)) setDiscoverState(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && discover.classList.contains("is-open")) {
        setDiscoverState(false);
        discoverToggle.focus();
      }
    });
  }

  if (btn && nav && !initializedElements.has(btn)) {
    initializedElements.add(btn);
    const setMenuState = (isOpen) => {
      nav.classList.toggle("open", isOpen);
      btn.classList.toggle("open", isOpen);
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (!isOpen) setDiscoverState(false);
    };

    setMenuState(nav.classList.contains("open"));
    btn.addEventListener("click", () => {
      setMenuState(!nav.classList.contains("open"));
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("open")) return;
      const target = event.target;
      if (target instanceof Node && (nav.contains(target) || btn.contains(target))) return;
      setMenuState(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        setMenuState(false);
        btn.focus();
      }
    });

    // "scroll" ne remonte pas depuis le scroll interne du menu (nav-links en overflow-y: auto),
    // seul le scroll de la fenêtre déclenche donc cette fermeture.
    window.addEventListener(
      "scroll",
      () => {
        if (nav.classList.contains("open")) setMenuState(false);
      },
      { passive: true }
    );
  }

  // Popover services : bouton reel + meme comportement visuel qu'avant
  const serviceDetails = document.querySelectorAll(".service-details");
  const isPointerFine = window.matchMedia("(pointer: fine)").matches;

  const setServiceDetailsState = (details, isOpen) => {
    details.classList.toggle("is-open", isOpen);

    const toggleButton = details.querySelector(".service-details-toggle");
    if (toggleButton) {
      toggleButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }

    const popoverContent = details.querySelector("p");
    if (popoverContent) {
      popoverContent.setAttribute("aria-hidden", isOpen ? "false" : "true");
    }

    const card = details.closest(".service-card");
    if (card) {
      card.classList.toggle("popover-open", isOpen);
    }
  };

  const closeAllServiceDetails = (exceptDetails = null) => {
    document.querySelectorAll(".service-details").forEach((details) => {
      if (details !== exceptDetails) {
        setServiceDetailsState(details, false);
      }
    });
  };

  serviceDetails.forEach((details, index) => {
    if (initializedElements.has(details)) return;
    const toggleButton = details.querySelector(".service-details-toggle");
    if (!toggleButton) return;
    initializedElements.add(details);

    const popoverContent = details.querySelector("p");
    if (popoverContent) {
      if (!popoverContent.id) {
        popoverContent.id = `service-popover-${index + 1}`;
      }
      toggleButton.setAttribute("aria-controls", popoverContent.id);
    }

    setServiceDetailsState(details, details.classList.contains("is-open"));

    toggleButton.addEventListener("click", () => {
      const willOpen = !details.classList.contains("is-open");

      // Un seul encart ouvert a la fois quand on clique sur un bouton
      if (willOpen) {
        closeAllServiceDetails(details);
      }

      setServiceDetailsState(details, willOpen);
    });

    if (isPointerFine) {
      toggleButton.addEventListener("mouseenter", () => {
        setServiceDetailsState(details, true);
      });

      details.addEventListener("mouseleave", () => {
        setServiceDetailsState(details, false);
      });
    }
  });

  // Ferme les encarts quand on clique/tape ailleurs sur la page.
  // Seul le bouton "En savoir plus" est exclu (il gere son propre toggle).
  const handleGlobalDetailsDismiss = (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest(".service-details-toggle")) return;
    closeAllServiceDetails();
  };

  if (!dismissListenersInitialized) {
    document.addEventListener("pointerdown", handleGlobalDetailsDismiss);
    document.addEventListener("click", handleGlobalDetailsDismiss);
    dismissListenersInitialized = true;
  }

  // Animation d'apparition au scroll
  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          // Trigger un peu plus tôt pour éviter que le contenu reste invisible sur mobile
          rootMargin: "20% 0px",
          threshold: 0,
        }
      );
    }

    revealElements.forEach((el) => {
      if (initializedElements.has(el)) return;
      initializedElements.add(el);
      revealObserver.observe(el);
    });
  } else {
    // Fallback simple
    revealElements.forEach((el) => {
      if (initializedElements.has(el)) return;
      initializedElements.add(el);
      el.classList.add("visible");
    });
  }

  // Envoi du formulaire de contact via Web3Forms
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");

  if (contactForm && formStatus && !initializedElements.has(contactForm)) {
    initializedElements.add(contactForm);
    const phoneInput = contactForm.querySelector('input[type="tel"]');
    if (phoneInput) {
      phoneInput.addEventListener("input", () => {
        phoneInput.value = phoneInput.value.replace(/[^0-9]/g, "");
      });
    }

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      formStatus.textContent = "Envoi en cours...";

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: new FormData(contactForm),
        });

        if (!response.ok) throw new Error("Échec de l'envoi");

        formStatus.textContent = "Merci, votre message a bien été envoyé.";
        contactForm.reset();
      } catch {
        formStatus.innerHTML =
          'Impossible d\'envoyer le message. Vous pouvez aussi m\'écrire à : <a href="mailto:contact@tech46services.fr">contact@tech46services.fr</a>';
      }
    });
  }
};

document.addEventListener("astro:page-load", initializePage);
