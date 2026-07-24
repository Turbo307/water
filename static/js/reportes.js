
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
    let html = '<div class="detalle-reporte"><h2>Detalle del reporte</h2>';

    if (reporte.foto) {
        html += `
            <div class="detalle-item">
                <div class="detalle-label">Foto</div>
                <img src="${escaparHtml(reporte.foto)}" alt="Foto del reporte" class="detalle-foto">
            </div>
        `;
    }

    html += `
        <div class="detalle-item">
            <div class="detalle-label">Tipo de incidente</div>
            <div class="detalle-valor">${escaparHtml(obtenerTipoIncidenteTexto(reporte.tipo_incidente))}</div>
        </div>
        <div class="detalle-item">
            <div class="detalle-label">Descripcion</div>
            <div class="detalle-valor">${escaparHtml(reporte.descripcion || 'Sin descripción')}</div>
        </div>
        <div class="detalle-item">
            <div class="detalle-label">Estatus</div>
            <div class="detalle-valor">
                <span class="reporte-estatus ${escaparHtml(reporte.estatus)}">
                    ${escaparHtml(obtenerEstatusTexto(reporte.estatus))}
                </span>
            </div>
        </div>
    `;

    if (reporte.latitud && reporte.longitud) {
        html += `
            <div class="detalle-item">
                <div class="detalle-label">Ubicacion GPS</div>
                <div class="detalle-valor">
                    Latitud: ${escaparHtml(reporte.latitud)} | Longitud: ${escaparHtml(reporte.longitud)}
                    <br>
                    <small><a href="https://maps.google.com/?q=${escaparHtml(reporte.latitud)},${escaparHtml(reporte.longitud)}" target="_blank">Ver en Google Maps</a></small>
                </div>
            </div>
        `;
    }

    if (reporte.direccion_manual) {
        html += `
            <div class="detalle-item">
                <div class="detalle-label">Direccion o referencia</div>
                <div class="detalle-valor">${escaparHtml(reporte.direccion_manual)}</div>
            </div>
        `;
    }

    html += `
        <div class="detalle-item">
            <div class="detalle-label">Fecha de creacion</div>
            <div class="detalle-valor">${escaparHtml(formatearFecha(reporte.fecha_creacion))}</div>
        </div>
        <div class="detalle-item">
            <div class="detalle-label">Usuario reportante</div>
            <div class="detalle-valor">${escaparHtml(reporte.owner_username || 'Desconocido')}</div>
        </div>
        <div class="detalle-item">
            <div class="detalle-label">ID del reporte</div>
            <div class="detalle-valor" style="font-family: monospace; word-break: break-all;">${escaparHtml(reporte.id)}</div>
        </div>
    `;

    return html + '</div>';
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Inicializando aplicación...');
    
    // Cargar usuario actual
    await cargarUsuario();
    
    // Cargar reportes
    await cargarReportes();
    
    // Configurar eventos
    configurarEventos();
    
    // Cargar vista inicial
    mostrarTab('crear-reporte');
});


async function cargarUsuario() {
    try {
        // Primero intentamos obtener del endpoint de usuario autenticado
        const response = await fetch('/api/user-auth/');
        
        if (response.status === 401) {
            // No autenticado
            document.getElementById('usernameTxt').textContent = 'No autenticado';
            return null;
        }
        
        if (response.ok) {
            usuarioActual = await response.json();
            document.getElementById('usernameTxt').textContent = 
                usuarioActual.username || 'Usuario';
            return usuarioActual;
        } else {
            throw new Error('Error en respuesta');
        }
    } catch (error) {
        console.error('Error al cargar usuario:', error);
        document.getElementById('usernameTxt').textContent = 'Error cargando usuario';
        return null;
    }
}


/**
 * Carga todos los reportes desde la API
 */
async function cargarReportes() {
    try {
        const response = await fetch('/api/reportes-fuga/', {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Manejar respuesta en array o en objeto results (DRF pagination)
            if (Array.isArray(data)) {
                todosReportes = data;
            } else if (data.results) {
                todosReportes = data.results;
            } else {
                todosReportes = [];
            }
            
            // Filtrar reportes del usuario
            if (usuarioActual) {
                misReportes = todosReportes.filter(r => 
                    r.owner === usuarioActual.id || 
                    r.owner_username === usuarioActual.username
                );
            }
            
            console.log('Reportes cargados:', todosReportes.length);
        } else {
            console.warn('No se pudieron cargar los reportes');
            todosReportes = [];
            misReportes = [];
        }
    } catch (error) {
        console.error('Error al cargar reportes:', error);
        todosReportes = [];
        misReportes = [];
    }
}


/**
 * Configura todos los event listeners
 */
function configurarEventos() {
    // Tabs de navegación
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            mostrarTab(tabName);
        });
    });
    
    // Formulario de crear reporte
    const formReporte = document.getElementById('formReporte');
    if (formReporte) {
        formReporte.addEventListener('submit', handleSubmitReporte);
    }
    
    // Vista previa de foto
    const fotoInput = document.getElementById('foto');
    if (fotoInput) {
        fotoInput.addEventListener('change', handleFotoChange);
    }
    
    // Filtros de Mis Reportes
    document.querySelectorAll('#mis-reportes .filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            filtroActualMisReportes = e.target.dataset.filter;
            actualizarFiltrosMisReportes();
        });
    });
    
    // Filtros de Todos los Reportes
    document.querySelectorAll('#todos-reportes .filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            filtroActualTodosReportes = e.target.dataset.filter;
            actualizarFiltrosTodosReportes();
        });
    });
}


