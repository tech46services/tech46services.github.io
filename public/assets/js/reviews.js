// Déplie individuellement les avis longs (chargé uniquement sur les pages avec le composant Reviews).
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".review-toggle").forEach((toggleButton) => {
    const card = toggleButton.closest(".testimonial-card");
    const controlledTextId = toggleButton.getAttribute("aria-controls");
    const reviewText = controlledTextId
      ? document.getElementById(controlledTextId)
      : null;
    if (!card || !reviewText) return;

    card.classList.add("is-collapsible");
    const textOverflows = reviewText.scrollHeight > reviewText.clientHeight + 1;
    if (!textOverflows) {
      card.classList.remove("is-collapsible");
      return;
    }

    toggleButton.hidden = false;
    toggleButton.addEventListener("click", () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (card._activeAnim) {
        card._activeAnim.cancel();
      }

      const startHeight = card.offsetHeight;

      const isExpanded = card.classList.toggle("is-expanded");
      toggleButton.setAttribute("aria-expanded", isExpanded ? "true" : "false");
      toggleButton.textContent = isExpanded
        ? "Réduire l’avis"
        : "Afficher l’avis complet";

      const endHeight = card.offsetHeight;

      if (
        !prefersReducedMotion &&
        typeof card.animate === "function" &&
        startHeight !== endHeight
      ) {
        card.style.overflow = "hidden";
        const anim = card.animate(
          [
            { height: `${startHeight}px` },
            { height: `${endHeight}px` },
          ],
          {
            duration: 260,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          }
        );
        card._activeAnim = anim;

        const cleanup = () => {
          card.style.overflow = "";
          card._activeAnim = null;
        };

        anim.onfinish = cleanup;
        anim.oncancel = cleanup;
      }
    });
  });
});
