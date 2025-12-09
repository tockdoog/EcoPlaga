document.getElementById("formPlaga").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    nombre: form.nombre.value,
    descripcion: form.descripcion.value,
    severidad: form.severidad.value
  };
  try {
    const res = await fetch("http://127.0.0.1:8000/plagas/", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(data)
    });
    const json = await res.json();
    alert("Plaga creada: " + json.nombre);
    loadPlagas();
  } catch (err) { alert("Error: " + err.message); }
});

async function loadPlagas(){
  const res = await fetch("http://127.0.0.1:8000/plagas/");
  const list = await res.json();
  const ul = document.getElementById("listaPlagas");
  ul.innerHTML = "";
  for (const p of list) {
    const li = document.createElement("li");
    li.textContent = `${p.id} - ${p.nombre} (${p.severidad || "-"})`;
    ul.appendChild(li);
  }
}

loadPlagas();
