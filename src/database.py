import sqlite3
import os

# Define la ruta a la base de datos. Ahora vivirá en la carpeta 'data'.
DB_PATH = os.path.join('data', 'pacientes.db')

def obtener_conexion_db():
    """
    Se conecta a la base de datos SQLite. La crea si no existe.
    """
    # Se conecta a la base de datos (la crea si el archivo no existe)
    conn = sqlite3.connect(DB_PATH)
    return conn

def crear_tablas():
    """
    Ejecuta las sentencias SQL para crear la estructura inicial de tablas.
    """
    conn = obtener_conexion_db()
    cursor = conn.cursor()

    # --- Tabla de Usuarios (para el login) ---
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    )
    """)

    # --- Tabla de Pacientes ---
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pacientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cedula TEXT UNIQUE NOT NULL,
        nombres TEXT NOT NULL,
        apellidos TEXT NOT NULL,
        fecha_nacimiento TEXT,
        telefono TEXT,
        comentario TEXT
    )
    """)

    # --- Tabla de Consultas (vinculada a Pacientes) ---
    # FOREIGN KEY (paciente_id) REFERENCES pacientes (id) crea el vínculo
    # entre una consulta y un paciente.
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS consultas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paciente_id INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        motivo_consulta TEXT,
        valoracion TEXT,
        tratamiento TEXT,
        ruta_imagen TEXT,
        FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    )
    """)

    conn.commit() # Guarda todos los cambios en la base de datos
    conn.close() # Cierra la conexión
    print("Tablas 'usuarios', 'pacientes' y 'consultas' creadas o ya existentes.")