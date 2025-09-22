import eel
import gestor_paciente as gestor # Importamos nuestro módulo de lógica

# Inicializa Eel y le dice dónde están los archivos de la interfaz ('web')
eel.init('web')

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
        telefono=paciente_data['telefono']
    )
    # Devolvemos un diccionario indicando si fue exitoso
    if nuevo_id:
        return {'exito': True, 'mensaje': 'Paciente agregado correctamente.'}
    else:
        return {'exito': False, 'mensaje': 'Error: La cédula ya está registrada.'}


if __name__ == "__main__":
    # Aquí podrías añadir la lógica de login en el futuro
    iniciar_app()
