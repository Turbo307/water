from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

from api.models import Recurso, ReporteFuga
from api.serializers import RecursoSerializer
from .serializers import ReporteFugaSerializer

from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout as auth_logout
from django.views.decorators.http import require_http_methods


class RecursoViewSet(viewsets.ModelViewSet):

    queryset = Recurso.objects.all()

    serializer_class = RecursoSerializer

    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly
    ]

    def perform_create(self, serializer):

        serializer.save(
            owner=
            self.request.user
            if not self.request.user.is_anonymous
            else None
        )


class ReporteFugaViewSet(viewsets.ModelViewSet):

    queryset = ReporteFuga.objects.all()

    serializer_class = ReporteFugaSerializer

    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly
    ]

    def perform_create(self, serializer):

        serializer.save(
            owner=self.request.user
        )

    def get_queryset(self):

        """Filtrar reportes por usuario si se pasa ?owner=me"""

        queryset = ReporteFuga.objects.all()

        owner = self.request.query_params.get(
            'owner',
            None
        )

        if (
            owner == 'me'
            and self.request.user.is_authenticated
        ):

            queryset = queryset.filter(
                owner=self.request.user
            )

        return queryset


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def usuario_actual(request):

    """Retorna la información del usuario autenticado"""

    user = request.user

    return Response({

        'id':
            user.id,

        'username':
            user.username,

        'email':
            user.email,

        'first_name':
            user.first_name,

        'last_name':
            user.last_name,

        'is_authenticated':
            True

    })


@api_view(['GET'])
def usuario_publico(request):

    """Endpoint público para verificar usuario"""

    if request.user.is_authenticated:

        return Response({

            'id':
                request.user.id,

            'username':
                request.user.username,

            'email':
                request.user.email,

            'authenticated':
                True

        })

    else:

        return Response({

            'authenticated':
                False,

            'message':
                'No autenticado'

        })


def dashboard(request):

    """Dashboard con estadísticas de reportes"""

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


def reportes(request):

    """Listado de reportes"""

    reportes = ReporteFuga.objects.all()

    context = {

        "reportes":
            reportes

    }

    return render(

        request,

        "dashboard/reportes.html",

        context

    )


def detalle_reporte(request, id):

    """Detalle de un reporte específico"""

    reporte = ReporteFuga.objects.get(
        id=id
    )

    return render(

        request,

        "dashboard/detalle_reporte.html",

        {
            "reporte":
                reporte
        }

    )


# =========================================
# LOGIN ADMINISTRADOR
# =========================================

def login_page(request):

    return render(

        request,

        "login/login.html"

    )


# =========================================
# INTERFAZ DE USUARIOS
# =========================================

@login_required(
    login_url='/login/'
)
def reportes_usuario(request):

    """Nueva interfaz moderna de reportes para usuarios"""

    context = {

        'usuario':
            request.user,

        'total_reportes':
            ReporteFuga.objects.count(),

        'mis_reportes':
            ReporteFuga.objects.filter(
                owner=request.user
            ).count(),

    }

    return render(

        request,

        "users/reportes_usuario.html",

        context

    )


def test_api(request):

    """Página de prueba de la API"""

    return render(

        request,

        "users/test_api.html"

    )


# =========================================
# LOGIN USUARIOS
# =========================================

@require_http_methods(
    ["GET", "POST"]
)
def login_view(request):

    """Formulario de inicio de sesión para usuarios."""

    if request.user.is_authenticated:

        return redirect(
            'reportes_usuario'
        )

    error = None

    username = ''

    if request.method == 'POST':

        username = request.POST.get(
            'username',
            ''
        ).strip()

        password = request.POST.get(
            'password',
            ''
        ).strip()

        user = authenticate(

            request,

            username=username,

            password=password

        )

        if user is not None:

            login(
                request,
                user
            )

            return redirect(
                'reportes_usuario'
            )

        error = (
            'Usuario o contraseña incorrectos'
        )

    return render(

        request,

        'users/login.html',

        {

            'error':
                error,

            'username':
                username,

        }

    )


def home(request):

    """Página de inicio"""

    if request.user.is_authenticated:

        return render(

            request,

            'users/home.html',

            {

                'usuario':
                    request.user,

                'message':
                    f'Bienvenido '
                    f'{request.user.username}!'

            }

        )

    else:

        return render(

            request,

            'users/home.html',

            {

                'message':
                    'Bienvenido al Sistema '
                    'de Reportes de Fugas'

            }

        )


# =========================================
# REGISTRO DE USUARIOS
# =========================================

@require_http_methods(
    ["GET", "POST"]
)
def registro(request):

    """Página de registro de nuevos usuarios"""

    if request.method == 'POST':

        username = request.POST.get(
            'username',
            ''
        ).strip()

        email = request.POST.get(
            'email',
            ''
        ).strip()

        password = request.POST.get(
            'password',
            ''
        ).strip()

        password_confirm = request.POST.get(
            'password_confirm',
            ''
        ).strip()

        first_name = request.POST.get(
            'first_name',
            ''
        ).strip()

        errors = []

        # Validaciones básicas

        if (
            not username
            or len(username) < 3
        ):

            errors.append(
                'Usuario debe tener mínimo 3 caracteres'
            )

        elif User.objects.filter(
            username=username
        ).exists():

            errors.append(
                'Usuario ya existe'
            )


        if (
            not email
            or '@' not in email
        ):

            errors.append(
                'Email inválido'
            )

        elif User.objects.filter(
            email=email
        ).exists():

            errors.append(
                'Email ya registrado'
            )


        if (
            not password
            or len(password) < 6
        ):

            errors.append(
                'Contraseña mínimo 6 caracteres'
            )


        if password != password_confirm:

            errors.append(
                'Contraseñas no coinciden'
            )


        if not errors:

            try:

                user = User.objects.create_user(

                    username=username,

                    email=email,

                    password=password,

                    first_name=first_name

                )

                user = authenticate(

                    request,

                    username=username,

                    password=password

                )

                if user:

                    login(
                        request,
                        user
                    )

                    return redirect(
                        '/reportes-app/'
                    )

            except Exception as e:

                errors.append(
                    f'Error: {str(e)}'
                )


        return render(

            request,

            'users/registro.html',

            {

                'errors':
                    errors,

                'username':
                    username,

                'email':
                    email,

                'first_name':
                    first_name

            }

        )


    return render(

        request,

        'users/registro.html'

    )


# =========================================
# LOGOUT
# =========================================

@login_required(
    login_url='/login/'
)
def logout_view(request):

    """Cierra la sesión del usuario"""

    auth_logout(
        request
    )

    return redirect(
        '/'
    )