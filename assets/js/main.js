// Ajout de l'annee actuelle dans le footer
document.addEventListener("DOMContentLoaded", () => {
  const yearSpanList = document.querySelectorAll(".js-year");
  const year = new Date().getFullYear();
  yearSpanList.forEach((span) => (span.textContent = year));

  const btn = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");

  if (btn && nav) {
    const setMenuState = (isOpen) => {
      nav.classList.toggle("open", isOpen);
      btn.classList.toggle("open", isOpen);
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    };

    setMenuState(nav.classList.contains("open"));
    btn.addEventListener("click", () => {
      setMenuState(!nav.classList.contains("open"));
    });
  }

  // Popover services : hover seulement sur pointeurs fins, comportement natif sur mobile
  const serviceDetails = document.querySelectorAll(".service-details");
  const isPointerFine = window.matchMedia("(pointer: fine)").matches;
  const closeAllServiceDetails = () => {
    serviceDetails.forEach((details) => {
      if (details.open) {
        details.open = false;
      }
    });
  };

  serviceDetails.forEach((details) => {
    const summary = details.querySelector("summary");
    if (!summary) return;

    const card = details.closest(".service-card");
    const syncPopoverClass = () => {
      if (!card) return;
      card.classList.toggle("popover-open", details.open);
    };

    const openDetails = () => {
      details.open = true;
      syncPopoverClass();
    };

    const closeDetails = () => {
      details.open = false;
      syncPopoverClass();
    };

    details.addEventListener("toggle", () => {
      // Mobile/tactile: un seul encart ouvert a la fois (comportement accordéon)
      if (!isPointerFine && details.open) {
        serviceDetails.forEach((otherDetails) => {
          if (otherDetails !== details && otherDetails.open) {
            otherDetails.open = false;
          }
        });
      }

      syncPopoverClass();
    });
    syncPopoverClass();

    if (isPointerFine) {
      summary.addEventListener("mouseenter", openDetails);
      summary.addEventListener("mouseleave", closeDetails);
    }

    // Sur tactile/clavier, on garde le comportement natif <details>/<summary>.
    // Cela evite un conflit focus/blur qui imposait parfois un double tap.
    // pas de preventDefault : on laisse le toggle natif fonctionner.
  });

  // Ferme les encarts quand on clique/tape ailleurs sur la page.
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest(".service-details")) return;
    closeAllServiceDetails();
  });

  // Animation d'apparition au scroll
  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
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

    revealElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback simple
    revealElements.forEach((el) => el.classList.add("visible"));
  }
});
