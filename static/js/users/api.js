const API_BASE_URL = '/api';
const API_REPORTES = `${API_BASE_URL}/reportes-fuga/`;

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

async function logout() {
    try {
        window.location.href = '/logout/';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        window.location.href = '/logout/';
    }
}

async function crearReporte(datos, foto = null) {
    try {
        if (foto) {
            const formData = new FormData();
            Object.keys(datos).forEach(key => {
                if (datos[key] !== null && datos[key] !== '') {
                    formData.append(key, datos[key]);
                }
            });
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

function filtrarReportes(reportes, filtro, valor) {
    if (valor === 'todos') return reportes;
    return reportes.filter(r => {
        if (filtro === 'estatus') return r.estatus === valor;
        if (filtro === 'tipo') return r.tipo_incidente === valor;
        return true;
    });
}
