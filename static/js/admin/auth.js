/*

    WATER ADMIN - AUTENTICACIÓN

*/


/*

    VERIFICAR SESIÓN DEL ADMINISTRADOR

*/

async function verificarSesionAdmin() {

    /*
        OBTENER ACCESS TOKEN
    */

    const token =
        localStorage.getItem(
            "access_token"
        );


    /*
        VERIFICAR SI EXISTE TOKEN
    */

    if (!token) {

        window.location.href =
            "/admin-login/";

        return false;

    }


    try {

        /*
            VERIFICAR TOKEN CON LA API
        */

        const respuesta =
            await fetch(
                "/api/reportes-fuga/",
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    }

                }
            );


        /*
            VERIFICAR SI EL TOKEN EXPIRÓ
        */

        if (
            respuesta.status === 401
        ) {

            localStorage.removeItem(
                "access_token"
            );


            localStorage.removeItem(
                "refresh_token"
            );


            window.location.href =
                "/admin-login/";


            return false;

        }


        /*
            VERIFICAR OTROS ERRORES
        */

        if (
            !respuesta.ok
        ) {

            console.error(
                "Error al verificar la sesión."
            );

            return false;

        }


        /*
            SESIÓN VÁLIDA
        */

        document.body.classList.remove(
            "admin-loading"
        );

        return true;


    } catch (error) {

        console.error(
            "Error al verificar la sesión:",
            error
        );


        return false;

    }

}


/*

    EJECUTAR AL CARGAR LA PÁGINA

*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        verificarSesionAdmin();

    }
);