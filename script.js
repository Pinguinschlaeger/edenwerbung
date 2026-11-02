
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-current-year]").forEach(element => {
    element.textContent = new Date().getFullYear();
  });

  const form = document.querySelector("#ad-form");
  if (!form) return;

  const imageInput = document.querySelector("#ad-image");
  const previewContainer = document.querySelector("#file-preview");
  const previewImage = document.querySelector("#preview-image");
  const fileName = document.querySelector("#file-name");
  const fileSize = document.querySelector("#file-size");
  const removeFileButton = document.querySelector("#remove-file");
  const notice = document.querySelector("#form-notice");

  const sizeWidthInput = document.querySelector("#size-width");
  const sizeHeightInput = document.querySelector("#size-height");
  const trustUsCheckbox = document.querySelector("#trust-us");

  const submitButton = form.querySelector('button[type="submit"]');

  const WORKER_URL =
    "https://edenwerbung-formular.david1997.workers.dev/";

  const MAX_FILE_SIZE = 8 * 1024 * 1024;
  const ALLOWED_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif"
  ];

  let previewUrl = null;

  function updateSizePreferences() {
    const trustUs = trustUsCheckbox.checked;

    sizeWidthInput.disabled = trustUs;
    sizeHeightInput.disabled = trustUs;

    if (trustUs) {
      sizeWidthInput.value = "";
      sizeHeightInput.value = "";
    }
  }

  trustUsCheckbox.addEventListener("change", updateSizePreferences);
  updateSizePreferences();

  function clearPreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }

    previewImage.removeAttribute("src");
    previewContainer.hidden = true;
    fileName.textContent = "";
    fileSize.textContent = "";
  }

  imageInput.addEventListener("change", () => {
    clearPreview();

    const file = imageInput.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      imageInput.value = "";
      notice.textContent =
        "Bitte wähle eine PNG-, JPG-, WEBP- oder GIF-Bilddatei aus.";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      imageInput.value = "";
      notice.textContent =
        "Die Datei ist größer als 8 MB. Bitte wähle ein kleineres Bild.";
      return;
    }

    previewUrl = URL.createObjectURL(file);
    previewImage.src = previewUrl;
    fileName.textContent = file.name;
    fileSize.textContent =
      `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    previewContainer.hidden = false;
    notice.textContent = "Bild ausgewählt und geprüft.";
  });

  removeFileButton.addEventListener("click", () => {
    imageInput.value = "";
    clearPreview();
    notice.textContent = "Bild entfernt. Du kannst ein anderes auswählen.";
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const file = imageInput.files?.[0];

    if (!file) {
      notice.textContent = "Bitte wähle ein Werbebild aus.";
      imageInput.focus();
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE) {
      notice.textContent = "Die Bilddatei ist ungültig oder zu groß.";
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Wird versendet ...";
    notice.textContent = "Deine Anfrage wird übermittelt ...";

    try {
      const formData = new FormData(form);

      const response = await fetch(WORKER_URL, {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Versand fehlgeschlagen.");
      }

      notice.textContent =
        "Vielen Dank! Deine Werbeanfrage wurde erfolgreich versendet.";

      form.reset();
      updateSizePreferences();
      clearPreview();

      notice.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

    } catch (error) {
      console.error("Formularfehler:", error);

      notice.textContent =
        error.message || "Es ist ein Fehler beim Versand aufgetreten.";

    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML =
        'Werbung einreichen!<span aria-hidden="true">→</span>';
    }
  });

  window.addEventListener("beforeunload", clearPreview);
});
