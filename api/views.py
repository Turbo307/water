from rest_framework import viewsets, permissions
from rest_framework.permissions import AllowAny # Puedes dejarlo por si lo usas luego, o borrarlo
from api.models import Recurso, ReporteFuga
from api.serializers import RecursoSerializer
from .serializers import ReporteFugaSerializer

from django.shortcuts import render
from .models import ReporteFuga

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



#Nueva funcion

def dashboard(request):
    context = {
        "total_reportes":
        ReporteFuga.objects.count(),

        "pendientes":
        ReporteFuga.objects.filter(
            estatus="PENDIENTE"
        ).count(),

        "progreso":
        ReporteFuga.objects.filter(
            estatus="PROGRESO"
        ).count(),

        "resueltos":
        ReporteFuga.objects.filter(
            estatus="RESUELTO"
        ).count(),
    }

    return render(
        request,
        "dashboard/dashboard.html",
        context
    )


# funcion de reportes

def reportes(request):

    reportes = ReporteFuga.objects.all()

    context = {
        "reportes": reportes
    }

    return render(
        request,
        "dashboard/reportes.html",
        context
    )



# funcion de detalle reporte

def detalle_reporte(request, id):

    reporte = ReporteFuga.objects.get(id=id)

    return render(
        request,
        "dashboard/detalle_reporte.html",
        {
            "reporte": reporte
        }
    )


def login_page(request):
    return render(request, "login/login.html")