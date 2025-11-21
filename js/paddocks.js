import { getData, setData } from "./storage.js";
import { formatDate, diffDays } from "./helpers.js";

const potreroForm = document.getElementById("paddockForm");
const potrerosTableBody = document.querySelector("#paddocksTable tbody");
const farmSelect = document.getElementById("paddockFarms");
const stateSelect = document.getElementById("paddockStates");

let currentEditIndex = null;

export function initPotreroSection() {
  populateFarmDropdown();
  renderPotreros();

  potreroForm.addEventListener("submit", handlePotreroSubmit);
}

function populateFarmDropdown() {
  const { values } = getData();

  values.farms.forEach((f) => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    farmSelect.appendChild(opt);
  });

  values.paddockStates.forEach((f) => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    stateSelect.appendChild(opt);
  });
}

// GUARDAR / EDITAR
function handlePotreroSubmit(e) {
  e.preventDefault();

  const formData = new FormData(potreroForm);
  const potrero = Object.fromEntries(formData.entries());
  potrero.dayOff = parseInt(potrero.dayOff, 10);

  const data = getData();

  if (currentEditIndex !== null) {
    data.paddocks[currentEditIndex] = potrero;
    currentEditIndex = null;
  } else {
    data.paddocks.push(potrero);
  }

  setData(data);
  potreroForm.reset();
  renderPotreros();
}

function calcularRotacion(changeDate, dayOff, status) {
  const hoy = new Date();
  const fechaCambio = new Date(changeDate);

  const proximaFecha = new Date(fechaCambio);
  proximaFecha.setDate(proximaFecha.getDate() + parseInt(dayOff, 10));

  const diffMs = proximaFecha - hoy;
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (status === "Ocupado") {
    return {
      tipo: "sacar",
      dias: diffDias,
    };
  }

  if (status === "Descanso") {
    return {
      tipo: "meter",
      dias: diffDias,
    };
  }
}

function renderPotreros() {
  const { paddocks } = getData();

  potrerosTableBody.innerHTML = paddocks
    .map((paddock, i) => {
      const rotacion = calcularRotacion(paddock.changeDate, paddock.dayOff, paddock.state);
      return `
      <tr>
        <td>${paddock.farm}</td>
        <td>${paddock.name}</td>
        <td>${formatDate(paddock.changeDate)}</td>
        <td>${paddock.dayOff} días</td>
        <td>${rotacion.tipo === "sacar" ? "Sacar ganado en" : "Meter ganado en"}
            <strong>${rotacion.dias} días</strong></td>
        <td class="actions">
          <button class="icon-btn edit" onclick="editPotrero(${i})" title="Editar">
            <i class="fa-classic fa-solid fa-pen-to-square fa-fw"></i>
          </button>
          <button class="icon-btn delete" onclick="deletePotrero(${i})" title="Eliminar">
            <i class="fa-classic fa-solid fa-trash fa-fw"></i>
          </button>
        </td>
      </tr>
    `;
    })
    .join("");
}

window.cancelPotreroForm = function () {
  currentEditIndex = null;
  potreroForm.reset();
};

window.editPotrero = function (index) {
  const p = getData().paddocks[index];

  Object.keys(p).forEach((k) => {
    if (potreroForm.elements[k]) {
      potreroForm.elements[k].value = p[k];
    }
  });

  currentEditIndex = index;
  potreroForm.scrollIntoView({ behavior: "smooth" });
};

window.deletePotrero = function (index) {
  if (!confirm("¿Deseas eliminar este potrero?")) return;

  const data = getData();
  data.paddocks.splice(index, 1);
  setData(data);
  renderPotreros();
};
