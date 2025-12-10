// Ajout de l'année actuelle dans le footer
document.addEventListener("DOMContentLoaded", () => {
  const yearSpanList = document.querySelectorAll("#year");
  const year = new Date().getFullYear();
  yearSpanList.forEach(span => span.textContent = year);

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
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.15,
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback simple
    revealElements.forEach((el) => el.classList.add("visible"));
  }
});
