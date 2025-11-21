import { initializeStorage, importData, exportData } from "./storage.js";
import { initExpenseSection } from "./expenses.js";
import { initCattleSection } from "./cattle.js";
import { renderSummary } from "./summary.js";
import { initPotreroSection } from "./paddocks.js";
import { initMedicamentoSection } from "./medications.js";

document.addEventListener("DOMContentLoaded", async () => {
  await initializeStorage();
  setupImportExport();
  showSection("cattle");
  initExpenseSection();
  initCattleSection();
  initPotreroSection();
  initMedicamentoSection();
});

window.showSection = function (sectionId) {
  document.querySelectorAll(".section").forEach((s) => {
    s.classList.add("hidden");
  });
  document.getElementById(sectionId).classList.remove("hidden");
  if (sectionId === "summary") {
    renderSummary();
  }
};

function setupImportExport() {
  const importInput = document.getElementById("importInput");
  const importBtn = document.getElementById("importBtn");
  const exportBtn = document.getElementById("exportBtn");

  importBtn.addEventListener("click", () => importInput.click());

  importInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    importData(file, (success) => {
      if (success) {
        alert("Datos importados correctamente.");
        location.reload();
      } else {
        alert("Error al importar el archivo.");
      }
    });
  });

  exportBtn.addEventListener("click", exportData);
}
