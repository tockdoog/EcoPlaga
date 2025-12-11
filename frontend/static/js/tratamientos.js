// =============== CONFIGURACIÓN ===============
const API_URL = "http://127.0.0.1:8000";
let tratamientosData = [];
let plagasData = [];
let editingTratamientoId = null;

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
        // Verificar que hay token
        if (!getToken()) {
            window.location.href = "/login";
            return;
        }

        // Cargar plagas
        const plagasRes = await fetch(`${API_URL}/plagas/`, {
            headers: getHeaders()
        });
        
        if (plagasRes.status === 401) {
            window.location.href = "/login";
            return;
        }
        
        if (plagasRes.ok) {
            plagasData = await plagasRes.json();
            populatePlagasSelect();
            populateFilterPlaga();
        }

        // Cargar tratamientos
        await loadTratamientos();

    } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        showMessage('Error al cargar datos', 'error');
    }
}

// =============== POPULAR SELECTS ===============
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

function populateFilterPlaga() {
    const select = document.getElementById('filterPlaga');
    select.innerHTML = '<option value="">Todas las plagas</option>';
    
    plagasData.forEach(plaga => {
        const option = document.createElement('option');
        option.value = plaga.id;
        option.textContent = plaga.nombre;
        select.appendChild(option);
    });
}

// =============== CARGAR TRATAMIENTOS ===============
async function loadTratamientos() {
    try {
        const res = await fetch(`${API_URL}/tratamientos/`, {
            headers: getHeaders()
        });

        if (res.status === 401) {
            window.location.href = "/login";
            return;
        }

        if (!res.ok) {
            throw new Error('Error al cargar tratamientos');
        }

        tratamientosData = await res.json();
        renderTratamientos(tratamientosData);

    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al cargar los tratamientos', 'error');
        document.getElementById('tratamientosTableBody').innerHTML = `
            <tr>
                <td colspan="5">
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
function renderTratamientos(tratamientos) {
    const tbody = document.getElementById('tratamientosTableBody');
    
    if (tratamientos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <div class="icon">💊</div>
                        <p>No hay tratamientos registrados</p>
                        <small>Haz clic en "Nuevo Tratamiento" para agregar uno</small>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = tratamientos.map(trat => {
        const fecha = new Date(trat.fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const plaga = plagasData.find(p => p.id === trat.plaga_id);
        
        return `
            <tr>
                <td><strong>#${trat.id}</strong></td>
                <td>${fecha}</td>
                <td>${plaga ? plaga.nombre : `Plaga #${trat.plaga_id}`}</td>
                <td>${trat.descripcion || '<em style="color: #94a3b8;">Sin descripción</em>'}</td>
                <td>
                    <div class="actions">
                        <button class="btn-edit" onclick="editTratamiento(${trat.id})">
                            ✏️ Editar
                        </button>
                        <button class="btn-delete" onclick="deleteTratamiento(${trat.id})">
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
document.getElementById('filterPlaga').addEventListener('change', applyFilters);

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const plagaFilter = document.getElementById('filterPlaga').value;
    
    let filtered = tratamientosData.filter(trat => {
        const matchesSearch = !searchTerm || 
            (trat.descripcion && trat.descripcion.toLowerCase().includes(searchTerm));
        
        const matchesPlaga = !plagaFilter || trat.plaga_id === parseInt(plagaFilter);
        
        return matchesSearch && matchesPlaga;
    });
    
    renderTratamientos(filtered);
}

// =============== MODAL - ABRIR/CERRAR ===============
function openModal(isEdit = false) {
    const modal = document.getElementById('tratamientoModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (isEdit) {
        modalTitle.textContent = 'Editar Tratamiento';
    } else {
        modalTitle.textContent = 'Nuevo Tratamiento';
        document.getElementById('tratamientoForm').reset();
        document.getElementById('tratamientoId').value = '';
        editingTratamientoId = null;
    }
    
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('tratamientoModal');
    modal.classList.remove('active');
    document.getElementById('tratamientoForm').reset();
    editingTratamientoId = null;
}

// Cerrar modal al hacer clic fuera
document.getElementById('tratamientoModal').addEventListener('click', (e) => {
    if (e.target.id === 'tratamientoModal') {
        closeModal();
    }
});

// =============== CREAR TRATAMIENTO ===============
async function createTratamiento(data) {
    try {
        const res = await fetch(`${API_URL}/tratamientos/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Error al crear tratamiento');
        }

        showMessage('✅ Tratamiento registrado exitosamente', 'success');
        closeModal();
        await loadTratamientos();

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'error');
    }
}

// =============== EDITAR TRATAMIENTO ===============
function editTratamiento(id) {
    const tratamiento = tratamientosData.find(t => t.id === id);
    
    if (!tratamiento) {
        showMessage('Tratamiento no encontrado', 'error');
        return;
    }

    editingTratamientoId = id;
    document.getElementById('tratamientoId').value = id;
    document.getElementById('plaga_id').value = tratamiento.plaga_id;
    document.getElementById('descripcion').value = tratamiento.descripcion || '';
    
    openModal(true);
}

async function updateTratamiento(id, data) {
    try {
        const res = await fetch(`${API_URL}/tratamientos/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Error al actualizar tratamiento');
        }

        showMessage('✅ Tratamiento actualizado exitosamente', 'success');
        closeModal();
        await loadTratamientos();

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'error');
    }
}

// =============== ELIMINAR TRATAMIENTO ===============
async function deleteTratamiento(id) {
    if (!confirm('¿Estás seguro de eliminar este tratamiento?\n\nEsta acción no se puede deshacer.')) {
        return;
    }

    try {
        const res = await fetch(`${API_URL}/tratamientos/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Error al eliminar tratamiento');
        }

        showMessage('✅ Tratamiento eliminado exitosamente', 'success');
        await loadTratamientos();

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'error');
    }
}

// =============== SUBMIT FORM ===============
document.getElementById('tratamientoForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        plaga_id: parseInt(document.getElementById('plaga_id').value),
        descripcion: document.getElementById('descripcion').value.trim()
    };

    // Validación
    if (!data.plaga_id) {
        showMessage('Debes seleccionar una plaga', 'error');
        return;
    }

    if (!data.descripcion) {
        showMessage('La descripción del tratamiento es obligatoria', 'error');
        return;
    }

    if (data.descripcion.length > 500) {
        showMessage('La descripción no puede exceder 500 caracteres', 'error');
        return;
    }

    const tratamientoId = document.getElementById('tratamientoId').value;

    if (tratamientoId) {
        // Actualizar
        await updateTratamiento(parseInt(tratamientoId), data);
    } else {
        // Crear
        await createTratamiento(data);
    }
});

// =============== INICIALIZAR ===============
document.addEventListener('DOMContentLoaded', () => {
    loadInitialData();
});