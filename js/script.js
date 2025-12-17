// ---------------------------------------------------------------------
// 1. BASIC SCROLL RESTORATION + PAGE RESET (lightweight, mobile-safe)
// ---------------------------------------------------------------------
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

function resetPageState() {
  // Start from top on first load
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  // Reset footer visibility
  const footer = document.querySelector(".main-footer");
  if (footer) {
    footer.classList.remove("footer-visible");
  }

  // Reset progress bar
  const progressBar = document.querySelector(".page-progress .bar");
  const progressPct = document.querySelector(".page-progress .pct");
  if (progressBar) progressBar.style.width = "0%";
  if (progressPct) progressPct.textContent = "0%";
}

// Run once early + on load to ensure consistent starting state
resetPageState();
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", resetPageState, { once: true });
}
window.addEventListener("load", resetPageState, { once: true });

// ---------------------------------------------------------------------
// 2. MAIN STAGE / SCROLL LOGIC
// ---------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  // ---- STAGE CONFIG -------------------------------------------------
  const stageConfigs = [
    {
      type: "hero",
      bg: 'url("images/BG.png")',
    },
    {
      type: "icon",
      iconIndex: 0,
      bg: 'url("images/index0.png")',
      title: "Registration",
      text: "Secure your business identity with effortless registration support.",
      cta: "Start Registration",
      iconClass: "fa-handshake",
      ctaIndex: 0,
    },
    {
      type: "icon",
      iconIndex: 1,
      bg: 'url("images/index1.png")',
      title: "Legal Registration",
      text: "Stay compliant with expert-backed legal filings and approvals.",
      cta: "Begin Legal Setup",
      iconClass: "fa-file-lines",
      ctaIndex: 1,
    },
    {
      type: "icon",
      iconIndex: 2,
      bg: 'url("images/index2.png")',
      title: "Online Presence",
      text: "Launch your digital footprint with branded sites and assets.",
      cta: "Build Presence",
      iconClass: "fa-laptop-code",
      ctaIndex: 2,
    },
    {
      type: "icon",
      iconIndex: 3,
      bg: 'url("images/index3.png")',
      title: "Business Operations",
      text: "Optimize daily operations with streamlined processes and tools.",
      cta: "Improve Operations",
      iconClass: "fa-chart-line",
      ctaIndex: 3,
    },
    {
      type: "icon",
      iconIndex: 4,
      bg: 'url("images/index4.png")',
      title: "Compliances",
      text: "Keep your organisation audit-ready with proactive compliance care.",
      cta: "Stay Compliant",
      iconClass: "fa-clipboard-check",
      ctaIndex: 4,
    },
    {
      type: "footer",
      bg: 'url("images/index4.png")',
    },
  ];

  const TOTAL_STAGES = stageConfigs.length;

  // ---- DOM REFERENCES -----------------------------------------------
  const icons = Array.from(
    document.querySelectorAll(".icons-section .icon-item")
  );
  if (!icons.length) return;

  const panels = Array.from(
    document.querySelectorAll(".icon-scroll-panel")
  );

  const heroWrapper = document.querySelector(".hero-wrapper");
  const stageOverlay = document.querySelector(".stage-overlay");
  const stageIcon = stageOverlay ? stageOverlay.querySelector(".stage-icon") : null;
  const stageTitle = stageOverlay ? stageOverlay.querySelector(".stage-title") : null;
  const stageText = stageOverlay ? stageOverlay.querySelector(".stage-text") : null;
  const stageCta = stageOverlay ? stageOverlay.querySelector(".stage-cta") : null;

  const footer = document.querySelector(".main-footer");

  const pageMap = [
    "Pages/Registration.html",
    "Pages/LegalRegistration.html",
    "Pages/OnlinePresence.html",
    "Pages/BusinessOperations.html",
    "Pages/Compliances.html",
  ];
  const fallbackPageMap = pageMap.map((p) => p.replace(/^Pages\//, "pages/"));

  function navigateToStagePage(iconIdx) {
    const targetPath = pageMap[iconIdx] || fallbackPageMap[iconIdx];
    if (!targetPath) return;

    // Small delay to let the UI feel responsive before navigation
    setTimeout(() => {
      window.location.href = targetPath;
    }, 500);
  }

  // ---- BACKGROUND LAYERS --------------------------------------------
  const bgLayer = document.createElement("div");
  bgLayer.className = "page-bg-layer";
  bgLayer.style.transform = "translateZ(0)";
  bgLayer.style.webkitTransform = "translateZ(0)";
  bgLayer.style.willChange = "opacity";
  document.body.appendChild(bgLayer);

  const bgLayer2 = document.createElement("div");
  bgLayer2.className = "page-bg-layer page-bg-layer-2";
  bgLayer2.style.transform = "translateZ(0)";
  bgLayer2.style.webkitTransform = "translateZ(0)";
  bgLayer2.style.willChange = "opacity";
  document.body.appendChild(bgLayer2);

  let currentBgLayer = bgLayer;
  let nextBgLayer = bgLayer2;
  let isTransitioningBg = false;
  let isFirstRender = true;

  // ---- PROGRESS BAR -------------------------------------------------
  const progressWrap = document.createElement("div");
  progressWrap.className = "page-progress";
  progressWrap.setAttribute("aria-hidden", "true");
  const progressBar = document.createElement("div");
  progressBar.className = "bar";
  const pct = document.createElement("div");
  pct.className = "pct";
  pct.textContent = "0%";
  progressWrap.appendChild(progressBar);
  progressWrap.appendChild(pct);
  document.body.appendChild(progressWrap);

  // Smooth width movement
  progressBar.style.transition = "width 0.6s ease";

  // ---- STAGE STATE --------------------------------------------------
  let currentStage = 0;
  let previousStage = 0;
  let isAnimatingScroll = false;
  const SCROLL_LOCK_TIME = 900;

  // ---- ANIMATION HELPERS --------------------------------------------
  function playStageRevealAnimation() {
    if (!stageIcon || !stageCta) return;
    stageIcon.classList.add("no-transition");
    stageCta.classList.add("no-transition");
    stageIcon.classList.remove("revealed");
    stageCta.classList.remove("revealed");
    void stageIcon.offsetWidth;
    stageIcon.classList.remove("no-transition");
    stageCta.classList.remove("no-transition");
    requestAnimationFrame(() => {
      stageIcon.classList.add("revealed");
      stageCta.classList.add("revealed");
    });
  }

  function playHeroRevealAnimation() {
    const heroTagline = document.querySelector(".hero-tagline");
    const watchBtn = document.querySelector(".watch-btn");
    if (!heroTagline || !watchBtn) return;

    heroTagline.classList.add("no-transition");
    watchBtn.classList.add("no-transition");
    heroTagline.classList.remove("hero-revealed");
    watchBtn.classList.remove("hero-revealed");
    void heroTagline.offsetWidth;
    void watchBtn.offsetWidth;

    heroTagline.classList.remove("no-transition");
    watchBtn.classList.remove("no-transition");
    requestAnimationFrame(() => {
      heroTagline.classList.add("hero-revealed");
      watchBtn.classList.add("hero-revealed");
    });
  }

  function setBackgroundImmediate(newBg) {
    const newBgValue = newBg || "transparent";
    currentBgLayer.style.backgroundImage = newBgValue;
    if (newBgValue !== "transparent") {
      currentBgLayer.style.opacity = "1";
      currentBgLayer.classList.add("visible");
    } else {
      currentBgLayer.style.opacity = "0";
      currentBgLayer.classList.remove("visible");
    }
  }

  function setBackgroundWithFade(newBg) {
    if (isTransitioningBg) return;

    const newBgValue = newBg || "transparent";
    const currentBgValue = currentBgLayer.style.backgroundImage;

    if (
      newBgValue === currentBgValue &&
      currentBgLayer.classList.contains("visible")
    ) {
      return;
    }

    if (
      !currentBgLayer.style.backgroundImage ||
      currentBgLayer.style.backgroundImage === "none" ||
      !currentBgLayer.classList.contains("visible")
    ) {
      setBackgroundImmediate(newBgValue);
      return;
    }

    isTransitioningBg = true;

    nextBgLayer.style.backgroundImage = newBgValue;
    nextBgLayer.style.opacity = "0";
    nextBgLayer.classList.add("visible");

    void nextBgLayer.offsetWidth;

    currentBgLayer.style.opacity = "0";
    nextBgLayer.style.transition =
      "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
    nextBgLayer.style.opacity = "1";

    setTimeout(() => {
      currentBgLayer.classList.remove("visible");
      currentBgLayer.style.opacity = "0";
      currentBgLayer.style.backgroundImage = "";

      const temp = currentBgLayer;
      currentBgLayer = nextBgLayer;
      nextBgLayer = temp;

      isTransitioningBg = false;
    }, 800);
  }

  // Progress is stage-based (0..TOTAL_STAGES-1)
  function updateProgressForStage(stageIndex) {
    if (TOTAL_STAGES <= 0) {
      progressBar.style.width = "0%";
      pct.textContent = "0%";
      return;
    }
    const clampedIndex = Math.max(0, Math.min(stageIndex, TOTAL_STAGES - 1));
    const percent = Math.round(((clampedIndex + 1) / TOTAL_STAGES) * 100);
    progressBar.style.width = percent + "%";
    pct.textContent = percent + "%";
  }

  // ---- RENDER STAGE -------------------------------------------------
  function renderStage(index) {
    const stage = stageConfigs[index];

    icons.forEach((icon, idx) => {
      icon.classList.toggle(
        "focused",
        stage && stage.type === "icon" && stage.iconIndex === idx
      );
    });

    if (!stage) {
      setBackgroundWithFade("transparent");
      setTimeout(() => {
        currentBgLayer.classList.remove("visible");
        nextBgLayer.classList.remove("visible");
      }, 800);
      if (stageOverlay) stageOverlay.classList.remove("active");
      if (heroWrapper) heroWrapper.classList.remove("stage-muted");
      if (footer) footer.classList.remove("footer-visible");
      if (previousStage > 0) {
        setTimeout(() => {
          playHeroRevealAnimation();
        }, 50);
      }
      return;
    }

    if (isFirstRender) {
      setBackgroundImmediate(stage.bg || "transparent");
      isFirstRender = false;
    } else {
      setBackgroundWithFade(stage.bg || "transparent");
    }

    if (stage.type === "icon" && stageOverlay && stageIcon && stageTitle && stageText && stageCta) {
      heroWrapper && heroWrapper.classList.add("stage-muted");

      // Set Font Awesome icon class
      stageIcon.className = "fas stage-icon " + (stage.iconClass || "");
      stageTitle.textContent = stage.title || "";
      stageText.textContent = stage.text || "";
      stageCta.textContent = stage.cta || "Learn more";

      // store which page to go to
      stageCta.setAttribute("data-icon-index", String(stage.ctaIndex));

      playStageRevealAnimation();
      stageOverlay.classList.add("active");
      if (footer) footer.classList.remove("footer-visible");
    } else if (stage.type === "footer") {
      if (stageOverlay) stageOverlay.classList.remove("active");
      if (heroWrapper) heroWrapper.classList.remove("stage-muted");
      if (stageIcon) stageIcon.classList.remove("revealed");
      if (stageCta) stageCta.classList.remove("revealed");
      if (footer) {
        footer.classList.add("footer-visible");
        // Enable scrolling within footer on mobile
        footer.style.touchAction = "pan-y";
        footer.style.overflowY = "auto";
      }
    } else {
      heroWrapper && heroWrapper.classList.remove("stage-muted");
      if (stageIcon) stageIcon.classList.remove("revealed");
      if (stageCta) stageCta.classList.remove("revealed");
      if (stageOverlay) stageOverlay.classList.remove("active");
      if (footer) footer.classList.remove("footer-visible");
    }

    updateProgressForStage(index);
  }

  // ---- GO TO STAGE --------------------------------------------------
  function goToStage(targetStage, options = {}) {
    const { animateScroll = true, fromUserScroll = false } = options;

    if (targetStage < 0 || targetStage >= TOTAL_STAGES) return;
    if (targetStage === currentStage) return;
    if (fromUserScroll && isAnimatingScroll) return;

    previousStage = currentStage;
    currentStage = targetStage;
    renderStage(currentStage);

    const stage = stageConfigs[currentStage];

    if (stage.type === "footer") {
      isAnimatingScroll = true;
      // Enable scrolling inside footer on mobile
      document.body.style.overflow = "auto";
      document.body.style.touchAction = "pan-y";
      document.documentElement.style.overflow = "auto";
      setTimeout(() => {
        isAnimatingScroll = false;
      }, SCROLL_LOCK_TIME);
      return;
    }

    if (currentStage === 0) {
      // Hero stage -> scroll to top
      isAnimatingScroll = true;
      if (animateScroll) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.scrollTo(0, 0);
      }
      setTimeout(() => {
        isAnimatingScroll = false;
      }, animateScroll ? SCROLL_LOCK_TIME : 0);
    } else {
      // Icon stages -> scroll to corresponding panel
      const targetPanel = panels.find(
        (panel) =>
          parseInt(panel.getAttribute("data-stage-index"), 10) === currentStage
      );

      if (targetPanel) {
        isAnimatingScroll = true;
        targetPanel.scrollIntoView({
          behavior: animateScroll ? "smooth" : "auto",
          block: "start",
        });
        setTimeout(() => {
          isAnimatingScroll = false;
        }, animateScroll ? SCROLL_LOCK_TIME : 0);
      } else {
        isAnimatingScroll = true;
        setTimeout(() => {
          isAnimatingScroll = false;
        }, SCROLL_LOCK_TIME);
      }
    }
  }

  // ---- RESET TO STAGE 0 --------------------------------------------
  function resetToIndexZero() {
    currentStage = 0;
    previousStage = 0;
    isAnimatingScroll = false;

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (footer) {
      footer.classList.remove("footer-visible");
    }

    bgLayer.classList.remove("visible");
    bgLayer.style.backgroundImage = "";
    bgLayer.style.opacity = "0";
    bgLayer2.classList.remove("visible");
    bgLayer2.style.backgroundImage = "";
    bgLayer2.style.opacity = "0";
    isTransitioningBg = false;
    currentBgLayer = bgLayer;
    nextBgLayer = bgLayer2;

    isFirstRender = true;

    icons.forEach((icon) => {
      icon.classList.remove("focused");
    });

    if (stageOverlay) stageOverlay.classList.remove("active");
    if (heroWrapper) heroWrapper.classList.remove("stage-muted");

    renderStage(0);
  }

  // Initial render
  resetToIndexZero();

  // Keep hero as entry when returning from background
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      setTimeout(() => {
        resetToIndexZero();
      }, 50);
    }
  });

  window.addEventListener("focus", function () {
    setTimeout(function () {
      if (window.scrollY === 0) {
        resetToIndexZero();
      }
    }, 10);
  });

  // ---- DESKTOP WHEEL SNAP SCROLL -----------------------------------
  function handleWheel(e) {
    e.preventDefault();
    if (isAnimatingScroll) return;

    const delta = e.deltaY;
    if (Math.abs(delta) < 10) return;

    if (delta > 0) {
      const nextStage = Math.min(TOTAL_STAGES - 1, currentStage + 1);
      goToStage(nextStage, { animateScroll: true, fromUserScroll: true });
    } else {
      const prevStage = Math.max(0, currentStage - 1);
      goToStage(prevStage, { animateScroll: true, fromUserScroll: true });
    }
  }

  window.addEventListener("wheel", handleWheel, { passive: false });

  // ---- MOBILE TOUCH SWIPE (kept, but not blocking normal scroll) ---
  let touchStartY = 0;
  let touchEndY = 0;
  let touchStartTime = 0;
  let touchStartX = 0;
  let touchEndX = 0;
  let isTouchActive = false;

  const MIN_SWIPE_DISTANCE = 60;
  const MAX_SWIPE_TIME = 600;
  const MAX_HORIZONTAL_SWIPE = 50;

  const isMobileDevice = (function () {
    try {
      return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      );
    } catch (e) {
      return false;
    }
  })();

  function handleTouchStart(e) {
    const sidebar = document.querySelector(".inceptionhub-sidebar");
    if (sidebar && sidebar.classList.contains("open")) return;

    const target = e.target;
    if (
      target &&
      (target.closest(".icon-item") ||
        target.closest(".stage-cta") ||
        target.closest(".watch-btn") ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest(".inceptionhub-sidebar") ||
        target.closest(".page-progress") ||
        target.closest(".main-footer"))
    ) {
      return;
    }

    if (e.touches && e.touches.length > 0) {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      touchStartTime = Date.now();
      isTouchActive = true;
    }
  }

  function handleTouchEnd(e) {
    if (!isTouchActive) return;
    isTouchActive = false;

    const sidebar = document.querySelector(".inceptionhub-sidebar");
    if (sidebar && sidebar.classList.contains("open")) return;

    const target = e.target;
    if (
      target &&
      (target.closest(".icon-item") ||
        target.closest(".stage-cta") ||
        target.closest(".watch-btn") ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest(".inceptionhub-sidebar"))
    ) {
      return;
    }

    if (isAnimatingScroll) return;

    if (e.changedTouches && e.changedTouches.length > 0) {
      touchEndY = e.changedTouches[0].clientY;
      touchEndX = e.changedTouches[0].clientX;
      const touchEndTime = Date.now();
      const swipeDistanceY = touchStartY - touchEndY;
      const swipeDistanceX = Math.abs(touchStartX - touchEndX);
      const swipeTime = touchEndTime - touchStartTime;

      if (
        Math.abs(swipeDistanceY) >= MIN_SWIPE_DISTANCE &&
        swipeTime <= MAX_SWIPE_TIME &&
        swipeDistanceX < MAX_HORIZONTAL_SWIPE
      ) {
        e.preventDefault();
        e.stopPropagation();

        if (swipeDistanceY > 0) {
          const nextStage = Math.min(TOTAL_STAGES - 1, currentStage + 1);
          if (nextStage !== currentStage) {
            goToStage(nextStage, { animateScroll: true, fromUserScroll: true });
          }
        } else {
          const prevStage = Math.max(0, currentStage - 1);
          if (prevStage !== currentStage) {
            goToStage(prevStage, { animateScroll: true, fromUserScroll: true });
          }
        }
      }
    }
  }

  if (isMobileDevice) {
    // We do NOT use handleMobileScroll anymore – that was fighting native scroll.
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });
  }

  // ---- KEYBOARD NAVIGATION -----------------------------------------
  document.addEventListener("keydown", (e) => {
    if (isAnimatingScroll) return;

    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      const nextStage = Math.min(TOTAL_STAGES - 1, currentStage + 1);
      goToStage(nextStage, { animateScroll: true, fromUserScroll: true });
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      const prevStage = Math.max(0, currentStage - 1);
      goToStage(prevStage, { animateScroll: true, fromUserScroll: true });
    }
  });

  // ---- ICON CLICK (stage + navigate) -------------------------------
  icons.forEach((icon, idx) => {
    icon.addEventListener("click", (e) => {
      const sidebar = document.querySelector(".inceptionhub-sidebar");
      if (sidebar && sidebar.classList.contains("open")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      const stageIndex = idx + 1; // 1..5
      goToStage(stageIndex, { animateScroll: true });

      // Also jump to page
      navigateToStagePage(idx);
      return false;
    });
  });

  // ---- CTA BUTTON CLICK (uses data-icon-index) ---------------------
  if (stageCta) {
    stageCta.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const iconIdxAttr = stageCta.getAttribute("data-icon-index");
      if (iconIdxAttr == null) return;

      const iconIdx = parseInt(iconIdxAttr, 10);
      if (isNaN(iconIdx) || iconIdx < 0 || iconIdx >= pageMap.length) return;

      navigateToStagePage(iconIdx);
      return false;
    });
  }
});

