document.addEventListener("DOMContentLoaded", () => {
  // Setzt das aktuelle Jahr in der Fußzeile, falls ein entsprechendes Element existiert.
  document.querySelectorAll("[data-current-year]").forEach((element) => {
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

  const MAX_FILE_SIZE = 8 * 1024 * 1024;
  const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
  let previewUrl = null;

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
    const file = imageInput.files && imageInput.files[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      imageInput.value = "";
      notice.textContent = "Bitte wähle eine PNG-, JPG-, WEBP- oder GIF-Bilddatei aus.";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      imageInput.value = "";
      notice.textContent = "Die Datei ist größer als 8 MB. Bitte wähle ein kleineres Bild.";
      return;
    }

    previewUrl = URL.createObjectURL(file);
    previewImage.src = previewUrl;
    fileName.textContent = file.name;
    fileSize.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    previewContainer.hidden = false;
    notice.textContent = "Bild ausgewählt. Hinweis: Diese GitHub-Pages-Version verschickt noch keine Daten.";
  });

  removeFileButton.addEventListener("click", () => {
    imageInput.value = "";
    clearPreview();
    notice.textContent = "Bild entfernt. Du kannst ein anderes Bild auswählen.";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const file = imageInput.files && imageInput.files[0];
    if (!file) {
      notice.textContent = "Bitte wähle ein Werbebild aus.";
      imageInput.focus();
      return;
    }

    // Die Website liegt auf GitHub Pages und hat aktuell kein Backend.
    // Daher werden weder Formularangaben noch das Bild übertragen oder gespeichert.
    notice.textContent =
      "Das Formular ist vollständig ausgefüllt und das Bild wurde geprüft. Es wurde noch nichts versendet: Für echte Einreichungen muss zuerst ein Backend oder ein sicherer Formular-Dienst angebunden werden.";
    notice.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  window.addEventListener("beforeunload", clearPreview);
});
