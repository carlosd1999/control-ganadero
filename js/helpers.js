// Genera un ID único para objetos (animales, gastos)
export function generateId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

// Formatea una fecha YYYY-MM-DD a DD/MM/YYYY
export function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

// Calcula diferencia de días entre dos fechas (ignora horas)
export function diffDays(start, end) {
  const startDate = parseLocalDate(start);
  const endDate = parseLocalDate(end);

  // Fuerza ambas fechas a medianoche (00:00:00)
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const diff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

// Formatea un número como moneda (₡1.234.567,89)
export function formatCurrency(value) {
  return value.toLocaleString("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
  });
}

function parseLocalDate(date) {
  if (date instanceof Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day); // medianoche local
}
