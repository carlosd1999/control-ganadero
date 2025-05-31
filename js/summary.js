import { getData } from "./storage.js";
import { formatCurrency } from "./helpers.js";

export function renderSummary() {
  const data = getData();
  const { animals, expenses, summary } = data;

  let totalPurchase = 0;
  let totalExpenses = 0;
  let totalSales = 0;
  let totalCommission = 0;
  let totalTransport = 0;
  let totalGrossProfit = 0;
  let totalNetProfit = 0;
  let totalDays = 0;
  let totalWeightGain = 0;
  let totalPurchaseWeight = 0;
  let totalSaleWeight = 0;
  let totalPurchasePrice = 0;
  let totalSalePrice = 0;
  let countSold = 0;

  animals.forEach((animal) => {
    const isHalf = animal.ownership === "Medias";
    const factor = isHalf ? 0.5 : 1;

    totalPurchase += animal.totalCompra * factor || 0;
    totalCommission += animal.comision * factor || 0;
    totalTransport += animal.transporte * factor || 0;
    totalSales += animal.totalVenta * factor || 0;
    totalGrossProfit += animal.gananciaBruta * factor || 0;

    if (animal.estado === "Vendido") {
      countSold++;
      totalDays += animal.diasFinca || 0;
      totalWeightGain += animal.pesoVenta - animal.pesoCompra || 0;
      totalPurchaseWeight += animal.pesoCompra || 0;
      totalSaleWeight += animal.pesoVenta || 0;
      totalPurchasePrice += animal.precioCompra || 0;
      totalSalePrice += animal.precioVenta || 0;
    }
  });

  expenses.forEach((gasto) => {
    totalExpenses += gasto.amount || 0;
  });

  totalNetProfit = totalGrossProfit - totalExpenses;

  const summaryValues = {
    "Inversión en Ganado": formatCurrency(totalPurchase),
    "Total de Gastos": formatCurrency(totalExpenses),
    "Total de Ventas": formatCurrency(totalSales),
    "Comisiones (3%)": formatCurrency(totalCommission),
    Transporte: formatCurrency(totalTransport),
    "Ganancia Bruta": formatCurrency(totalGrossProfit),
    "Ganancia Neta": formatCurrency(totalNetProfit),
    "Margen de Ganancia": `${
      totalPurchase > 0
        ? ((totalNetProfit / totalPurchase) * 100).toFixed(2)
        : 0
    }%`,
    "Días Promedio en Finca": countSold > 0 ? totalDays / countSold : 0,
    "Promedio de Ganancia Kg/Día":
      totalDays > 0 ? (totalWeightGain / totalDays).toFixed(2) : 0,
    "Promedio Precio Compra": formatCurrency(
      countSold > 0 ? totalPurchasePrice / countSold : 0
    ),
    "Promedio Precio Venta": formatCurrency(
      countSold > 0 ? totalSalePrice / countSold : 0
    ),
    "Promedio Peso Compra": countSold > 0 ? totalPurchaseWeight / countSold : 0,
    "Promedio Peso Venta": formatCurrency(
      countSold > 0 ? totalSaleWeight / countSold : 0
    ),
    "Ganancia Precio/Día": formatCurrency(
      totalDays > 0 ? totalNetProfit / totalDays : 0
    ),
    "Ganancia por animal": formatCurrency(
      countSold > 0 ? totalNetProfit / countSold : 0
    ),
  };

  const container = document.getElementById("summaryCards");
  container.innerHTML = "";

  summary.forEach((item) => {
    const card = document.createElement("div");
    card.className = "summary-card";
    if (item.concept === "Ganancia Neta") card.classList.add("important");

    const monto = summaryValues[item.concept] ?? 0;
    item.amount = monto;

    card.innerHTML = `
      <div class="summary-title">${item.concept}</div>
      <div class="summary-amount">${monto}</div>
      <div class="summary-note">${item.note}</div>
    `;
    container.appendChild(card);
  });
}
