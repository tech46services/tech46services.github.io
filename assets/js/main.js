// Ajout de l'annee actuelle dans le footer
document.addEventListener("DOMContentLoaded", () => {
  const yearSpanList = document.querySelectorAll("#year");
  const year = new Date().getFullYear();
  yearSpanList.forEach((span) => (span.textContent = year));

  // Popover services : hover seulement sur pointeurs fins, comportement natif sur mobile
  const serviceDetails = document.querySelectorAll(".service-details");
  const isPointerFine = window.matchMedia("(pointer: fine)").matches;

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

    details.addEventListener("toggle", syncPopoverClass);
    syncPopoverClass();

    if (isPointerFine) {
      summary.addEventListener("mouseenter", openDetails);
      summary.addEventListener("mouseleave", closeDetails);
    }

    summary.addEventListener("focus", openDetails);
    summary.addEventListener("blur", closeDetails);
    // pas de preventDefault : on laisse le toggle natif fonctionner (mobile et accessibilité)
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
