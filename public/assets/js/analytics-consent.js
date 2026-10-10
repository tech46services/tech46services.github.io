(() => {
  const googleTagId = "G-5RJZZRVC7C";
  const measurementId = "G-KLWSQMTCQ9";
  const consentStorageKey = "tech46_analytics_consent";
  const validConsentValues = new Set(["granted", "denied"]);
  const googleTagScriptId = "tech46-google-analytics";

  let currentConsent = readStoredConsent();
  let analyticsInitialized = false;
  let googleTagLoaded = false;
  let pageLoadObserved = false;
  let lastTrackedNavigation = "";
  let currentLocation = window.location.href;
  let previousLocation = "";
  let forceBannerOpen = false;
  let manageButton = null;

  function readStoredConsent() {
    try {
      const storedValue = window.localStorage.getItem(consentStorageKey);
      return validConsentValues.has(storedValue) ? storedValue : null;
    } catch {
      return null;
    }
  }

  function storeConsent(value) {
    currentConsent = value;

    try {
      window.localStorage.setItem(consentStorageKey, value);
    } catch {
      // Le choix reste appliqué à la page courante si le stockage local est indisponible.
    }
  }

  function getBanner() {
    return document.getElementById("cookie-consent");
  }

  function showBanner(shouldFocus = false) {
    const banner = getBanner();
    if (!banner) return;

    banner.hidden = false;
    if (shouldFocus) {
      banner.querySelector('[data-cookie-consent-action="accept"]')?.focus();
    }
  }

  function hideBanner() {
    const banner = getBanner();
    if (banner) banner.hidden = true;

    if (manageButton instanceof HTMLElement && document.contains(manageButton)) {
      manageButton.focus();
    }
    manageButton = null;
  }

  function syncBanner() {
    if (forceBannerOpen || currentConsent === null) {
      showBanner(false);
    } else {
      const banner = getBanner();
      if (banner) banner.hidden = true;
    }
  }

  function ensureGtagQueue() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
  }

  function getConsentState(analyticsStorage) {
    return {
      analytics_storage: analyticsStorage,
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    };
  }

  function getNavigationKey() {
    const historyIndex = window.history.state?.index;
    return `${historyIndex ?? "initial"}:${window.location.href}`;
  }

  function trackCurrentPage() {
    if (currentConsent !== "granted" || !analyticsInitialized || !googleTagLoaded) return;

    const navigationKey = getNavigationKey();
    if (navigationKey === lastTrackedNavigation) return;

    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_referrer: previousLocation || document.referrer,
    });
    lastTrackedNavigation = navigationKey;
  }

  function loadGoogleTag() {
    const existingScript = document.getElementById(googleTagScriptId);
    if (existingScript) return;

    const script = document.createElement("script");
    script.id = googleTagScriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${googleTagId}`;
    script.addEventListener("load", () => {
      googleTagLoaded = true;
      if (pageLoadObserved) trackCurrentPage();
    });
    document.head.appendChild(script);
  }

  function enableAnalytics() {
    if (currentConsent !== "granted") return;

    window[`ga-disable-${measurementId}`] = false;
    window[`ga-disable-${googleTagId}`] = false;
    ensureGtagQueue();

    if (!analyticsInitialized) {
      window.gtag("consent", "default", getConsentState("granted"));
      window.gtag("js", new Date());
      window.gtag("config", googleTagId, {
        send_page_view: false,
        allow_ad_personalization_signals: false,
        allow_google_signals: false,
      });
      analyticsInitialized = true;
      loadGoogleTag();
      return;
    }

    window.gtag("consent", "update", getConsentState("granted"));
    trackCurrentPage();
  }

  function deleteAnalyticsCookies() {
    const analyticsCookieNames = document.cookie
      .split(";")
      .map((cookie) => cookie.trim().split("=")[0])
      .filter((name) => name === "_ga" || name.startsWith("_ga_"));

    const hostname = window.location.hostname;
    const domains = new Set([hostname, `.${hostname}`]);
    const hostnameParts = hostname.split(".");
    if (hostnameParts.length > 2) {
      const registrableDomain = hostnameParts.slice(-2).join(".");
      domains.add(registrableDomain);
      domains.add(`.${registrableDomain}`);
    }

    analyticsCookieNames.forEach((name) => {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      domains.forEach((domain) => {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}; SameSite=Lax`;
      });
    });
  }

  function disableAnalytics() {
    window[`ga-disable-${measurementId}`] = true;
    window[`ga-disable-${googleTagId}`] = true;

    const googleWasLoaded =
      analyticsInitialized || document.getElementById(googleTagScriptId) !== null;

    analyticsInitialized = false;
    googleTagLoaded = false;
    lastTrackedNavigation = "";

    deleteAnalyticsCookies();

    // Le rechargement arrête toute activité de la balise déjà chargée.
    if (googleWasLoaded) window.location.reload();
  }

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element
      ? event.target.closest("[data-cookie-consent-action]")
      : null;
    if (!target) return;

    const action = target.getAttribute("data-cookie-consent-action");

    if (action === "manage") {
      manageButton = target;
      forceBannerOpen = true;
      showBanner(true);
      return;
    }

    if (action === "accept") {
      storeConsent("granted");
      forceBannerOpen = false;
      hideBanner();
      enableAnalytics();
      return;
    }

    if (action === "deny") {
      storeConsent("denied");
      forceBannerOpen = false;
      disableAnalytics();
      hideBanner();
    }
  });

  document.addEventListener("astro:page-load", () => {
    if (pageLoadObserved) previousLocation = currentLocation;
    currentLocation = window.location.href;
    pageLoadObserved = true;
    syncBanner();
    trackCurrentPage();
  });

  syncBanner();
  if (currentConsent === "granted") enableAnalytics();
})();
