// =============== CONFIGURACIÓN ===============
const API_URL = "http://127.0.0.1:8000";
let incidenciasData = [];
let cultivosData = [];
let plagasData = [];
let editingIncidenciaId = null;

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

// =============== MENSAJES ===============
function showMessage(message, type = 'success') {
    const messageEl = document.getElementById(type === 'success' ? 'successMessage' : 'errorMessage');
    messageEl.textContent = message;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 4000);
}

// =============== CARGAR DATOS INICIALES ===============
async function loadInitialData() {
    try {
        // Cargar cultivos
        const cultivosRes = await fetch(`${API_URL}/cultivos/`, {
            headers: getHeaders()
        });
        if (cultivosRes.ok) {
            cultivosData = await cultivosRes.json();
            populateCultivosSelect();
        }

        // Cargar plagas
        const plagasRes = await fetch(`${API_URL}/plagas/`, {
            headers: getHeaders()
        });
        if (plagasRes.ok) {
            plagasData = await plagasRes.json();
            populatePlagasSelect();
        }

        // Cargar incidencias
        await loadIncidencias();

    } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        showMessage('Error al cargar datos', 'error');
    }
}

// =============== POPULAR SELECTS ===============
function populateCultivosSelect() {
    const select = document.getElementById('cultivo_id');
    select.innerHTML = '<option value="">Selecciona un cultivo</option>';
    
    cultivosData.forEach(cultivo => {
        const option = document.createElement('option');
        option.value = cultivo.id;
        option.textContent = cultivo.nombre || `Cultivo #${cultivo.id}`;
        select.appendChild(option);
    });
}

function populatePlagasSelect() {
    const select = document.getElementById('plaga_id');
    select.innerHTML = '<option value="">Selecciona una plaga</option>';
    
    plagasData.forEach(plaga => {
        const option = document.createElement('option');
        option.value = plaga.id;
        option.textContent = plaga.nombre;
        select.appendChild(option);
    });
}