// ---------------------------------------------------------------------
// 3. MENU / SIDEBAR INJECTOR (unchanged behaviour)
// ---------------------------------------------------------------------
(function () {
  "use strict";

  const menuButton = document.querySelector(".logo.logo-pill .logo-menu");
  if (!menuButton) return;

  if (menuButton.__inceptionhub_menu_installed) return;
  menuButton.__inceptionhub_menu_installed = true;

  let overlay = document.querySelector(".inceptionhub-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "inceptionhub-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.tabIndex = -1;
    document.body.appendChild(overlay);
  }

  let sidebar = document.querySelector(".inceptionhub-sidebar");
  if (!sidebar) {
    sidebar = document.createElement("aside");
    sidebar.className = "inceptionhub-sidebar";
    sidebar.setAttribute("role", "dialog");
    sidebar.setAttribute("aria-modal", "true");
    sidebar.setAttribute("aria-label", "Main menu");

    const logoImg = document.querySelector(".logo.logo-pill .logo-img");
    const logoSrc = logoImg ? logoImg.src : "images/logo.png";

    const inPagesDirectory = /\/Pages\//i.test(window.location.pathname);
    const homePath = inPagesDirectory ? "../index.html" : "index.html";
    const pagePrefix = inPagesDirectory ? "" : "Pages/";
    const navItems = [
      { label: "Home", path: homePath },
      { label: "Registration", path: `${pagePrefix}Registration.html` },
      { label: "Legal Registration", path: `${pagePrefix}LegalRegistration.html` },
      { label: "Online Presence", path: `${pagePrefix}OnlinePresence.html` },
      {
        label: "Business Operations",
        path: `${pagePrefix}BusinessOperations.html`,
      },
      { label: "Compliances", path: `${pagePrefix}Compliances.html` },
    ];
    const navLinks = navItems
      .map(
        (item) => `<a href="${item.path}" class="menu-link">${item.label}</a>`
      )
      .join("");

    sidebar.innerHTML = `
      <div class="menu-header-wrapper">
        <img src="${logoSrc}" alt="InceptionHub" class="logo-img">
        <span class="logo-divider" aria-hidden="true"></span>
        <button class="menu-close-btn" aria-label="Close menu"></button>
      </div>

      <nav role="navigation" aria-label="Primary">
        ${navLinks}
      </nav>

      <div class="menu-footer">Need help? <a href="${homePath}#contact">Contact us</a></div>
    `;
    document.body.appendChild(sidebar);
  }

  const closeBtn = sidebar.querySelector(".menu-close-btn");

  function getFocusable(el) {
    if (!el) return [];
    return Array.from(
      el.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((n) => n.offsetParent !== null);
  }

  menuButton.setAttribute(
    "aria-expanded",
    menuButton.classList.contains("open") ? "true" : "false"
  );
  menuButton.setAttribute("aria-controls", "inceptionhub-sidebar");
  if (!sidebar.id) sidebar.id = "inceptionhub-sidebar";

  function openMenu() {
    overlay.classList.add("open");
    sidebar.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    menuButton.classList.add("open");
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Close menu");

    const sidebarCloseBtn = sidebar.querySelector(".menu-close-btn");
    if (sidebarCloseBtn) {
      sidebarCloseBtn.classList.add("open");
    }

    menuButton.__inceptionhub_last_focus = document.activeElement;

    adjustSidebarTop();

    const focusables = getFocusable(sidebar);
    if (focusables.length) focusables[0].focus();

    document.documentElement.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  }

  function closeMenu() {
    overlay.classList.remove("open");
    sidebar.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    menuButton.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");

    const sidebarCloseBtn = sidebar.querySelector(".menu-close-btn");
    if (sidebarCloseBtn) {
      sidebarCloseBtn.classList.remove("open");
    }

    try {
      const prev = menuButton.__inceptionhub_last_focus;
      if (prev && typeof prev.focus === "function") prev.focus();
    } catch (e) { }

    document.documentElement.style.overflow = "";
    document.body.style.touchAction = "";
  }

  function toggleMenu() {
    if (sidebar.classList.contains("open")) closeMenu();
    else openMenu();
  }

  menuButton.addEventListener("click", (ev) => {
    ev.preventDefault();
    toggleMenu();
  });

  menuButton.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      menuButton.click();
    }
  });

  overlay.addEventListener("click", () => closeMenu());

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeMenu();
    });

    closeBtn.addEventListener("click", () => {
      const hamburger = closeBtn.querySelector(".logo-hamburger");
      if (hamburger) {
        closeBtn.classList.toggle("open");
      }
    });
  }

  function adjustSidebarTop() {
    sidebar.style.top = "0";
    sidebar.style.left = "0";
    sidebar.style.height = "100vh";
  }

  adjustSidebarTop();
  window.addEventListener("resize", adjustSidebarTop);

  if (menuButton.classList.contains("open")) {
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Close menu");
    overlay.classList.add("open");
    sidebar.classList.add("open");
  } else {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
    overlay.classList.remove("open");
    sidebar.classList.remove("open");
  }

  window.__inceptionhubMenu = {
    open: openMenu,
    close: closeMenu,
    toggle: toggleMenu,
    adjustTop: adjustSidebarTop,
  };
})();

