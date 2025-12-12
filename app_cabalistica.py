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
from cabala_py.soul_analytics import SoulAnalyticsEngine
from cabala_py.clinical_scorer import ClinicalScorer

app = Flask(__name__)
CORS(app)  # Habilitar CORS para frontend

# Inicializar motores (Cargarán los JSONs al arrancar)
soul_engine = SoulAnalyticsEngine()
clinical_engine = ClinicalScorer()


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
            "/api/tests/interpretar": "POST - Interpretar test con Sefirá y Ángel Remedio",
            "/api/salud": "GET - Health check"
        },
        "documentacion": "https://github.com/tu-usuario/cabala-py"
    })


@app.route('/api/tests/interpretar', methods=['POST'])
def interpretar_test():
    """
    Recibe: { "test_id": "phq-9", "score": 15 }
    Devuelve: JSON con Sefirá y Ángel Remedio
    
    Tests disponibles: phq-9, gad-7, bdi-ii, bai
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400
        
        test_id = data.get('test_id')
        score = data.get('score')
        
        # Validación de datos requeridos
        if not test_id:
            return jsonify({"error": "El campo 'test_id' es requerido"}), 400
        
        if score is None:
            return jsonify({"error": "El campo 'score' es requerido"}), 400
        
        # Validar que score sea un número
        try:
            score = float(score)
        except (ValueError, TypeError):
            return jsonify({"error": "El campo 'score' debe ser un número"}), 400
        
        # Interpretar el test
        resultado = soul_engine.interpretar_individual(test_id, score)
        
        # Si el resultado contiene un error, devolver código 400
        if resultado.get("error"):
            return jsonify(resultado), 400
        
        return jsonify(resultado), 200
        
    except Exception as e:
        app.logger.error(f"Error interpretando test: {e}")
        return jsonify({"error": f"Error interno: {str(e)}"}), 500


@app.route('/api/tests/procesar-completo', methods=['POST'])
def procesar_test_completo():
    """
    Endpoint que integra el motor clínico y el motor del alma.
    
    Recibe: { "test_id": "phq-9", "answers": [0, 1, 2, 3, 0, 1, 2, 0, 1] }
    Devuelve: { "clinica": {...}, "alma": {...} }
    
    Tests disponibles: phq-9, gad-7, bdi-ii, bai
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400
        
        test_id = data.get('test_id')
        answers = data.get('answers')
        
        # Validación de datos requeridos
        if not test_id:
            return jsonify({"error": "El campo 'test_id' es requerido"}), 400
        
        if not answers:
            return jsonify({"error": "El campo 'answers' es requerido"}), 400
        
        if not isinstance(answers, list):
            return jsonify({"error": "El campo 'answers' debe ser una lista de enteros"}), 400
        
        # Paso 1: Calcular score clínico
        resultado_clinico = clinical_engine.calcular_score(test_id, answers)
        score_bruto = resultado_clinico["score_bruto"]
        
        # Paso 2: Interpretar con el motor del alma
        resultado_alma = soul_engine.interpretar_individual(test_id, score_bruto)
        
        # Si el resultado del alma contiene un error, devolver código 400
        if resultado_alma.get("error"):
            return jsonify(resultado_alma), 400
        
        # Paso 3: Retornar respuesta unificada
        respuesta_unificada = {
            "clinica": resultado_clinico,
            "alma": resultado_alma
        }
        
        return jsonify(respuesta_unificada), 200
        
    except ValueError as ve:
        app.logger.error(f"Error de validación: {ve}")
        return jsonify({"error": f"Datos inválidos: {str(ve)}"}), 400
    
    except Exception as e:
        app.logger.error(f"Error procesando test completo: {e}")
        return jsonify({"error": f"Error interno: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )