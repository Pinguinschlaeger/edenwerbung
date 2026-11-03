
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
  let isSending = false;

  function message(key) {
    return typeof translate === "function"
      ? translate(key)
      : key;
  }

  function setSubmitButton() {
    if (isSending) {
      submitButton.textContent = message("sending");
      return;
    }

    submitButton.innerHTML =
      `<span data-i18n="submit">${message("submit")}</span><span aria-hidden="true">→</span>`;
  }

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
      notice.textContent = message("fileInvalidType");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      imageInput.value = "";
      notice.textContent = message("fileTooLarge");
      return;
    }

    previewUrl = URL.createObjectURL(file);
    previewImage.src = previewUrl;
    fileName.textContent = file.name;
    fileSize.textContent =
      `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    previewContainer.hidden = false;
    notice.textContent = message("fileSelected");
  });

  removeFileButton.addEventListener("click", () => {
    imageInput.value = "";
    clearPreview();
    notice.textContent = message("fileRemoved");
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const file = imageInput.files?.[0];

    if (!file) {
      notice.textContent = message("fileRequired");
      imageInput.focus();
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE) {
      notice.textContent = message("fileInvalid");
      return;
    }

    isSending = true;
    submitButton.disabled = true;
    setSubmitButton();
    notice.textContent = message("submitting");

    try {
      const formData = new FormData(form);

      const response = await fetch(WORKER_URL, {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || message("sendFailed"));
      }

      notice.textContent = message("success");

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
        error.message || message("sendError");

    } finally {
      isSending = false;
      submitButton.disabled = false;
      setSubmitButton();
    }
  });

  window.addEventListener("beforeunload", clearPreview);
});
