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

// =============== CARGAR TODOS LOS DATOS ===============
async function loadAllData() {
    try {
        // Mostrar loading
        document.getElementById('loadingState').style.display = 'block';
        
        // Cargar análisis completo
        const analisisRes = await fetch(`${API_URL}/recomendaciones/analisis`, {
            headers: getHeaders()
        });
        
        if (!analisisRes.ok) {
            throw new Error('Error al cargar análisis');
        }
        
        const analisisData = await analisisRes.json();
        
        // Cargar alertas
        const alertasRes = await fetch(`${API_URL}/recomendaciones/alertas`, {
            headers: getHeaders()
        });
        const alertasData = await alertasRes.json();
        
        // Cargar sugerencias
        const sugerenciasRes = await fetch(`${API_URL}/recomendaciones/sugerencias`, {
            headers: getHeaders()
        });
        const sugerenciasData = await sugerenciasRes.json();
        
        // Ocultar loading
        document.getElementById('loadingState').style.display = 'none';
        
        // Verificar si hay datos
        if (analisisData.total_incidencias === 0) {
            document.getElementById('emptyState').style.display = 'block';
            return;
        }
        
        // Renderizar cada sección
        renderAlertas(alertasData.alertas || []);
        renderEstadisticas(analisisData.estadisticas || {});
        renderRecomendaciones(sugerenciasData.sugerencias || [], analisisData.plagas_nombres || {});
        renderAnalisis(analisisData.resumen_plagas || {}, analisisData.plagas_nombres || {});
        renderTendencias(analisisData.tendencias || []);
        
        // Mostrar secciones
        document.getElementById('alertasSection').style.display = 'block';
        document.getElementById('estadisticasSection').style.display = 'block';
        document.getElementById('recomendacionesSection').style.display = 'block';
        document.getElementById('analisisSection').style.display = 'block';
        
        if (analisisData.tendencias && analisisData.tendencias.length > 0) {
            document.getElementById('tendenciasSection').style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('emptyState').style.display = 'block';
    }
}

// =============== RENDERIZAR ALERTAS ===============
function renderAlertas(alertas) {
    const container = document.getElementById('alertasContainer');
    
    if (alertas.length === 0) {
        container.innerHTML = '<p style="color: #94a3b8; padding: 20px;">No hay alertas en este momento</p>';
        return;
    }
    
    container.innerHTML = alertas.map(alerta => `
        <div class="alert-card ${alerta.nivel}">
            <div class="alert-header">
                <h3 class="alert-title">${alerta.titulo}</h3>
            </div>
            <p class="alert-message">${alerta.mensaje}</p>
        </div>
    `).join('');
}

// =============== RENDERIZAR ESTADÍSTICAS ===============
function renderEstadisticas(stats) {
    document.getElementById('totalIncidencias').textContent = stats.total_incidencias || 0;
    document.getElementById('plagasUnicas').textContent = stats.plagas_unicas || 0;
    document.getElementById('cultivosAfectados').textContent = stats.cultivos_afectados || 0;
    
    // Severidad promedio (1-4 escala)
    const severidadProm = stats.severidad_promedio || 0;
    const severidadTexto = severidadProm >= 3.5 ? '🔴 Crítica' :
                           severidadProm >= 2.5 ? '🟠 Alta' :
                           severidadProm >= 1.5 ? '🟡 Media' : '🟢 Baja';
    document.getElementById('severidadPromedio').textContent = severidadTexto;
}

// =============== RENDERIZAR RECOMENDACIONES ===============
function renderRecomendaciones(recomendaciones, plagasNombres) {
    const container = document.getElementById('recomendacionesContainer');
    
    if (recomendaciones.length === 0) {
        container.innerHTML = '<p style="color: #94a3b8; padding: 20px;">No hay recomendaciones disponibles</p>';
        return;
    }
    
    container.innerHTML = recomendaciones.map(reco => {
        const plagaNombre = reco.plaga_nombre || plagasNombres[reco.plaga_id] || `Plaga #${reco.plaga_id}`;
        const detalles = reco.detalles || {};
        
        return `
            <div class="reco-card ${reco.prioridad}">
                <div class="reco-header">
                    <div>
                        <h3 class="reco-title">🐛 ${plagaNombre}</h3>
                        <p class="reco-subtitle">${reco.total_incidencias} incidencias registradas</p>
                    </div>
                </div>
                <div class="reco-accion">${reco.accion}</div>
                <p class="reco-texto">${reco.recomendacion}</p>
                <div class="reco-detalles">
                    <div class="detalle-item">
                        <span class="detalle-label">Críticas</span>
                        <span class="detalle-valor">${detalles.criticas || 0}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">Altas</span>
                        <span class="detalle-valor">${detalles.altas || 0}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">Medias</span>
                        <span class="detalle-valor">${detalles.medias || 0}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">Bajas</span>
                        <span class="detalle-valor">${detalles.bajas || 0}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// =============== RENDERIZAR ANÁLISIS ===============
function renderAnalisis(resumen, plagasNombres) {
    const container = document.getElementById('analisisContainer');
    
    const counts = resumen.counts || {};
    const bySeverity = resumen.by_severity || {};
    
    if (Object.keys(counts).length === 0) {
        container.innerHTML = '<p style="color: #94a3b8; padding: 20px;">No hay datos de análisis</p>';
        return;
    }
    
    // Ordenar por frecuencia
    const sortedPlagas = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10); // Top 10
    
    container.innerHTML = sortedPlagas.map(([plagaId, count]) => {
        const plagaNombre = plagasNombres[plagaId] || `Plaga #${plagaId}`;
        const severidades = bySeverity[plagaId] || {};
        
        return `
            <div class="analisis-item">
                <div class="analisis-header">
                    <span class="analisis-plaga">🐛 ${plagaNombre}</span>
                    <span class="analisis-count">${count} incidencias</span>
                </div>
                <div class="analisis-severidad">
                    <div class="sev-item">
                        <span class="sev-label">Crítica</span>
                        <span class="sev-valor">${severidades['Crítica'] || 0}</span>
                    </div>
                    <div class="sev-item">
                        <span class="sev-label">Alta</span>
                        <span class="sev-valor">${severidades['Alta'] || 0}</span>
                    </div>
                    <div class="sev-item">
                        <span class="sev-label">Media</span>
                        <span class="sev-valor">${severidades['Media'] || 0}</span>
                    </div>
                    <div class="sev-item">
                        <span class="sev-label">Baja</span>
                        <span class="sev-valor">${severidades['Baja'] || 0}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// =============== RENDERIZAR TENDENCIAS ===============
function renderTendencias(tendencias) {
    const container = document.getElementById('tendenciasContainer');
    
    if (tendencias.length === 0) {
        container.innerHTML = '<p style="color: #94a3b8; padding: 20px;">No hay datos de tendencias</p>';
        return;
    }
    
    container.innerHTML = tendencias.map(trend => {
        const icono = trend.tendencia === 'aumento' ? '📈' :
                     trend.tendencia === 'disminución' ? '📉' : '➡️';
        
        return `
            <div class="tendencia-card">
                <div class="tendencia-info">
                    <h4>${icono} ${trend.periodo}</h4>
                    <p style="color: #64748b; margin-top: 4px;">
                        ${trend.cantidad} incidencias registradas
                    </p>
                </div>
                <div class="tendencia-stat">
                    <span class="tendencia-numero">${trend.cantidad}</span>
                    <span class="tendencia-cambio ${trend.tendencia}">
                        ${trend.cambio_porcentual > 0 ? '+' : ''}${trend.cambio_porcentual}%
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// =============== INICIALIZAR ===============
document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
});