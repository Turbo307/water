

const API_BASE_URL = '/api';
const API_REPORTES = `${API_BASE_URL}/reportes-fuga/`;

// Token CSRF para peticiones POST/PUT/DELETE
function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
        getCookie('csrftoken');
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


async function obtenerUsuarioActual() {
    try {
        const response = await fetch(`${API_BASE_URL}/usuario-actual/`);
        if (response.ok) {
            return await response.json();
        }
        throw new Error('No autenticado');
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return null;
    }
}

/**
 * Cierra sesión del usuario
 */
async function logout() {
    try {
        window.location.href = '/logout/';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        window.location.href = '/logout/';
    }
}



/**
 * Crea un nuevo reporte de fuga
 * @param {Object} datos 
 * @param {File} foto 
 */
async function crearReporte(datos, foto = null) {
    try {
        if (foto) {
            const formData = new FormData();
            
            // Agregar campos de texto
            Object.keys(datos).forEach(key => {
                if (datos[key] !== null && datos[key] !== '') {
                    formData.append(key, datos[key]);
                }
            });
            
            // Agregar foto
            formData.append('foto', foto);
            
            const response = await fetch(API_REPORTES, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCSRFToken()
                },
                body: formData
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                const error = await response.json();
                throw new Error(JSON.stringify(error));
            }
        } else {
            // Sin foto, usamos JSON
            const response = await fetch(API_REPORTES, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                const error = await response.json();
                throw new Error(JSON.stringify(error));
            }
        }
    } catch (error) {
        console.error('Error al crear reporte:', error);
        throw error;
    }
}

/**
 * Obtiene todos los reportes
 */