/**
 * Muestra un tab específico y carga sus datos
 */
async function mostrarTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar tab seleccionado
    const tabElement = document.getElementById(tabName);
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    // Actualizar estado de botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Cargar datos específicos del tab
    if (tabName === 'mis-reportes') {
        await cargarYMostrarMisReportes();
    } else if (tabName === 'todos-reportes') {
        await cargarYMostrarTodosReportes();
    }
}


/**
 * Maneja el envío del formulario de crear reporte
 */
async function handleSubmitReporte(e) {
    e.preventDefault();
    
    const statusDiv = document.getElementById('statusMessage');
    
    try {
        // Recopilar datos del formulario
        const formData = new FormData(document.getElementById('formReporte'));
        
        const datos = {
            tipo_incidente: formData.get('tipo_incidente'),
            descripcion: formData.get('descripcion'),
            latitud: formData.get('latitud') ? parseFloat(formData.get('latitud')) : null,
            longitud: formData.get('longitud') ? parseFloat(formData.get('longitud')) : null,
            direccion_manual: formData.get('direccion_manual')
        };
        
        // Validar
        const errores = validarFormulario(datos);
        if (errores.length > 0) {
            mostrarMensaje(statusDiv,
                'Error: ' + errores.join(', '),
                'error', 5000);
            return;
        }
        
        // Obtener foto si la hay
        const fotoInput = document.getElementById('foto');
        const foto = fotoInput && fotoInput.files.length > 0 ? fotoInput.files[0] : null;
        
        // Mostrar estado de envío
        mostrarMensaje(statusDiv, 'Enviando reporte...', 'info');
        
        // Crear reporte
        const respuesta = await crearReporte(datos, foto);
        
        // Éxito
        mostrarMensaje(statusDiv,
            'Reporte creado correctamente. ID: ' + respuesta.id,
            'success', 5000);
        
        // Limpiar formulario
        document.getElementById('formReporte').reset();
        document.getElementById('previewContainer').innerHTML = '';
        document.getElementById('ubicacionStatus').innerHTML = '';
        
        // Recargar reportes
        await cargarReportes();
        
    } catch (error) {
        console.error('Error:', error);
        const mensaje = error.message.includes('{') ? 
            JSON.parse(error.message) : 
            { detail: error.message };
        
        let textoError = 'Error: ';
        if (typeof mensaje === 'object') {
            textoError += Object.values(mensaje)
                .flat()
                .join(', ');
        } else {
            textoError += error.message;
        }
        
        mostrarMensaje(statusDiv, textoError, 'error', 5000);
    }
}

/**
 * Maneja el cambio de foto con vista previa
 */
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

/**
 * Carga y muestra los reportes del usuario
 */
async function cargarYMostrarMisReportes() {
    const container = document.getElementById('misReportesContainer');
    
    if (misReportes.length === 0) {
        container.innerHTML = crearMarkupEstadoVacio(
            'No has creado reportes aún',
            'Crea tu primer reporte para que aparezca aquí'
        );
        return;
    }
    
    actualizarFiltrosMisReportes();
}

/**
 * Actualiza la visualización según el filtro seleccionado
 */
function actualizarFiltrosMisReportes() {
    const container = document.getElementById('misReportesContainer');
    
    // Actualizar estado de botones
    document.querySelectorAll('#mis-reportes .filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filtroActualMisReportes);
    });
    
    // Filtrar reportes
    let reportesFiltrados = misReportes;
    
    if (filtroActualMisReportes !== 'todos') {
        reportesFiltrados = misReportes.filter(r => 
            r.estatus === filtroActualMisReportes
        );
    }
    
    // Ordenar por fecha
    reportesFiltrados = ordenarReportes(reportesFiltrados);
    
    // Renderizar
    container.innerHTML = reportesFiltrados.map(r => 
        crearHTMLTarjetaReporte(r, true)
    ).join('');
}

/**
 * Carga y muestra todos los reportes del sistema
 */
async function cargarYMostrarTodosReportes() {
    const container = document.getElementById('todosReportesContainer');
    
    if (todosReportes.length === 0) {
        container.innerHTML = crearMarkupEstadoVacio('No hay reportes en el sistema');
        return;
    }
    
    actualizarFiltrosTodosReportes();
}

/**
 * Actualiza la visualización según el filtro seleccionado
 */
