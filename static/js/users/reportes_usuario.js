/*

    WATER REPORT — USERS
    INTERFAZ DE REPORTES


    Este archivo controla únicamente la interfaz
    de usuario.

    La comunicación con Django está en:

        users/api.js

    Responsabilidades:

    - Cargar reportes
    - Mostrar reportes
    - Filtrar reportes
    - Mostrar estadísticas
    - Abrir y cerrar modales
    - Crear reportes
    - Obtener GPS
    - Vista previa de fotografías
    - Mostrar mensajes
    - Manejar eventos


*/


/* 
   ESTADO DE LA APLICACIÓN
 */

const estadoReportes = {

    reportes: [],

    filtroActual: 'TODOS',

    fotoSeleccionada: null

};


/* 
   ELEMENTOS DEL DOM
 */

const elementos = {};


/**
 * Obtiene todos los elementos necesarios
 * de la interfaz.
 */

function inicializarElementos() {

    /* 
       BOTONES PRINCIPALES
     */

    elementos.btnOpenReport =
        document.getElementById(
            'btn-open-report'
        );


    elementos.btnEmptyReport =
        document.getElementById(
            'btn-empty-report'
        );


    elementos.btnRefreshReports =
        document.getElementById(
            'btn-refresh-reports'
        );


    /* 
       ESTADÍSTICAS
     */

    elementos.totalReports =
        document.getElementById(
            'total-reports'
        );


    elementos.pendingReports =
        document.getElementById(
            'pending-reports'
        );


    elementos.progressReports =
        document.getElementById(
            'progress-reports'
        );


    elementos.resolvedReports =
        document.getElementById(
            'resolved-reports'
        );


    /* 
       FILTROS
     */

    elementos.statusFilter =
        document.getElementById(
            'report-status-filter'
        );


    /* 
       LISTA DE REPORTES
     */

    elementos.reportsList =
        document.getElementById(
            'reports-list'
        );


    elementos.reportsLoading =
        document.getElementById(
            'reports-loading'
        );


    elementos.reportsEmpty =
        document.getElementById(
            'reports-empty'
        );


    elementos.reportsMessage =
        document.getElementById(
            'reports-message'
        );


    /* 
       MODAL CREAR REPORTE
     */

    elementos.reportModal =
        document.getElementById(
            'report-modal'
        );


    elementos.reportModalOverlay =
        document.getElementById(
            'report-modal-overlay'
        );


    elementos.btnCloseReport =
        document.getElementById(
            'btn-close-report'
        );


    elementos.btnCancelReport =
        document.getElementById(
            'btn-cancel-report'
        );


    /* 
       FORMULARIO
     */

    elementos.reportForm =
        document.getElementById(
            'report-form'
        );


    elementos.tipoIncidente =
        document.getElementById(
            'tipo_incidente'
        );


    elementos.descripcion =
        document.getElementById(
            'descripcion'
        );


    elementos.direccion =
        document.getElementById(
            'direccion_manual'
        );


    elementos.latitud =
        document.getElementById(
            'latitud'
        );


    elementos.longitud =
        document.getElementById(
            'longitud'
        );


    elementos.foto =
        document.getElementById(
            'foto'
        );


    elementos.formMessage =
        document.getElementById(
            'report-form-message'
        );


    elementos.btnSubmitReport =
        document.getElementById(
            'btn-submit-report'
        );


    /* 
       UBICACIÓN
     */

    elementos.btnGetLocation =
        document.getElementById(
            'btn-get-location'
        );


    elementos.locationStatus =
        document.getElementById(
            'location-status'
        );


    /* 
       PREVISUALIZACIÓN DE FOTO
     */

    elementos.photoPreview =
        document.getElementById(
            'photo-preview'
        );


    elementos.photoPreviewImage =
        document.getElementById(
            'photo-preview-image'
        );


    elementos.btnRemovePhoto =
        document.getElementById(
            'btn-remove-photo'
        );


    /* 
       MODAL DETALLE
     */

    elementos.detailModal =
        document.getElementById(
            'detail-modal'
        );


    elementos.detailModalOverlay =
        document.getElementById(
            'detail-modal-overlay'
        );


    elementos.btnCloseDetail =
        document.getElementById(
            'btn-close-detail'
        );


    elementos.reportDetailContent =
        document.getElementById(
            'report-detail-content'
        );

}


