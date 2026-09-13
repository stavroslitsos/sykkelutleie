const coolImages = [
  "new-02.jpg", "new-03.jpg", "new-04.jpg", "new-05.jpg",
  "new-16.jpg", "new-07.jpg", "new-08.jpg", "new-10.jpg",
  "new-12.jpg", "new-14.jpg", "new-15.jpg"
].map(file => `media/${file}`);
const warmImages = [
  "new-06.jpg", "new-09.jpg", "new-01.jpg", "new-11.jpg", "new-13.jpg"
].map(file => `media/${file}`);
const outdoorArchive = [1, 2, 3, 4, 5, 50].map(number =>
  `media/car-${String(number).padStart(2, "0")}.jpg`
);
const dealerArchive = Array.from({ length: 44 }, (_, index) =>
  `media/car-${String(index + 6).padStart(2, "0")}.jpg`
);
const newImages = [...coolImages, ...warmImages];
const images = [...newImages, ...outdoorArchive, ...dealerArchive];
const imageCount = images.length;

const coolGallery = document.querySelector("#coolGallery");
const warmGallery = document.querySelector("#warmGallery");
const outdoorGallery = document.querySelector("#outdoorGallery");
const dealerGallery = document.querySelector("#dealerGallery");
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
  img.alt = index < newImages.length
    ? `Nyere bilde av Mercedes-Benz C250 Coupé, bilde ${index + 1}`
    : `Mercedes-Benz C250 Coupé, bilde ${index + 1}`;
  img.loading = eager ? "eager" : "lazy";
  img.decoding = "async";
  button.append(img);
  button.addEventListener("click", () => openImage(index));
  return button;
}

coolImages.forEach((src, index) =>
  coolGallery.append(photoButton(src, index, index === 0))
);
warmImages.forEach((src, index) =>
  warmGallery.append(photoButton(src, coolImages.length + index))
);
outdoorArchive.forEach((src, index) =>
  outdoorGallery.append(photoButton(src, newImages.length + index))
);
dealerArchive.forEach((src, index) =>
  dealerGallery.append(photoButton(src, newImages.length + outdoorArchive.length + index))
);

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
