// Shows a small warning beside any app-controlled password field while
// Caps Lock is active. Event delegation also covers password inputs created
// later by the prompt-list and Workspace Set modals.

const CAPS_LOCK_TEXT = Object.freeze({
  en: "Caps Lock is on",
  no: "Caps Lock er på",
  de: "Feststelltaste ist aktiviert",
  fr: "Verr. Maj. est activée",
  it: "Bloc Maiusc è attivo",
  sv: "Caps Lock är på",
});

let indicatorCounter = 0;
const indicators = new WeakMap();

function isPasswordInput(target) {
  return target instanceof HTMLInputElement && target.type === "password";
}

function getCurrentLanguage() {
  let saved = "";
  try {
    saved = String(localStorage.getItem("siteLanguage") || "").toLowerCase();
  } catch (_) {}
  const documentLanguage = String(document.documentElement.lang || "").toLowerCase();
  const language = (saved || documentLanguage || "en").split("-")[0];
  return Object.hasOwn(CAPS_LOCK_TEXT, language) ? language : "en";
}

function getIndicator(input) {
  let indicator = indicators.get(input);
  if (indicator?.isConnected) return indicator;

  indicator = document.createElement("span");
  indicator.id = `caps-lock-indicator-${++indicatorCounter}`;
  indicator.className = "caps-lock-indicator";
  indicator.hidden = true;
  indicator.setAttribute("role", "status");
  indicator.setAttribute("aria-live", "polite");
  input.insertAdjacentElement("afterend", indicator);
  indicators.set(input, indicator);
  return indicator;
}

function setIndicator(input, isOn) {
  const indicator = getIndicator(input);
  indicator.textContent = CAPS_LOCK_TEXT[getCurrentLanguage()];
  indicator.hidden = !isOn;
}

function updateFromKeyboardEvent(event) {
  if (!isPasswordInput(event.target)) return;
  const isOn = typeof event.getModifierState === "function" &&
    event.getModifierState("CapsLock");
  setIndicator(event.target, isOn);
}

function hideForInput(input) {
  const indicator = indicators.get(input);
  if (indicator) indicator.hidden = true;
}

if (!document.getElementById("caps-lock-indicator-styles")) {
  const style = document.createElement("style");
  style.id = "caps-lock-indicator-styles";
  style.textContent = `
    .caps-lock-indicator {
      display: block;
      width: fit-content;
      margin: 5px 0 1px;
      padding: 3px 7px;
      border: 1px solid #e1ad55;
      border-radius: 6px;
      background: #fff7e6;
      color: #7a4300;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.25;
    }
    .caps-lock-indicator[hidden] {
      display: none !important;
    }
  `;
  document.head.append(style);
}

document.addEventListener("keydown", updateFromKeyboardEvent, true);
document.addEventListener("keyup", updateFromKeyboardEvent, true);
document.addEventListener("focusout", (event) => {
  if (isPasswordInput(event.target)) hideForInput(event.target);
}, true);

window.addEventListener("blur", () => {
  const active = document.activeElement;
  if (isPasswordInput(active)) hideForInput(active);
});