// =============== CARGAR INCIDENCIAS ===============
async function loadIncidencias() {
    try {
        const res = await fetch(`${API_URL}/incidencias/`, {
            headers: getHeaders()
        });

        if (!res.ok) {
            throw new Error('Error al cargar incidencias');
        }

        incidenciasData = await res.json();
        renderIncidencias(incidenciasData);

    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al cargar las incidencias', 'error');
        document.getElementById('incidenciasTableBody').innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <div class="icon">❌</div>
                        <p>Error al cargar datos</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

// =============== RENDERIZAR TABLA ===============
function renderIncidencias(incidencias) {
    const tbody = document.getElementById('incidenciasTableBody');
    
    if (incidencias.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <div class="icon">⚠️</div>
                        <p>No hay incidencias registradas</p>
                        <small>Haz clic en "Nueva Incidencia" para agregar una</small>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = incidencias.map(inc => {
        const fecha = new Date(inc.fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const cultivo = cultivosData.find(c => c.id === inc.cultivo_id);
        const plaga = plagasData.find(p => p.id === inc.plaga_id);
        
        const severidadClass = inc.severidad ? inc.severidad.toLowerCase() : 'media';
        
        return `
            <tr>
                <td><strong>#${inc.id}</strong></td>
                <td>${fecha}</td>
                <td>${cultivo ? cultivo.nombre : `Cultivo #${inc.cultivo_id}`}</td>
                <td>${plaga ? plaga.nombre : `Plaga #${inc.plaga_id}`}</td>
                <td>
                    <span class="severidad-badge ${severidadClass}">
                        ${inc.severidad || 'Media'}
                    </span>
                </td>
                <td>${inc.descripcion || '<em style="color: #94a3b8;">Sin descripción</em>'}</td>
                <td>
                    <div class="actions">
                        <button class="btn-edit" onclick="editIncidencia(${inc.id})">
                            ✏️ Editar
                        </button>
                        <button class="btn-delete" onclick="deleteIncidencia(${inc.id})">
                            🗑️ Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// =============== FILTROS ===============
document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('filterSeveridad').addEventListener('change', applyFilters);

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const severidadFilter = document.getElementById('filterSeveridad').value;
    
    let filtered = incidenciasData.filter(inc => {
        const matchesSearch = !searchTerm || 
            (inc.descripcion && inc.descripcion.toLowerCase().includes(searchTerm));
        
        const matchesSeveridad = !severidadFilter || inc.severidad === severidadFilter;
        
        return matchesSearch && matchesSeveridad;
    });
    
    renderIncidencias(filtered);
}

// =============== MODAL - ABRIR/CERRAR ===============
function openModal(isEdit = false) {
    const modal = document.getElementById('incidenciaModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (isEdit) {
        modalTitle.textContent = 'Editar Incidencia';
    } else {
        modalTitle.textContent = 'Nueva Incidencia';
        document.getElementById('incidenciaForm').reset();
        document.getElementById('incidenciaId').value = '';
        editingIncidenciaId = null;
    }
    
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('incidenciaModal');
    modal.classList.remove('active');
    document.getElementById('incidenciaForm').reset();
    editingIncidenciaId = null;
}

// Cerrar modal al hacer clic fuera
document.getElementById('incidenciaModal').addEventListener('click', (e) => {
    if (e.target.id === 'incidenciaModal') {
        closeModal();
    }
});

// =============== CREAR INCIDENCIA ===============
async function createIncidencia(data) {
    try {
        const res = await fetch(`${API_URL}/incidencias/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Error al crear incidencia');
        }

        showMessage('✅ Incidencia registrada exitosamente', 'success');
        closeModal();
        await loadIncidencias();

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'error');
    }
}

// =============== EDITAR INCIDENCIA ===============
function editIncidencia(id) {
    const incidencia = incidenciasData.find(i => i.id === id);
    
    if (!incidencia) {
        showMessage('Incidencia no encontrada', 'error');
        return;
    }

    editingIncidenciaId = id;
    document.getElementById('incidenciaId').value = id;
    document.getElementById('cultivo_id').value = incidencia.cultivo_id;
    document.getElementById('plaga_id').value = incidencia.plaga_id;
    document.getElementById('severidad').value = incidencia.severidad || '';
    document.getElementById('descripcion').value = incidencia.descripcion || '';
    
    openModal(true);
}

async function updateIncidencia(id, data) {
    try {
        const res = await fetch(`${API_URL}/incidencias/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Error al actualizar incidencia');
        }

        showMessage('✅ Incidencia actualizada exitosamente', 'success');
        closeModal();
        await loadIncidencias();

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'error');
    }
}

// =============== ELIMINAR INCIDENCIA ===============
async function deleteIncidencia(id) {
    if (!confirm('¿Estás seguro de eliminar esta incidencia?\n\nEsta acción no se puede deshacer.')) {
        return;
    }

    try {
        const res = await fetch(`${API_URL}/incidencias/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Error al eliminar incidencia');
        }

        showMessage('✅ Incidencia eliminada exitosamente', 'success');
        await loadIncidencias();

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'error');
    }
}

// =============== EXPORTAR CSV ===============
async function exportCSV() {
    try {
        const res = await fetch(`${API_URL}/incidencias/export/csv`, {
            headers: getHeaders()
        });
        
        if (!res.ok) {
            throw new Error('Error al exportar datos');
        }
        
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `incidencias_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        
        showMessage('✅ CSV exportado exitosamente', 'success');
    } catch (error) {
        console.error('Error exportando CSV:', error);
        showMessage('Error al exportar el archivo', 'error');
    }
}

// =============== SUBMIT FORM ===============
document.getElementById('incidenciaForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        cultivo_id: parseInt(document.getElementById('cultivo_id').value),
        plaga_id: parseInt(document.getElementById('plaga_id').value),
        severidad: document.getElementById('severidad').value || null,
        descripcion: document.getElementById('descripcion').value.trim() || null
    };

    // Validación
    if (!data.cultivo_id) {
        showMessage('Debes seleccionar un cultivo', 'error');
        return;
    }

    if (!data.plaga_id) {
        showMessage('Debes seleccionar una plaga', 'error');
        return;
    }

    if (data.descripcion && data.descripcion.length > 400) {
        showMessage('La descripción no puede exceder 400 caracteres', 'error');
        return;
    }

    const incidenciaId = document.getElementById('incidenciaId').value;

    if (incidenciaId) {
        // Actualizar
        await updateIncidencia(parseInt(incidenciaId), data);
    } else {
        // Crear
        await createIncidencia(data);
    }
});

// =============== INICIALIZAR ===============
document.addEventListener('DOMContentLoaded', () => {
    loadInitialData();
});