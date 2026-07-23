from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import RecursoViewSet
from api.views import ReporteFugaViewSet
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'resources', RecursoViewSet, basename='recurso')
router.register(r'reportes-fuga', ReporteFugaViewSet, basename='reportefuga')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path("", include("api.urls"))
]


if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
