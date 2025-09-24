import sys
import eel
import os
from . import gestor_paciente as gestor # Importamos nuestro módulo de lógica

# Inicializa Eel y le dice dónde están los archivos de la interfaz ('web')
ruta_script = os.path.dirname(os.path.abspath(__file__))
ruta_web = os.path.join(os.path.dirname(ruta_script), 'web')
eel.init(ruta_web)
#eel.init('web')

# Simula una sesión para saber quién está logueado.
sesion_actual = {'usuario': None, 'rol': None}

login_exitoso = False

# --- Funciones de Login Expuestas ---

@eel.expose('login_py')
def login(username, password):
    """Verifica las credenciales y, si son correctas, levanta la bandera de login."""
    global login_exitoso # Le decimos a la función que vamos a modificar la variable global
    
    usuario_verificado = gestor.verificar_usuario(username, password)
    if usuario_verificado:
        sesion_actual['usuario'] = usuario_verificado['username']
        sesion_actual['rol'] = usuario_verificado['rol']
        
        login_exitoso = True # <-- 1. Levantamos la bandera ANTES de redirigir
        
        eel.redirigir_a_main()
        return {'exito': True}
    else:
        return {'exito': False, 'mensaje': 'Usuario o contraseña incorrectos.'}



# --- El Controlador ---
# Usamos el decorador @eel.expose para que esta función pueda ser llamada desde JavaScript.
# Le damos un nombre para JS ('obtener_pacientes_py') para evitar confusiones.
@eel.expose('obtener_pacientes_py')
def obtener_pacientes():
    """
    Función intermediaria que llama al gestor y devuelve los datos
    en un formato que JavaScript puede usar (lista de diccionarios).
    """
    print("Se ha solicitado la lista de pacientes desde la interfaz.")
    pacientes = gestor.obtener_todos_los_pacientes()
    return pacientes

# Dentro de src/main.py

# ... (debajo de la otra función expuesta)

@eel.expose('buscar_paciente_por_id_py')
def buscar_paciente(paciente_id):
    """Función intermediaria para buscar un paciente por su ID desde JS."""
    print(f"Se solicitaron los detalles para el paciente con ID: {paciente_id}")
    paciente, consultas = gestor.buscar_paciente_por_id(paciente_id)
    return {'paciente': paciente, 'consultas': consultas}


@eel.expose('agregar_paciente_py')
def agregar_paciente(paciente_data):
    """
    Función intermediaria que recibe un diccionario con los datos del paciente
    desde JavaScript y llama al gestor para guardarlo.
    """
    print("Recibiendo datos para un nuevo paciente:", paciente_data)
    # Llama a la función del gestor con los datos del diccionario
    nuevo_id = gestor.agregar_paciente(
        cedula=paciente_data['cedula'],
        nombres=paciente_data['nombres'],
        apellidos=paciente_data['apellidos'],
        fecha_nacimiento=paciente_data['fecha_nacimiento'],
        telefono=paciente_data['telefono'],
        domicilio=paciente_data['domicilio'],
        comentario=paciente_data['comentario']
        
    )
    # Devolvemos un diccionario indicando si fue exitoso
    if nuevo_id:
        print("Paciente guardado. Iniciando backup automático en segundo plano...")
        gestor.crear_copia_de_seguridad_automatica()
        return {'exito': True, 'mensaje': 'Paciente agregado correctamente.'}
    else:
        return {'exito': False, 'mensaje': 'Error: La cédula ya está registrada.'}

@eel.expose('agregar_consulta_py')
def agregar_consulta(consulta_data):
    print("Recibiendo datos para una nueva consulta:", consulta_data)
    nuevo_id = gestor.agregar_consulta(
        paciente_id=consulta_data['paciente_id'],
        fur=consulta_data['fur'],
        gestas_parto=consulta_data['gestas_parto'],
        gestas_cesarea=consulta_data['gestas_cesarea'],
        gestas_aborto=consulta_data['gestas_aborto'],
        anticonceptivos=consulta_data['anticonceptivos'],
        ant_personales=consulta_data['antecedentes_personales'],
        ant_familiares=consulta_data['antecedentes_familiares'],
        motivo=consulta_data['motivo_consulta'],
        examen_fisico=consulta_data['examen_fisico'],
        ecografia=consulta_data['ecografia'],
        diagnostico=consulta_data['diagnostico'],
        plan=consulta_data['plan'],
        medio_pago=consulta_data['medio_pago']
    )
    if nuevo_id:
        return {'exito': True, 'mensaje': 'Consulta agregada correctamente.'}
    else:
        return {'exito': False, 'mensaje': 'Error al guardar la consulta.'}

@eel.expose('modificar_paciente_py')
def modificar_paciente(paciente_id, paciente_data):
    """Función intermediaria para modificar un paciente desde JS."""
    print(f"Recibiendo datos para actualizar paciente ID {paciente_id}:", paciente_data)
    exito = gestor.modificar_paciente(paciente_id, paciente_data)
    
    if exito:
        return {'exito': True, 'mensaje': 'Datos del paciente actualizados correctamente.'}
    else:
        return {'exito': False, 'mensaje': 'Error: La cédula ya está registrada para otro paciente.'}

