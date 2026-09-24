import { loadLanguageModule } from "../languageLoader.js";

const TEXT_PRICE_GROUPS = [
  {
    provider: "Requesty",
    rows: [
      { model: "Claude Opus 5.5", id: "bedrock/claude-opus-5-5@eu-north-1", context: "1M", input: "$4.40", output: "$22.00" },
      { model: "Claude Sonnet 5", id: "vertex/claude-sonnet-5@eu", context: "1M", input: "$2.20", output: "$11.00" },
      { model: "GPT-6 Sol", id: "azure/gpt-6-sol@swedencentral", context: "1.1M", input: "$2.40", output: "$12.00" },
      { model: "GPT-6 Luna", id: "azure/gpt-6-luna@swedencentral", context: "1.1M", input: "$0.12", output: "$0.60" },
      { model: "GPT-5.6 Sol", id: "azure/gpt-5.6-sol@swedencentral", context: "1.1M", input: "$4.40", output: "$22.00" },
      { model: "GPT-5.6 Terra", id: "azure/gpt-5.6-terra@swedencentral", context: "1.1M", input: "$2.20", output: "$13.20" },
      { model: "GPT-5.6 Luna", id: "azure/gpt-5.6-luna@swedencentral", context: "1.1M", input: "$0.22", output: "$1.32" },
      { model: "GPT-5.5", id: "azure/gpt-5.5@swedencentral", context: "1.1M", input: "$5.00", output: "$30.00" },
      { model: "GPT-5 Nano", id: "azure/gpt-5-nano@swedencentral", context: "200K", input: "$0.055", output: "$0.44" },
      { model: "Gemini 3.8 Flash", id: "vertex/gemini-3.8-flash@eu", context: "1M", input: "$0.825", output: "$4.125" },
      { model: "DeepSeek V4 Pro", id: "tensorx/deepseek-v4-pro-0813", context: "1M", input: "$1.75", output: "$3.50" },
      { model: "DeepSeek V4.1 Flash", id: "sference/deepseek-v4.1-flash", context: "1M", input: "$0.50", output: "$1.50" },
      { model: "Kimi K3", id: "nebius/kimi-k3", context: "1M", input: "$3.00", output: "$15.00" },
    ],
  },
  {
    provider: "AWS Bedrock",
    rows: [
      { model: "Claude Haiku 4.5", context: "200K", input: "$1.00", output: "$5.00" },
      { model: "Claude Sonnet 4.5", context: "200K", input: "$3.00", output: "$15.00" },
      { model: "Claude Sonnet 4.6", context: "1M", input: "$3.00", output: "$15.00" },
      { model: "Claude Opus 4.5", context: "200K", input: "$5.00", output: "$25.00" },
      { model: "Claude Opus 4.6", context: "1M", input: "$5.00", output: "$25.00" },
      { model: "Claude Opus 4.7", context: "1M", input: "$5.00", output: "$25.00" },
    ],
  },
  {
    provider: "OpenAI",
    rows: [
      { model: "GPT-5.6 Sol", context: "1.05M", input: "$4.00", output: "$20.00" },
      { model: "GPT-5.6 Terra", context: "1.05M", input: "$2.00", output: "$12.00" },
      { model: "GPT-5.6 Luna", context: "1.05M", input: "$0.20", output: "$1.20" },
      { model: "GPT-5 Nano", context: "400K", input: "$0.05", output: "$0.40" },
    ],
  },
  {
    provider: "Mistral",
    rows: [
      { model: "Mistral Large", id: "mistral-large-latest", context: "256K", input: "$0.50", output: "$1.50" },
    ],
  },
];

const STT_PRICE_GROUPS = [
  {
    provider: "Soniox",
    rows: [
      { model: "Soniox", id: "stt-async-v5", billingType: "token", priceType: "minute", price: "$0.0017", approximate: true },
      { model: "Soniox Realtime", id: "stt-rt-v5", billingType: "token", priceType: "minute", price: "$0.002", approximate: true },
    ],
  },
  {
    provider: "Mistral",
    rows: [
      { model: "Voxtral Mini Transcribe 2", id: "voxtral-mini-2602", billingType: "audio", priceType: "minute", price: "$0.003", hourly: "$0.18" },
    ],
  },
  {
    provider: "OpenAI",
    rows: [
      { model: "GPT Transcribe", id: "gpt-transcribe", billingType: "audio", priceType: "minute", price: "$0.0045", hourly: "$0.27" },
    ],
  },
];

