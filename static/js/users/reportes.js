let usuarioActual = null;
let todosReportes = [];
let misReportes = [];
let filtroActualMisReportes = 'todos';
let filtroActualTodosReportes = 'todos';

function escaparHtml(texto) {
    if (texto === null || texto === undefined) {
        return '';
    }

    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function crearMarkupEstadoVacio(mensaje, detalle = '') {
    return `
        <div class="empty-state">
            <div class="empty-state-icon"></div>
            <div class="empty-state-text">${escaparHtml(mensaje)}</div>
            ${detalle ? `<p>${escaparHtml(detalle)}</p>` : ''}
        </div>
    `;
}

function crearMarkupDetalleReporte(reporte) {
    return `
        <div class="detalle-reporte">
            <h2>${escaparHtml(obtenerTipoIncidenteTexto(reporte.tipo_incidente))}</h2>
            <div class="detalle-item">
                <div class="detalle-label">Estado</div>
                <div class="detalle-valor">${escaparHtml(obtenerEstatusTexto(reporte.estatus))}</div>
            </div>
            <div class="detalle-item">
                <div class="detalle-label">Descripción</div>
                <div class="detalle-valor">${escaparHtml(reporte.descripcion || 'Sin descripción')}</div>
            </div>
            <div class="detalle-item">
                <div class="detalle-label">Dirección</div>
                <div class="detalle-valor">${escaparHtml(reporte.direccion_manual || 'Sin dirección')}</div>
            </div>
            <div class="detalle-item">
                <div class="detalle-label">Fecha</div>
                <div class="detalle-valor">${escaparHtml(formatearFecha(reporte.fecha_creacion))}</div>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Inicializando aplicación...');
    await cargarUsuario();
    await cargarReportes();
    configurarEventos();
    mostrarTab('crear-reporte');
});

async function cargarUsuario() {
    try {
        const response = await fetch('/api/user-auth/');
        if (response.status === 401) {
            document.getElementById('usernameTxt').textContent = 'No autenticado';
            return null;
        }
        if (response.ok) {
            usuarioActual = await response.json();
            document.getElementById('usernameTxt').textContent = usuarioActual.username || 'Usuario';
            return usuarioActual;
        }
        throw new Error('Error en respuesta');
    } catch (error) {
        console.error('Error al cargar usuario:', error);
        document.getElementById('usernameTxt').textContent = 'Error cargando usuario';
        return null;
    }
}

async function cargarReportes() {
    try {
        const response = await fetch('/api/reportes-fuga/', {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
                todosReportes = data;
            } else if (data.results) {
                todosReportes = data.results;
            } else {
                todosReportes = [];
            }
            if (usuarioActual) {
                misReportes = todosReportes.filter(r => 
                    r.owner === usuarioActual.id || 
                    r.owner_username === usuarioActual.username
                );
            }
            console.log('Reportes cargados:', todosReportes.length);
        } else {
            todosReportes = [];
            misReportes = [];
        }
    } catch (error) {
        console.error('Error al cargar reportes:', error);
        todosReportes = [];
        misReportes = [];
    }
}

function configurarEventos() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            mostrarTab(e.target.dataset.tab);
        });
    });

    const formReporte = document.getElementById('formReporte');
    if (formReporte) {
        formReporte.addEventListener('submit', handleSubmitReporte);
    }

    const fotoInput = document.getElementById('foto');
    if (fotoInput) {
        fotoInput.addEventListener('change', handleFotoChange);
    }

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', logout);
    }

    const btnObtenerUbicacion = document.getElementById('btnObtenerUbicacion');
    if (btnObtenerUbicacion) {
        btnObtenerUbicacion.addEventListener('click', obtenerUbicacion);
    }

    const btnCerrarModal = document.getElementById('btnCerrarModal');
    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', cerrarModal);
    }

    document.querySelectorAll('#mis-reportes .filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            filtroActualMisReportes = e.target.dataset.filter;
            actualizarFiltrosMisReportes();
        });
    });

    document.querySelectorAll('#todos-reportes .filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            filtroActualTodosReportes = e.target.dataset.filter;
            actualizarFiltrosTodosReportes();
        });
    });
}

async function mostrarTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    const tabElement = document.getElementById(tabName);
    if (tabElement) {
        tabElement.classList.add('active');
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    if (tabName === 'mis-reportes') {
        await cargarYMostrarMisReportes();
    } else if (tabName === 'todos-reportes') {
        await cargarYMostrarTodosReportes();
    }
}

async function handleSubmitReporte(e) {
    e.preventDefault();
    const statusDiv = document.getElementById('statusMessage');
    try {
        const formData = new FormData(document.getElementById('formReporte'));
        const datos = {
            tipo_incidente: formData.get('tipo_incidente'),
            descripcion: formData.get('descripcion'),
            latitud: formData.get('latitud') ? parseFloat(formData.get('latitud')) : null,
            longitud: formData.get('longitud') ? parseFloat(formData.get('longitud')) : null,
            direccion_manual: formData.get('direccion_manual')
        };
        const errores = validarFormulario(datos);
        if (errores.length > 0) {
            mostrarMensaje(statusDiv, 'Error: ' + errores.join(', '), 'error', 5000);
            return;
        }
        const fotoInput = document.getElementById('foto');
        const foto = fotoInput && fotoInput.files.length > 0 ? fotoInput.files[0] : null;
        mostrarMensaje(statusDiv, 'Enviando reporte...', 'info');
        const respuesta = await crearReporte(datos, foto);
        mostrarMensaje(statusDiv, 'Reporte creado correctamente. ID: ' + respuesta.id, 'success', 5000);
        document.getElementById('formReporte').reset();
        document.getElementById('previewContainer').innerHTML = '';
        document.getElementById('ubicacionStatus').innerHTML = '';
        await cargarReportes();
    } catch (error) {
        console.error('Error:', error);
        const mensaje = error.message.includes('{') ? JSON.parse(error.message) : { detail: error.message };
        let textoError = 'Error: ';
        if (typeof mensaje === 'object') {
            textoError += Object.values(mensaje).flat().join(', ');
        } else {
            textoError += error.message;
        }
        mostrarMensaje(statusDiv, textoError, 'error', 5000);
    }
}

async function obtenerUbicacion() {
    const statusDiv = document.getElementById('ubicacionStatus');

    if (!navigator.geolocation) {
        mostrarMensaje(statusDiv, 'Tu navegador no soporta geolocalización.', 'error', 4000);
        return;
    }

    mostrarMensaje(statusDiv, 'Solicitando ubicación...', 'info');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitud = position.coords.latitude.toFixed(6);
            const longitud = position.coords.longitude.toFixed(6);
            document.getElementById('latitud').value = latitud;
            document.getElementById('longitud').value = longitud;
            mostrarMensaje(statusDiv, `Ubicación obtenida: ${latitud}, ${longitud}`, 'success', 4000);
        },
        (error) => {
            let mensaje = 'No se pudo obtener la ubicación.';
            if (error.code === error.PERMISSION_DENIED) {
                mensaje = 'Permiso de ubicación denegado.';
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                mensaje = 'Ubicación no disponible.';
            } else if (error.code === error.TIMEOUT) {
                mensaje = 'La solicitud tardó demasiado.';
            }
            mostrarMensaje(statusDiv, mensaje, 'error', 5000);
        }
    );
}

function cerrarModal() {
    const modal = document.getElementById('modalDetalle');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function validarFormulario(datos) {
    const errores = [];
    if (!datos.tipo_incidente) errores.push('Selecciona un tipo de incidente');
    if (!datos.descripcion || datos.descripcion.length < 10) errores.push('La descripción debe tener al menos 10 caracteres');
    return errores;
}

function handleFotoChange(e) {
    const file = e.target.files[0];
    const container = document.getElementById('previewContainer');
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            container.innerHTML = `<img src="${event.target.result}" alt="Vista previa">`;
        };
        reader.readAsDataURL(file);
    } else {
        container.innerHTML = '';
    }
}

async function cargarYMostrarMisReportes() {
    const container = document.getElementById('misReportesContainer');
    container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Cargando reportes...</p></div>';
    const reportesFiltrados = filtrarReportes(misReportes, 'estatus', filtroActualMisReportes);
    renderizarReportes(container, reportesFiltrados);
}

async function cargarYMostrarTodosReportes() {
    const container = document.getElementById('todosReportesContainer');
    container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Cargando reportes...</p></div>';
    const reportesFiltrados = filtrarReportes(todosReportes, 'tipo', filtroActualTodosReportes);
    renderizarReportes(container, reportesFiltrados);
}

function actualizarFiltrosMisReportes() {
    const container = document.getElementById('misReportesContainer');
    const reportesFiltrados = filtrarReportes(misReportes, 'estatus', filtroActualMisReportes);
    renderizarReportes(container, reportesFiltrados);
}

function actualizarFiltrosTodosReportes() {
    const container = document.getElementById('todosReportesContainer');
    const reportesFiltrados = filtrarReportes(todosReportes, 'tipo', filtroActualTodosReportes);
    renderizarReportes(container, reportesFiltrados);
}

function renderizarReportes(container, reportes) {
    if (!reportes || reportes.length === 0) {
        container.innerHTML = crearMarkupEstadoVacio(
            'No hay reportes para mostrar',
            'Prueba con otro filtro o crea un nuevo reporte.'
        );
        return;
    }

    const reportesOrdenados = ordenarReportes(reportes);
    container.innerHTML = reportesOrdenados.map(reporte => `
        <article class="reporte-card">
            <div class="reporte-header">
                <span class="reporte-tipo">${escaparHtml(obtenerTipoIncidenteTexto(reporte.tipo_incidente))}</span>
                <span class="reporte-estatus ${escaparHtml(reporte.estatus || 'PENDIENTE')}">${escaparHtml(obtenerEstatusTexto(reporte.estatus))}</span>
            </div>

            <p class="reporte-descripcion">${escaparHtml(reporte.descripcion || 'Sin descripción')}</p>

            <div class="reporte-meta">
                <div>
                    <strong>Fecha</strong>
                    ${escaparHtml(formatearFecha(reporte.fecha_creacion))}
                </div>
                <div>
                    <strong>Usuario</strong>
                    ${escaparHtml(reporte.owner_username || 'Desconocido')}
                </div>
                ${reporte.latitud ? `
                <div>
                    <strong>Latitud</strong>
                    ${escaparHtml(reporte.latitud)}
                </div>
                <div>
                    <strong>Longitud</strong>
                    ${escaparHtml(reporte.longitud)}
                </div>` : ''}
            </div>

            <div class="reporte-usuario">
                Reportado por <strong>${escaparHtml(reporte.owner_username || 'Usuario')}</strong>
            </div>

            <div class="reporte-acciones">
                <button class="btn-ver" type="button" data-id="${escaparHtml(reporte.id)}">Ver detalle</button>
            </div>
        </article>
    `).join('');

    container.querySelectorAll('.btn-ver').forEach(btn => {
        btn.addEventListener('click', () => abrirDetalle(btn.dataset.id));
    });
}

function formatearFecha(fecha) {
    if (!fecha) return 'Sin fecha';
    const fechaObj = new Date(fecha);
    return isNaN(fechaObj.getTime()) ? 'Sin fecha' : fechaObj.toLocaleString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function obtenerTipoIncidenteTexto(tipo) {
    const mapa = {
        BANQUETA: 'Banqueta',
        MEDIDOR: 'Medidor',
        DRENAJE: 'Drenaje',
        OTRO: 'Otro'
    };
    return mapa[tipo] || 'Sin tipo';
}

function obtenerEstatusTexto(estatus) {
    const mapa = {
        PENDIENTE: 'Pendiente',
        PROGRESO: 'En progreso',
        RESUELTO: 'Resuelto'
    };
    return mapa[estatus] || 'Sin estado';
}

function ordenarReportes(reportes) {
    return [...reportes].sort((a, b) => {
        const fechaA = new Date(a.fecha_creacion || 0).getTime();
        const fechaB = new Date(b.fecha_creacion || 0).getTime();
        return fechaB - fechaA;
    });
}

async function abrirDetalle(id) {
    const reporte = [...todosReportes, ...misReportes].find(item => item.id === id);
    const modal = document.getElementById('modalDetalle');
    const detalleContent = document.getElementById('detalleContent');

    if (!reporte || !modal || !detalleContent) return;

    detalleContent.innerHTML = crearMarkupDetalleReporte(reporte);

    modal.classList.remove('hidden');
}

function mostrarMensaje(elemento, mensaje, tipo = 'info', tiempo = 0) {
    if (!elemento) return;
    elemento.textContent = mensaje;
    elemento.className = `status-message ${tipo}`;
    if (tiempo > 0) {
        setTimeout(() => {
            elemento.textContent = '';
            elemento.className = 'status-message';
        }, tiempo);
    }
}
