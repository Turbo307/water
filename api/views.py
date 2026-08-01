from django.contrib.auth.models import User

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from api.models import Recurso, ReporteFuga
from api.serializers import RecursoSerializer, ReporteFugaSerializer


# CRUD de recursos
class RecursoViewSet(viewsets.ModelViewSet):
    queryset = Recurso.objects.all()
    serializer_class = RecursoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    # Asigna el usuario autenticado como propietario
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


# CRUD de reportes de fuga
class ReporteFugaViewSet(viewsets.ModelViewSet):
    serializer_class = ReporteFugaSerializer
    permission_classes = [IsAuthenticated]

    # Devuelve reportes según el rol del usuario
    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return ReporteFuga.objects.all()

        return ReporteFuga.objects.filter(owner=user)

    # Asigna el usuario autenticado al crear un reporte
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    # Actualización completa solo para administradores
    def update(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {
                    "detail": (
                        "No tienes permiso para modificar este reporte."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().update(request, *args, **kwargs)

    # Actualización parcial solo para administradores
    def partial_update(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {
                    "detail": (
                        "No tienes permiso para modificar este reporte."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().partial_update(request, *args, **kwargs)

    # Eliminación solo para administradores
    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {
                    "detail": (
                        "No tienes permiso para eliminar este reporte."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().destroy(request, *args, **kwargs)


# Devuelve los datos del usuario autenticado
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def usuario_actual(request):
    user = request.user

    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_authenticated": True,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        }
    )


# Registra un usuario desde el frontend
@api_view(["POST"])
@permission_classes([AllowAny])
def registro_api(request):
    username = str(request.data.get("username", "")).strip()
    email = str(request.data.get("email", "")).strip()
    first_name = str(request.data.get("first_name", "")).strip()
    last_name = str(request.data.get("last_name", "")).strip()
    password = str(request.data.get("password", ""))
    password_confirm = str(
        request.data.get("password_confirm", "")
    )

    errors = {}

    # Valida el nombre de usuario
    if len(username) < 3:
        errors["username"] = (
            "El usuario debe tener mínimo 3 caracteres."
        )
    elif User.objects.filter(username=username).exists():
        errors["username"] = "El usuario ya existe."

    # Valida el correo electrónico
    if not email or "@" not in email:
        errors["email"] = "El correo electrónico no es válido."
    elif User.objects.filter(email=email).exists():
        errors["email"] = (
            "El correo electrónico ya está registrado."
        )

    # Valida la contraseña
    if len(password) < 6:
        errors["password"] = (
            "La contraseña debe tener mínimo 6 caracteres."
        )

    # Confirma que ambas contraseñas coincidan
    if password != password_confirm:
        errors["password_confirm"] = (
            "Las contraseñas no coinciden."
        )

    # Retorna los errores encontrados
    if errors:
        return Response(
            {
                "detail": "Revisa los datos enviados.",
                "errors": errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Crea el usuario
    user = User.objects.create_user(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        password=password,
    )

    # Retorna el usuario creado
    return Response(
        {
            "detail": "Usuario registrado correctamente.",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_staff": user.is_staff,
            },
        },
        status=status.HTTP_201_CREATED,
    )