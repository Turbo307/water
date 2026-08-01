/*

    WATER REPORT — USERS API


    Este archivo contiene únicamente las funciones
    encargadas de comunicarse con la API de Django.

    NO manejar aquí:

    - DOM
    - Modales
    - Formularios visuales
    - Tarjetas
    - Filtros
    - Mensajes de interfaz
    - Eventos


*/


/* 
   CONFIGURACIÓN DE LA API
 */

const API_BASE_URL = '/api';

const API_REPORTES_URL =
    `${API_BASE_URL}/reportes-fuga/`;

const API_USUARIO_URL =
    '/user-auth/';


    /*
   AUTENTICACIÓN JWT
*/

/**
 * Obtiene el Access Token guardado
 * después de iniciar sesión.
 */

function obtenerTokenJWT() {

    return localStorage.getItem(
        'access_token'
    );

}


/**
 * Crea los headers necesarios
 * para comunicarse con la API.
 */

function obtenerHeadersAutenticados() {

    const token =
        obtenerTokenJWT();


    return {

        'Accept':
            'application/json',

        'Authorization':
            `Bearer ${token}`

    };

}




/* 
   CSRF
 */

/**
 * Obtiene el token CSRF desde las cookies.
 *
 * Django utiliza este token para proteger
 * las peticiones que modifican información.
 */

function obtenerCookie(nombre) {

    let valor = null;

    if (
        document.cookie &&
        document.cookie !== ''
    ) {

        const cookies =
            document.cookie.split(';');


        for (
            let i = 0;
            i < cookies.length;
            i++
        ) {

            const cookie =
                cookies[i].trim();


            if (
                cookie.substring(
                    0,
                    nombre.length + 1
                ) === `${nombre}=`
            ) {

                valor =
                    decodeURIComponent(
                        cookie.substring(
                            nombre.length + 1
                        )
                    );

                break;

            }

        }

    }

    return valor;

}


/**
 * Obtiene el token CSRF necesario
 * para peticiones POST, PATCH y DELETE.
 */

function obtenerCSRFToken() {

    return obtenerCookie(
        'csrftoken'
    );

}


/* 
   MANEJO DE RESPUESTAS
 */

/**
 * Convierte una respuesta HTTP en JSON.
 *
 * Si Django devuelve un error,
 * se lanza una excepción con la información.
 */

async function procesarRespuesta(
    response
) {

    let datos = null;


    try {

        datos =
            await response.json();

    } catch (error) {

        datos = null;

    }


    if (
        !response.ok
    ) {

        let mensaje =
            'Ocurrió un error al comunicarse con el servidor.';


        if (
            datos &&
            typeof datos === 'object'
        ) {

            mensaje =
                Object.entries(datos)
                    .map(
                        ([campo, errores]) => {

                            if (
                                Array.isArray(
                                    errores
                                )
                            ) {

                                return `${campo}: ${errores.join(', ')}`;

                            }

                            return `${campo}: ${errores}`;

                        }
                    )
                    .join(' | ');

        }


        throw new Error(
            mensaje
        );

    }


    return datos;

}


/* 
   USUARIO
 */

/**
 * Obtiene la información del usuario
 * actualmente autenticado.
 */

async function obtenerUsuarioActual() {

    const response =
        await fetch(
            API_USUARIO_URL,
            {
                method: 'GET',
                headers: 
                    obtenerHeadersAutenticados()
                
            }
        );


    return procesarRespuesta(
        response
    );

}


/* 
   REPORTES — OBTENER MIS REPORTES
 */

/**
 * Obtiene únicamente los reportes
 * pertenecientes al usuario autenticado.
 *
 * Django filtra mediante:
 *
 * ?owner=me
 */

async function obtenerMisReportes() {

    const response =
        await fetch(
            API_REPORTES_URL,
            {
                method: 'GET',
                headers:
                     obtenerHeadersAutenticados()
            }
        );


    return procesarRespuesta(
        response
    );

}


