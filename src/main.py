import eel
import gestor_paciente as gestor # Importamos nuestro módulo de lógica

# Inicializa Eel y le dice dónde están los archivos de la interfaz ('web')
eel.init('web')

# Simula una sesión para saber quién está logueado.
sesion_actual = {'usuario': None, 'rol': None}

# --- Funciones de Login Expuestas ---

@eel.expose('login_py')
def login(username, password):
    """Verifica las credenciales y actualiza la sesión."""
    usuario_verificado = gestor.verificar_usuario(username, password)
    if usuario_verificado:
        sesion_actual['usuario'] = usuario_verificado['username']
        sesion_actual['rol'] = usuario_verificado['rol']
        # Le decimos a JS que el login fue exitoso para que redirija
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

# --- Punto de Entrada de la Aplicación ---
def iniciar_app():
    """Inicia la aplicación de escritorio con Eel."""
    print("Iniciando aplicación...")
    eel.start('main.html', size=(1024, 768), port=0) # port=0 busca un puerto libre
    print("Aplicación cerrada.")

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
        fecha=consulta_data['fecha'],
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

def iniciar_app():
    """
    Modificamos la función para que inicie en la pantalla de login.
    """
    print("Iniciando aplicación en la pantalla de login...")
    # La aplicación ahora empieza en login.html
    eel.start('login.html', size=(600, 500), port=0)
    print("Aplicación cerrada.")

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


if __name__ == "__main__":
    # Aquí podrías añadir la lógica de login en el futuro
    iniciar_app()
