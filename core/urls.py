from django.contrib import admin
from django.urls import path, include

from rest_framework.routers import DefaultRouter

from api.views import (
    RecursoViewSet,
    ReporteFugaViewSet
)

from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


# =========================================
# ROUTER DE LA API
# =========================================

router = DefaultRouter()

router.register(
    r'resources',
    RecursoViewSet,
    basename='recurso'
)

router.register(
    r'reportes-fuga',
    ReporteFugaViewSet,
    basename='reportefuga'
)


# =========================================
# URLS PRINCIPALES
# =========================================

urlpatterns = [

    # Panel de administración de Django
    path(
        'admin/',
        admin.site.urls
    ),


    # =====================================
    # API REST
    # =====================================

    path(
        'api/',
        include(router.urls)
    ),


    # =====================================
    # AUTENTICACIÓN JWT
    # =====================================

    path(
        'api/token/',
        TokenObtainPairView.as_view(),
        name='token_obtain_pair'
    ),

    path(
        'api/token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),


    # =====================================
    # AUTENTICACIÓN REST FRAMEWORK
    # =====================================

    path(
        'api-auth/',
        include(
            'rest_framework.urls',
            namespace='rest_framework'
        )
    ),


    # =====================================
    # TEMPLATES
    # =====================================

    path(
        '',
        include('api.urls')
    ),

]


# =========================================
# ARCHIVOS MEDIA EN DESARROLLO
# =========================================

if settings.DEBUG:

    urlpatterns += static(

        settings.MEDIA_URL,

        document_root=
        settings.MEDIA_ROOT

    )