/* 
   INICIALIZACIÓN
 */
document.addEventListener(
    'DOMContentLoaded',
    iniciarPagina
);


/**
 * Inicia la página de reportes.
 */

async function iniciarPagina() {

    inicializarElementos();

    configurarEventos();

    const usuario =
        await obtenerUsuarioActual();

    console.log(
        'Usuario autenticado:',
        usuario
    );


    const nombreUsuario =
        document.getElementById(
            'nombre-usuario'
        );


    if (
        nombreUsuario &&
        usuario
    ) {

        nombreUsuario.textContent =
            usuario.username;

    }


    await cargarMisReportes();

}


/* 
   EVENTOS
 */

function configurarEventos() {

    /* 
       ABRIR MODAL
     */

    elementos.btnOpenReport
        ?.addEventListener(
            'click',
            abrirModalReporte
        );


    elementos.btnEmptyReport
        ?.addEventListener(
            'click',
            abrirModalReporte
        );


    /* 
       CERRAR MODAL
     */

    elementos.btnCloseReport
        ?.addEventListener(
            'click',
            cerrarModalReporte
        );


    elementos.btnCancelReport
        ?.addEventListener(
            'click',
            cerrarModalReporte
        );


    elementos.reportModalOverlay
        ?.addEventListener(
            'click',
            cerrarModalReporte
        );


    /* 
       FILTRO
     */

    elementos.statusFilter
        ?.addEventListener(
            'change',
            manejarFiltro
        );


    /* 
       ACTUALIZAR
     */

    elementos.btnRefreshReports
        ?.addEventListener(
            'click',
            cargarMisReportes
        );


    /* 
       FORMULARIO
     */

    elementos.reportForm
        ?.addEventListener(
            'submit',
            manejarEnvioReporte
        );


    /* 
       GPS
     */

    elementos.btnGetLocation
        ?.addEventListener(
            'click',
            obtenerUbicacion
        );


    /* 
       FOTO
     */

    elementos.foto
        ?.addEventListener(
            'change',
            manejarSeleccionFoto
        );


    elementos.btnRemovePhoto
        ?.addEventListener(
            'click',
            eliminarFoto
        );


    /* 
       MODAL DETALLE
     */

    elementos.btnCloseDetail
        ?.addEventListener(
            'click',
            cerrarModalDetalle
        );


    elementos.detailModalOverlay
        ?.addEventListener(
            'click',
            cerrarModalDetalle
        );


    /* 
       ESCAPE
     */

    document.addEventListener(
        'keydown',
        manejarTeclaEscape
    );

}


/* 
   CARGAR REPORTES
 */

async function cargarMisReportes() {

    mostrarCargando(true);

    ocultarMensaje();

    try {

        const reportes =
            await obtenerMisReportes();


        estadoReportes.reportes =
            Array.isArray(reportes)
                ? reportes
                : reportes.results || [];


        actualizarEstadisticas();

        renderizarReportes();


    } catch (error) {

        console.error(
            'Error al cargar reportes:',
            error
        );


        mostrarMensaje(
            'No fue posible cargar tus reportes.',
            'error'
        );

    } finally {

        mostrarCargando(false);

    }

}


/* 
   ESTADÍSTICAS
 */

