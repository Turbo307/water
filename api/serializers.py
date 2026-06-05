from rest_framework import serializers
from api.models import Recurso

class RecursoSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Recurso
        fields = ['id', 'titulo', 'descripcion', 'completado', 'fecha_creacion', 'owner']
    