@eel.expose('eliminar_paciente_py')
def eliminar_paciente(paciente_id):
    """Función intermediaria para eliminar un paciente desde JS."""
    print(f"Recibiendo solicitud para eliminar paciente ID {paciente_id}")
    exito = gestor.eliminar_paciente(paciente_id)
    
    if exito:
        return {'exito': True, 'mensaje': 'Paciente eliminado correctamente.'}
    else:
        return {'exito': False, 'mensaje': 'Error al eliminar el paciente.'}

@eel.expose('buscar_pacientes_py')
def buscar_pacientes(termino):
    """Función intermediaria para buscar pacientes desde JS."""
    if not termino: # Si la barra de búsqueda está vacía, devuelve todos los pacientes
        return gestor.obtener_todos_los_pacientes()
    else:
        return gestor.buscar_pacientes_por_termino(termino)

@eel.expose('eliminar_consulta_py')
def eliminar_consulta(consulta_id):
    """Función intermediaria para eliminar una consulta desde JS."""
    print(f"Recibiendo solicitud para eliminar consulta ID {consulta_id}")
    exito = gestor.eliminar_consulta(consulta_id)
    
    if exito:
        return {'exito': True, 'mensaje': 'Consulta eliminada correctamente.'}
    else:
        return {'exito': False, 'mensaje': 'Error al eliminar la consulta.'}


@eel.expose('buscar_consulta_py')
def buscar_consulta(consulta_id):
    """Busca una consulta específica por su ID."""
    return gestor.buscar_consulta_por_id(consulta_id)

@eel.expose('modificar_consulta_py')
def modificar_consulta(consulta_id, consulta_data):
    """Modifica una consulta existente."""
    exito = gestor.modificar_consulta(consulta_id, consulta_data)
    if exito:
        return {'exito': True, 'mensaje': 'Consulta actualizada correctamente.'}
    else:
        return {'exito': False, 'mensaje': 'Error al actualizar la consulta.'}

# en src/main.py

@eel.expose('obtener_estadisticas_py')
def obtener_estadisticas():
    """Calcula y devuelve un diccionario completo de estadísticas, incluso si hay errores."""
    stats = {
        'total_pacientes': 0,
        'total_consultas': 0,
        'desglose_pagos': [] # Devuelve una lista vacía por defecto
    }
    try:
        todos_pacientes = gestor.obtener_todos_los_pacientes()
        total_consultas = gestor.contar_consultas_totales()
        desglose_pagos = gestor.contar_por_medio_pago()
        distribucion_edades = gestor.obtener_distribucion_edades()
        
        stats['total_pacientes'] = len(todos_pacientes)
        stats['total_consultas'] = total_consultas
        stats['desglose_pagos'] = desglose_pagos
        stats['distribucion_edades'] = distribucion_edades
        
    except Exception as e:
        print(f"Error al calcular estadísticas: {e}")
        # En caso de error, el diccionario ya tiene valores seguros por defecto

    return stats

@eel.expose('logout_py')
def logout():
    """Limpia los datos de la sesión actual."""
    global login_exitoso
    print(f"Cerrando sesión para el usuario: {sesion_actual['usuario']}")
    sesion_actual['usuario'] = None
    sesion_actual['rol'] = None
    
    login_exitoso = True 
    return {'exito': True}

def on_close(page, sockets):
    """
    Ahora esta función es más inteligente: solo cierra el programa si el
    cierre no fue causado por un login exitoso.
    """
    global login_exitoso
    
    # 2. Comprobamos el estado de la bandera
    if not login_exitoso:
        print("La ventana se ha cerrado por el usuario. Finalizando proceso.")
        sys.exit() # Solo salimos si NO fue un login exitoso
    else:
        print("Redirección de login a main.html, el proceso continúa.")
        # Reiniciamos la bandera para que el siguiente cierre (el real) sí funcione
        login_exitoso = False

def iniciar_app():
    """Inicia la aplicación de escritorio en la pantalla de login."""
    print("Iniciando aplicación en la pantalla de login...")
    
    # Añadimos flags de Chrome para deshabilitar la caché durante el desarrollo
    argumentos_navegador = [
        '--disable-cache', 
        '--disk-cache-size=0',
    ]
    try:
        eel.start(
            'login.html', 
            mode='chrome',
            size=(1920, 1080), 
            port=0, 
            close_callback=on_close,
            # Le pasamos los flags al navegador
            cmdline_args=argumentos_navegador
        )
    except (SystemExit, MemoryError, KeyboardInterrupt):
        print("Cerrando la aplicación.")

if __name__ == "__main__":
    # Aquí podrías añadir la lógica de login en el futuro
    iniciar_app()