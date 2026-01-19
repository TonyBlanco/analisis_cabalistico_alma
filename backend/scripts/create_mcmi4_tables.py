"""
Script para crear tablas MCMI-4-Mystic directamente en la base de datos,
evitando el sistema de migraciones de Django.
"""

import os
import sys
import django

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection

SQL_CREATE_TABLES = """
-- Tabla de banco de preguntas
CREATE TABLE IF NOT EXISTS mcmi4_mystic_question_bank (
    question_id VARCHAR(20) PRIMARY KEY,
    world VARCHAR(20) NOT NULL,
    dimension_id VARCHAR(50) NOT NULL,
    sefirah VARCHAR(20) NOT NULL,
    text_es TEXT NOT NULL,
    text_en TEXT,
    reverse_scored BOOLEAN DEFAULT FALSE,
    weight REAL DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mcmi4_qbank_world_dim ON mcmi4_mystic_question_bank(world, dimension_id);
CREATE INDEX IF NOT EXISTS idx_mcmi4_qbank_dim ON mcmi4_mystic_question_bank(dimension_id);

-- Tabla de configuración de dimensiones
CREATE TABLE IF NOT EXISTS mcmi4_mystic_dimension_config (
    dimension_id VARCHAR(50) PRIMARY KEY,
    world VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    sefirah VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    items_required INTEGER NOT NULL
);

-- Tabla de instancias de test
CREATE TABLE IF NOT EXISTS mcmi4_mystic_test_instance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    questions_used TEXT NOT NULL,
    responses TEXT DEFAULT '{}',
    raw_scores TEXT NULL,
    structured_data TEXT NULL,
    is_complete BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (patient_id) REFERENCES auth_user(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mcmi4_instance_patient ON mcmi4_mystic_test_instance(patient_id);
CREATE INDEX IF NOT EXISTS idx_mcmi4_instance_date ON mcmi4_mystic_test_instance(applied_at DESC);
"""

def create_tables():
    """Crear tablas directamente usando SQL."""
    print("🔧 Creando tablas MCMI-4-Mystic...")
    
    with connection.cursor() as cursor:
        # Ejecutar cada statement SQL
        for statement in SQL_CREATE_TABLES.split(';'):
            statement = statement.strip()
            if statement:
                try:
                    cursor.execute(statement)
                    print(f"✅ Ejecutado: {statement[:50]}...")
                except Exception as e:
                    print(f"⚠️  Error: {e}")
    
    print("\n✅ Tablas creadas exitosamente!")
    
    # Verificar tablas
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name LIKE 'mcmi4%'
            ORDER BY name
        """)
        tables = cursor.fetchall()
        
        print("\n📊 Tablas MCMI-4-Mystic creadas:")
        for table in tables:
            print(f"  - {table[0]}")

if __name__ == '__main__':
    create_tables()
