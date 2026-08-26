(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector(".anne-navbar");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navMenu = document.querySelector("#site-nav");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  root.classList.add("js");
  body.classList.add("js");

  const setMenuState = (isOpen) => {
    if (!menuToggle || !navMenu) return;
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
    navMenu.classList.toggle("is-open", isOpen);
    body.classList.toggle("menu-open", isOpen);
  };

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      setMenuState(menuToggle.getAttribute("aria-expanded") !== "true");
    });

    navMenu.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenuState(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMenuState(false);
        menuToggle.focus();
      }
    });
  }

  if (header) {
    const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  const revealItems = document.querySelectorAll("[data-reveal]");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: .16, rootMargin: "0px 0px -8%" });

    revealItems.forEach((item) => observer.observe(item));
  }

})();