function actualizarEstadisticas() {

    const reportes =
        estadoReportes.reportes;


    const total =
        reportes.length;


    const pendientes =
        reportes.filter(
            reporte =>
                reporte.estatus === 'PENDIENTE'
        ).length;


    const progreso =
        reportes.filter(
            reporte =>
                reporte.estatus === 'PROGRESO'
        ).length;


    const resueltos =
        reportes.filter(
            reporte =>
                reporte.estatus === 'RESUELTO'
        ).length;


    elementos.totalReports.textContent =
        total;


    elementos.pendingReports.textContent =
        pendientes;


    elementos.progressReports.textContent =
        progreso;


    elementos.resolvedReports.textContent =
        resueltos;

}


/* 
   RENDERIZAR REPORTES
 */

function renderizarReportes() {

    const filtro =
        estadoReportes.filtroActual;


    let reportes =
        [...estadoReportes.reportes];


    if (
        filtro !== 'TODOS'
    ) {

        reportes =
            reportes.filter(
                reporte =>
                    reporte.estatus === filtro
            );

    }


    reportes =
        ordenarReportes(
            reportes
        );


    elementos.reportsList.innerHTML =
        '';


    if (
        reportes.length === 0
    ) {

        mostrarEstadoVacio();

        return;

    }


    elementos.reportsEmpty.hidden =
        true;


    reportes.forEach(
        reporte => {

            const tarjeta =
                crearTarjetaReporte(
                    reporte
                );


            elementos.reportsList.appendChild(
                tarjeta
            );

        }
    );

}


/* 
   CREAR TARJETA
 */
function crearTarjetaReporte(
    reporte
) {

    const article =
        document.createElement(
            'article'
        );


    article.className =
        'report-card';


    const estado =
        obtenerEstatusTexto(
            reporte.estatus
        );


    const tipo =
        obtenerTipoIncidenteTexto(
            reporte.tipo_incidente
        );


    const fecha =
        formatearFecha(
            reporte.fecha_creacion
        );


    article.innerHTML = `

        <div class="report-card__header">

            <div>

                <span class="report-card__tag">

                    ${tipo}

                </span>

                <h3>

                    Reporte #${reporte.id}

                </h3>

            </div>

            <span class="report-card__status report-card__status--${reporte.estatus.toLowerCase()}">

                ${estado}

            </span>

        </div>


        <div class="report-card__body">

            <p>

                ${escaparHTML(
                    reporte.descripcion || ''
                )}

            </p>

        </div>


        <div class="report-card__footer">

            <span>

                ${fecha}

            </span>


            <div class="report-card__actions">

                <button
                    type="button"
                    class="report-card__button"
                    data-report-id="${reporte.id}"
                >

                    Ver detalle

                </button>


                <button
                    type="button"
                    class="report-card__button"
                    data-edit-report-id="${reporte.id}"
                >

                    Editar

                </button>

            </div>

        </div>

    `;


    /* 
       BOTÓN VER DETALLE
     */

    const btnDetalle =
        article.querySelector(
            '[data-report-id]'
        );


    btnDetalle?.addEventListener(
        'click',
        () => {

            abrirDetalleReporte(
                reporte.id
            );

        }
    );


    /* 
       BOTÓN EDITAR
     */

    const btnEditar =
        article.querySelector(
            '[data-edit-report-id]'
        );


    btnEditar?.addEventListener(
        'click',
        () => {

            abrirEditarReporte(
                reporte.id
            );

        }
    );


    return article;

}


/* 
   ORDENAR REPORTES
 */

function ordenarReportes(
    reportes
) {

    return reportes.sort(
        (a, b) =>
            new Date(
                b.fecha_creacion
            ) -
            new Date(
                a.fecha_creacion
            )
    );

}


/* 
   FILTRO
 */

function manejarFiltro(
    event
) {

    estadoReportes.filtroActual =
        event.target.value;


    renderizarReportes();

}


/* 
   MODAL — CREAR REPORTE
 */

function abrirModalReporte() {

    elementos.reportModal.hidden = false;

    elementos.reportModal.style.display = 'flex';

    document.body.classList.add(
        'modal-open'
    );

    elementos.tipoIncidente.focus();

}


