import { getData, setData } from "./storage.js";
import { formatCurrency, diffDays, formatDate } from "./helpers.js";

const form = document.getElementById("cattleForm");
const tableBody = document.querySelector("#cattleTable tbody");

const farmSelect = document.getElementById("finca");
const genderSelect = document.getElementById("sexo");
const statusSelect = document.getElementById("estado");

export function initCattleSection() {
  populateSelects();
  renderTable();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const animal = getFormData();
    if (!animal) return;

    const data = getData();
    const editId = form.getAttribute("data-edit-id");

    if (editId) {
      // Editando
      const index = data.animals.findIndex((a) => a.id === parseInt(editId));
      if (index !== -1) {
        animal.id = parseInt(editId); // Mantener el ID original
        data.animals[index] = animal;
      }
      form.removeAttribute("data-edit-id");
    } else {
      // Nuevo registro
      animal.id =
        data.animals.length > 0
          ? Math.max(...data.animals.map((a) => a.id)) + 1
          : 1;
      data.animals.push(animal);
    }

    setData(data);
    form.reset();
    renderTable();
  });
}

function populateSelects() {
  const { values } = getData();

  values.farms.forEach((f) => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    farmSelect.appendChild(opt);
  });

  values.gender.forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    genderSelect.appendChild(opt);
  });

  values.animalStates.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    statusSelect.appendChild(opt);
  });
}

function getFormData() {
  const idGanado = document.getElementById("idGanado").value.trim();
  const finca = farmSelect.value;
  const fechaCompra = document.getElementById("fechaCompra").value;
  const sexo = genderSelect.value;
  const precioCompra = parseFloat(
    document.getElementById("precioCompra").value
  );
  const pesoCompra = parseFloat(document.getElementById("pesoCompra").value);
  const fechaVenta = document.getElementById("fechaVenta").value;
  const precioVenta =
    parseFloat(document.getElementById("precioVenta").value) || 0;
  const pesoVenta = parseFloat(document.getElementById("pesoVenta").value) || 0;
  const transporte =
    parseFloat(document.getElementById("transporte").value) || 0;
  const estado = statusSelect.value;
  const observaciones = document.getElementById("observaciones").value;
  const propiedad = document.getElementById("propiedad").value;
  if (
    !idGanado ||
    !finca ||
    !fechaCompra ||
    !sexo ||
    isNaN(precioCompra) ||
    isNaN(pesoCompra)
  ) {
    alert("Faltan datos obligatorios");
    return null;
  }

  const totalCompra = precioCompra * pesoCompra;
  const comision = precioVenta * pesoVenta * 0.03;
  const totalVenta = precioVenta * pesoVenta - transporte - comision;
  const diasFinca = diffDays(fechaCompra, fechaVenta || new Date());
  const rawGananciaBruta = totalVenta - totalCompra;
  const gananciaBruta =
    propiedad === "A medias" ? rawGananciaBruta / 2 : rawGananciaBruta;

  const gananciaKgDia =
    pesoVenta && diasFinca
      ? ((pesoVenta - pesoCompra) / diasFinca).toFixed(2)
      : 0;
  const margenGanancia =
    totalCompra > 0
      ? (((totalVenta - totalCompra) / totalVenta) * 100).toFixed(2)
      : 0;

  return {
    idGanado,
    finca,
    fechaCompra,
    sexo,
    precioCompra,
    pesoCompra,
    totalCompra,
    fechaVenta,
    precioVenta,
    pesoVenta,
    transporte,
    comision,
    totalVenta,
    diasFinca,
    gananciaBruta,
    gananciaKgDia: parseFloat(gananciaKgDia),
    margenGanancia: parseFloat(margenGanancia),
    estado,
    observaciones,
    propiedad,
  };
}

function renderTable() {
  const data = getData();
  tableBody.innerHTML = "";

  data.animals.forEach((animal, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${animal.idGanado}</td>
      <td>${animal.finca}</td>
      <td>${formatDate(animal.fechaCompra)}</td>
      <td>${animal.sexo}</td>
      <td>${formatCurrency(animal.precioCompra)}</td>
      <td>${animal.pesoCompra}</td>
      <td>${formatCurrency(animal.totalCompra)}</td>
      <td>${formatDate(animal.fechaVenta) || ""}</td>
      <td>${animal.precioVenta ? formatCurrency(animal.precioVenta) : ""}</td>
      <td>${animal.pesoVenta || ""}</td>
      <td>${animal.transporte ? formatCurrency(animal.transporte) : ""}</td>
      <td>${animal.comision ? formatCurrency(animal.comision) : ""}</td>
      <td>${animal.totalVenta ? formatCurrency(animal.totalVenta) : ""}</td>
      <td>${diffDays(animal.fechaCompra, animal.fechaVenta || new Date())}</td>
      <td>${
        animal.gananciaBruta ? formatCurrency(animal.gananciaBruta) : ""
      }</td>
      <td>${animal.gananciaKgDia || ""}</td>
      <td>${animal.margenGanancia ? animal.margenGanancia + "%" : ""} </td>
      <td>${animal.estado}</td>
      <td>${animal.propiedad}</td>
      <td>${animal.observaciones}</td>
      <td class="actions">
        <button class="icon-btn edit" onclick="editAnimal(${
          animal.id
        })" title="Editar">
          <i class="fa-classic fa-solid fa-pen-to-square fa-fw"></i>
        </button>
        <button class="icon-btn delete" onclick="deleteAnimal(${
          animal.id
        })" title="Eliminar">
          <i class="fa-classic fa-solid fa-trash fa-fw"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

window.editAnimal = function (id) {
  const data = getData();
  const animal = data.animals.find((a) => a.id === id);
  if (!animal) return;

  // Rellenar el formulario con los datos del animal
  document.getElementById("idGanado").value = animal.idGanado;
  document.getElementById("finca").value = animal.finca;
  document.getElementById("fechaCompra").value = animal.fechaCompra;
  document.getElementById("sexo").value = animal.sexo;
  document.getElementById("precioCompra").value = animal.precioCompra;
  document.getElementById("pesoCompra").value = animal.pesoCompra;
  document.getElementById("fechaVenta").value = animal.fechaVenta;
  document.getElementById("precioVenta").value = animal.precioVenta;
  document.getElementById("pesoVenta").value = animal.pesoVenta;
  document.getElementById("transporte").value = animal.transporte;
  document.getElementById("estado").value = animal.estado;
  document.getElementById("observaciones").value = animal.observaciones;
  document.getElementById("propiedad").value = animal.propiedad;

  // Guardar el ID en un atributo oculto
  form.setAttribute("data-edit-id", id);
};

window.deleteAnimal = function (id) {
  if (!confirm("¿Estás seguro que deseas eliminar este registro?")) return;

  const data = getData();
  data.animals = data.animals.filter((a) => a.id !== id);
  setData(data);
  renderTable();
};
