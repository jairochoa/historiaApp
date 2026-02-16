import sqlite3
import os

DB_PATH = os.path.join('data', 'pacientes.db')

def eliminar_todos_pacientes():
    """
    Elimina todos los registros de la tabla pacientes.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM pacientes;")
    
    conn.commit()
    conn.close()
    print("Todos los registros de pacientes han sido eliminados.")

if __name__ == "__main__":
    eliminar_todos_pacientes()