function cerrarModalReporte() {

    if (!elementos.reportModal) {
        return;
    }

    elementos.reportModal.hidden = true;

    elementos.reportModal.style.display = 'none';

    document.body.classList.remove(
        'modal-open'
    );

    limpiarFormulario();

}

/* 
   MODAL — EDITAR REPORTE
 */

async function abrirEditarReporte(id) {

    console.log(
        'Editar reporte:',
        id
    );

}


/* 
   FORMULARIO
 */

async function manejarEnvioReporte(
    event
) {

    event.preventDefault();


    limpiarMensajeFormulario();


    const datos = {

        tipo_incidente:
            elementos.tipoIncidente.value,

        descripcion:
            elementos.descripcion.value.trim(),

        direccion_manual:
            elementos.direccion.value.trim(),

        latitud:
            elementos.latitud.value,

        longitud:
            elementos.longitud.value

    };


    const errores =
        validarFormulario(
            datos
        );


    if (
        errores.length > 0
    ) {

        mostrarMensajeFormulario(
            errores.join(' '),
            'error'
        );

        return;

    }


    cambiarEstadoBotonEnviar(
        true
    );


    try {

        await crearReporte(
            datos,
            estadoReportes.fotoSeleccionada
        );


        mostrarMensajeFormulario(
            'Reporte enviado correctamente.',
            'success'
        );


        await cargarMisReportes();


        setTimeout(
            () => {

                cerrarModalReporte();

            },
            1200
        );


    } catch (error) {

        console.error(
            'Error al crear reporte:',
            error
        );


        mostrarMensajeFormulario(
            error.message ||
            'No fue posible enviar el reporte.',
            'error'
        );


    } finally {

        cambiarEstadoBotonEnviar(
            false
        );

    }

}


/* 
   VALIDAR FORMULARIO
 */

function validarFormulario(
    datos
) {

    const errores = [];


    if (
        !datos.tipo_incidente
    ) {

        errores.push(
            'Selecciona el tipo de incidente.'
        );

    }


    if (
        !datos.descripcion
    ) {

        errores.push(
            'Escribe una descripción.'
        );

    }


    if (
        datos.descripcion &&
        datos.descripcion.length < 10
    ) {

        errores.push(
            'La descripción debe tener al menos 10 caracteres.'
        );

    }


    return errores;

}


/* 
   GPS
 */

function obtenerUbicacion() {

    if (
        !navigator.geolocation
    ) {

        mostrarEstadoUbicacion(
            'Tu navegador no soporta geolocalización.',
            'error'
        );

        return;

    }


    mostrarEstadoUbicacion(
        'Obteniendo ubicación...',
        'info'
    );


    elementos.btnGetLocation.disabled =
        true;


    navigator.geolocation.getCurrentPosition(

        position => {

            const latitud =
                position.coords.latitude;


            const longitud =
                position.coords.longitude;


            elementos.latitud.value =
                latitud.toFixed(6);


            elementos.longitud.value =
                longitud.toFixed(6);


            mostrarEstadoUbicacion(
                `Ubicación obtenida: ${latitud.toFixed(5)}, ${longitud.toFixed(5)}`,
                'success'
            );


            elementos.btnGetLocation.disabled =
                false;

        },


        error => {

            let mensaje =
                'No fue posible obtener tu ubicación.';


            if (
                error.code ===
                error.PERMISSION_DENIED
            ) {

                mensaje =
                    'Permiso de ubicación denegado.';

            }


            if (
                error.code ===
                error.POSITION_UNAVAILABLE
            ) {

                mensaje =
                    'La ubicación no está disponible.';

            }


            if (
                error.code ===
                error.TIMEOUT
            ) {

                mensaje =
                    'La solicitud de ubicación tardó demasiado.';

            }


            mostrarEstadoUbicacion(
                mensaje,
                'error'
            );


            elementos.btnGetLocation.disabled =
                false;

        }

    );

}


