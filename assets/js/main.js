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
    serviceDetails.forEach((details) => {
      if (details !== exceptDetails) {
        setServiceDetailsState(details, false);
      }
    });
  };

  serviceDetails.forEach((details, index) => {
    const toggleButton = details.querySelector(".service-details-toggle");
    if (!toggleButton) return;

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

  document.addEventListener("pointerdown", handleGlobalDetailsDismiss);
  document.addEventListener("click", handleGlobalDetailsDismiss);

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
