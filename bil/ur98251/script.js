const imageCount = 50;
const images = Array.from({ length: imageCount }, (_, index) =>
  `media/car-${String(index + 1).padStart(2, "0")}.jpg`
);

const currentGallery = document.querySelector("#currentGallery");
const gallery = document.querySelector("#gallery");
const dialog = document.querySelector("#lightbox");
const lightboxImage = dialog.querySelector("img");
const counter = dialog.querySelector(".counter");
let activeIndex = 0;

function photoButton(src, index, eager = false) {
  const button = document.createElement("button");
  button.className = "photo";
  button.type = "button";
  button.setAttribute("aria-label", `Vis bilde ${index + 1} i full størrelse`);

  const img = document.createElement("img");
  img.src = src;
  img.alt = index < 5
    ? `Nyere bilde av Mercedes-Benz C250 Coupé, bilde ${index + 1}`
    : `Mercedes-Benz C250 Coupé, bilde ${index + 1}`;
  img.loading = eager ? "eager" : "lazy";
  img.decoding = "async";
  button.append(img);
  button.addEventListener("click", () => openImage(index));
  return button;
}

images.slice(0, 5).forEach((src, index) =>
  currentGallery.append(photoButton(src, index, index === 0))
);
images.forEach((src, index) => gallery.append(photoButton(src, index)));

function openImage(index) {
  activeIndex = (index + imageCount) % imageCount;
  lightboxImage.src = images[activeIndex];
  lightboxImage.alt = `Mercedes-Benz C250 Coupé, bilde ${activeIndex + 1}`;
  counter.textContent = `${activeIndex + 1} / ${imageCount}`;
  if (!dialog.open) dialog.showModal();
}

dialog.querySelector(".close").addEventListener("click", () => dialog.close());
dialog.querySelector(".prev").addEventListener("click", () => openImage(activeIndex - 1));
dialog.querySelector(".next").addEventListener("click", () => openImage(activeIndex + 1));
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});
document.addEventListener("keydown", event => {
  if (!dialog.open) return;
  if (event.key === "ArrowLeft") openImage(activeIndex - 1);
  if (event.key === "ArrowRight") openImage(activeIndex + 1);
});
