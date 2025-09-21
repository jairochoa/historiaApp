from src.database import crear_tablas

if __name__ == "__main__":
    print("🏗️  Iniciando la construcción de la base de datos...")
    crear_tablas()
    print("\n✅ ¡Éxito! La base de datos 'pacientes.db' ha sido creada en la carpeta 'data'.")