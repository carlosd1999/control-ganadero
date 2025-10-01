import { getData, setData } from "./storage.js";
import { formatCurrency, diffDays, formatDate } from "./helpers.js";

const form = document.getElementById("cattleForm");
const container = document.getElementById("cattleCards");
const farmSelect = document.getElementById("finca");
const genderSelect = document.getElementById("sexo");
const statusSelect = document.getElementById("estado");
const filterEstado = document.getElementById("filterEstado");

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
  filterEstado.addEventListener("change", renderTable);
}

function promedioSummary() {
  const data = getData();
  let totalDays = 0;
  let totalWeightGain = 0;
  let countSold = 0;
  let totalSalePrice = 0;

  data.animals.forEach((animal) => {
    const diasFinca = diffDays(
      animal.fechaCompra,
      animal.fechaVenta || new Date()
    );

    if (animal.estado === "Vendido") {
      countSold++;
      totalDays += diasFinca || 0;
      totalWeightGain += animal.pesoVenta - animal.pesoCompra || 0;
      totalSalePrice += animal.precioVenta || 0;
    }
  });
  const averageSalePrice = countSold > 0 ? totalSalePrice / countSold : 0;
  const averageGainKgDay =
    totalDays > 0 ? (totalWeightGain / totalDays).toFixed(2) : 0;
  return { averageGainKgDay, averageSalePrice: averageSalePrice.toFixed(2) };
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

  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "Todos";
  filterEstado.appendChild(allOption);

  values.animalStates.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    filterEstado.appendChild(opt);
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
  const comision = parseFloat(document.getElementById("comision").value) || 0;
  if (
    !idGanado ||
    !finca ||
    !fechaCompra ||
    !sexo ||
    isNaN(precioCompra) ||
    isNaN(pesoCompra) ||
    isNaN(comision)
  ) {
    alert("Faltan datos obligatorios");
    return null;
  }

  return {
    idGanado,
    finca,
    fechaCompra,
    sexo,
    precioCompra,
    pesoCompra,
    fechaVenta,
    precioVenta,
    pesoVenta,
    transporte,
    estado,
    observaciones,
    propiedad,
    comision,
  };
}

function getAnimals() {
  const data = getData();
  const filtro = filterEstado?.value || "Todos";
  const estadoOrden = { "En Finca": 0, Vendido: 1, Muerto: 2 };

  let animals = data.animals
    .slice() // Copiar para evitar modificar el original
    .sort((a, b) => {
      const estadoDiff =
        (estadoOrden[a.estado] ?? 3) - (estadoOrden[b.estado] ?? 3);
      if (estadoDiff !== 0) return estadoDiff;

      // Si el estado es igual, ordenar por fecha descendente (más nuevo primero)
      const fechaA = new Date(a.fechaVenta || a.fechaCompra);
      const fechaB = new Date(b.fechaVenta || b.fechaCompra);
      return fechaB - fechaA;
    });

  if (filtro !== "Todos") {
    animals = animals.filter((a) => a.estado === filtro);
  }

  return animals;
}

function toKebabCase(str) {
  return str.toLowerCase().replace(/\s+/g, "-");
}

