import sys
import os

# Add src directory to path so we can import gestor_paciente
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from gestor_paciente import eliminar_todas_las_consultas

if __name__ == "__main__":
    print("=" * 50)
    print("ELIMINADOR DE TODAS LAS CONSULTAS")
    print("=" * 50)
    print("\nADVERTENCIA: Esta acción eliminará TODOS los registros de consultas")
    print("y NO se puede deshacer.")
    
    respuesta = input("\n¿Deseas continuar? (si/no): ").strip().lower()
    
    if respuesta in ['si', 's', 'yes', 'y']:
        resultado = eliminar_todas_las_consultas()
        if resultado:
            print("\n✓ Todas las consultas han sido eliminadas correctamente.")
        else:
            print("\n✗ Hubo un error al eliminar las consultas.")
    else:
        print("\nOperación cancelada.")