const FALLBACK_I18N = {
  button: "Prices",
  heading: "Prices",
  intro: "Current prices for the models available in this app.",
  textModels: "Text models",
  speechToText: "Speech-to-text",
  model: "Model",
  context: "Context",
  input: "Input / 1M",
  output: "Output / 1M",
  billing: "Billing",
  price: "Price",
  audioDuration: "Audio duration",
  tokenBased: "Token-based",
  perMinute: "/ min",
  perHour: "/ hour",
  approx: "approx.",
  close: "Close",
  contextNote: "Context is the maximum published context window for the configured model or route.",
  requestyNote: "Requesty prices match the exact routes configured in this app. Any account-level Requesty markup is not included.",
  sttNote: "Speech-to-text prices are current public pay-as-you-go rates. Soniox is token-billed; the per-minute figures shown are approximate equivalents derived from Soniox's published hourly rates.",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getCurrentLang() {
  const select = document.getElementById("lang-select-transcribe");
  return (select?.value || localStorage.getItem("siteLanguage") || "en").trim();
}

async function loadPriceI18n() {
  try {
    const mod = await loadLanguageModule(getCurrentLang());
    const bundle = mod?.transcribeTranslations || mod?.default?.transcribeTranslations;
    return { ...FALLBACK_I18N, ...(bundle?.priceOverlay || {}) };
  } catch (error) {
    console.warn("Could not load price overlay translations:", error);
    return { ...FALLBACK_I18N };
  }
}

function renderTextTable(group, t) {
  const rows = group.rows.map((row) => `
    <tr>
      <td>
        ${escapeHtml(row.model)}
        ${row.id ? `<span class="prices-model-id">${escapeHtml(row.id)}</span>` : ""}
      </td>
      <td>${escapeHtml(row.context)}</td>
      <td>${escapeHtml(row.input)}</td>
      <td>${escapeHtml(row.output)}</td>
    </tr>
  `).join("");

  return `
    <h5 class="prices-provider">${escapeHtml(group.provider)}</h5>
    <div class="prices-table-wrap">
      <table class="prices-table">
        <thead>
          <tr>
            <th>${escapeHtml(t.model)}</th>
            <th>${escapeHtml(t.context)}</th>
            <th>${escapeHtml(t.input)}</th>
            <th>${escapeHtml(t.output)}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function formatSttPrice(row, t) {
  if (row.priceType === "hour") {
    return `${escapeHtml(row.price)} ${escapeHtml(t.perHour)}${row.approximate ? ` (${escapeHtml(t.approx)})` : ""}`;
  }

  const approximate = row.approximate ? ` (${escapeHtml(t.approx)})` : "";
  const hourly = row.hourly
    ? ` · ≈ ${escapeHtml(row.hourly)} ${escapeHtml(t.perHour)}`
    : "";
  return `${escapeHtml(row.price)} ${escapeHtml(t.perMinute)}${approximate}${hourly}`;
}

function renderSttTable(group, t) {
  const rows = group.rows.map((row) => `
    <tr>
      <td>
        ${escapeHtml(row.model)}
        ${row.id ? `<span class="prices-model-id">${escapeHtml(row.id)}</span>` : ""}
      </td>
      <td>${escapeHtml(row.billingType === "token" ? t.tokenBased : t.audioDuration)}</td>
      <td>${formatSttPrice(row, t)}</td>
    </tr>
  `).join("");

  return `
    <h5 class="prices-provider">${escapeHtml(group.provider)}</h5>
    <div class="prices-table-wrap">
      <table class="prices-table">
        <thead>
          <tr>
            <th>${escapeHtml(t.model)}</th>
            <th>${escapeHtml(t.billing)}</th>
            <th>${escapeHtml(t.price)}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

async function renderPrices() {
  const button = document.getElementById("btnPrices");
  const view = document.getElementById("pricesView");
  const close = document.getElementById("pricesClose");
  const heading = document.getElementById("pricesHeading");
  const intro = document.getElementById("pricesIntro");
  const body = document.getElementById("pricesBody");
  if (!button || !view || !body) return;

  const t = await loadPriceI18n();

  button.textContent = t.button;
  if (close) close.setAttribute("aria-label", t.close);
  if (heading) heading.textContent = t.heading;
  if (intro) intro.textContent = t.intro;

  const textTables = TEXT_PRICE_GROUPS.map((group) => renderTextTable(group, t)).join("");
  const sttTables = STT_PRICE_GROUPS.map((group) => renderSttTable(group, t)).join("");

  body.innerHTML = `
    <section class="prices-section">
      <h4 class="prices-section-title">${escapeHtml(t.textModels)}</h4>
      ${textTables}
      <div class="prices-footnotes">
        <p class="prices-note">${escapeHtml(t.contextNote)}</p>
        <p class="prices-note">${escapeHtml(t.requestyNote)}</p>
      </div>
    </section>
    <section class="prices-section">
      <h4 class="prices-section-title">${escapeHtml(t.speechToText)}</h4>
      ${sttTables}
      <p class="prices-note">${escapeHtml(t.sttNote)}</p>
    </section>
  `;
}

function initPricesOverlay() {
  const button = document.getElementById("btnPrices");
  const view = document.getElementById("pricesView");
  const close = document.getElementById("pricesClose");
  if (!button || !view) return;

  const closePrices = () => {
    view.classList.remove("active");
    view.setAttribute("aria-hidden", "true");
  };

  const openPrices = async () => {
    document.getElementById("guideView")?.classList.remove("active");
    document.getElementById("guideView")?.setAttribute("aria-hidden", "true");
    document.getElementById("newsView")?.classList.remove("active");
    document.getElementById("newsView")?.setAttribute("aria-hidden", "true");
    document.getElementById("billingLinksView")?.classList.remove("active");
    document.getElementById("billingLinksView")?.setAttribute("aria-hidden", "true");

    await renderPrices();
    view.classList.add("active");
    view.setAttribute("aria-hidden", "false");
    view.scrollTop = 0;
    close?.focus();
  };

  renderPrices();

  button.addEventListener("click", () => {
    if (view.classList.contains("active")) closePrices();
    else openPrices();
  });

  close?.addEventListener("click", closePrices);

  document.getElementById("btnGuide")?.addEventListener("click", closePrices);
  document.getElementById("btnNews")?.addEventListener("click", closePrices);
  document.getElementById("openaiUsageLink")?.addEventListener("click", closePrices);
  document.getElementById("openaiWalletLink")?.addEventListener("click", closePrices);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && view.classList.contains("active")) {
      closePrices();
    }
  });

  window.addEventListener("transcribe-language-updated", () => {
    renderPrices();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPricesOverlay, { once: true });
} else {
  initPricesOverlay();
}
