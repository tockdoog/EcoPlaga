// =============== CONFIGURACIÓN ===============
const API_URL = "http://127.0.0.1:8000";
let plagasData = [];
let editingPlagaId = null;

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

// =============== CARGAR PLAGAS ===============
async function loadPlagas() {
    try {
        const res = await fetch(`${API_URL}/plagas/`, {
            headers: getHeaders()
        });

        if (!res.ok) {
            throw new Error('Error al cargar plagas');
        }

        plagasData = await res.json();
        renderPlagas(plagasData);

    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al cargar las plagas', 'error');
        document.getElementById('plagasTableBody').innerHTML = `
            <tr>
                <td colspan="4">
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
function renderPlagas(plagas) {
    const tbody = document.getElementById('plagasTableBody');
    
    if (plagas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        <div class="icon">🐛</div>
                        <p>No hay plagas registradas</p>
                        <small>Haz clic en "Nueva Plaga" para agregar una</small>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = plagas.map(plaga => `
        <tr>
            <td><strong>#${plaga.id}</strong></td>
            <td><strong>${plaga.nombre}</strong></td>
            <td>${plaga.descripcion || '<em style="color: #94a3b8;">Sin descripción</em>'}</td>
            <td>
                <div class="actions">
                    <button class="btn-edit" onclick="editPlaga(${plaga.id})">
                        ✏️ Editar
                    </button>
                    <button class="btn-delete" onclick="deletePlaga(${plaga.id}, '${plaga.nombre.replace(/'/g, "\\'")}')">
                        🗑️ Eliminar
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// =============== BÚSQUEDA EN TIEMPO REAL ===============
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredPlagas = plagasData.filter(plaga => 
        plaga.nombre.toLowerCase().includes(searchTerm) ||
        (plaga.descripcion && plaga.descripcion.toLowerCase().includes(searchTerm))
    );
    renderPlagas(filteredPlagas);
});

// =============== MODAL - ABRIR/CERRAR ===============
function openModal(isEdit = false) {
    const modal = document.getElementById('plagaModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (isEdit) {
        modalTitle.textContent = 'Editar Plaga';
    } else {
        modalTitle.textContent = 'Nueva Plaga';
        document.getElementById('plagaForm').reset();
        document.getElementById('plagaId').value = '';
        editingPlagaId = null;
    }
    
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('plagaModal');
    modal.classList.remove('active');
    document.getElementById('plagaForm').reset();
    editingPlagaId = null;
}

// Cerrar modal al hacer clic fuera
document.getElementById('plagaModal').addEventListener('click', (e) => {
    if (e.target.id === 'plagaModal') {
        closeModal();
    }
});

// =============== CREAR PLAGA ===============
async function createPlaga(data) {
    try {
        const res = await fetch(`${API_URL}/plagas/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Error al crear plaga');
        }

        showMessage('✅ Plaga creada exitosamente', 'success');
        closeModal();
        await loadPlagas();

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'error');
    }
}

// =============== EDITAR PLAGA ===============
function editPlaga(id) {
    const plaga = plagasData.find(p => p.id === id);
    
    if (!plaga) {
        showMessage('Plaga no encontrada', 'error');
        return;
    }

    editingPlagaId = id;
    document.getElementById('plagaId').value = id;
    document.getElementById('nombre').value = plaga.nombre;
    document.getElementById('descripcion').value = plaga.descripcion || '';
    
    openModal(true);
}

async function updatePlaga(id, data) {
    try {
        const res = await fetch(`${API_URL}/plagas/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Error al actualizar plaga');
        }

        showMessage('✅ Plaga actualizada exitosamente', 'success');
        closeModal();
        await loadPlagas();

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'error');
    }
}

// =============== ELIMINAR PLAGA ===============
async function deletePlaga(id, nombre) {
    if (!confirm(`¿Estás seguro de eliminar la plaga "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
        return;
    }

    try {
        const res = await fetch(`${API_URL}/plagas/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Error al eliminar plaga');
        }

        showMessage('✅ Plaga eliminada exitosamente', 'success');
        await loadPlagas();

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'error');
    }
}

// =============== SUBMIT FORM ===============
document.getElementById('plagaForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        nombre: document.getElementById('nombre').value.trim(),
        descripcion: document.getElementById('descripcion').value.trim() || null
    };

    // Validación
    if (!data.nombre) {
        showMessage('El nombre de la plaga es obligatorio', 'error');
        return;
    }

    if (data.nombre.length > 150) {
        showMessage('El nombre no puede exceder 150 caracteres', 'error');
        return;
    }

    if (data.descripcion && data.descripcion.length > 400) {
        showMessage('La descripción no puede exceder 400 caracteres', 'error');
        return;
    }

    const plagaId = document.getElementById('plagaId').value;

    if (plagaId) {
        // Actualizar
        await updatePlaga(parseInt(plagaId), data);
    } else {
        // Crear
        await createPlaga(data);
    }
});

// =============== INICIALIZAR ===============
document.addEventListener('DOMContentLoaded', () => {
    loadPlagas();
});