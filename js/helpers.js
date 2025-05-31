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

// Calcula diferencia de días entre dos fechas
export function diffDays(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
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
