import sqlite3
from src.database import obtener_conexion_db

conn = obtener_conexion_db()
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(pacientes)")
rows = cursor.fetchall()
for row in rows:
    print(row)