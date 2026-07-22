from django.urls import path
from . import views

urlpatterns = [
     path("dashboard/", views.dashboard, name="dashboard"),

     path("reportes/", views.reportes, name="reportes"),

     path("reportes/<uuid:id>/",views.detalle_reporte,name="detalle_reporte"),

     path("login/", views.login_page, name="login"),
]