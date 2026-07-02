from rest_framework import viewsets, permissions
from rest_framework.permissions import AllowAny # Puedes dejarlo por si lo usas luego, o borrarlo
from api.models import Recurso, ReporteFuga
from api.serializers import RecursoSerializer
from .serializers import ReporteFugaSerializer

class RecursoViewSet(viewsets.ModelViewSet):
    queryset = Recurso.objects.all()
    serializer_class = RecursoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user if not self.request.user.is_anonymous else None)
        
        
class ReporteFugaViewSet(viewsets.ModelViewSet):
    queryset = ReporteFuga.objects.all()
    serializer_class = ReporteFugaSerializer
    
    #  CORREGIDO: Ahora sí está protegido. 
    # Cualquiera puede ver los reportes (GET), pero solo usuarios logueados pueden crear uno (POST).
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # Al estar protegido por IsAuthenticatedOrReadOnly, Django garantiza que 
        # para llegar a este punto el usuario YA inició sesión. 
        # 'self.request.user' nunca será anónimo aquí.
        serializer.save(owner=self.request.user)