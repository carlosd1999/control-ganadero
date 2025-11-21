import { getData, setData } from "./storage.js";
import { formatDate } from "./helpers.js";

const medicamentoForm = document.getElementById("medicationForm");
const medicamentoTableBody = document.querySelector("#medicationFormTable tbody");
const farmSelect = document.getElementById("medicationFarms");

let currentEditIndex = null;

export function initMedicamentoSection() {
  populateFarmDropdown();
  renderMedicamentos();

  medicamentoForm.addEventListener("submit", handleMedicamentoSubmit);
}

function populateFarmDropdown() {
  const { values } = getData();

  values.farms.forEach((f) => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    farmSelect.appendChild(opt);
  });

}

// GUARDAR / EDITAR
function handleMedicamentoSubmit(e) {
  e.preventDefault();

  const formData = new FormData(medicamentoForm);
  const medicamento = Object.fromEntries(formData.entries());

  const data = getData();

  if (currentEditIndex !== null) {
    data.medications[currentEditIndex] = medicamento;
    currentEditIndex = null;
  } else {
    data.medications.push(medicamento);
  }

  setData(data);
  medicamentoForm.reset();
  renderMedicamentos();
}

function calcularProximaAplicacion(changeDate, frequency) {
  const hoy = new Date();
  const fechaCambio = new Date(changeDate);

  const proximaFecha = new Date(fechaCambio);
  proximaFecha.setDate(proximaFecha.getDate() + parseInt(frequency, 10));

  const diffMs = proximaFecha - hoy;

  return formatDate(proximaFecha.toISOString().substring(0,10));

}

function renderMedicamentos() {
  const { medications } = getData();

  medicamentoTableBody.innerHTML = medications
    .map((medication, i) => {
      return `
      <tr>
        <td>${medication.farm}</td>
        <td>${medication.medicine}</td>
        <td>${medication.presentation} mL</td>
        <td>${medication.dose}</td>
        <td>${formatDate(medication.applicationDate)}</td>
        <td>${calcularProximaAplicacion(medication.applicationDate, medication.frequency)}</td>
        <td class="actions">
          <button class="icon-btn edit" onclick="editMedicamento(${i})" title="Editar">
            <i class="fa-classic fa-solid fa-pen-to-square fa-fw"></i>
          </button>
          <button class="icon-btn delete" onclick="deleteMedicamento(${i})" title="Eliminar">
            <i class="fa-classic fa-solid fa-trash fa-fw"></i>
          </button>
        </td>
      </tr>
    `;
    })
    .join("");
}

window.cancelmedicamentoForm = function () {
  currentEditIndex = null;
  medicamentoForm.reset();
};

window.editMedicamento = function (index) {
  const p = getData().medications[index];

  Object.keys(p).forEach((k) => {
    if (medicamentoForm.elements[k]) {
      medicamentoForm.elements[k].value = p[k];
    }
  });

  currentEditIndex = index;
  medicamentoForm.scrollIntoView({ behavior: "smooth" });
};

window.deleteMedicamento = function (index) {
  if (!confirm("¿Deseas eliminar este medicamento?")) return;

  const data = getData();
  data.medications.splice(index, 1);
  setData(data);
  renderMedicamentos();
};
