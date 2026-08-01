from django.urls import path
from . import views


urlpatterns = [

    
    # PÁGINA DE INICIO


    path(
        "",
        views.home,
        name="home"
    ),


    
    # AUTENTICACIÓN DE USUARIOS
    

    path(
        "registro/",
        views.registro,
        name="registro"
    ),

    path(
        "login/",
        views.login_view,
        name="login"
    ),

    path(
        "logout/",
        views.logout_view,
        name="logout"
    ),


  
    # AUTENTICACIÓN DE ADMINISTRADOR
    

    path(
        "admin-login/",
        views.login_page,
        name="admin_login"
    ),

    path(
    "admin-logout/",
    views.admin_logout_view,
    name="admin_logout"
),


    
    # VISTAS DEL ADMINISTRADOR
    
    
    path(
        "dashboard/",
        views.dashboard,
        name="dashboard"
    ),

    path(
        "reportes/",
        views.reportes,
        name="reportes"
    ),

    path(
        "reportes/<uuid:id>/",
        views.detalle_reporte,
        name="detalle_reporte"
    ),


    
    # INTERFAZ MODERNA DE USUARIOS
    

    path(
        "reportes-app/",
        views.reportes_usuario,
        name="reportes_usuario"
    ),


    
    # PRUEBA DE API
    

    path(
        "test-api/",
        views.test_api,
        name="test_api"
    ),


    
    # ENDPOINTS DE USUARIO
    

    path(
        "user/",
        views.usuario_publico,
        name="usuario_publico"
    ),

    path(
        "user-auth/",
        views.usuario_actual,
        name="usuario_actual"
    ),

]