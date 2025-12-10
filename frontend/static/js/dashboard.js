// =============== CONFIGURACIÓN ===============
const API_URL = "http://127.0.0.1:8000";

// Obtener token del localStorage
function getToken() {
    return localStorage.getItem("token");
}

// Headers con autenticación
function getHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    };
}

// =============== CARGAR DATOS DEL USUARIO ===============
async function loadUserInfo() {
    try {
        // Decodificar el token JWT para obtener el user_id
        const token = getToken();
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub;

        // Obtener información del usuario
        const res = await fetch(`${API_URL}/users/${userId}`, {
            headers: getHeaders()
        });

        if (res.ok) {
            const user = await res.json();
            document.getElementById("userName").textContent = user.name || user.email;
        } else {
            document.getElementById("userName").textContent = "Usuario";
        }
    } catch (error) {
        console.error("Error cargando usuario:", error);
        document.getElementById("userName").textContent = "Usuario";
    }
}

// =============== CARGAR ESTADÍSTICAS ===============
async function loadStats() {
    try {
        // Cargar cultivos
        const cultivosRes = await fetch(`${API_URL}/cultivos/`, {
            headers: getHeaders()
        });
        if (cultivosRes.ok) {
            const cultivos = await cultivosRes.json();
            document.getElementById("totalCultivos").textContent = cultivos.length;
        }

        // Cargar plagas
        const plagasRes = await fetch(`${API_URL}/plagas/`, {
            headers: getHeaders()
        });
        if (plagasRes.ok) {
            const plagas = await plagasRes.json();
            document.getElementById("totalPlagas").textContent = plagas.length;
        }

        // Cargar incidencias
        const incidenciasRes = await fetch(`${API_URL}/incidencias/`, {
            headers: getHeaders()
        });
        if (incidenciasRes.ok) {
            const incidencias = await incidenciasRes.json();
            document.getElementById("totalIncidencias").textContent = incidencias.length;
            
            // Mostrar incidencias recientes
            displayIncidencias(incidencias);
        }

        // Cargar tratamientos
        const tratamientosRes = await fetch(`${API_URL}/tratamientos/`, {
            headers: getHeaders()
        });
        if (tratamientosRes.ok) {
            const tratamientos = await tratamientosRes.json();
            document.getElementById("totalTratamientos").textContent = tratamientos.length;
        }

    } catch (error) {
        console.error("Error cargando estadísticas:", error);
    }
}

// =============== MOSTRAR INCIDENCIAS RECIENTES ===============
function displayIncidencias(incidencias) {
    const container = document.getElementById("incidenciasChart");
    
    if (incidencias.length === 0) {
        container.innerHTML = '<p style="color: #94a3b8;">No hay incidencias registradas</p>';
        return;
    }

    // Tomar las últimas 5 incidencias
    const recientes = incidencias.slice(-5).reverse();
    
    let html = '<div class="incidencias-list">';
    recientes.forEach(inc => {
        const fecha = new Date(inc.fecha_deteccion).toLocaleDateString('es-ES');
        const severidadColor = getSeveridadColor(inc.nivel_severidad);
        
        html += `
            <div class="incidencia-item">
                <div class="incidencia-info">
                    <strong>${inc.nombre_plaga || 'Plaga desconocida'}</strong>
                    <span class="fecha">${fecha}</span>
                </div>
                <span class="severidad" style="background: ${severidadColor}">
                    ${inc.nivel_severidad || 'Media'}
                </span>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// =============== COLORES SEGÚN SEVERIDAD ===============
function getSeveridadColor(severidad) {
    const colores = {
        'Baja': '#10b981',
        'Media': '#f59e0b',
        'Alta': '#ef4444',
        'Crítica': '#991b1b'
    };
    return colores[severidad] || '#64748b';
}

// =============== MOSTRAR PLAGAS MÁS FRECUENTES ===============
async function loadPlagasFrecuentes() {
    try {
        const incidenciasRes = await fetch(`${API_URL}/incidencias/`, {
            headers: getHeaders()
        });
        
        if (!incidenciasRes.ok) return;
        
        const incidencias = await incidenciasRes.json();
        const container = document.getElementById("plagasChart");
        
        if (incidencias.length === 0) {
            container.innerHTML = '<p style="color: #94a3b8;">No hay datos disponibles</p>';
            return;
        }

        // Contar frecuencia de plagas
        const frecuencia = {};
        incidencias.forEach(inc => {
            const plaga = inc.nombre_plaga || 'Desconocida';
            frecuencia[plaga] = (frecuencia[plaga] || 0) + 1;
        });

        // Ordenar por frecuencia
        const plagasOrdenadas = Object.entries(frecuencia)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Mostrar lista
        let html = '<div class="plagas-list">';
        plagasOrdenadas.forEach(([plaga, count]) => {
            const porcentaje = (count / incidencias.length * 100).toFixed(1);
            html += `
                <div class="plaga-item">
                    <div class="plaga-info">
                        <strong>${plaga}</strong>
                        <span>${count} incidencias</span>
                    </div>
                    <div class="plaga-bar">
                        <div class="plaga-bar-fill" style="width: ${porcentaje}%"></div>
                    </div>
                    <span class="porcentaje">${porcentaje}%</span>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;

    } catch (error) {
        console.error("Error cargando plagas frecuentes:", error);
    }
}

// =============== EXPORTAR CSV ===============
document.getElementById("exportBtn").addEventListener("click", async () => {
    try {
        const res = await fetch(`${API_URL}/incidencias/export/csv`, {
            headers: getHeaders()
        });
        
        if (!res.ok) {
            alert("Error al exportar datos");
            return;
        }
        
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `incidencias_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        
        alert("¡CSV exportado exitosamente!");
    } catch (error) {
        console.error("Error exportando CSV:", error);
        alert("Error al exportar el archivo");
    }
});

// =============== INICIALIZAR DASHBOARD ===============
document.addEventListener("DOMContentLoaded", () => {
    loadUserInfo();
    loadStats();
    loadPlagasFrecuentes();
});

// =============== ESTILOS ADICIONALES PARA LISTAS ===============
const styles = document.createElement('style');
styles.textContent = `
    .incidencias-list, .plagas-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .incidencia-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: #f8fafc;
        border-radius: 8px;
        border-left: 3px solid #4a7c23;
    }

    .incidencia-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .incidencia-info strong {
        color: #1e293b;
        font-size: 0.95em;
    }

    .fecha {
        color: #64748b;
        font-size: 0.8em;
    }

    .severidad {
        padding: 4px 12px;
        border-radius: 12px;
        color: white;
        font-size: 0.75em;
        font-weight: 600;
    }

    .plaga-item {
        display: grid;
        grid-template-columns: 1fr 2fr auto;
        align-items: center;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid #e2e8f0;
    }

    .plaga-item:last-child {
        border-bottom: none;
    }

    .plaga-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .plaga-info strong {
        color: #1e293b;
        font-size: 0.9em;
    }

    .plaga-info span {
        color: #64748b;
        font-size: 0.75em;
    }

    .plaga-bar {
        height: 8px;
        background: #e2e8f0;
        border-radius: 4px;
        overflow: hidden;
    }

    .plaga-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #4a7c23 0%, #6b9e3e 100%);
        transition: width 0.5s ease;
    }

    .porcentaje {
        color: #4a7c23;
        font-weight: 600;
        font-size: 0.85em;
        min-width: 50px;
        text-align: right;
    }
`;
document.head.appendChild(styles);