async function obtenerTodosReportes() {
    try {
        const response = await fetch(API_REPORTES);
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Error al obtener reportes');
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

/**
 * Obtiene los reportes del usuario autenticado
 */
async function obtenerMisReportes() {
    try {
        const response = await fetch(`${API_REPORTES}?owner=me`);
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Error al obtener mis reportes');
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

/**
 * Obtiene un reporte específico por ID
 * @param {string} id - UUID del reporte
 */
async function obtenerReporte(id) {
    try {
        const response = await fetch(`${API_REPORTES}${id}/`);
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Reporte no encontrado');
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

/**
 * Actualiza un reporte existente
 * @param {string} id - UUID del reporte
 * @param {Object} datos - Datos a actualizar
 * @param {File} foto - Foto (opcional)
 */
async function actualizarReporte(id, datos, foto = null) {
    try {
        if (foto) {
            const formData = new FormData();
            
            Object.keys(datos).forEach(key => {
                if (datos[key] !== null && datos[key] !== '') {
                    formData.append(key, datos[key]);
                }
            });
            
            formData.append('foto', foto);
            
            const response = await fetch(`${API_REPORTES}${id}/`, {
                method: 'PATCH',
                headers: {
                    'X-CSRFToken': getCSRFToken()
                },
                body: formData
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                const error = await response.json();
                throw new Error(JSON.stringify(error));
            }
        } else {
            const response = await fetch(`${API_REPORTES}${id}/`, {
                method: 'PATCH',
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                const error = await response.json();
                throw new Error(JSON.stringify(error));
            }
        }
    } catch (error) {
        console.error('Error al actualizar reporte:', error);
        throw error;
    }
}

/**
 * Elimina un reporte
 * @param {string} id - UUID del reporte
 */
async function eliminarReporte(id) {
    try {
        const response = await fetch(`${API_REPORTES}${id}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });
        
        if (response.status === 204) {
            return true;
        }
        throw new Error('Error al eliminar');
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

/**
 * Filtra reportes por criterio
 * @param {Array} reportes - Lista de reportes
 * @param {string} filtro - Campo por el que filtrar
 * @param {string} valor - Valor del filtro
 */
function filtrarReportes(reportes, filtro, valor) {
    if (valor === 'todos') return reportes;
    
    return reportes.filter(r => {
        if (filtro === 'estatus') return r.estatus === valor;
        if (filtro === 'tipo') return r.tipo_incidente === valor;
        return true;
    });
}

/**
 * Ordena reportes por fecha (más recientes primero)
 */
function ordenarReportes(reportes) {
    return reportes.sort((a, b) => 
        new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
    );
}


async function obtenerUbicacion() {
    const statusDiv = document.getElementById('ubicacionStatus');
    
    if (!navigator.geolocation) {
        mostrarMensaje(statusDiv, 'Tu navegador no soporta geolocalización', 'error');
        return;
    }
    
    mostrarMensaje(statusDiv, 'Obteniendo ubicación...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            document.getElementById('latitud').value = lat.toFixed(6);
            document.getElementById('longitud').value = lon.toFixed(6);
            
            mostrarMensaje(statusDiv, 
                `✓ Ubicación obtenida: ${lat.toFixed(4)}, ${lon.toFixed(4)}`, 
                'success');
        },
        (error) => {
            let mensaje = 'Error al obtener ubicación';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    mensaje = 'Permiso denegado. Habilita la geolocalización en tu navegador.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    mensaje = 'Información de ubicación no disponible';
                    break;
                case error.TIMEOUT:
                    mensaje = 'Tiempo de espera agotado';
                    break;
            }
            
            mostrarMensaje(statusDiv, mensaje, 'error');
        }
    );
}



/**
 * Muestra un mensaje en un contenedor
 * @param {Element} container 
 * @param {string} texto 
 * @param {string} tipo 
 * @param {number} duracion 
 */
function mostrarMensaje(container, texto, tipo = 'info', duracion = 0) {
    container.textContent = texto;
    container.className = `status-message show ${tipo}`;
    
    if (duracion > 0) {
        setTimeout(() => {
            container.classList.remove('show');
        }, duracion);
    }
}

/**
 * Formatea una fecha para mostrar
 * @param {string} fechaISO - Fecha en formato ISO
 */
function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Obtiene el texto del estatus en español
 */
function obtenerEstatusTexto(estatus) {
    const estatusMap = {
        'PENDIENTE': 'Pendiente',
        'PROGRESO': 'En Progreso',
        'RESUELTO': 'Resuelto'
    };
    return estatusMap[estatus] || estatus;
}

/**
 * Obtiene el texto del tipo de incidente en español
 */
function obtenerTipoIncidenteTexto(tipo) {
    const tipoMap = {
        'BANQUETA': 'Fuga en banqueta / vía pública',
        'MEDIDOR': 'Fuga en el medidor',
        'DRENAJE': 'Brote de aguas negras',
        'OTRO': 'Otro tipo de reporte'
    };
    return tipoMap[tipo] || tipo;
}

/**
 * Valida un formulario
 */
function validarFormulario(formData) {
    const errores = [];
    
    if (!formData.tipo_incidente) {
        errores.push('Debe seleccionar un tipo de incidente');
    }
    
    if (!formData.descripcion || formData.descripcion.trim() === '') {
        errores.push('Debe escribir una descripción');
    }
    
    if (formData.descripcion && formData.descripcion.length < 10) {
        errores.push('La descripción debe tener al menos 10 caracteres');
    }
    
    return errores;
}

/**
 * Exporta un reporte a CSV
 */
function exportarReporteCSV(reporte) {
    const lineas = [
        ['Campo', 'Valor'],
        ['ID', reporte.id],
        ['Tipo', obtenerTipoIncidenteTexto(reporte.tipo_incidente)],
        ['Descripción', reporte.descripcion],
        ['Estatus', obtenerEstatusTexto(reporte.estatus)],
        ['Fecha', formatearFecha(reporte.fecha_creacion)],
        ['Latitud', reporte.latitud],
        ['Longitud', reporte.longitud],
        ['Dirección', reporte.direccion_manual],
        ['Usuario', reporte.owner_username]
    ];
    
    let csv = lineas.map(fila => 
        fila.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_${reporte.id}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
