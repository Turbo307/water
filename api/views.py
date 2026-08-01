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


# API DE REPORTES DE FUGAS


class ReporteFugaViewSet(viewsets.ModelViewSet):

    queryset = ReporteFuga.objects.all()

    serializer_class = ReporteFugaSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]


    # OBTENER REPORTES


    def get_queryset(self):

        # Administrador:
        # puede ver todos los reportes

        if self.request.user.is_staff:

            return ReporteFuga.objects.all()


        # Usuario normal:
        # solo puede ver sus propios reportes

        return ReporteFuga.objects.filter(
            owner=self.request.user
        )



    # CREAR REPORTE

    def perform_create(self, serializer):

        serializer.save(
            owner=self.request.user
        )



    # ACTUALIZAR REPORTE


    def update(self, request, *args, **kwargs):

        # Solo el administrador puede modificar reportes

        if not request.user.is_staff:

            return Response(
                {
                    "detail":
                        "No tienes permiso para modificar este reporte."
                },
                status=403
            )


        return super().update(
            request,
            *args,
            **kwargs
        )


    # ELIMINAR REPORTE


    def destroy(self, request, *args, **kwargs):

        # Solo el administrador puede eliminar reportes

        if not request.user.is_staff:

            return Response(
                {
                    "detail":
                        "No tienes permiso para eliminar este reporte."
                },
                status=403
            )


        return super().destroy(
            request,
            *args,
            **kwargs
        )

    


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


#dashboard administrativo

def dashboard(request):

    #Dashboard con estadísticas de reportes

    return render(

        request,

        "admin/dashboard.html",
    )




#listadp de reportes administrativos

def reportes(request):

    #pagina con listado de reportes

    return render(

        request,

        "admin/reportes.html",
    )





#detalle de reporte administrativo

def detalle_reporte(request, id):

    #pagina con el detalle reportes

    return render(

        request,

        "admin/detalle_reporte.html",
    )


# LOGIN ADMINISTRADOR

def login_page(request):

    return render(

        request,

        "admin/login.html"

    )




def reportes_usuario(request):

    """
    Renderiza la interfaz de reportes.

    Los datos de los reportes se obtienen
    mediante la API REST utilizando JWT.
    """

    return render(

        request,

        "users/reportes_usuario.html"

    )

# INTERFAZ DE USUARIOS

def login_view(request):

    """
    Renderiza la página de inicio de sesión.

    La autenticación del usuario se realiza
    mediante la API JWT desde JavaScript.
    """

    return render(

        request,

        'users/login.html'

    )


def test_api(request):

    """Página de prueba de la API"""

    return render(

        request,

        "users/test_api.html"

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


# REGISTRO DE USUARIOS

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


# LOGOUT

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


# LOGOUT ADMINISTRADOR

def admin_logout_view(request):

    """Cierra la sesión del administrador"""

    auth_logout(
        request
    )

    return redirect(
        'admin_login'
    )