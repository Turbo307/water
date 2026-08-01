from django.conf import settings
from django.conf.urls.static import static
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
    basename="reportefuga",
)


urlpatterns = [
    # Panel de administración de Django
    path("admin/", admin.site.urls),

    # Endpoints principales de la API
    path("api/", include(router.urls)),

    # Registro de usuarios
    path(
        "api/registro/",
        registro_api,
        name="registro-api",
    ),

    # Datos del usuario autenticado
    path(
        "api/user-auth/",
        usuario_actual,
        name="usuario-actual",
    ),

    # Inicio de sesión con JWT
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