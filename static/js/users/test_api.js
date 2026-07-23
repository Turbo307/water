function log(elementId, text, isError = false) {
    const el = document.getElementById(elementId);
    el.textContent += text + '\n\n';
    el.className = `output ${isError ? 'error' : 'success'}`;
    el.scrollTop = el.scrollHeight;
}

function clear(elementId) {
    document.getElementById(elementId).textContent = '';
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

async function testUsuario() {
    clear('output-usuario');
    log('output-usuario', 'Cargando...');
    try {
        const response = await fetch('/api/user-auth/');
        const data = await response.json();
        log('output-usuario', ' ÉXITO\n\n' + JSON.stringify(data, null, 2));
    } catch (error) {
        log('output-usuario', 'ERROR\n\n' + error.message, true);
    }
}

async function testUsuarioPublico() {
    clear('output-usuario');
    log('output-usuario', 'Cargando...');
    try {
        const response = await fetch('/api/user/');
        const data = await response.json();
        log('output-usuario', 'ÉXITO\n\n' + JSON.stringify(data, null, 2));
    } catch (error) {
        log('output-usuario', ' ERROR\n\n' + error.message, true);
    }
}

async function testTodosReportes() {
    clear('output-reportes');
    log('output-reportes', 'Cargando...');
    try {
        const response = await fetch('/api/reportes-fuga/');
        const data = await response.json();
        const texto = Array.isArray(data) ?
            `Total: ${data.length} reportes\n\n${JSON.stringify(data.slice(0, 2), null, 2)}...` :
            JSON.stringify(data, null, 2);
        log('output-reportes', 'ÉXITO\n\n' + texto);
    } catch (error) {
        log('output-reportes', ' ERROR\n\n' + error.message, true);
    }
}

async function testMisReportes() {
    clear('output-reportes');
    log('output-reportes', ' Cargando...');
    try {
        const response = await fetch('/api/reportes-fuga/?owner=me');
        const data = await response.json();
        const texto = Array.isArray(data) ?
            `Total: ${data.length} reportes tuyos\n\n${JSON.stringify(data, null, 2)}` :
            JSON.stringify(data, null, 2);
        log('output-reportes', 'ÉXITO\n\n' + texto);
    } catch (error) {
        log('output-reportes', ' ERROR\n\n' + error.message, true);
    }
}

async function testCrearReporte() {
    clear('output-crear');
    log('output-crear', ' Creando reporte...');
    try {
        const datos = {
            tipo_incidente: document.getElementById('tipoIncidente').value,
            descripcion: document.getElementById('descripcion').value,
            latitud: document.getElementById('latitud').value ? parseFloat(document.getElementById('latitud').value) : null,
            longitud: document.getElementById('longitud').value ? parseFloat(document.getElementById('longitud').value) : null,
            direccion_manual: document.getElementById('direccion').value
        };

        if (!datos.descripcion || datos.descripcion.length < 10) {
            throw new Error('La descripción debe tener al menos 10 caracteres');
        }

        const response = await fetch('/api/reportes-fuga/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(JSON.stringify(error, null, 2));
        }

        const data = await response.json();
        log('output-crear', 'REPORTE CREADO\n\n' + JSON.stringify(data, null, 2));
        document.getElementById('reporteId').value = data.id;
        document.getElementById('reporteIdUpdate').value = data.id;
        document.getElementById('reporteIdDelete').value = data.id;
    } catch (error) {
        log('output-crear', 'ERROR\n\n' + error.message, true);
    }
}

async function testObtenerReporte() {
    clear('output-reporte-especifico');
    const id = document.getElementById('reporteId').value;

    if (!id) {
        log('output-reporte-especifico', ' Ingresa un ID de reporte', true);
        return;
    }

    log('output-reporte-especifico', ' Cargando...');
    try {
        const response = await fetch(`/api/reportes-fuga/${id}/`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        log('output-reporte-especifico', 'ÉXITO\n\n' + JSON.stringify(data, null, 2));
    } catch (error) {
        log('output-reporte-especifico', ' ERROR\n\n' + error.message, true);
    }
}

async function testActualizarReporte() {
    clear('output-actualizar');
    const id = document.getElementById('reporteIdUpdate').value;

    if (!id) {
        log('output-actualizar', 'Ingresa un ID de reporte', true);
        return;
    }

    log('output-actualizar', 'Actualizando...');
    try {
        const response = await fetch(`/api/reportes-fuga/${id}/`, {
            method: 'PATCH',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                estatus: document.getElementById('nuevoEstatus').value
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(JSON.stringify(error, null, 2));
        }

        const data = await response.json();
        log('output-actualizar', ' REPORTE ACTUALIZADO\n\n' + JSON.stringify(data, null, 2));
    } catch (error) {
        log('output-actualizar', ' ERROR\n\n' + error.message, true);
    }
}

async function testEliminarReporte() {
    clear('output-eliminar');
    const id = document.getElementById('reporteIdDelete').value;

    if (!id) {
        log('output-eliminar', ' Ingresa un ID de reporte', true);
        return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
        return;
    }

    log('output-eliminar', ' Eliminando...');
    try {
        const response = await fetch(`/api/reportes-fuga/${id}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });

        if (response.status === 204) {
            log('output-eliminar', ' REPORTE ELIMINADO');
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        log('output-eliminar', ' ERROR\n\n' + error.message, true);
    }
}

async function testGPS() {
    clear('output-gps');

    if (!navigator.geolocation) {
        log('output-gps', ' Tu navegador no soporta geolocalización', true);
        return;
    }

    log('output-gps', ' Obteniendo ubicación...\n\n Permite el acceso a tu ubicación en el navegador');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            document.getElementById('latitud').value = lat.toFixed(6);
            document.getElementById('longitud').value = lon.toFixed(6);

            log('output-gps', ` UBICACIÓN OBTENIDA\n\nLatitud: ${lat.toFixed(6)}\nLongitud: ${lon.toFixed(6)}\nPrecisión: ${accuracy.toFixed(0)} metros`);
        },
        (error) => {
            let mensaje = 'Error desconocido';
            switch (error.code) {
                case error.PERMISSION_DENIED: mensaje = 'Permiso denegado'; break;
                case error.POSITION_UNAVAILABLE: mensaje = 'Posición no disponible'; break;
                case error.TIMEOUT: mensaje = 'Tiempo agotado'; break;
            }
            log('output-gps', ` ERROR\n\n${mensaje}`, true);
        }
    );
}
