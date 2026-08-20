/**
 * Anne Chataigner - Site Interactions & Animations Orchestrator
 * Compatible with Webflow IX2/IX3, Lenis Smooth Scroll & GSAP SplitText
 */
function initAnne() {
  // 1. Ensure HTML class flags for Webflow and animations
  document.documentElement.classList.add("w-mod-js", "w-mod-ix", "w-mod-ix3");

  // 2. Initialize Lenis Luxury Smooth Scroll
  let lenis = null;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false
    });
    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync with GSAP ScrollTrigger if present
    if (typeof gsap !== "undefined" && gsap.ticker) {
      gsap.ticker.lagSmoothing(0);
    }
  }

  // 3. Initialize GSAP SplitText for buttons & headings
  if (typeof gsap !== "undefined" && typeof SplitText !== "undefined") {
    // Hero Text animation
    const heroTitles = document.querySelectorAll("[hero-text]");
    heroTitles.forEach((el) => {
      if (!el.querySelector(".gsap_split_letter")) {
        const split = new SplitText(el, { type: "words,chars", charsClass: "gsap_split_letter", wordsClass: "gsap_split_word" });
        gsap.fromTo(
          split.chars,
          { y: "100%", opacity: 0 },
          { y: "0%", opacity: 1, duration: 0.9, stagger: 0.02, ease: "power3.out", delay: 0.15 }
        );
      }
      el.style.visibility = "visible";
    });

    // Ensure all button text layers are fully visible and active
    document.querySelectorAll("[button-text]").forEach((el) => {
      el.style.visibility = "visible";
    });
  } else {
    // Fallback: make sure all text is immediately visible
    document.querySelectorAll("[button-text], [hero-text]").forEach((el) => {
      el.style.visibility = "visible";
    });
  }

  // 4. Smooth scrolling for anchor links with Lenis support
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId && targetId !== "#" && targetId.length > 1) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(targetElement, { offset: -90, duration: 1.2 });
          } else {
            targetElement.scrollIntoView({ behavior: "smooth" });
          }
          
          // Close mobile menu if open
          const navMenu = document.querySelector(".w-nav-menu");
          const menuBtn = document.querySelector(".w-nav-button");
          const overlay = document.querySelector(".w-nav-overlay");
          if (navMenu && (navMenu.classList.contains("w--open") || navMenu.style.display === "block")) {
            navMenu.classList.remove("w--open");
            navMenu.style.display = "";
            menuBtn && menuBtn.classList.remove("w--open");
            menuBtn && menuBtn.setAttribute("aria-expanded", "false");
            if (overlay) overlay.style.display = "none";
          }
        }
      }
    });
  });

  // 5. Cal.com appointment integration handler
  const calButtons = document.querySelectorAll("[data-cal-link]");
  calButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const calUrl = btn.getAttribute("data-cal-url");
      if (calUrl && calUrl !== "#" && calUrl.startsWith("http")) {
        window.open(calUrl, "_blank", "noopener,noreferrer");
        e.preventDefault();
      } else {
        const contactSec = document.querySelector("#contact");
        if (contactSec) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(contactSec, { offset: -90, duration: 1.2 });
          } else {
            contactSec.scrollIntoView({ behavior: "smooth" });
          }
        }
      }
    });
  });

  // 6. Mobile Menu Toggle Helper for reliable cross-browser opening/closing
  const menuButton = document.querySelector(".w-nav-button");
  const navMenu = document.querySelector(".w-nav-menu");
  const overlay = document.querySelector(".w-nav-overlay");

  if (menuButton && navMenu) {
    menuButton.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.contains("w--open") || navMenu.style.display === "block";
      if (isOpen) {
        navMenu.classList.remove("w--open");
        navMenu.style.display = "";
        menuButton.classList.remove("w--open");
        menuButton.setAttribute("aria-expanded", "false");
        if (overlay) overlay.style.display = "none";
      } else {
        navMenu.classList.add("w--open");
        navMenu.style.display = "block";
        menuButton.classList.add("w--open");
        menuButton.setAttribute("aria-expanded", "true");
        if (overlay) overlay.style.display = "block";
      }
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !menuButton.contains(e.target)) {
        if (navMenu.classList.contains("w--open") || navMenu.style.display === "block") {
          navMenu.classList.remove("w--open");
          navMenu.style.display = "";
          menuButton.classList.remove("w--open");
          menuButton.setAttribute("aria-expanded", "false");
          if (overlay) overlay.style.display = "none";
        }
      }
    });
  }

  // 7. Floating Navbar scroll shadow / glass enhancement
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 30) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }, { passive: true });
  }

  // 8. Organic Sticky Scroll Journey (Section Déroulement with Dynamic Organic SVG Path & Glow)
  const journeySection = document.querySelector("#deroulement");
  const organicPathActive = document.querySelector("#organicPathActive");
  const stepItems = document.querySelectorAll(".sticky-step-item");
  const stickyImages = document.querySelectorAll(".sticky-image");
  const visualDot = document.querySelector("#stickyVisualDot");
  const visualText = document.querySelector("#stickyVisualText");
  const visualGlow = document.querySelector("#stickyVisualGlow");

  const stepMeta = [
    { num: "01", name: "01 · Écouter", color: "#8192AC" },
    { num: "02", name: "02 · Explorer", color: "#A4ACA1" },
    { num: "03", name: "03 · Mobiliser", color: "#DFA38B" },
    { num: "04", name: "04 · Avancer", color: "#EBC284" }
  ];

  let pathTotalLength = 0;
  if (organicPathActive) {
    try {
      pathTotalLength = organicPathActive.getTotalLength();
      organicPathActive.style.strokeDasharray = `${pathTotalLength}`;
      organicPathActive.style.strokeDashoffset = `${pathTotalLength}`;
    } catch (e) {
      pathTotalLength = 2400;
    }
  }

  function setActiveStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= stepItems.length) return;

    // 1. Update Step cards active class
    stepItems.forEach((item, idx) => {
      if (idx === stepIndex) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // 2. Update Sticky Images with smooth crossfade
    stickyImages.forEach((img, idx) => {
      if (idx === stepIndex) {
        img.classList.add("active");
      } else {
        img.classList.remove("active");
      }
    });

    // 3. Update Badge text and dot color
    if (visualDot && visualText && stepMeta[stepIndex]) {
      visualText.textContent = stepMeta[stepIndex].name;
      visualDot.style.backgroundColor = stepMeta[stepIndex].color;
      visualDot.style.boxShadow = `0 0 12px ${stepMeta[stepIndex].color}`;
    }

    // 4. Update Ambient Glow backlight
    if (visualGlow && stepMeta[stepIndex]) {
      visualGlow.style.background = `radial-gradient(circle at 50% 50%, ${stepMeta[stepIndex].color}44, transparent 70%)`;
    }
  }

  if (journeySection && stepItems.length > 0) {
    const handleStickyScroll = () => {
      const windowHeight = window.innerHeight;
      const centerTrigger = windowHeight * 0.52;

      let currentActive = 0;
      stepItems.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        if (rect.top <= centerTrigger) {
          currentActive = index;
        }
      });

      setActiveStep(currentActive);

      // Animate Organic Curved SVG Path
      if (organicPathActive && pathTotalLength > 0) {
        const sectionRect = journeySection.getBoundingClientRect();
        const startTrigger = windowHeight * 0.8;
        const totalSpan = sectionRect.height;
        const currentProgress = (startTrigger - sectionRect.top) / totalSpan;
        const clampedProgress = Math.max(0.05, Math.min(1, currentProgress));
        const offset = pathTotalLength * (1 - clampedProgress);
        organicPathActive.style.strokeDashoffset = `${offset}`;
      }
    };

    window.addEventListener("scroll", handleStickyScroll, { passive: true });
    if (lenis) {
      lenis.on("scroll", handleStickyScroll);
    }
    handleStickyScroll(); // Initial activation

    // Click on step cards to smooth scroll
    stepItems.forEach((item, index) => {
      item.addEventListener("click", () => {
        setActiveStep(index);
        if (lenis) {
          lenis.scrollTo(item, { offset: -140, duration: 1.1 });
        } else {
          item.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    });
  }

  // 9. Initialize FAQ Accordion Interactions
  const faqItems = document.querySelectorAll(".faq-item");
  if (faqItems.length > 0) {
    faqItems.forEach((item) => {
      const trigger = item.querySelector(".faq-trigger");
      if (trigger) {
        trigger.addEventListener("click", () => {
          const isOpen = item.classList.contains("is-open");
          
          // Close other open items for exclusive clean accordion
          faqItems.forEach((other) => {
            if (other !== item && other.classList.contains("is-open")) {
              other.classList.remove("is-open");
              const otherTrigger = other.querySelector(".faq-trigger");
              if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
            }
          });

          if (isOpen) {
            item.classList.remove("is-open");
            trigger.setAttribute("aria-expanded", "false");
          } else {
            item.classList.add("is-open");
            trigger.setAttribute("aria-expanded", "true");
          }

          if (window.lenis && typeof window.lenis.resize === "function") {
            setTimeout(() => window.lenis.resize(), 400);
          }
        });
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAnne);
} else {
  initAnne();
}
