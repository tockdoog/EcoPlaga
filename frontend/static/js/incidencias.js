document.getElementById("formIncidencia").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const payload = {
    cultivo_id: Number(f.cultivo_id.value),
    plaga_id: Number(f.plaga_id.value),
    descripcion: f.descripcion.value,
    gravedad: parseFloat(f.gravedad.value || "0")
  };
  try {
    const r = await fetch("http://127.0.0.1:8000/incidencias/", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    alert("Incidencia registrada: " + data.id);
    loadIncidencias();
  } catch (e) { alert("Error " + e.message); }
});

async function loadIncidencias(){
  const r = await fetch("http://127.0.0.1:8000/incidencias/");
  const list = await r.json();
  const ul = document.getElementById("listaIncidencias");
  ul.innerHTML = "";
  list.forEach(i => {
    const li = document.createElement("li");
    li.textContent = `${i.id} - cultivo:${i.cultivo_id} plaga:${i.plaga_id} gravedad:${i.gravedad}`;
    ul.appendChild(li);
  });
}

loadIncidencias();
