from rest_framework import viewsets, permissions
from api.models import Recurso
from api.serializers import RecursoSerializer

class RecursoViewSet(viewsets.ModelViewSet):
    queryset = Recurso.objects.all()
    serializer_class = RecursoSerializer
    permission_classes = [permissions.AllowAny] # Permisivo solo para desarrollo inicial

    def perform_create(self, serializer):
        # Asigna automáticamente el usuario logueado. Si no hay, asigna None.
        serializer.save(owner=self.request.user if not self.request.user.is_anonymous else None)