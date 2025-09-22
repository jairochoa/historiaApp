import sqlite3
import hashlib # Librería para encriptar contraseñas
from database import obtener_conexion_db

# --- Funciones de Usuarios y Seguridad ---

def _hash_password(password):
    """Función interna para encriptar una contraseña usando SHA-256."""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def registrar_usuario(username, password):
    """Registra un nuevo usuario en la base de datos con una contraseña encriptada."""
    conn = obtener_conexion_db()
    cursor = conn.cursor()
    
    password_hash = _hash_password(password)
    
    try:
        cursor.execute("INSERT INTO usuarios (username, password_hash) VALUES (?, ?)", (username, password_hash))
        conn.commit()
        print(f"Usuario '{username}' registrado exitosamente.")
    except sqlite3.IntegrityError:
        print(f"Error: El nombre de usuario '{username}' ya existe.")
    finally:
        conn.close()

def verificar_usuario(username, password):
    """
    Verifica las credenciales. Si son correctas, devuelve los datos del usuario.
    Si no, devuelve None.
    """
    conn = obtener_conexion_db()
    conn.row_factory = sqlite3.Row # Para obtener resultados como diccionario
    cursor = conn.cursor()
    
    # Seleccionamos toda la fila del usuario
    cursor.execute("SELECT * FROM usuarios WHERE username = ?", (username,))
    record = cursor.fetchone()
    conn.close()
    
    if record:
        stored_hash = record['password_hash']
        input_hash = _hash_password(password)
        if stored_hash == input_hash:
            print(f"Login exitoso para usuario '{username}' con rol '{record['rol']}'.")
            return dict(record) # Devuelve un diccionario con id, username, rol, etc.
    
    print("Login fallido.")
    return None

# --- Funciones de Pacientes ---

def agregar_paciente(cedula, nombres, apellidos, fecha_nacimiento, telefono, domicilio, comentario):
    """Añade un nuevo paciente a la base de datos."""
    conn = obtener_conexion_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "INSERT INTO pacientes (cedula, nombres, apellidos, fecha_nacimiento, telefono, domicilio, comentario) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (cedula, nombres, apellidos, fecha_nacimiento, telefono, domicilio, comentario)
        )
        conn.commit()
        print(f"Paciente '{nombres} {apellidos}' agregado exitosamente.")
        return cursor.lastrowid # Devuelve el ID interno del nuevo paciente
    except sqlite3.IntegrityError:
        print(f"Error: La cédula '{cedula}' ya está registrada.")
        return None
    finally:
        conn.close()

def buscar_paciente_por_cedula(cedula):
    """Busca un paciente por su cédula y devuelve sus datos y su historial."""
    conn = obtener_conexion_db()
    # Hacemos que los resultados vengan como diccionarios para un manejo más fácil
    conn.row_factory = sqlite3.Row 
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM pacientes WHERE cedula = ?", (cedula,))
    paciente_record = cursor.fetchone()
    
    if not paciente_record:
        conn.close()
        return None, [] # Paciente no encontrado

    # Convertimos el registro del paciente a un diccionario
    paciente_dict = dict(paciente_record)
    
    # Ahora buscamos todas sus consultas asociadas
    cursor.execute("SELECT * FROM consultas WHERE paciente_id = ? ORDER BY fecha DESC", (paciente_dict['id'],))
    consultas_records = cursor.fetchall()
    
    # Convertimos cada registro de consulta a un diccionario
    consultas_list = [dict(consulta) for consulta in consultas_records]
    
    conn.close()
    return paciente_dict, consultas_list

def obtener_todos_los_pacientes():
    """Devuelve una lista de todos los pacientes registrados."""
    conn = obtener_conexion_db()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, cedula, nombres, apellidos FROM pacientes ORDER BY apellidos, nombres")
    pacientes_records = cursor.fetchall()
    conn.close()
    
    return [dict(paciente) for paciente in pacientes_records]

# --- Funciones de Consultas ---

