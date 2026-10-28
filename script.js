
document.addEventListener("DOMContentLoaded", () => {
    // Aktuelles Jahr automatisch in der Fußzeile anzeigen
    const yearElement = document.getElementById("year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});