function renderTable() {
  container.innerHTML = "";

  getAnimals().forEach((animal) => {
    const card = document.createElement("div");
    card.className = "animal-card";
    const isHalf = animal.propiedad === "A medias";
    const comision =
      animal.precioVenta *
        animal.pesoVenta *
        (animal.comision ? animal.comision / 100 : 0.03) || 0;
    const totalCompra = animal.pesoCompra * animal.precioCompra;
    const totalVenta =
      animal.pesoVenta * animal.precioVenta - animal.transporte - comision;
    const rawGananciaNeta = totalVenta - totalCompra;
    const gananciaNeta =
      isHalf && rawGananciaNeta > 0 ? rawGananciaNeta / 2 : rawGananciaNeta;
    const diasFinca = diffDays(
      animal.fechaCompra,
      animal.fechaVenta || new Date()
    );
    const gananciaKgDia =
      animal.pesoVenta && animal.fechaVenta
        ? ((animal.pesoVenta - animal.pesoCompra) / diasFinca).toFixed(2)
        : "";
    const margenGanancia =
      totalCompra > 0
        ? (((totalVenta - totalCompra) / totalCompra) * 100).toFixed(2)
        : 0;

    let detailInfo = "";
    let seeMoreButton = "";
    const isSoldOrDead = Boolean(
      (animal.fechaVenta && animal.estado == "Vendido") ||
        animal.estado == "Muerto"
    );

    if (isSoldOrDead) {
      detailInfo = `
      <div class="details hidden" data-id="${animal.id}">
        <strong>Fecha Venta:</strong> ${formatDate(animal.fechaVenta) || ""}
      </div>
      <div class="details hidden" data-id="${animal.id}">
        <strong>Peso Venta:</strong> ${
          animal.pesoVenta ? animal.pesoVenta + " kg" : ""
        }
      </div>
      <div class="details hidden" data-id="${animal.id}">
        <strong>Precio Venta:</strong> ${
          animal.precioVenta ? formatCurrency(animal.precioVenta) : ""
        }
      </div>
      <div class="details hidden" data-id="${animal.id}">
        <strong>Total Venta:</strong>
        ${formatCurrency(totalVenta)}
      </div>
      <div class="details hidden" data-id="${animal.id}">
        <strong>Ganancia Neta:</strong> ${formatCurrency(gananciaNeta)}
      </div>
      <div class="details hidden" data-id="${
        animal.id
      }"><strong>Ganancia Kg/Día:</strong> ${gananciaKgDia} kg</div>
      <div class="details hidden" data-id="${
        animal.id
      }"><strong>Margen Ganancia:</strong> ${margenGanancia}%</div>
      <div class="details hidden" data-id="${animal.id}">
        <strong>Comisión:</strong> ${formatCurrency(comision)}
      </div>
      <div class="details hidden" data-id="${animal.id}">
        <strong>Transporte:</strong> ${formatCurrency(animal.transporte)}
      </div>`;
      seeMoreButton = `
      <button class="toggle-details-btn" onclick="toggleDetails(this, ${animal.id})">
        Ver más
      </button>`;
    }

    if (!isSoldOrDead) {
      detailInfo = `
      <div class="details hidden" data-id="${animal.id}">
        <strong>Peso Estimado:</strong>${(
          animal.pesoCompra +
          promedioSummary().averageGainKgDay * diasFinca
        ).toFixed(0)} kg
      </div>
      <div class="details hidden" data-id="${animal.id}">
        <strong>Precio Estimado:</strong>${formatCurrency(
          (
            animal.pesoCompra +
            promedioSummary().averageGainKgDay * diasFinca
          ).toFixed(0) * promedioSummary().averageSalePrice
        )}
      </div>`;
      seeMoreButton = `
      <button class="toggle-details-btn" onclick="toggleDetails(this, ${animal.id})">
        Ver más
      </button>`;
    }

    card.innerHTML = `
    <div class="card-header">
    <div class="left info-animla-container">
      <h3 class="animal-id">ID: ${animal.idGanado}</h3>
      <span class="animal-status ${toKebabCase(animal.estado)}">${
      animal.estado
    }</span>
    <span class="animal-sexo ${toKebabCase(animal.sexo)}">${animal.sexo}</span>
    </div>
    <div class="right">
      <button
        class="icon-btn edit"
        onclick="editAnimal(${animal.id})"
        title="Editar"
      >
        <i class="fa-classic fa-solid fa-pen-to-square fa-fw"></i>
      </button>
      <button
        class="icon-btn delete"
        onclick="deleteAnimal(${animal.id})"
        title="Eliminar"
      >
        <i class="fa-classic fa-solid fa-trash fa-fw"></i>
      </button>
    </div>
  </div>

  <div class="card-body">
    <div class="info-grid">
      <div><strong>Finca:</strong> ${animal.finca}</div>
      <div><strong>Propiedad:</strong> ${animal.propiedad}</div>
      <div><strong>Fecha Compra:</strong> ${formatDate(
        animal.fechaCompra
      )}</div>
      <div><strong>Peso Compra:</strong> ${animal.pesoCompra} kg</div>
      <div><strong>Precio Compra:</strong> ${formatCurrency(
        animal.precioCompra
      )}</div>
      <div><strong>Total Compra:</strong> ${formatCurrency(totalCompra)}</div>
      <div><strong>Días en Finca:</strong> ${diasFinca}</div>
      ${detailInfo}
      <div>
        <strong>Observaciones:</strong> ${animal.observaciones}
      </div>
    </div>
    ${seeMoreButton}
  </div>
    `;

    container.appendChild(card);
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
  document.getElementById("cattleForm").scrollIntoView({ behavior: "smooth" });
};

window.deleteAnimal = function (id) {
  if (!confirm("¿Estás seguro que deseas eliminar este registro?")) return;

  const data = getData();
  data.animals = data.animals.filter((a) => a.id !== id);
  setData(data);
  renderTable();
};

window.cancelCattleForm = function () {
  form.removeAttribute("data-edit-id");
  form.reset();
};

window.toggleDetails = function (button, id) {
  const details = document.querySelectorAll(`.details[data-id="${id}"]`);
  const isHidden = [...details].some((div) => div.classList.contains("hidden"));

  details.forEach((div) => div.classList.toggle("hidden"));

  button.textContent = isHidden ? "Ver menos" : "Ver más";
};
