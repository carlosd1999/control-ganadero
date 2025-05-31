import { getData, setData } from "./storage.js";
import { formatDate } from "./helpers.js";

const expenseForm = document.getElementById("expenseForm");
const expensesTableBody = document.querySelector("#expensesTable tbody");

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
  expensesTableBody.innerHTML = data.expenses
    .map(
      (e, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${formatDate(e.date)}</td>
      <td>${e.farm}</td>
      <td>${e.type}</td>
      <td>${e.description}</td>
      <td>₡${e.amount.toLocaleString("es-CR", {
        minimumFractionDigits: 2,
      })}</td>
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
}

// Necesario exponerlas al window para que funcionen los botones en HTML
window.editExpense = function (index) {
  const e = getData().expenses[index];
  Object.keys(e).forEach((k) => {
    if (expenseForm.elements[k]) {
      expenseForm.elements[k].value = e[k];
    }
  });
  currentEditIndex = index;
};

window.deleteExpense = function (index) {
  if (!confirm("¿Estás seguro que deseas eliminar este registro?")) return;

  const data = getData();
  data.expenses.splice(index, 1);
  setData(data);
  renderExpenses();
};
