// ui.js

function enableFunctionalButtons() {
  const startButton = document.getElementById("startButton");
  if (startButton) {
    startButton.disabled = false;
    startButton.title = "";
  }

  const generateNoteButton = document.getElementById("generateNoteButton");
  if (generateNoteButton) {
    generateNoteButton.disabled = false;
    generateNoteButton.title = "";
  }
}

function renderActiveAccordionContent() {
  const contentContainer = document.querySelector(".accordion-content-container");
  if (!contentContainer) return;

  const activeHeader = document.querySelector(".accordion-header.active");
  if (!activeHeader) {
    contentContainer.innerHTML = "";
    return;
  }

  const contentId = activeHeader.getAttribute("data-content-id");
  const hiddenContent = contentId ? document.getElementById(contentId) : null;
  contentContainer.innerHTML = hiddenContent ? hiddenContent.innerHTML : "";
}

function toggleAccordionHeader(header) {
  const contentContainer = document.querySelector(".accordion-content-container");
  if (!header || !contentContainer) return;

  const isActive = header.classList.contains("active");
  document.querySelectorAll(".accordion-header.active").forEach((activeHeader) => {
    activeHeader.classList.remove("active");
  });

  if (isActive) {
    contentContainer.innerHTML = "";
    return;
  }

  header.classList.add("active");
  renderActiveAccordionContent();
}

function bindAccordionHeaders() {
  const headers = document.querySelectorAll(".accordion-header");
  headers.forEach((header) => {
    if (header.dataset.accordionBound === "1") return;
    header.dataset.accordionBound = "1";
    header.addEventListener("click", () => toggleAccordionHeader(header));
  });
}

function bindGuideDelegation() {
  if (document.documentElement.dataset.indexGuideDelegationBound === "1") return;
  document.documentElement.dataset.indexGuideDelegationBound = "1";

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open-guide]");
    if (!trigger) return;

    event.preventDefault();

    const which = trigger.getAttribute("data-open-guide");
    const id =
      which === "bedrock" ? "bedrock-guide-link" :
      which === "vertex" ? "vertex-guide-link" :
      null;

    const realLink = id ? document.getElementById(id) : null;
    realLink?.click();
  });
}

function initIndexAccordions() {
  bindAccordionHeaders();
  bindGuideDelegation();
  renderActiveAccordionContent();
}

export { enableFunctionalButtons, initIndexAccordions };
