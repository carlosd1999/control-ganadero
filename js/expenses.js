import { getData, setData } from "./storage.js";
import { formatDate, formatCurrency } from "./helpers.js";

const expenseForm = document.getElementById("expenseForm");
const expensesTableBody = document.querySelector("#expensesTable tbody");
const totalGastos = document.getElementById("totalGastos");

let currentEditIndex = null;

export function initExpenseSection() {
  populateDropdowns();
  renderExpenses();

  expenseForm.addEventListener("submit", handleExpenseSubmit);
}

function populateDropdowns() {
  const data = getData();
  ["farm", "type", "paymentMethod"].forEach((field) => {
    const select = expenseForm.elements[field];
    const values =
      data.values[
        {
          farm: "farms",
          type: "expenseTypes",
          paymentMethod: "paymentMethods",
        }[field]
      ];
    select.innerHTML = values
      .map((val) => `<option value="${val}">${val}</option>`)
      .join("");
  });
}

function handleExpenseSubmit(e) {
  e.preventDefault();
  const formData = new FormData(expenseForm);
  const expense = Object.fromEntries(formData.entries());
  expense.amount = parseFloat(expense.amount);

  const data = getData();

  if (currentEditIndex !== null) {
    data.expenses[currentEditIndex] = expense;
    currentEditIndex = null;
  } else {
    data.expenses.push(expense);
  }

  setData(data);
  expenseForm.reset();
  renderExpenses();
}

function renderExpenses() {
  const data = getData();
  let totalExpenses = 0;

  data.expenses.forEach((gasto) => {
    totalExpenses += gasto.amount || 0;
  });

  expensesTableBody.innerHTML = data.expenses
    .map(
      (e, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${formatDate(e.date)}</td>
      <td>${e.farm}</td>
      <td>${e.type}</td>
      <td>${e.description}</td>
      <td>${formatCurrency(e.amount)}</td>
      <td>${e.paymentMethod}</td>
      <td class="actions">
        <button class="icon-btn edit" onclick="editExpense(${i})" title="Editar">
            <i class="fa-classic fa-solid fa-pen-to-square fa-fw"></i>
        </button>
        <button class="icon-btn delete" onclick="deleteExpense(${i})" title="Eliminar">
            <i class="fa-classic fa-solid fa-trash fa-fw"></i>
        </button>
      </td>
    </tr>
  `
    )
    .join("");
  totalGastos.textContent = `Total Gastos: ${formatCurrency(totalExpenses)}`;
}

window.cancelExpenseForm = function () {
  currentEditIndex = null;
  expenseForm.reset();
};

// Necesario exponerlas al window para que funcionen los botones en HTML
window.editExpense = function (index) {
  const e = getData().expenses[index];
  Object.keys(e).forEach((k) => {
    if (expenseForm.elements[k]) {
      expenseForm.elements[k].value = e[k];
    }
  });
  currentEditIndex = index;
  document.getElementById("expenseForm").scrollIntoView({ behavior: "smooth" });
};

window.deleteExpense = function (index) {
  if (!confirm("¿Estás seguro que deseas eliminar este registro?")) return;

  const data = getData();
  data.expenses.splice(index, 1);
  setData(data);
  renderExpenses();
};
