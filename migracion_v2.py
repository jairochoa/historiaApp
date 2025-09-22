import sqlite3
from src.database import obtener_conexion_db

def aplicar_migracion_v2():
    """Añade las nuevas columnas solicitadas"""
    
    conn = None
    try:
        conn = obtener_conexion_db()
        cursor = conn.cursor()
        print("Iniciando migración de la base de datos a la v2...")

        # --- 1. Añadir columnas 'comentario' y domicilio a la tabla de pacientes ---
        try:
            cursor.execute("ALTER TABLE pacientes ADD COLUMN domicilio TEXT")
            print("- Columna 'domicilio' añadida a la tabla 'pacientes'.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("- La columna 'domicilio' ya existía en 'pacientes'.")
            else:
                raise e

        # --- 2. Añadir todas las nuevas columnas a la tabla de consultas ---
        columnas_consulta = {
            "FUR": "TEXT NOT NULL DEFAULT ''",
            "motivo_consulta": "TEXT NOT NULL",
            "gestas_parto": "INTEGER DEFAULT 0",
            "gestas_cesarea": "INTEGER DEFAULT 0",
            "gestas_aborto": "INTEGER DEFAULT 0",
            "anticonceptivos": "TEXT",
            "antecedentes_personales": "TEXT",
            "antecedentes_familiares": "TEXT",
            "examen_fisico": "TEXT",
            "ecografia": "TEXT",
            "diagnostico": "TEXT",
            "plan": "TEXT",
            "medio_pago": "TEXT"
        }

        for col, tipo in columnas_consulta.items():
            try:
                cursor.execute(f"ALTER TABLE consultas ADD COLUMN {col} {tipo}")
                print(f"- Columna '{col}' añadida a la tabla 'consultas'.")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e):
                    print(f"- La columna '{col}' ya existía en 'consultas'.")
                else:
                    raise e
        
        conn.commit()
        print("\n✅ ¡Migración completada exitosamente!")
        
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    aplicar_migracion_v2()