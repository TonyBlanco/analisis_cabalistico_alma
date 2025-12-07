# app_cabalistica.py
"""
API Flask completa para generar Fichas Numerológicas Cabalísticas
Integra métodos Dshevastan® y Coquatrix
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from cabala_py.numerology import calcular_valores_nombre, calcular_camino_destino
from cabala_py.inclusion import (
    calcular_inclusion_base, 
    interpretar_inclusion, 
    generar_grafico_inclusion
)
from cabala_py.integracion_arbol import generar_mapa_cabalista_completo
from cabala_py.data import ALFABETO_ESPANOL_1995

app = Flask(__name__)
CORS(app)  # Habilitar CORS para frontend


@app.route('/api/ficha-numerologica', methods=['POST'])
def generar_ficha_completa():
    """
    Endpoint principal: genera la Ficha Numerológica completa con correspondencias cabalísticas.
    
    Body esperado:
    {
        "nombre_completo": "Juan Pérez García",
        "dia_nacimiento": 15,
        "mes_nacimiento": 3,
        "anio_nacimiento": 1985
    }
    """
    try:
        data = request.get_json()
        
        # 1. Validación de datos
        nombre_completo = data.get('nombre_completo', '').strip()
        dia = data.get('dia_nacimiento')
        mes = data.get('mes_nacimiento')
        anio = data.get('anio_nacimiento')
        
        if not nombre_completo:
            return jsonify({"error": "El nombre completo es requerido"}), 400
        
        if not all([dia, mes, anio]):
            return jsonify({"error": "Fecha de nacimiento incompleta"}), 400
        
        # Convertir a enteros
        dia, mes, anio = int(dia), int(mes), int(anio)
        
        # Validar rangos
        if not (1 <= dia <= 31 and 1 <= mes <= 12 and 1900 <= anio <= 2100):
            return jsonify({"error": "Fecha de nacimiento inválida"}), 400
        
        # 2. GENERAR MAPA CABALÍSTICO COMPLETO
        # Este método integra todos los cálculos y correspondencias
        mapa_completo = generar_mapa_cabalista_completo(nombre_completo, dia, mes, anio)
        
        # 3. Construcción de la respuesta completa
        ficha_numerologica = {
            "identidad": mapa_completo["identidad"],
            
            "numeros_principales": mapa_completo["numeros_principales"],
            
            "inclusion_base": mapa_completo["inclusion_base"],
            
            "arbol_vida": {
                "analisis": mapa_completo["analisis_cabalista"],
                "recomendaciones": mapa_completo["recomendaciones"]
            },
            
            "metadatos": {
                "metodo_alfabeto": "Dshevastan® (Español 1995)",
                "metodo_inclusion": "Coquatrix (Casas 1-9)",
                "sistema_cabalista": "Árbol de la Vida - Tradición Hermética",
                "version": "2.0"
            }
        }
        
        return jsonify(ficha_numerologica), 200

    except ValueError as ve:
        app.logger.error(f"Error de validación: {ve}")
        return jsonify({"error": f"Datos inválidos: {str(ve)}"}), 400
    
    except Exception as e:
        app.logger.error(f"Error interno: {e}")
        return jsonify({"error": "Error procesando la solicitud"}), 500


@app.route('/api/arbol-vida', methods=['POST'])
def analizar_arbol_vida():
    """
    Endpoint específico: retorna el análisis completo del Árbol de la Vida.
    
    Body esperado:
    {
        "nombre_completo": "Juan Pérez García",
        "dia_nacimiento": 15,
        "mes_nacimiento": 3,
        "anio_nacimiento": 1985
    }
    """
    try:
        data = request.get_json()
        
        nombre = data.get('nombre_completo', '').strip()
        dia = int(data.get('dia_nacimiento'))
        mes = int(data.get('mes_nacimiento'))
        anio = int(data.get('anio_nacimiento'))
        
        if not nombre:
            return jsonify({"error": "Nombre requerido"}), 400
        
        # Generar mapa cabalístico
        mapa = generar_mapa_cabalista_completo(nombre, dia, mes, anio)
        
        # Retornar solo la información del Árbol de la Vida
        resultado = {
            "identidad": mapa["identidad"],
            "correspondencias_arbol": mapa["numeros_principales"],
            "analisis_cabalista": mapa["analisis_cabalista"],
            "recomendaciones": mapa["recomendaciones"],
            "inclusion": {
                "dominantes": mapa["inclusion_base"]["dominantes"],
                "ausentes": mapa["inclusion_base"]["ausentes"],
                "maestrias": mapa["inclusion_base"]["maestrias"]
            }
        }
        
        return jsonify(resultado), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/calcular-solo-inclusion', methods=['POST'])
def calcular_solo_nombre():
    """Endpoint simplificado: solo cálculos del nombre."""
    try:
        data = request.get_json()
        nombre = data.get('nombre_completo', '')
        
        if not nombre:
            return jsonify({"error": "Nombre requerido"}), 400
        
        resultado = calcular_valores_nombre(nombre)
        return jsonify(resultado), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/calcular-fecha', methods=['POST'])
def calcular_solo_fecha():
    """Endpoint simplificado: solo cálculos de fecha."""
    try:
        data = request.get_json()
        dia = int(data.get('dia'))
        mes = int(data.get('mes'))
        anio = int(data.get('anio'))
        
        resultado = calcular_camino_destino(dia, mes, anio)
        return jsonify(resultado), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/inclusion', methods=['POST'])
def calcular_solo_inclusion():
    """Endpoint simplificado: solo Inclusión de Base."""
    try:
        data = request.get_json()
        nombre = data.get('nombre_completo', '')
        dia = int(data.get('dia'))
        mes = int(data.get('mes'))
        anio = int(data.get('anio'))
        
        inclusion = calcular_inclusion_base(nombre, dia, mes, anio)
        grafico = generar_grafico_inclusion(inclusion["casas"])
        interpretacion = interpretar_inclusion(inclusion)
        
        resultado = {
            "casas": inclusion["casas"],
            "dominantes": inclusion["numeros_dominantes"],
            "ausentes": inclusion["numeros_ausentes"],
            "maestrias": inclusion["maestrias"],
            "grafico": grafico,
            "interpretacion": interpretacion
        }
        
        return jsonify(resultado), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/salud', methods=['GET'])
def salud():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "servicio": "API Numerología Cabalística",
        "version": "1.0"
    }), 200


@app.route('/')
def inicio():
    """Página de inicio con documentación básica."""
    return jsonify({
        "mensaje": "API de Numerología Cabalística",
        "endpoints": {
            "/api/ficha-numerologica": "POST - Ficha completa",
            "/api/calcular-nombre": "POST - Solo cálculos del nombre",
            "/api/calcular-fecha": "POST - Solo cálculos de fecha",
            "/api/inclusion": "POST - Solo Inclusión de Base",
            "/api/salud": "GET - Health check"
        },
        "documentacion": "https://github.com/tu-usuario/cabala-py"
    })


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )