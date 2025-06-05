import { getData } from "./storage.js";
import { formatCurrency, diffDays } from "./helpers.js";

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
  let margenGanancia = 0;
  let totalGrossProfitSold = 0;
  let totalPurchaseOnFarm = 0;
  let totalDaysOnFarm = 0;
  let averageGainKgDay = 0;
  let averageSalePrice = 0;
  let estimatedProfitOnFarm = 0;

  animals.forEach((animal) => {
    const isHalf = animal.propiedad === "A medias";
    const comision = animal.precioVenta * animal.pesoVenta * 0.03 || 0;
    const totalCompra = animal.pesoCompra * animal.precioCompra;
    const totalVenta =
      animal.pesoVenta * animal.precioVenta - animal.transporte - comision;
    const rawGananciaBruta = totalVenta - totalCompra;
    const gananciaBruta =
      animal.estado === "Vendido" || animal.estado === "Muerto"
        ? isHalf && rawGananciaBruta > 0
          ? rawGananciaBruta / 2
          : rawGananciaBruta
        : 0;
    const gananciaBrutaVendidos =
      animal.estado === "Vendido"
        ? isHalf && rawGananciaBruta > 0
          ? rawGananciaBruta / 2
          : rawGananciaBruta
        : 0;

    const diasFinca = diffDays(
      animal.fechaCompra,
      animal.fechaVenta || new Date()
    );

    totalPurchase += totalCompra;
    totalCommission += comision || 0;
    totalTransport += animal.transporte || 0;
    totalSales += totalVenta || 0;
    totalGrossProfit += gananciaBruta || 0;
    totalGrossProfitSold += gananciaBrutaVendidos || 0;

    if (animal.estado === "Vendido") {
      countSold++;
      totalDays += diasFinca || 0;
      totalWeightGain += animal.pesoVenta - animal.pesoCompra || 0;
      totalPurchaseWeight += animal.pesoCompra || 0;
      totalSaleWeight += animal.pesoVenta || 0;
      totalPurchasePrice += animal.precioCompra || 0;
      totalSalePrice += animal.precioVenta || 0;
      margenGanancia +=
        totalCompra > 0 ? ((totalVenta - totalCompra) / totalCompra) * 100 : 0;
    }
    if (animal.estado === "En Finca") {
      totalPurchaseOnFarm += totalCompra;
      totalDaysOnFarm += isHalf ? diasFinca / 2 : diasFinca;
    }
  });

  expenses.forEach((gasto) => {
    totalExpenses += gasto.amount || 0;
  });

  totalNetProfit = totalGrossProfit - totalExpenses;
  averageGainKgDay =
    totalDays > 0 ? (totalWeightGain / totalDays).toFixed(2) : 0;
  averageSalePrice = countSold > 0 ? totalSalePrice / countSold : 0;
  estimatedProfitOnFarm = totalDaysOnFarm * averageGainKgDay * averageSalePrice;

  const summaryValues = {
    "Ganancia Neta": formatCurrency(totalNetProfit),
    "Inversión en Ganado": formatCurrency(totalPurchase),
    "Total de Gastos": formatCurrency(totalExpenses),
    "Total de Ventas": formatCurrency(totalSales),
    "Ganancia Bruta": formatCurrency(totalGrossProfit),
    "Comisiones (3%)": formatCurrency(totalCommission),
    Transporte: formatCurrency(totalTransport),
    "Margen de Ganancia": `${(margenGanancia / countSold).toFixed(2)}%`,
    "Días Promedio en Finca":
      countSold > 0 ? (totalDays / countSold).toFixed(0) : 0,
    "Promedio de Ganancia Kg/Día": `${averageGainKgDay} kg`,
    "Promedio Precio Compra": formatCurrency(
      countSold > 0 ? totalPurchasePrice / countSold : 0
    ),
    "Promedio Precio Venta": formatCurrency(averageSalePrice),
    "Promedio Peso Compra": `${
      countSold > 0 ? (totalPurchaseWeight / countSold).toFixed(0) : 0
    } kg`,
    "Promedio Peso Venta": `${
      countSold > 0 ? (totalSaleWeight / countSold).toFixed(0) : 0
    } kg`,
    "Ganancia Precio/Día": formatCurrency(
      totalDays > 0 ? totalGrossProfitSold / totalDays : 0
    ),
    "Ganancia por animal": formatCurrency(
      countSold > 0 ? totalGrossProfitSold / countSold : 0
    ),
    "Inversión en Ganado en Finca": formatCurrency(totalPurchaseOnFarm),
    "Ganancia Proyectada en Finca": formatCurrency(estimatedProfitOnFarm),
    "Total Proyectado en Finca": formatCurrency(
      totalPurchaseOnFarm + estimatedProfitOnFarm
    ),
  };

  const container = document.getElementById("summaryCards");
  container.innerHTML = "";

  summary.forEach((item) => {
    const card = document.createElement("div");
    card.className = "summary-card";
    if (item.concept === "Total Proyectado en Finca") card.classList.add("important");
    if (item.concept === "Inversión en Ganado") card.classList.add("important");

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