// ---------------------------------------------------------------------
// 4. LOGO PILL INTRO ANIMATION
// ---------------------------------------------------------------------
(function () {
  if (document.getElementById("splash-overlay")) return;

  const logo = document.querySelector(".logo.logo-pill");
  if (!logo) return;

  const HIDE_DURATION_MS = 300;
  const START_HIDE_AFTER_PAINT_MS = 30;

  logo.classList.remove("logo-hidden", "logo-reveal", "no-transition");
  void logo.offsetWidth;

  setTimeout(() => {
    logo.classList.add("no-transition");
    logo.classList.add("logo-hidden");
    void logo.offsetWidth;

    setTimeout(() => {
      logo.classList.remove("no-transition");
      logo.classList.remove("logo-hidden");
      void logo.offsetWidth;
      logo.classList.add("logo-reveal");
    }, HIDE_DURATION_MS);
  }, START_HIDE_AFTER_PAINT_MS);
})();

// ---------------------------------------------------------------------
// 5. FINAL MOBILE SCROLL SAFETY (ensures html/body can scroll)
// ---------------------------------------------------------------------
(function () {
  "use strict";

  const isMobile =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    if (document.body) {
      document.body.style.overflowY = "auto";
      document.body.style.touchAction = "pan-y";
    }

    if (document.documentElement) {
      document.documentElement.style.overflowY = "auto";
    }

    // Ensure stage panels are tall enough to scroll between
    const scrollPanels = document.querySelectorAll(".icon-scroll-panel");
    scrollPanels.forEach((panel) => {
      panel.style.minHeight = "120vh";
      panel.style.display = "block";
    });
  }
})();
