from django.urls import path
from . import views

urlpatterns = [
     # Página de inicio
     path("", views.home, name="home"),
     path("registro/", views.registro, name="registro"),
     path("login/", views.login_view, name="login"),
     path("logout/", views.logout_view, name="logout"),
     
     # Vistas de templates antiguos
     path("dashboard/", views.dashboard, name="dashboard"),
     path("reportes/", views.reportes, name="reportes"),
     path("reportes/<uuid:id>/", views.detalle_reporte, name="detalle_reporte"),
     
     # Nueva interfaz moderna
     path("reportes-app/", views.reportes_usuario, name="reportes_usuario"),
     
     # Página de prueba de API
     path("test-api/", views.test_api, name="test_api"),
     
     # Endpoints de API
     path("user/", views.usuario_publico, name="usuario_publico"),
     path("user-auth/", views.usuario_actual, name="usuario_actual"),
]