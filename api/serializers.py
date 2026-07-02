from rest_framework import serializers
from django.contrib.auth.models import User
from api.models import Recurso, ReporteFuga

# --- Serializador viejo  ---
class RecursoSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Recurso
        fields = ['id', 'titulo', 'descripcion', 'completado', 'fecha_creacion', 'owner']


# ==========================================
# NUEVO SERIALIZADOR
# ==========================================
class ReporteFugaSerializer(serializers.ModelSerializer):
    # 1. Campo personalizado de solo lectura para el nombre del usuario
    owner_username = serializers.ReadOnlyField(source='owner.username')
    
    # 2. El id del dueño lo manejamos como solo lectura en la API 
    # porque lo asignaremos automáticamente en la vista usando el usuario logueado.
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        # 3. Le decimos a DRF qué modelo debe mapear
        model = ReporteFuga
        
        # 4. Listamos explícitamente todos los campos que queremos 
        # recibir en los JSON o enviar de vuelta al cliente.
        fields = [
            'id', 
            'owner', 
            'owner_username',  # Mostramos el nombre además del ID para comodidad del Frontend
            'tipo_incidente', 
            'descripcion', 
            'fecha_creacion', 
            'foto', 
            'latitud', 
            'longitud', 
            'direccion_manual', 
            'estatus'
        ]