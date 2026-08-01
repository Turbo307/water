/*

    WATER - LOGIN

*/


/*

    ELEMENTOS DEL DOM

*/

const formulario =
    document.getElementById(
        "login-form"
    );


const botonLogin =
    document.getElementById(
        "login-button"
    );


const passwordInput =
    document.getElementById(
        "password"
    );


const passwordToggle =
    document.getElementById(
        "password-toggle"
    );


const eyeClosed =
    document.getElementById(
        "eye-closed"
    );


const eyeOpen =
    document.getElementById(
        "eye-open"
    );


const mensaje =
    document.getElementById(
        "mensaje"
    );


/*

    MOSTRAR / OCULTAR CONTRASEÑA

*/

passwordToggle.addEventListener(
    "click",
    function() {


        /*
        
            VERIFICAR TIPO ACTUAL DEL INPUT
        
        */

        const isPassword =
            passwordInput.type === "password";


        /*
        
            MOSTRAR CONTRASEÑA
        
        */

        if (isPassword) {


            passwordInput.type =
                "text";


            eyeClosed.classList.add(
                "hidden"
            );


            eyeOpen.classList.remove(
                "hidden"
            );


            passwordToggle.setAttribute(
                "aria-label",
                "Ocultar contraseña"
            );


        }


        /*
        
            OCULTAR CONTRASEÑA
        
        */

        else {


            passwordInput.type =
                "password";


            eyeOpen.classList.add(
                "hidden"
            );


            eyeClosed.classList.remove(
                "hidden"
            );


            passwordToggle.setAttribute(
                "aria-label",
                "Mostrar contraseña"
            );


        }


    }
);


/*

    LOGIN

*/

formulario.addEventListener(
    "submit",
    async function(event) {


        /*
        
            EVITAR RECARGAR LA PÁGINA
        
        */

        event.preventDefault();


        /*
            OBTENER USUARIO
        */

        const username =
            document
            .getElementById(
                "username"
            )
            .value;


        /*
        
            OBTENER CONTRASEÑA
        */

        const password =
            document
            .getElementById(
                "password"
            )
            .value;


        /*
            DESHABILITAR BOTÓN
        */

        botonLogin.disabled =
            true;


        botonLogin.textContent =
            "Iniciando sesión...";


        /*
            LIMPIAR MENSAJE ANTERIOR
        */

        mensaje.textContent =
            "";


        try {


            /*
                ENVIAR CREDENCIALES A LA API
            */

            const respuesta =
                await fetch(
                    "/api/token/",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

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
                OBTENER RESPUESTA JSON
            */

            const datos =
                await respuesta.json();


            /*
                VALIDAR AUTENTICACIÓN
            */

            if (
                !respuesta.ok
            ) {


                mensaje.textContent =
                    "Usuario o contraseña incorrectos.";


                mensaje.className =
                    "mensaje error";


                botonLogin.disabled =
                    false;


                botonLogin.textContent =
                    "Iniciar sesión";


                return;


            }


            /*
                GUARDAR ACCESS TOKEN
            
            */

            localStorage.setItem(
                "access_token",
                datos.access
            );


            /*
            
                GUARDAR REFRESH TOKEN
        
            */

            localStorage.setItem(
                "refresh_token",
                datos.refresh
            );


            /*
                MOSTRAR MENSAJE DE ÉXITO
            
            */

            mensaje.textContent =
                "Inicio de sesión exitoso.";


            mensaje.className =
                "mensaje exito";


            /*
            
                REDIRIGIR AL DASHBOARD
            */

            window.location.href =
                "/dashboard/";


        }


        catch (error) {


            /*
            
                MOSTRAR ERROR EN CONSOLA
            
            */

            console.error(
                "Error en el login:",
                error
            );


            /*
            
                MOSTRAR ERROR AL USUARIO
            
            */

            mensaje.textContent =
                "Error al conectar con el servidor.";


            mensaje.className =
                "mensaje error";


            /*
            
                REACTIVAR BOTÓN
            
            */

            botonLogin.disabled =
                false;


            botonLogin.textContent =
                "Iniciar sesión";


        }


    }
);