def agregar_consulta(paciente_id, fecha, motivo, fur, gestas_parto, gestas_cesarea, gestas_aborto, anticonceptivos, ant_personales, ant_familiares, examen_fisico, ecografia, diagnostico, plan, medio_pago, ruta_imagen=None):
    """Añade una nueva consulta para un paciente existente."""
    conn = obtener_conexion_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            """INSERT INTO consultas (paciente_id, fecha, motivo_consulta, ruta_imagen, FUR, gestas_parto, gestas_cesarea, gestas_aborto, anticonceptivos, antecedentes_personales, antecedentes_familiares, examen_fisico, ecografia, diagnostico, plan, medio_pago)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (paciente_id, fecha, motivo, ruta_imagen, fur, gestas_parto, gestas_cesarea, gestas_aborto, anticonceptivos, ant_personales, ant_familiares, examen_fisico, ecografia, diagnostico, plan, medio_pago)
        )
        conn.commit()
        print(f"Nueva consulta para el paciente ID {paciente_id} agregada exitosamente.")
        return cursor.lastrowid
    except Exception as e:
        print(f"Error al agregar la consulta: {e}")
        return None
    finally:
        conn.close()

def buscar_paciente_por_id(paciente_id):
    """Busca un paciente por su ID interno y devuelve sus datos y consultas."""
    conn = obtener_conexion_db()
    conn.row_factory = sqlite3.Row 
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM pacientes WHERE id = ?", (paciente_id,))
    paciente_record = cursor.fetchone()
    
    if not paciente_record:
        conn.close()
        return None, []

    paciente_dict = dict(paciente_record)
    
    cursor.execute("SELECT * FROM consultas WHERE paciente_id = ? ORDER BY fecha DESC", (paciente_id,))
    consultas_records = cursor.fetchall()
    
    consultas_list = [dict(consulta) for consulta in consultas_records]
    
    conn.close()
    return paciente_dict, consultas_list


# En src/gestor_pacientes.py

# ... (debajo de las otras funciones de pacientes)

def modificar_paciente(paciente_id, paciente_data):
    """Actualiza los datos de un paciente existente usando su ID interno."""
    conn = obtener_conexion_db()
    cursor = conn.cursor()
    
    try:
        # La sentencia UPDATE modifica una fila existente.
        # La cláusula WHERE es crucial para asegurar que solo modificamos al paciente correcto.
        cursor.execute(
            """UPDATE pacientes SET
               cedula = ?,
               nombres = ?,
               apellidos = ?,
               fecha_nacimiento = ?,
               telefono = ?,
               domicilio = ?,
               comentario = ?
               WHERE id = ?""",
            (
                paciente_data['cedula'],
                paciente_data['nombres'],
                paciente_data['apellidos'],
                paciente_data['fecha_nacimiento'],
                paciente_data['telefono'],
                paciente_data['domicilio'],
                paciente_data['comentario'],
                paciente_id
            )
        )
        conn.commit()
        print(f"Paciente ID {paciente_id} actualizado exitosamente.")
        return True
    except sqlite3.IntegrityError:
        # Esto pasaría si intentas cambiar la cédula a una que ya existe.
        print(f"Error: La cédula '{paciente_data['cedula']}' ya pertenece a otro paciente.")
        return False
    except Exception as e:
        print(f"Error al modificar el paciente: {e}")
        return False
    finally:
        conn.close()


def eliminar_paciente(paciente_id):
    """
    Elimina un paciente y todas sus consultas asociadas de la base de datos.
    """
    conn = obtener_conexion_db()
    cursor = conn.cursor()
    
    try:
        # Primero, eliminamos los registros dependientes (las consultas)
        cursor.execute("DELETE FROM consultas WHERE paciente_id = ?", (paciente_id,))
        
        # Luego, eliminamos el registro principal (el paciente)
        cursor.execute("DELETE FROM pacientes WHERE id = ?", (paciente_id,))
        
        conn.commit()
        print(f"Paciente ID {paciente_id} y todas sus consultas han sido eliminados.")
        return True
    except Exception as e:
        print(f"Error al eliminar el paciente: {e}")
        conn.rollback() # Revierte los cambios si algo sale mal
        return False
    finally:
        conn.close()

# En src/gestor_pacientes.py
import shutil
from datetime import datetime
import os # Asegúrate de que 'os' esté importado

# ... (otras funciones) ...

def crear_copia_de_seguridad_automatica():
    """
    Crea una copia de seguridad automática en una carpeta predefinida
    dentro de los Documentos del usuario.
    """
    try:
        # 1. Definimos la ruta de origen de la base de datos
        ruta_origen = os.path.join('data', 'pacientes.db')
        if not os.path.exists(ruta_origen):
            print("Backup automático omitido: No se encontró la base de datos.")
            return

        # 2. Definimos una ruta de destino segura y predecible
        directorio_documentos = os.path.join(os.path.expanduser('~'), 'Documents')
        carpeta_backups = os.path.join(directorio_documentos, 'Backups_Historial_Medico')
        os.makedirs(carpeta_backups, exist_ok=True) # Crea la carpeta si no existe

        # 3. Creamos el nombre del archivo de backup con fecha y hora
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        nombre_backup = f"backup-pacientes-{timestamp}.db"
        ruta_backup_completa = os.path.join(carpeta_backups, nombre_backup)
        
        # 4. Copiamos el archivo
        shutil.copy2(ruta_origen, ruta_backup_completa)
        print(f"Backup automático creado exitosamente en: {ruta_backup_completa}")
        
    except Exception as e:
        # Si el backup falla, no debe detener la aplicación. Solo lo registramos.
        print(f"ERROR DURANTE EL BACKUP AUTOMÁTICO: {e}")

if __name__ == '__main__':
    registrar_usuario("ydama", "linfocitot") #<-- ¡Sin el # al principio!
#     # --- PRUEBAS ---
#     print("\n--- INICIANDO PRUEBAS DEL GESTOR ---")
    
#     # 1. Registrar un usuario (solo se necesita la primera vez)
#     # registrar_usuario("DraAna", "contraseña_segura_123")
    
#     # 2. Verificar el login
#     verificar_usuario("DraYasmin", "contraseña_segura_123")
#     verificar_usuario("DraYasmin", "contraseña_incorrecta")
    
#     print("\n--- Pruebas de Pacientes ---")
#     # 3. Agregar un paciente nuevo
#     agregar_paciente("V12345678", "Ana", "Suarez", "1985-05-10", "555-1234")
    
#     # 4. Intentar agregar el mismo paciente de nuevo (debería fallar)
#     agregar_paciente("V13996491", "Yasmin", "Ramirez", "1985-05-10", "555-1234")
    
#     # 5. Buscar al paciente y su historial (que estará vacío por ahora)
#     paciente, consultas = buscar_paciente_por_cedula("V12345678")
#     if paciente:
#         print(f"\nPaciente encontrado: {paciente['nombres']} {paciente['apellidos']}")
        
#         # 6. Agregarle dos consultas
#         paciente_id_interno = paciente['id']
#         agregar_consulta(paciente_id_interno, "2025-09-20", "Chequeo general", "Paciente refiere buen estado de salud.", "Continuar dieta.")
#         agregar_consulta(paciente_id_interno, "2025-09-21", "Dolor de cabeza", "Migraña por estrés.", "Analgésicos y reposo.")
        
#         # 7. Volver a buscarlo para ver su historial completo
#         paciente_actualizado, consultas_actualizadas = buscar_paciente_por_cedula("V12345678")
#         print(f"\nHistorial actualizado para {paciente_actualizado['nombres']}:")
#         for consulta in consultas_actualizadas:
#             print(f"  - Fecha: {consulta['fecha']}, Motivo: {consulta['motivo_consulta']}")
            
#     # 8. Obtener la lista de todos los pacientes
#     todos_los_pacientes = obtener_todos_los_pacientes()
#     print("\n--- Lista de todos los pacientes ---")
#     for p in todos_los_pacientes:
#         print(f"  - ID: {p['id']}, Cédula: {p['cedula']}, Nombre: {p['nombres']} {p['apellidos']}")