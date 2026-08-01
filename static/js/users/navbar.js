/*
WATER REPORT — NAVBAR

Controla la navegación global
mediante autenticación JWT.

*/

/*
URL PARA OBTENER
EL USUARIO AUTENTICADO
*/

const API_USUARIO_NAVBAR_URL =
'/user-auth/';

/*
INICIALIZAR NAVBAR
*/

document.addEventListener(
'DOMContentLoaded',
inicializarNavbar
);

/*
FUNCIÓN PRINCIPAL
*/

async function inicializarNavbar() {

/*
    OBTENER TOKEN JWT
*/

const token =
    localStorage.getItem(
        'access_token'
    );


/*
    ELEMENTOS DEL NAVBAR
*/

const navbarAuthenticated =
    document.getElementById(
        'navbar-authenticated'
    );


const navbarGuest =
    document.getElementById(
        'navbar-guest'
    );


const navbarUsername =
    document.getElementById(
        'navbar-username'
    );


/*
    SI NO EXISTE TOKEN
*/

if (
    !token
) {

    mostrarUsuarioNoAutenticado(
        navbarAuthenticated,
        navbarGuest
    );

    return;

}


/*
    CONSULTAR USUARIO
*/

try {

    const response =
        await fetch(
            API_USUARIO_NAVBAR_URL,
            {

                method:
                    'GET',

                headers: {

                    'Accept':
                        'application/json',

                    'Authorization':
                        `Bearer ${token}`

                }

            }
        );


    /*
        SI EL TOKEN NO ES VÁLIDO
    */

    if (
        !response.ok
    ) {

        mostrarUsuarioNoAutenticado(
            navbarAuthenticated,
            navbarGuest
        );

        return;

    }


    /*
        OBTENER DATOS
    */

    const usuario =
        await response.json();


    console.log(
        'Usuario del navbar:',
        usuario
    );


    /*
        MOSTRAR NAVBAR
        AUTENTICADO
    */

    if (
        navbarAuthenticated
    ) {

        navbarAuthenticated.hidden =
            false;

    }


    /*
        OCULTAR NAVBAR
        DE INVITADO
    */

    if (
        navbarGuest
    ) {

        navbarGuest.hidden =
            true;

    }


    /*
        MOSTRAR NOMBRE
    */

    if (
        navbarUsername
    ) {

        navbarUsername.textContent =
            usuario.username || '';

    }


}

catch (
    error
) {

    console.error(
        'Error al obtener usuario del navbar:',
        error
    );


    mostrarUsuarioNoAutenticado(
        navbarAuthenticated,
        navbarGuest
    );

}

}

/*
MOSTRAR USUARIO
NO AUTENTICADO
*/

function mostrarUsuarioNoAutenticado(
navbarAuthenticated,
navbarGuest
) {

/*
    OCULTAR OPCIONES
    DE USUARIO AUTENTICADO
*/

if (
    navbarAuthenticated
) {

    navbarAuthenticated.hidden =
        true;

}


/*
    MOSTRAR OPCIONES
    DE INVITADO
*/

if (
    navbarGuest
) {

    navbarGuest.hidden =
        false;

}

}

/*
CERRAR SESIÓN
*/

document.addEventListener(
'click',
event => {

    if (
        event.target.id !==
        'navbar-logout'
    ) {

        return;

    }


    /*
        ELIMINAR ACCESS TOKEN
    */

    localStorage.removeItem(
        'access_token'
    );


    /*
        ELIMINAR REFRESH TOKEN
    */

    localStorage.removeItem(
        'refresh_token'
    );


    /*
        REGRESAR AL INICIO
    */

    window.location.href =
        '/';

}

);