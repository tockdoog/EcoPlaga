document.getElementById("export").addEventListener("click", async () => {
  const res = await fetch("http://127.0.0.1:8000/incidencias/export/csv");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "incidencias.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
});

async function loadStats(){
  const div = document.getElementById("stats");
  try {
    const res = await fetch("http://127.0.0.1:8000/incidencias/");
    const list = await res.json();
    div.innerHTML = `<strong>Total incidencias:</strong> ${list.length}`;
  } catch (e) {
    div.innerHTML = "Error cargando estadísticas";
  }
}
loadStats();