/* 
   FOTO
 */

function manejarSeleccionFoto(
    event
) {

    const archivo =
        event.target.files[0];


    if (
        !archivo
    ) {

        return;

    }


    if (
        !archivo.type.startsWith(
            'image/'
        )
    ) {

        mostrarMensajeFormulario(
            'Selecciona una imagen válida.',
            'error'
        );


        elementos.foto.value =
            '';


        return;

    }


    estadoReportes.fotoSeleccionada =
        archivo;


    const reader =
        new FileReader();


    reader.onload =
        event => {

            elementos.photoPreviewImage.src =
                event.target.result;


            elementos.photoPreview.hidden =
                false;

        };


    reader.readAsDataURL(
        archivo
    );

}


function eliminarFoto() {

    estadoReportes.fotoSeleccionada =
        null;


    elementos.foto.value =
        '';


    elementos.photoPreviewImage.src =
        '';


    elementos.photoPreview.hidden =
        true;

}


/* 
   LIMPIAR FORMULARIO
 */

function limpiarFormulario() {

    elementos.reportForm.reset();


    eliminarFoto();


    elementos.latitud.value =
        '';


    elementos.longitud.value =
        '';


    elementos.locationStatus.textContent =
        'Ubicación no obtenida';


    elementos.locationStatus.className =
        'report-location__status';


    limpiarMensajeFormulario();

}


/* 
   DETALLE
 */

async function abrirDetalleReporte(
    id
) {

    try {

        elementos.reportDetailContent.innerHTML = `

            <div class="reports-loading">

                <div class="reports-loading__spinner">
                </div>

                <p>
                    Cargando información...
                </p>

            </div>

        `;


        elementos.detailModal.hidden =
            false;


        document.body.classList.add(
            'modal-open'
        );


        const reporte =
            await obtenerReporte(
                id
            );


        elementos.reportDetailContent.innerHTML =
            crearDetalleReporte(
                reporte
            );


    } catch (error) {

        console.error(
            'Error al obtener detalle:',
            error
        );


        elementos.reportDetailContent.innerHTML = `

            <div class="reports-message error show">

                No fue posible cargar el reporte.

            </div>

        `;

    }

}


function crearDetalleReporte(
    reporte
) {

    const estado =
        obtenerEstatusTexto(
            reporte.estatus
        );


    const tipo =
        obtenerTipoIncidenteTexto(
            reporte.tipo_incidente
        );


    const fecha =
        formatearFecha(
            reporte.fecha_creacion
        );


    return `

        <div class="report-detail__item">

            <span>
                Tipo de incidente
            </span>

            <strong>
                ${tipo}
            </strong>

        </div>


        <div class="report-detail__item">

            <span>
                Estado
            </span>

            <strong>
                ${estado}
            </strong>

        </div>


        <div class="report-detail__item">

            <span>
                Descripción
            </span>

            <p>
                ${escaparHTML(
                    reporte.descripcion || ''
                )}
            </p>

        </div>


        <div class="report-detail__item">

            <span>
                Fecha del reporte
            </span>

            <strong>
                ${fecha}
            </strong>

        </div>


        ${
            reporte.direccion_manual
            ? `

                <div class="report-detail__item">

                    <span>
                        Dirección o referencia
                    </span>

                    <strong>
                        ${escaparHTML(
                            reporte.direccion_manual
                        )}
                    </strong>

                </div>

            `
            : ''
        }


        ${
            reporte.latitud &&
            reporte.longitud
            ? `

                <div class="report-detail__item">

                    <span>
                        Ubicación
                    </span>

                    <strong>

                        ${reporte.latitud},
                        ${reporte.longitud}

                    </strong>

                </div>

            `
            : ''
        }


        ${
            reporte.foto
            ? `

                <div class="report-detail__photo">

                    <img
                        src="${reporte.foto}"
                        alt="Fotografía del reporte"
                    >

                </div>

            `
            : ''
        }

    `;

}


