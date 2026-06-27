from django.db import models
from django.contrib.auth.models import User

import uuid



# ==========================================
#  MODELO ANTERIOR 
# ==========================================
class Recurso(models.Model):
    titulo = models.CharField(max_length=100, blank=False, null=False)
    descripcion = models.TextField(blank=True, null=True)
    completado = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(
        User,
        related_name="recursos",
        on_delete=models.CASCADE
    )
    class Meta:
        ordering = ['-fecha_creacion']

    def __str__(self):
        return self.titulo
    
# ==========================================
# NUEVO MODELO 
# ==========================================
    


# 1. Función auxiliar para el nombrado y almacenamiento de archivos de imagen.
# Recibe la instancia del modelo y el nombre original del archivo, extrae su extensión
# (ej. '.jpg') y genera un nombre completamente aleatorio usando UUID. Esto evita que si 
# dos usuarios suben un archivo llamado "fuga.jpg", uno sobrescriba al otro en el servidor.
def ruta_foto_fuga(instance, filename):
    ext = filename.split('.')[-1]
    return f"fugas/{uuid.uuid4()}.{ext}"

# 2. Definición de la clase principal del Modelo.
# Al heredar de 'models.Model', le indicamos a Django que esta clase debe mapearse 
# como una tabla en la base de datos relacional.
class ReporteFuga(models.Model):
    
    # 3. Identificador Único Universal (Llave Primaria).
    # Reemplaza el ID numérico por defecto de Django por un código alfanumérico largo (UUID).
    # 'primary_key=True' lo vuelve el identificador único de la tabla, y 'editable=False'
    # asegura que nadie pueda modificar este ID una vez creado.
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # 4. Relación de Llave Foránea (ForeignKey) con la tabla de Usuarios.
    # Conecta cada reporte con el usuario ('User') que lo creó.
    # 'related_name="reportes_fugas"' permite buscar desde el objeto usuario todos sus reportes.
    # 'on_delete=models.CASCADE' dicta que si un usuario es eliminado, se borrarán en cadena
    # todos los reportes de fuga asociados a él.
    owner = models.ForeignKey(
        User,
        related_name="reportes_fugas",
        on_delete=models.CASCADE
    )
    
    # 5. Enumeración de Opciones para el Tipo de Incidente.
    # Al heredar de 'models.TextChoices', creamos una lista cerrada de opciones válidas.
    # El primer valor (ej. 'BANQUETA') es lo que se guarda de forma compacta en la base de datos,
    # y el segundo es la etiqueta legible para humanos (ej. 'Fuga en banqueta / vía pública').
    class TipoIncidente(models.TextChoices):
        BANQUETA = 'BANQUETA', 'Fuga en banqueta / vía pública'
        MEDIDOR = 'MEDIDOR', 'Fuga en el medidor'
        DRENAJE = 'DRENAJE', 'Brote de aguas negras'
        OTRO = 'OTRO', 'Otro tipo de reporte'

    # 6. Campo de almacenamiento para el Tipo de Incidente.
    # Almacena la opción seleccionada de la enumeración anterior.
    # 'choices=TipoIncidente.choices' activa la validación interna de Django para rechazar textos
    # que no estén en la lista, y 'default' asigna un valor si no se envía nada.
    tipo_incidente = models.CharField(
        max_length=20, 
        choices=TipoIncidente.choices, 
        default=TipoIncidente.OTRO
    )
    
    # 7. Campo de Texto Libre para la Descripción del Reporte.
    # 'models.TextField' se utiliza para almacenar textos largos sin un límite estricto de caracteres.
    # 'blank=True' permite que el formulario de Django lo acepte vacío, y 'null=True' permite
    # que la base de datos almacene un valor nulo (vacío).
    descripcion = models.TextField(blank=True, null=True)
    
    # 8. Campo de Fecha y Hora de Creación Automática.
    # Registra la estampa de tiempo exacta del reporte.
    # La magia ocurre con 'auto_now_add=True', que le ordena a Django capturar la hora actual
    # del servidor de manera automática únicamente cuando el registro se crea por primera vez.
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    # 9. Campo para Almacenamiento de Imágenes.
    # Guarda la ruta del archivo de imagen subido por el usuario.
    # 'upload_to=ruta_foto_fuga' delega el control del nombre y la carpeta a la función del paso 1.
    # Se marca como opcional mediante 'blank=True, null=True'.
    foto = models.ImageField(upload_to=ruta_foto_fuga, blank=True, null=True)
    
    # 10. Coordenadas de Ubicación Geográfica (GPS).
    # 'models.DecimalField' es el tipo de campo ideal para geolocalización por su precisión matemática exacta.
    # 'max_digits=9' define que el número tendrá máximo 9 dígitos en total, y 'decimal_places=6'
    # reserva estrictamente 6 de esos dígitos para la parte decimal (ej. 19.432608), garantizando
    # precisión a nivel de centímetros. Están listos para recibir datos de GPS de cualquier App.
    latitud = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitud = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    
    # 11. Campo de Dirección Escrita Manualmente.
    # 'models.CharField' se usa para cadenas de texto cortas con un límite obligatorio ('max_length=255').
    # Diseñado para que el usuario anote referencias humanas si el GPS no es exacto.
    direccion_manual = models.CharField(max_length=255, blank=True, null=True)
    
    # 12. Enumeración de Opciones para el Estatus del Reporte.
    # Funciona igual que las opciones de incidente (paso 5), definiendo los estados por los cuales
    # puede pasar el reporte de la fuga durante su ciclo de vida en el sistema.
    class EstatusReporte(models.TextChoices):
        PENDIENTE = 'PENDIENTE', 'Pendiente'
        PROGRESO = 'PROGRESO', 'En atención'
        RESUELTO = 'RESUELTO', 'Solucionado'
        
    # 13. Campo de almacenamiento para el Estatus.
    # Guarda el estado del reporte. Todo registro inicia de forma automática en estado 'PENDIENTE'
    # gracias a 'default=EstatusReporte.PENDIENTE'.
    estatus = models.CharField(
        max_length=20, 
        choices=EstatusReporte.choices, 
        default=EstatusReporte.PENDIENTE
    )

    # 14. Clase de Metadatos de Django (Configuración Interna).
    # Permite alterar comportamientos específicos de la tabla. 
    # 'ordering = ['-fecha_creacion']' utiliza el guion menos (-) para indicarle a Django que realice
    # un ordenamiento descendente por defecto; así, las consultas a la API siempre devolverán las
    # fugas más recientes al principio.
    class Meta:
        ordering = ['-fecha_creacion']

    # 15. Método de Representación de Objeto en Texto (__str__).
    # Es una función especial de Python en Django. Define cómo se va a mostrar este registro cuando
    # sea impreso en la consola o visualizado dentro del Panel de Administración de Django, 
    # mostrando datos útiles en lugar de un texto genérico como "ReporteFuga Object (1)".
    def __str__(self):
        return f"{self.tipo_incidente} - {self.id} (Creado por: {self.owner.username})"