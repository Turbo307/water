from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import RecursoViewSet

router = DefaultRouter()
router.register(r'resources', RecursoViewSet, basename='recurso')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]