# migracion_v3_eliminar_columnas.py
import sqlite3
from src.database import obtener_conexion_db

def aplicar_migracion_v3():
    """
    Elimina las columnas 'valoracion' y 'tratamiento' de la tabla 'consultas'
    recreando la tabla y preservando los datos existentes.
    """
    conn = None
    try:
        conn = obtener_conexion_db()
        cursor = conn.cursor()
        print("Iniciando migración para eliminar columnas de la tabla 'consultas'...")

        # Paso 1: Renombrar la tabla original
        cursor.execute("ALTER TABLE consultas RENAME TO consultas_old")
        print("- Tabla original renombrada a 'consultas_old'.")

        # Paso 2: Crear la nueva tabla con la estructura deseada
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS consultas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paciente_id INTEGER NOT NULL,
            fecha TEXT NOT NULL,
            motivo_consulta TEXT,
            ruta_imagen TEXT,
            fur TEXT NOT NULL DEFAULT '',
            gestas_parto INTEGER DEFAULT 0,
            gestas_cesarea INTEGER DEFAULT 0,
            gestas_aborto INTEGER DEFAULT 0,
            anticonceptivos TEXT,
            antecedentes_personales TEXT,
            antecedentes_familiares TEXT,
            examen_fisico TEXT,
            ecografia TEXT,
            diagnostico TEXT,
            plan TEXT,
            medio_pago TEXT,
            FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
        )
        """)
        print("- Nueva tabla 'consultas' creada con la estructura correcta.")

        # Paso 3: Copiar los datos de la tabla vieja a la nueva
        columnas_a_conservar = [
            "id", "paciente_id", "fecha", "motivo_consulta", "ruta_imagen", "fur", 
            "gestas_parto", "gestas_cesarea", "gestas_aborto", "anticonceptivos", 
            "antecedentes_personales", "antecedentes_familiares", "examen_fisico", 
            "ecografia", "diagnostico", "plan", "medio_pago"
        ]
        columnas_str = ", ".join(columnas_a_conservar)
        cursor.execute(f"INSERT INTO consultas ({columnas_str}) SELECT {columnas_str} FROM consultas_old")
        print("- Datos existentes copiados a la nueva tabla.")

        # Paso 4: Eliminar la tabla antigua
        cursor.execute("DROP TABLE consultas_old")
        print("- Tabla 'consultas_old' eliminada.")

        conn.commit()
        print("\n✅ ¡Migración completada! Las columnas han sido eliminadas exitosamente.")

    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    aplicar_migracion_v3()