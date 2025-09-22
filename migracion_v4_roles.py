from src.database import obtener_conexion_db
import sqlite3

def aplicar_migracion_v4():
    """Añade la columna 'rol' a la tabla de usuarios."""
    conn = None
    try:
        conn = obtener_conexion_db()
        cursor = conn.cursor()
        print("Aplicando migración: añadiendo columna 'rol' a 'usuarios'...")
        
        # Le ponemos un valor por defecto 'admin' para que los usuarios existentes
        # no queden con un campo vacío.
        cursor.execute("ALTER TABLE usuarios ADD COLUMN rol TEXT NOT NULL DEFAULT 'admin'")
        
        conn.commit()
        print("\n✅ ¡Migración completada! La columna 'rol' ha sido añadida.")
        
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("- La columna 'rol' ya existía en 'usuarios'. No se necesita migración.")
        else:
            raise e
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    aplicar_migracion_v4()