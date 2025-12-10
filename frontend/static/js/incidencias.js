const API_URL = "http://127.0.0.1:8000/incidencias"; // Ajusta la ruta según tu backend

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formIncidencia");
    const tablaBody = document.querySelector("#tablaIncidencias tbody");

    // Función para listar incidencias
    async function listarIncidencias() {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            tablaBody.innerHTML = "";

            data.forEach(incidencia => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${incidencia.id}</td>
                    <td>${incidencia.cultivo_id}</td>
                    <td>${incidencia.plaga_id}</td>
                    <td>${incidencia.descripcion || ""}</td>
                    <td>${incidencia.severidad || ""}</td>
                    <td>${new Date(incidencia.fecha).toLocaleString()}</td>
                `;
                tablaBody.appendChild(fila);
            });
        } catch (error) {
            console.error("Error al listar incidencias:", error);
        }
    }

    // Crear nueva incidencia
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = {
            cultivo_id: Number(form.cultivo_id.value),
            plaga_id: Number(form.plaga_id.value),
            descripcion: form.descripcion.value,
            severidad: form.severidad.value
        };

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                form.reset();
                listarIncidencias();
            } else {
                console.error("Error al crear incidencia");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });

    // Cargar incidencias al inicio
    listarIncidencias();
});
