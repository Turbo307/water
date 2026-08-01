/*
    WATER REPORT — AUTENTICACIÓN DE USUARIOS

    Este archivo controla únicamente la autenticación
    de los usuarios mediante la API REST y JWT.

    Responsabilidades:

    - Iniciar sesión
    - Obtener Access Token
    - Obtener Refresh Token
    - Guardar tokens
    - Renovar Access Token
    - Cerrar sesión
    - Redirigir al usuario
*/


/*
    CONFIGURACIÓN DE LA API
*/

const API_TOKEN_URL =
    '/api/token/';


const API_TOKEN_REFRESH_URL =
    '/api/token/refresh/';


/*
    ELEMENTOS DEL LOGIN
*/

const formularioLogin =
    document.getElementById(
        'login-form'
    );


const botonLogin =
    document.getElementById(
        'login-button'
    );


const mensajeLogin =
    document.getElementById(
        'login-message'
    );


/*
    INICIALIZAR LOGIN
*/

if (
    formularioLogin
) {

    formularioLogin.addEventListener(
        'submit',
        manejarLogin
    );

}


/*
    INICIAR SESIÓN
*/

async function manejarLogin(
    event
) {

    event.preventDefault();


    /*
        OBTENER DATOS DEL FORMULARIO
    */

    const username =
        document
            .getElementById(
                'username'
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                'password'
            )
            .value;


    /*
        VALIDAR CAMPOS
    */

    if (
        !username ||
        !password
    ) {

        mostrarMensajeLogin(
            'Ingresa tu usuario y contraseña.',
            'error'
        );

        return;

    }


    /*
        CAMBIAR ESTADO DEL BOTÓN
    */

    if (
        botonLogin
    ) {

        botonLogin.disabled =
            true;


        botonLogin.textContent =
            'Iniciando sesión...';

    }


    ocultarMensajeLogin();


    try {

        /*
            ENVIAR CREDENCIALES
            A LA API JWT
        */

        const response =
            await fetch(
                API_TOKEN_URL,
                {

                    method:
                        'POST',

                    headers: {

                        'Content-Type':
                            'application/json',

                        'Accept':
                            'application/json'

                    },

                    body:
                        JSON.stringify({

                            username:
                                username,

                            password:
                                password

                        })

                }
            );


        /*
            OBTENER RESPUESTA
        */

        const datos =
            await response.json();


        /*
            VALIDAR RESPUESTA
        */

        if (
            !response.ok
        ) {

            mostrarMensajeLogin(
                'Usuario o contraseña incorrectos.',
                'error'
            );

            return;

        }


        /*
            VERIFICAR TOKENS
        */

        if (
            !datos.access ||
            !datos.refresh
        ) {

            mostrarMensajeLogin(
                'La API no devolvió los tokens de autenticación.',
                'error'
            );

            return;

        }


        /*
            GUARDAR ACCESS TOKEN
        */

        localStorage.setItem(
            'access_token',
            datos.access
        );


        /*
            GUARDAR REFRESH TOKEN
        */

        localStorage.setItem(
            'refresh_token',
            datos.refresh
        );


        /*
            MOSTRAR MENSAJE DE ÉXITO
        */

        mostrarMensajeLogin(
            'Inicio de sesión exitoso.',
            'success'
        );


        /*
            REDIRIGIR AL ÁREA
            DE REPORTES
        */

        window.location.href =
            '/reportes-app/';


    }


    catch (
        error
    ) {

        console.error(
            'Error al iniciar sesión:',
            error
        );


        mostrarMensajeLogin(
            'No fue posible conectar con el servidor.',
            'error'
        );

    }


    finally {

        /*
            RESTAURAR BOTÓN
        */

        if (
            botonLogin
        ) {

            botonLogin.disabled =
                false;


            botonLogin.textContent =
                'Iniciar sesión';

        }

    }

}


/*
    OBTENER ACCESS TOKEN
*/

function obtenerAccessToken() {

    return localStorage.getItem(
        'access_token'
    );

}


/*
    OBTENER REFRESH TOKEN
*/

function obtenerRefreshToken() {

    return localStorage.getItem(
        'refresh_token'
    );

}


/*
    RENOVAR ACCESS TOKEN
*/

async function renovarAccessToken() {

    const refreshToken =
        obtenerRefreshToken();


    if (
        !refreshToken
    ) {

        return null;

    }


    try {

        const response =
            await fetch(
                API_TOKEN_REFRESH_URL,
                {

                    method:
                        'POST',

                    headers: {

                        'Content-Type':
                            'application/json',

                        'Accept':
                            'application/json'

                    },

                    body:
                        JSON.stringify({

                            refresh:
                                refreshToken

                        })

                }
            );


        if (
            !response.ok
        ) {

            cerrarSesion();

            return null;

        }


        const datos =
            await response.json();


        if (
            datos.access
        ) {

            localStorage.setItem(
                'access_token',
                datos.access
            );

        }


        return datos.access;


    }

    catch (
        error
    ) {

        console.error(
            'Error al renovar el token:',
            error
        );


        return null;

    }

}


/*
    CERRAR SESIÓN
*/

function cerrarSesion() {

    localStorage.removeItem(
        'access_token'
    );


    localStorage.removeItem(
        'refresh_token'
    );


    window.location.href =
        '/';

}


/*
    VERIFICAR SI EXISTE
    UNA SESIÓN ACTIVA
*/

function usuarioEstaAutenticado() {

    return Boolean(
        obtenerAccessToken()
    );

}


/*
    MOSTRAR MENSAJE
*/

function mostrarMensajeLogin(
    texto,
    tipo
) {

    if (
        !mensajeLogin
    ) {

        return;

    }


    mensajeLogin.textContent =
        texto;


    mensajeLogin.className =
        `login-alert ${tipo}`;


    mensajeLogin.hidden =
        false;

}


/*
    OCULTAR MENSAJE
*/

function ocultarMensajeLogin() {

    if (
        !mensajeLogin
    ) {

        return;

    }


    mensajeLogin.textContent =
        '';


    mensajeLogin.hidden =
        true;

}