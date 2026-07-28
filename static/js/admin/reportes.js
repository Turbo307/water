/*
=========================================================
    WATER ADMIN - REPORTES
=========================================================
*/


document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarReportes();

    }
);


/*
=========================================================
    CARGAR REPORTES
=========================================================
*/

async function cargarReportes() {

    try {

        /*
        =================================================
            OBTENER TOKEN JWT
        =================================================
        */

        const token =
            localStorage.getItem(
                "access_token"
            );


        /*
        =================================================
            SOLICITAR REPORTES A LA API
        =================================================
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
        =================================================
            VERIFICAR RESPUESTA
        =================================================
        */

        if (!respuesta.ok) {

            throw new Error(
                `Error HTTP: ${respuesta.status}`
            );

        }


        /*
        =================================================
            CONVERTIR RESPUESTA A JSON
        =================================================
        */

        const datos =
            await respuesta.json();


        /*
        =================================================
            OBTENER REPORTES
        =================================================
        */

        const reportes =
            datos.results || [];


        /*
        =================================================
            OBTENER TABLA
        =================================================
        */

        const tbody =
            document.getElementById(
                "tabla-reportes-body"
            );


        /*
        =================================================
            LIMPIAR TABLA
        =================================================
        */

        tbody.innerHTML = "";


        /*
        =================================================
            VERIFICAR SI EXISTEN REPORTES
        =================================================
        */

        if (
            reportes.length === 0
        ) {

            tbody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        style="text-align:center;"
                    >

                        No existen reportes registrados.

                    </td>

                </tr>

            `;

            return;

        }


        /*
        =================================================
            GENERAR FILAS
        =================================================
        */

        reportes.forEach(
            reporte => {

                const fila =
                    document.createElement(
                        "tr"
                    );


                /*
                =========================================
                    CREAR CONTENIDO DE LA FILA
                =========================================
                */

                fila.innerHTML = `

                    <td>
                        ${
                            reporte.tipo_incidente
                            ||
                            "Sin tipo"
                        }
                    </td>

                    <td>
                        ${
                            reporte.owner_username
                            ||
                            "Sin usuario"
                        }
                    </td>

                    <td>
                        ${
                            reporte.direccion_manual
                            ||
                            "Sin dirección"
                        }
                    </td>

                    <td>
                        ${
                            reporte.estatus
                            ||
                            "Sin estado"
                        }
                    </td>

                    <td>
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
                    </td>

                    <td>

                        <a
                            href="/reportes/${reporte.id}/"
                        >

                            Ver detalle

                        </a>

                    </td>

                `;


                /*
                =========================================
                    AGREGAR FILA A LA TABLA
                =========================================
                */

                tbody.appendChild(
                    fila
                );

            }
        );


    } catch (error) {


        /*
        =================================================
            MOSTRAR ERROR EN CONSOLA
        =================================================
        */

        console.error(
            "Error al cargar los reportes:",
            error
        );


        /*
        =================================================
            OBTENER TABLA
        =================================================
        */

        const tbody =
            document.getElementById(
                "tabla-reportes-body"
            );


        /*
        =================================================
            MOSTRAR MENSAJE DE ERROR
        =================================================
        */

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="text-align:center;"
                >

                    Error al cargar los reportes.

                </td>

            </tr>

        `;

    }

}