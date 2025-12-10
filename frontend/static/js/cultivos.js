// =============== CONFIGURACIÓN ===============
const API_URL = "http://127.0.0.1:8000";
let cultivosData = [];
let editingCultivoId = null;

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

// =============== CARGAR CULTIVOS ===============
async function loadCultivos() {
    try {
        const res = await fetch(`${API_URL}/cultivos/`, {
            headers: getHeaders()
        });

        if (!res.ok) {
            throw new Error('Error al cargar cultivos');
        }

        cultivosData = await res.json();
        renderCultivos(cultivosData);

    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al cargar los cultivos', 'error');
        document.getElementById('cultivosTableBody').innerHTML = `
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
function renderCultivos(cultivos) {
    const tbody = document.getElementById('cultivosTableBody');
    
    if (cultivos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        <div class="icon">🌾</div>
                        <p>No hay cultivos registrados</p>
                        <small>Haz clic en "Nuevo Cultivo" para agregar uno</small>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = cultivos.map(cultivo => `
        <tr>
            <td><strong>#${cultivo.id}</strong></td>
            <td><strong>${cultivo.nombre}</strong></td>
            <td>
                ${cultivo.tipo ? `<span class="tipo-badge">${cultivo.tipo}</span>` : '<em style="color: #94a3b8;">Sin tipo</em>'}
            </td>
            <td>
                <div class="actions">
                    <button class="btn-edit" onclick="editCultivo(${cultivo.id})">
                        ✏️ Editar
                    </button>
                    <button class="btn-delete" onclick="deleteCultivo(${cultivo.id}, '${cultivo.nombre.replace(/'/g, "\\'")}')">
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
    const filteredCultivos = cultivosData.filter(cultivo => 
        cultivo.nombre.toLowerCase().includes(searchTerm) ||
        (cultivo.tipo && cultivo.tipo.toLowerCase().includes(searchTerm))
    );
    renderCultivos(filteredCultivos);
});

// =============== MODAL - ABRIR/CERRAR ===============
function openModal(isEdit = false) {
    const modal = document.getElementById('cultivoModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (isEdit) {
        modalTitle.textContent = 'Editar Cultivo';
    } else {
        modalTitle.textContent = 'Nuevo Cultivo';
        document.getElementById('cultivoForm').reset();
        document.getElementById('cultivoId').value = '';
        editingCultivoId = null;
    }
    
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('cultivoModal');
    modal.classList.remove('active');
    document.getElementById('cultivoForm').reset();
    editingCultivoId = null;
}

// Cerrar modal al hacer clic fuera
document.getElementById('cultivoModal').addEventListener('click', (e) => {
    if (e.target.id === 'cultivoModal') {
        closeModal();
    }
});

// =============== CREAR CULTIVO ===============
async function createCultivo(data) {
    try {
        const res = await fetch(`${API_URL}/cultivos/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Error al crear cultivo');
        }

        showMessage('✅ Cultivo creado exitosamente', 'success');
        closeModal();
        await loadCultivos();

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'error');
    }
}

// =============== EDITAR CULTIVO ===============
function editCultivo(id) {
    const cultivo = cultivosData.find(c => c.id === id);
    
    if (!cultivo) {
        showMessage('Cultivo no encontrado', 'error');
        return;
    }

    editingCultivoId = id;
    document.getElementById('cultivoId').value = id;
    document.getElementById('nombre').value = cultivo.nombre;
    document.getElementById('tipo').value = cultivo.tipo || '';
    
    openModal(true);
}

async function updateCultivo(id, data) {
    try {
        const res = await fetch(`${API_URL}/cultivos/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Error al actualizar cultivo');
        }

        showMessage('✅ Cultivo actualizado exitosamente', 'success');
        closeModal();
        await loadCultivos();

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'error');
    }
}

// =============== ELIMINAR CULTIVO ===============
async function deleteCultivo(id, nombre) {
    if (!confirm(`¿Estás seguro de eliminar el cultivo "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
        return;
    }

    try {
        const res = await fetch(`${API_URL}/cultivos/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Error al eliminar cultivo');
        }

        showMessage('✅ Cultivo eliminado exitosamente', 'success');
        await loadCultivos();

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'error');
    }
}

// =============== SUBMIT FORM ===============
document.getElementById('cultivoForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        nombre: document.getElementById('nombre').value.trim(),
        tipo: document.getElementById('tipo').value.trim() || null
    };

    // Validación
    if (!data.nombre) {
        showMessage('El nombre del cultivo es obligatorio', 'error');
        return;
    }

    if (data.nombre.length > 150) {
        showMessage('El nombre no puede exceder 150 caracteres', 'error');
        return;
    }

    if (data.tipo && data.tipo.length > 150) {
        showMessage('El tipo no puede exceder 150 caracteres', 'error');
        return;
    }

    const cultivoId = document.getElementById('cultivoId').value;

    if (cultivoId) {
        // Actualizar
        await updateCultivo(parseInt(cultivoId), data);
    } else {
        // Crear
        await createCultivo(data);
    }
});

// =============== INICIALIZAR ===============
document.addEventListener('DOMContentLoaded', () => {
    loadCultivos();
});