const STORAGE_KEY = "cattleData";

// Cargar datos desde localStorage o template.json si no existe
export async function initializeStorage() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const res = await fetch("./data/template.json");
    const data = await res.json();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

// Obtener los datos actuales
export function getData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

// Guardar datos nuevos
export function setData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Exportar como archivo JSON
export function exportData() {
  const data = getData();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `control-ganadero-${date + "_" + time}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Importar JSON (se espera un archivo de entrada)
export function importData(file, callback) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      setData(imported);
      callback(true);
    } catch (e) {
      console.error("Error parsing JSON:", e);
      callback(false);
    }
  };
  reader.readAsText(file);
}
