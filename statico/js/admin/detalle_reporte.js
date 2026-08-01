 /*
        OBTENER ID DEL REPORTE
    */

    const partesUrl =
        window.location.pathname.split("/");


    const reporteId =
        partesUrl[2];


    /*
        OBTENER TOKEN JWT
    */

    const token =
        localStorage.getItem(
            "access_token"
        );


    /*
        ELEMENTOS DEL DOM
    */

    const contenedor =
        document.getElementById(
            "detalle-reporte"
        );


    const mensajeEstado =
        document.getElementById(
            "mensaje-estado"
        );


    /*
        MOSTRAR MENSAJES
    */

    function mostrarMensaje(
        mensaje,
        tipo
    ) {

        mensajeEstado.textContent =
            mensaje;


        mensajeEstado.className =
            `mensaje-estado ${tipo}`;

    }


    /*
        CARGAR REPORTE
    */

    async function cargarReporte() {

        try {

            const respuesta =
                await fetch(
                    `/api/reportes-fuga/${reporteId}/`,
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


            // veridicar si la sesion expiro
            if (
                respuesta.status === 401
            ){
                localStorage.removeItem(
                    "access_token"
                );

                localStorage.removeItem(
                    "refresh_token"
                );

                window.location.href =
                    "/admin-login/"

                return;
            }

            // verificar la respuesta

            if (
                !respuesta.ok 
            ){

                 console.error(
                      "Error de API:",
                    datos
                 );

                throw new Error(
                    "No se pudo actualizar el estado"
                );
            }


            const reporte =
                await respuesta.json();


            console.log(
                "Reporte recibido:",
                reporte
            );


            /*
                MOSTRAR INFORMACIÓN
            */

            contenedor.innerHTML = `

                <div class="detail-grid">


                    <div class="detail-item">

                        <span class="detail-label">
                            ID
                        </span>

                        <p>
                            ${reporte.id}
                        </p>

                    </div>


                    <div class="detail-item">

                        <span class="detail-label">
                            Usuario
                        </span>

                        <p>
                            ${
                                reporte.owner_username
                                ||
                                "Sin usuario"
                            }
                        </p>

                    </div>


                    <div class="detail-item">

                        <span class="detail-label">
                            Tipo de incidente
                        </span>

                        <p>
                            ${
                                reporte.tipo_incidente
                                ||
                                "Sin tipo"
                            }
                        </p>

                    </div>


                    <div class="detail-item">

                        <span class="detail-label">
                            Estado actual
                        </span>

                        <p
                            id="estado-actual"
                            class="status-value"
                        >
                            ${
                                reporte.estatus
                                ||
                                "Sin estado"
                            }
                        </p>

                    </div>


                    <div class="detail-item detail-item-full">

                        <span class="detail-label">
                            Descripción
                        </span>

                        <p>
                            ${
                                reporte.descripcion
                                ||
                                "Sin descripción"
                            }
                        </p>

                    </div>


                    <div class="detail-item detail-item-full">

                        <span class="detail-label">
                            Dirección
                        </span>

                        <p>
                            ${
                                reporte.direccion_manual
                                ||
                                "Sin dirección"
                            }
                        </p>

                    </div>


                    <div class="detail-item">

                        <span class="detail-label">
                            Latitud
                        </span>

                        <p>
                            ${
                                reporte.latitud
                                ||
                                "Sin ubicación"
                            }
                        </p>

                    </div>


                    <div class="detail-item">

                        <span class="detail-label">
                            Longitud
                        </span>

                        <p>
                            ${
                                reporte.longitud
                                ||
                                "Sin ubicación"
                            }
                        </p>

                    </div>


                    <div class="detail-item">

                        <span class="detail-label">
                            Fecha de creación
                        </span>

                        <p>
                            ${
                                reporte.fecha_creacion

                                ?

                                new Date(
                                    reporte.fecha_creacion
                                ).toLocaleString(
                                    "es-MX"
                                )

                                :

                                "Sin fecha"
                            }
                        </p>

                    </div>


                </div>


                <!-- ACTUALIZAR ESTADO -->

                <div class="update-status">

                    <h2>
                        Actualizar estado
                    </h2>


                    <div class="status-controls">

                        <select
                            id="nuevo-estado"
                        >

                            <option
                                value="PENDIENTE"
                                ${
                                    reporte.estatus ===
                                    "PENDIENTE"
                                    ?
                                    "selected"
                                    :
                                    ""
                                }
                            >
                                Pendiente
                            </option>


                            <option
                                value="PROGRESO"
                                ${
                                    reporte.estatus ===
                                    "PROGRESO"
                                    ?
                                    "selected"
                                    :
                                    ""
                                }
                            >
                                En atención
                            </option>


                            <option
                                value="RESUELTO"
                                ${
                                    reporte.estatus ===
                                    "RESUELTO"
                                    ?
                                    "selected"
                                    :
                                    ""
                                }
                            >
                                Solucionado
                            </option>

                        </select>


                        <button
                            type="button"
                            id="actualizar-estado"
                        >
                            Actualizar estado
                        </button>

                    </div>

                </div>


                <!-- FOTOGRAFÍA -->

                <div class="report-photo">

                    <h2>
                        Fotografía del reporte
                    </h2>


                    ${
                        reporte.foto

                        ?

                        `

                        <img
                            src="${reporte.foto}"
                            alt="Fotografía del reporte"
                        >

                        `

                        :

                        `

                        <p>
                            No hay fotografía disponible.
                        </p>

                        `
                    }

                </div>

            `;


            /*
                BOTON ACTUALIZAR
            */

            const botonActualizar =
                document.getElementById(
                    "actualizar-estado"
                );


            botonActualizar.addEventListener(
                "click",
                actualizarEstado
            );


        } catch (error) {

            console.error(
                "Error:",
                error
            );


            contenedor.innerHTML = `

                <div class="error-message">

                    <p>
                        No se pudo cargar el detalle del reporte.
                    </p>

                </div>

            `;

        }

    }


    /*
        ACTUALIZAR ESTADO
    */

    async function actualizarEstado() {

        const nuevoEstado =
            document.getElementById(
                "nuevo-estado"
            ).value;


        const botonActualizar =
            document.getElementById(
                "actualizar-estado"
            );


        /*
            DESACTIVAR BOTÓN
        */

        botonActualizar.disabled =
            true;


        botonActualizar.textContent =
            "Actualizando...";


        mensajeEstado.textContent =
            "";


        try {

            /*
                ENVIAR CAMBIO A LA API
            */

            const respuesta =
                await fetch(
                    `/api/reportes-fuga/${reporteId}/`,
                    {

                        method: "PATCH",

                        headers: {

                            "Authorization":
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                estatus:
                                    nuevoEstado

                            })

                    }
                );


            const datos =
                await respuesta.json();


            /*
                VALIDAR RESPUESTA
            */

            if (
                !respuesta.ok
            ) {

                console.error(
                    "Error de API:",
                    datos
                );


                throw new Error(
                    "No se pudo actualizar el estado"
                );

            }


            /*
                ACTUALIZAR ESTADO EN PANTALLA
            */

            const estadoActual =
                document.getElementById(
                    "estado-actual"
                );


            estadoActual.textContent =
                nuevoEstado;


            /*
                MENSAJE DE ÉXITO
            */

            mostrarMensaje(
                "Estado actualizado correctamente.",
                "exito"
            );


        } catch (error) {

            console.error(
                "Error:",
                error
            );


            mostrarMensaje(
                "No se pudo actualizar el estado del reporte.",
                "error"
            );


        } finally {

            /*
                REACTIVAR BOTÓN
            */

            botonActualizar.disabled =
                false;


            botonActualizar.textContent =
                "Actualizar estado";

        }

    }


    /*
        INICIAR CARGA
    */

    cargarReporte();