/* 
   REPORTES — OBTENER REPORTE
 */

/**
 * Obtiene un reporte específico.
 *
 * @param {string|number} id
 */

async function obtenerReporte(
    id
) {

    if (!id) {

        throw new Error(
            'El ID del reporte es obligatorio.'
        );

    }


    const response =
        await fetch(
            `${API_REPORTES_URL}${id}/`,
            {
                method: 'GET',
                headers: {
                    'Accept':
                        'application/json'
                }
            }
        );


    return procesarRespuesta(
        response
    );

}


/* 
   REPORTES — CREAR
 */
/**
 * Crea un nuevo reporte.
 *
 * Si existe una fotografía,
 * se utiliza FormData.
 *
 * Si no existe fotografía,
 * se utiliza JSON.
 *
 * @param {Object} datos
 * @param {File|null} foto
 */

async function crearReporte(
    datos,
    foto = null
) {

    const headers = {

        'X-CSRFToken':
            obtenerCSRFToken()

    };


    let body;


    /* 
       REPORTE CON FOTO
     */

    if (foto) {

        const formData =
            new FormData();


        Object.entries(
            datos
        ).forEach(
            ([campo, valor]) => {

                if (
                    valor !== null &&
                    valor !== undefined &&
                    valor !== ''
                ) {

                    formData.append(
                        campo,
                        valor
                    );

                }

            }
        );


        formData.append(
            'foto',
            foto
        );


        body =
            formData;

    }


    /* 
       REPORTE SIN FOTO
     */

    else {

        headers[
            'Content-Type'
        ] =
            'application/json';


        body =
            JSON.stringify(
                datos
            );

    }


    const response =
        await fetch(
            API_REPORTES_URL,
            {
                method: 'POST',

                headers,

                body
            }
        );


    return procesarRespuesta(
        response
    );

}


/* 
   REPORTES — ACTUALIZAR
 */

/**
 * Actualiza parcialmente un reporte.
 *
 * @param {string|number} id
 * @param {Object} datos
 * @param {File|null} foto
 */

async function actualizarReporte(
    id,
    datos,
    foto = null
) {

    if (!id) {

        throw new Error(
            'El ID del reporte es obligatorio.'
        );

    }


    const headers = {

        'X-CSRFToken':
            obtenerCSRFToken()

    };


    let body;


    if (foto) {

        const formData =
            new FormData();


        Object.entries(
            datos
        ).forEach(
            ([campo, valor]) => {

                if (
                    valor !== null &&
                    valor !== undefined &&
                    valor !== ''
                ) {

                    formData.append(
                        campo,
                        valor
                    );

                }

            }
        );


        formData.append(
            'foto',
            foto
        );


        body =
            formData;

    }


    else {

        headers[
            'Content-Type'
        ] =
            'application/json';


        body =
            JSON.stringify(
                datos
            );

    }


    const response =
        await fetch(
            `${API_REPORTES_URL}${id}/`,
            {
                method: 'PATCH',

                headers,

                body
            }
        );


    return procesarRespuesta(
        response
    );

}


/* 
   REPORTES — ELIMINAR
 */

/**
 * Elimina un reporte.
 *
 * @param {string|number} id
 */

async function eliminarReporte(
    id
) {

    if (!id) {

        throw new Error(
            'El ID del reporte es obligatorio.'
        );

    }


    const response =
        await fetch(
            `${API_REPORTES_URL}${id}/`,
            {
                method: 'DELETE',

                headers: {

                    'X-CSRFToken':
                        obtenerCSRFToken()

                }

            }
        );


    if (
        response.status === 204
    ) {

        return true;

    }


    await procesarRespuesta(
        response
    );


    return true;

}


/* 
   CERRAR SESIÓN
 */

/**
 * Cierra la sesión del usuario.
 *
 * El logout se realiza mediante
 * la vista Django.
 */

function cerrarSesion() {

    window.location.href =
        '/logout/';

}