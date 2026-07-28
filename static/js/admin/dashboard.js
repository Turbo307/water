/*
=========================================================
    WATER ADMIN - DASHBOARD
=========================================================
*/


document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarDashboard();

    }
);


/*
=========================================================
    CARGAR INFORMACIÓN DEL DASHBOARD
=========================================================
*/

async function cargarDashboard() {

    try {

        const respuesta = await fetch(
            "/api/reportes-fuga/"
        );


        if (!respuesta.ok) {

            throw new Error(
                "Error al obtener los reportes"
            );

        }


        const datos = await respuesta.json();


        /*
        =================================================
            OBTENER LISTA DE REPORTES
        =================================================
        */

        const reportes = datos.results || [];


        /*
        =================================================
            ACTUALIZAR ESTADÍSTICAS
        =================================================
        */

        actualizarEstadisticas(
            reportes
        );


        /*
        =================================================
            MOSTRAR REPORTES RECIENTES
        =================================================
        */

        mostrarReportesRecientes(
            reportes
        );


    } catch (error) {

        console.error(
            "Error cargando el Dashboard:",
            error
        );

    }

}


/*
=========================================================
    ACTUALIZAR ESTADÍSTICAS
=========================================================
*/

function actualizarEstadisticas(
    reportes
) {


    /*
    =====================================================
        TOTAL DE REPORTES
    =====================================================
    */

    const totalReportes =
        reportes.length;


    /*
    =====================================================
        REPORTES PENDIENTES
    =====================================================
    */

    const reportesPendientes =
        reportes.filter(
            reporte =>
                reporte.estatus === "PENDIENTE"
        ).length;


    /*
    =====================================================
        REPORTES EN PROCESO
    =====================================================
    */

    const reportesProceso =
        reportes.filter(
            reporte =>
                reporte.estatus === "PROGRESO"
        ).length;


    /*
    =====================================================
        REPORTES RESUELTOS
    =====================================================
    */

    const reportesResueltos =
        reportes.filter(
            reporte =>
                reporte.estatus === "RESUELTO"
        ).length;


    /*
    =====================================================
        ACTUALIZAR HTML
    =====================================================
    */

    document.getElementById(
        "total-reportes"
    ).textContent =
        totalReportes;


    document.getElementById(
        "reportes-pendientes"
    ).textContent =
        reportesPendientes;


    document.getElementById(
        "reportes-proceso"
    ).textContent =
        reportesProceso;


    document.getElementById(
        "reportes-resueltos"
    ).textContent =
        reportesResueltos;

}


/*
=========================================================
    MOSTRAR REPORTES RECIENTES
=========================================================
*/

function mostrarReportesRecientes(
    reportes
) {


    const contenedor =
        document.getElementById(
            "reportes-recientes"
        );


    /*
    =====================================================
        VERIFICAR SI EXISTEN REPORTES
    =====================================================
    */

    if (
        reportes.length === 0
    ) {

        contenedor.innerHTML = `

            <tr>

                <td
                    colspan="4"
                >

                    No existen reportes registrados.

                </td>

            </tr>

        `;

        return;

    }


    /*
    =====================================================
        ORDENAR REPORTES POR FECHA
    =====================================================
    */

    const reportesOrdenados =
        [...reportes].sort(
            (
                a,
                b
            ) => {

                return new Date(
                    b.fecha_creacion
                ) - new Date(
                    a.fecha_creacion
                );

            }
        );


    /*
    =====================================================
        TOMAR LOS ÚLTIMOS 5
    =====================================================
    */

    const reportesRecientes =
        reportesOrdenados.slice(
            0,
            5
        );


    /*
    =====================================================
        GENERAR FILAS
    =====================================================
    */

    contenedor.innerHTML =
        "";


    reportesRecientes.forEach(
        reporte => {


            const fila =
                document.createElement(
                    "tr"
                );


            /*
            =============================================
                FORMATEAR FECHA
            =============================================
            */

            const fecha =
                new Date(
                    reporte.fecha_creacion
                );


            const fechaFormateada =
                fecha.toLocaleDateString(
                    "es-MX",
                    {

                        day: "2-digit",

                        month: "2-digit",

                        year: "numeric"

                    }
                );


            /*
            =============================================
                CREAR FILA
            =============================================
            */

            fila.innerHTML = `

                <td>

                    ${reporte.id
                        .substring(
                            0,
                            8
                        )
                    }

                </td>


                <td>

                    ${fechaFormateada}

                </td>


                <td>

                    ${reporte.estatus}

                </td>


                <td>

                    <a
                        href="/reportes/${reporte.id}/"
                        class="view-report-button"
                    >

                        Ver reporte

                    </a>

                </td>

            `;


            contenedor.appendChild(
                fila
            );

        }
    );

}