function cerrarModalDetalle() {

    if (!elementos.detailModal) {
        return;
    }

    elementos.detailModal.hidden = true;

    elementos.detailModal.style.display = 'none';

    document.body.classList.remove(
        'modal-open'
    );

    if (elementos.reportDetailContent) {

        elementos.reportDetailContent.innerHTML = '';

    }

}


/* 
   MENSAJES
 */

function mostrarMensaje(
    texto,
    tipo = 'info'
) {

    elementos.reportsMessage.textContent =
        texto;


    elementos.reportsMessage.className =
        `reports-message ${tipo}`;


    elementos.reportsMessage.hidden =
        false;

}


function ocultarMensaje() {

    elementos.reportsMessage.hidden =
        true;


    elementos.reportsMessage.textContent =
        '';

}


function mostrarMensajeFormulario(
    texto,
    tipo
) {

    elementos.formMessage.textContent =
        texto;


    elementos.formMessage.className =
        `report-form-message ${tipo}`;


    elementos.formMessage.hidden =
        false;

}


function limpiarMensajeFormulario() {

    elementos.formMessage.textContent =
        '';


    elementos.formMessage.hidden =
        true;

}


function mostrarEstadoUbicacion(
    texto,
    tipo
) {

    elementos.locationStatus.textContent =
        texto;


    elementos.locationStatus.className =
        `report-location__status ${tipo}`;

}


/* 
   ESTADO DE CARGA
 */

function mostrarCargando(
    mostrar
) {

    elementos.reportsLoading.hidden =
        !mostrar;

}


/* 
   ESTADO VACÍO
 */

function mostrarEstadoVacio() {

    elementos.reportsEmpty.hidden =
        false;


    elementos.reportsList.innerHTML =
        '';

}


/* 
   BOTÓN ENVIAR
 */

function cambiarEstadoBotonEnviar(
    cargando
) {

    elementos.btnSubmitReport.disabled =
        cargando;


    elementos.btnSubmitReport.textContent =
        cargando
            ? 'Enviando...'
            : 'Enviar reporte';

}


/* 
   ESCAPE
 */

function manejarTeclaEscape(
    event
) {

    if (
        event.key !== 'Escape'
    ) {

        return;

    }


    if (
        !elementos.reportModal.hidden
    ) {

        cerrarModalReporte();

    }


    if (
        !elementos.detailModal.hidden
    ) {

        cerrarModalDetalle();

    }

}


/* 
   FORMATO DE FECHA
 */

function formatearFecha(
    fechaISO
) {

    if (
        !fechaISO
    ) {

        return 'Fecha no disponible';

    }


    const fecha =
        new Date(
            fechaISO
        );


    return fecha.toLocaleString(
        'es-MX',
        {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }
    );

}


/* 
   TEXTO DEL ESTATUS
 */

function obtenerEstatusTexto(
    estatus
) {

    const estados = {

        PENDIENTE:
            'Pendiente',

        PROGRESO:
            'En progreso',

        RESUELTO:
            'Resuelto'

    };


    return estados[
        estatus
    ] || estatus;

}


/* 
   TEXTO DEL TIPO
 */

function obtenerTipoIncidenteTexto(
    tipo
) {

    const tipos = {

        CALLE:
            'Fuga en la calle',

        BANQUETA:
            'Fuga en banqueta',

        DOMICILIO:
            'Fuga en domicilio',

        TUBERIA:
            'Tubería dañada',

        OTRO:
            'Otro tipo de reporte'

    };


    return tipos[
        tipo
    ] || tipo;

}


/* 
   ESCAPAR HTML
 */

/**
 * Evita insertar directamente texto
 * proporcionado por el usuario dentro
 * del HTML generado dinámicamente.
 */

function escaparHTML(
    texto
) {

    const div =
        document.createElement(
            'div'
        );


    div.textContent =
        texto;


    return div.innerHTML;

}