# App de Historial Médico - Clínica Dra. Yasmin Ramirez

Aplicación de escritorio local para la gestión de historiales médicos de pacientes, enfocada en ginecología y obstetricia.

## ✨ Características Principales

* **Gestión de Pacientes:** CRUD completo (Crear, Leer, Actualizar, Eliminar) para los datos de las pacientes.
* **Historial de Consultas:** Registro detallado de cada consulta, incluyendo campos especializados.
* **Dashboard Interactivo:** Visualizaciones y estadísticas clave sobre la actividad de la consulta.
* **Búsqueda Rápida:** Filtro en tiempo real de pacientes por nombre, apellido o cédula.
* **Backups Automáticos:** Creación de copias de seguridad de la base de datos al registrar nuevos pacientes.
* **100% Offline:** La aplicación y todos sus datos se ejecutan y almacenan localmente.

## 🔧 Instalación y Ejecución (para Desarrolladores)

1.  Clona el repositorio: `git clone https://github.com/tu-usuario/tu-repositorio.git`
2.  Navega a la carpeta del proyecto: `cd historial_medico_app`
3.  Crea un entorno virtual: `python -m venv .venv`
4.  Activa el entorno: `.\.venv\Scripts\activate`
5.  Instala las dependencias: `pip install -r requirements.txt`
6.  Crea la base de datos por primera vez: `python inicializar_db.py`
7.  Ejecuta la aplicación: `python -m src.main`

## 💻 Uso (para el Usuario Final)

1.  Navega a la carpeta `dist/`.
2.  Ejecuta el archivo `main.exe`.
3.  Inicia sesión con las credenciales proporcionadas.