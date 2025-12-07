from django.db import models
from datetime import date

class Calculo(models.Model):
    """Representa un cálculo numerológico guardado."""
    nombre = models.CharField(max_length=255)
    fecha_nacimiento = models.DateField()
    sistema = models.CharField(max_length=50, default='dshevastan')
    
    # Guardamos los resultados clave
    esencia = models.CharField(max_length=20)
    expresion = models.CharField(max_length=20)
    destino = models.CharField(max_length=20)
    
    fecha_calculo = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cálculo para {self.nombre} el {self.fecha_calculo.strftime('%Y-%m-%d')}"