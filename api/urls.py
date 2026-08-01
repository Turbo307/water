from django.contrib import admin
from django.urls import include, path

from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from api.views import (
    RecursoViewSet,
    ReporteFugaViewSet,
    registro_api,
    usuario_actual,
)

from django.conf import settings
from django.conf.urls.static import static


# Router principal de la API
router = DefaultRouter()

router.register(
    r"resources",
    RecursoViewSet,
    basename="recurso",
)

router.register(
    r"reportes-fuga",
    ReporteFugaViewSet,
    basename="reporte-fuga",
)


urlpatterns = [
    # Administración de Django
    path("admin/", admin.site.urls),

    # Endpoints principales
    path("api/", include(router.urls)),

    # Registro de usuarios
    path(
        "api/registro/",
        registro_api,
        name="registro-api",
    ),

    # Usuario autenticado
    path(
        "api/user-auth/",
        usuario_actual,
        name="usuario-actual",
    ),

    # Inicio de sesión JWT
    path(
        "api/token/",
        TokenObtainPairView.as_view(),
        name="token-obtain-pair",
    ),

    # Renovación del token JWT
    path(
        "api/token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),
]


# Archivos subidos en desarrollo
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )