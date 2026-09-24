function initOverlays() {
  const btnGuide = document.getElementById("btnGuide");
  const guideView = document.getElementById("guideView");
  const guideClose = document.getElementById("guideClose");
  const guideHeading = document.getElementById("guideHeading");
  const guideText = document.getElementById("guideText");

  const btnNews = document.getElementById("btnNews");
  const newsLatestBadge = document.getElementById("newsLatestBadge");
  const newsView = document.getElementById("newsView");
  const newsClose = document.getElementById("newsClose");
  const newsHeading = document.getElementById("newsHeading");
  const newsText = document.getElementById("newsText");

  const usageLink = document.getElementById("openaiUsageLink");
  const walletLink = document.getElementById("openaiWalletLink");
  const billingView = document.getElementById("billingLinksView");
  const billingBody = document.getElementById("billingLinksBody");
  const billingHeading = document.getElementById("billingLinksHeading");
  const billingClose = document.getElementById("billingLinksClose");

  const calcSelect = document.getElementById("medicalCalcSelect");
  const calcOpenBtn = document.getElementById("medicalCalcOpenBtn");

  const copyBtn = document.getElementById("copyNoteButton");
  const noteEl = document.getElementById("generatedNote");

  let newsLoadedLang = null;
  let newsBadgeLoadedLang = null;

  function getCurrentLang() {
    const langSelect = document.getElementById("lang-select-transcribe");
    return (langSelect && langSelect.value) || localStorage.getItem("siteLanguage") || "en";
  }

  function closeGuide() {
    if (!guideView) return;
    guideView.classList.remove("active");
    guideView.setAttribute("aria-hidden", "true");
  }

  function openGuide() {
    if (!guideView) return;
    guideView.classList.add("active");
    guideView.setAttribute("aria-hidden", "false");

    if (guideHeading && window.transcribeTranslations) {
      const lang = getCurrentLang();
      const bundle = window.transcribeTranslations[lang] || window.transcribeTranslations.en;
      if (bundle?.guideHeading) guideHeading.innerHTML = bundle.guideHeading;
      if (guideText && bundle?.guideText) guideText.innerHTML = bundle.guideText;
    }
  }

  function getNewsCandidates(lang) {
    return (lang === "no")
      ? ["./Nyheter_NO.md", "./Nyheter_EN.md"]
      : ["./Nyheter_EN.md"];
  }

  function extractLatestNewsDate(markdown) {
    if (!markdown) return null;
    const match = markdown.match(/^\s*##\s+(.+?)\s*$/m);
    return match ? match[1].trim() : null;
  }

  async function loadNewsBadgeForCurrentLanguage(force = false) {
    if (!newsLatestBadge) return;

    const lang = getCurrentLang();
    if (!force && newsBadgeLoadedLang === lang) return;

    newsLatestBadge.textContent = (lang === "no") ? "Siste: …" : "Latest: …";
    newsLatestBadge.title =
      (lang === "no")
        ? "Viser datoen for den nyeste status-/oppdateringsmeldingen"
        : "Shows the date of the newest status/update entry";

    try {
      let latestDate = null;

      for (const url of getNewsCandidates(lang)) {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) continue;
        const markdown = await response.text();
        latestDate = extractLatestNewsDate(markdown);
        if (latestDate) break;
      }

      if (!latestDate) throw new Error("Could not extract latest news date.");

      newsLatestBadge.textContent =
        (lang === "no") ? `Siste: ${latestDate}` : `Latest: ${latestDate}`;
      newsBadgeLoadedLang = lang;
    } catch (error) {
      console.error("Failed to load latest news date:", error);
      newsLatestBadge.textContent = (lang === "no") ? "Siste: –" : "Latest: –";
      newsBadgeLoadedLang = null;
    }
  }

  async function loadNewsForCurrentLanguage(force = false) {
    if (!newsText) return;

    const lang = getCurrentLang();
    if (!force && newsLoadedLang === lang) return;

    if (newsHeading) {
      newsHeading.textContent = (lang === "no") ? "Status/Oppdateringer" : "Status & Updates";
    }
    newsText.textContent = "Loading…";

    try {
      let loaded = false;

      for (const url of getNewsCandidates(lang)) {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) continue;

        const markdown = await response.text();
        const html = (window.marked && typeof window.marked.parse === "function")
          ? window.marked.parse(markdown)
          : markdown;
        const safeHtml = (window.DOMPurify && typeof window.DOMPurify.sanitize === "function")
          ? window.DOMPurify.sanitize(html, { ADD_ATTR: ["target", "rel"] })
          : html;

        newsText.innerHTML = safeHtml;

        newsText.querySelectorAll('a[target="_blank"]').forEach((anchor) => {
          const rel = (anchor.getAttribute("rel") || "").split(/\s+/).filter(Boolean);
          if (!rel.includes("noopener")) rel.push("noopener");
          if (!rel.includes("noreferrer")) rel.push("noreferrer");
          anchor.setAttribute("rel", rel.join(" "));
        });

        loaded = true;
        break;
      }

      if (!loaded) throw new Error("No news file could be loaded.");
      newsLoadedLang = lang;
    } catch (error) {
      console.error("Failed to load news text:", error);
      newsText.textContent =
        "Could not load the news text.\n\n" +
        "If you are the site owner: make sure Nyheter_EN.md exists next to transcribe.html (and optionally Nyheter_NO.md).";
      newsLoadedLang = null;
    }
  }

  function openNews() {
    if (!newsView) return;
    newsView.classList.add("active");
    newsView.setAttribute("aria-hidden", "false");
    loadNewsForCurrentLanguage(true);
  }

  function closeNews() {
    if (!newsView) return;
    newsView.classList.remove("active");
    newsView.setAttribute("aria-hidden", "true");
  }

  function syncCalcOpenState() {
    if (!calcSelect || !calcOpenBtn) return;
    calcOpenBtn.disabled = !calcSelect.value;
  }

  const providerLinks = [
    {
      name: "OpenAI",
      usage: "https://platform.openai.com/usage",
      billing: "https://platform.openai.com/settings/organization/billing/overview",
    },
    {
      name: "AWS Bedrock",
      usage: "https://console.aws.amazon.com/costmanagement/home?region=us-east-1#/home",
      billing: "https://console.aws.amazon.com/costmanagement/home?region=us-east-1#/home",
    },
    {
      name: "Mistral",
      usage: "https://admin.mistral.ai/organization/usage",
      billing: "https://admin.mistral.ai/organization/billing",
    },
    {
      name: "Soniox",
      usage: "https://console.soniox.com/",
      billing: "https://console.soniox.com/",
    },
  ];

  function renderProviderLinksTable() {
    if (!billingBody) return;

    const usageHeader = (usageLink && usageLink.textContent || "Usage").trim();
    const billingHeader = (walletLink && walletLink.textContent || "Billing").trim();

    if (billingHeading) {
      billingHeading.textContent = `${usageHeader} / ${billingHeader}`;
    }

    const rows = providerLinks.map((provider) => {
      const usageCell = provider.usage
        ? `<a href="${provider.usage}" target="_blank" rel="noopener noreferrer">Open</a>`
        : "—";
      const billingCell = provider.billing
        ? `<a href="${provider.billing}" target="_blank" rel="noopener noreferrer">Open</a>`
        : "—";

      return `<tr><td>${provider.name}</td><td>${usageCell}</td><td>${billingCell}</td></tr>`;
    }).join("");

    billingBody.innerHTML = `
      <table id="billingLinksTable">
        <thead>
          <tr>
            <th style="width: 34%;">Provider</th>
            <th style="width: 33%;">${usageHeader}</th>
            <th style="width: 33%;">${billingHeader}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function openBillingLinksOverlay() {
    if (!billingView) return;
    renderProviderLinksTable();
    billingView.classList.add("active");
    billingView.setAttribute("aria-hidden", "false");
  }

  function closeBillingLinksOverlay() {
    if (!billingView) return;
    billingView.classList.remove("active");
    billingView.setAttribute("aria-hidden", "true");
  }

  if (guideClose) {
    guideClose.addEventListener("click", closeGuide);
  }

  if (btnGuide && guideView) {
    btnGuide.addEventListener("click", () => {
      closeNews();
      if (guideView.classList.contains("active")) closeGuide();
      else openGuide();
    });
  }

  if (newsClose) {
    newsClose.addEventListener("click", closeNews);
  }

  if (btnNews && newsView) {
    btnNews.addEventListener("click", () => {
      closeGuide();
      if (newsView.classList.contains("active")) closeNews();
      else openNews();
    });
  }

  const langSelectTranscribe = document.getElementById("lang-select-transcribe");
  langSelectTranscribe?.addEventListener("change", () => {
    newsLoadedLang = null;
    newsBadgeLoadedLang = null;
    loadNewsBadgeForCurrentLanguage(true);

    if (guideView?.classList.contains("active")) {
      openGuide();
    }
    if (newsView?.classList.contains("active")) {
      loadNewsForCurrentLanguage(true);
    }
  });

  loadNewsBadgeForCurrentLanguage(true);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && newsView?.classList.contains("active")) {
      closeNews();
    }
  });

  if (calcSelect && calcOpenBtn) {
    syncCalcOpenState();
    calcSelect.addEventListener("change", syncCalcOpenState);
    calcOpenBtn.addEventListener("click", () => {
      const href = calcSelect.value;
      if (!href) return;

      const url = new URL(href, window.location.href).toString();
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  if (usageLink) {
    usageLink.addEventListener("click", (event) => {
      event.preventDefault();
      openBillingLinksOverlay();
    });
  }

  if (walletLink) {
    walletLink.addEventListener("click", (event) => {
      event.preventDefault();
      openBillingLinksOverlay();
    });
  }

  if (billingClose) {
    billingClose.addEventListener("click", closeBillingLinksOverlay);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && billingView?.classList.contains("active")) {
      closeBillingLinksOverlay();
    }
  });

  if (copyBtn && noteEl) {
    const originalLabel = copyBtn.textContent;

    copyBtn.addEventListener("click", async () => {
      const text = (noteEl.value || "").trim();
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "Copied";
        setTimeout(() => {
          copyBtn.textContent = originalLabel;
        }, 1200);
      } catch (error) {
        try {
          noteEl.focus();
          noteEl.select();
          document.execCommand("copy");
          copyBtn.textContent = "Copied";
          setTimeout(() => {
            copyBtn.textContent = originalLabel;
          }, 1200);
        } catch (_) {
          console.warn("Copy failed", error);
        } finally {
          try {
            window.getSelection()?.removeAllRanges?.();
          } catch {}
        }
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initOverlays, { once: true });
} else {
  initOverlays();
}