function actualizarFiltrosTodosReportes() {
    const container = document.getElementById('todosReportesContainer');
    
    // Actualizar estado de botones
    document.querySelectorAll('#todos-reportes .filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filtroActualTodosReportes);
    });
    
    // Filtrar reportes
    let reportesFiltrados = todosReportes;
    
    if (filtroActualTodosReportes !== 'todos') {
        reportesFiltrados = todosReportes.filter(r => 
            r.tipo_incidente === filtroActualTodosReportes
        );
    }
    
    // Ordenar por fecha
    reportesFiltrados = ordenarReportes(reportesFiltrados);
    
    // Renderizar
    container.innerHTML = reportesFiltrados.map(r => 
        crearHTMLTarjetaReporte(r, false)
    ).join('');
}


/**
 * Crea el HTML de una tarjeta de reporte
 * @param {Object} reporte - Datos del reporte
 * @param {boolean} esPropio - Si es un reporte del usuario actual
 */
function crearHTMLTarjetaReporte(reporte, esPropio = false) {
    const fechaFormato = formatearFecha(reporte.fecha_creacion);
    const tipoTexto = obtenerTipoIncidenteTexto(reporte.tipo_incidente);
    const estatusTexto = obtenerEstatusTexto(reporte.estatus);

    const descripcion = reporte.descripcion ?
        (reporte.descripcion.length > 100 ?
            reporte.descripcion.substring(0, 100) + '...' :
            reporte.descripcion) :
        'Sin descripción';

    let botonesExtras = '';
    if (esPropio) {
        botonesExtras = `
            <button class="btn-editar" onclick="abrirEdicion('${reporte.id}')">Editar</button>
            <button class="btn-eliminar" onclick="confirmarEliminar('${reporte.id}', '${escaparHtml(reporte.tipo_incidente)}')">Eliminar</button>
        `;
    }

    return `
        <div class="reporte-card">
            <div class="reporte-header">
                <span class="reporte-tipo">${escaparHtml(tipoTexto)}</span>
                <span class="reporte-estatus ${escaparHtml(reporte.estatus)}">${escaparHtml(estatusTexto)}</span>
            </div>

            <p class="reporte-descripcion">${escaparHtml(descripcion)}</p>

            <div class="reporte-meta">
                <div>
                    <strong>Fecha</strong>
                    ${escaparHtml(fechaFormato)}
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
                </div>
                ` : ''}
            </div>

            <div class="reporte-usuario">
                Reportado por: <strong>${escaparHtml(reporte.owner_username || 'Usuario')}</strong>
            </div>

            <div class="reporte-acciones">
                <button class="btn-ver" onclick="abrirDetalle('${reporte.id}')">
                    Ver detalle
                </button>
                ${botonesExtras}
            </div>
        </div>
    `;
}

/**
 * Abre el modal con el detalle del reporte
 */
async function abrirDetalle(id) {
    try {
        const reporte = await obtenerReporte(id);
        
        if (!reporte) {
            alert('No se pudo cargar el reporte');
            return;
        }
        
        const modal = document.getElementById('modalDetalle');
        const content = document.getElementById('detalleContent');
        
        content.innerHTML = crearMarkupDetalleReporte(reporte);
        modal.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el detalle del reporte');
    }
}

/**
 * Cierra el modal
 */
function cerrarModal() {
    document.getElementById('modalDetalle').classList.add('hidden');
}


/**
 * Abre el editor para un reporte
 */
async function abrirEdicion(id) {
    try {
        const reporte = await obtenerReporte(id);
        
        if (!reporte) {
            alert('No se pudo cargar el reporte');
            return;
        }
        
        // Por simplicidad, mostramos un prompt para cambiar el estatus
        const nuevoEstatus = prompt(
            'Selecciona el nuevo estatus:\n1. PENDIENTE\n2. PROGRESO\n3. RESUELTO',
            reporte.estatus
        );
        
        if (nuevoEstatus && ['PENDIENTE', 'PROGRESO', 'RESUELTO'].includes(nuevoEstatus.toUpperCase())) {
            const resultado = await actualizarReporte(id, { estatus: nuevoEstatus.toUpperCase() });
            if (resultado) {
                alert('✓ Reporte actualizado');
                await cargarReportes();
                await cargarYMostrarMisReportes();
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar el reporte');
    }
}

/**
 * Confirma la eliminación de un reporte
 */
function confirmarEliminar(id, tipo) {
    if (confirm(`¿Estás seguro de que deseas eliminar este reporte de "${tipo}"?`)) {
        eliminarReporteUI(id);
    }
}

/**
 * Elimina un reporte desde la UI
 */
async function eliminarReporteUI(id) {
    try {
        await eliminarReporte(id);
        alert('✓ Reporte eliminado');
        await cargarReportes();
        await cargarYMostrarMisReportes();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el reporte');
    }
}


/**
 * Cierra la sesión del usuario
 */
async function logout() {
    if (confirm('¿Deseas cerrar sesión?')) {
        try {
            window.location.href = '/logout/';
        } catch (error) {
            console.error('Error:', error);
            window.location.href = '/logout/';
        }
    }
}


function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
        getCookie('csrftoken');
}

/**
 * Obtiene el valor de una cookie
 */
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
