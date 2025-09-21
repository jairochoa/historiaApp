// web/script.js

window.onload = function() {
    cargarListaPacientes();
};

async function cargarListaPacientes() {
    console.log("Pidiendo la lista de pacientes a Python...");
    let pacientes = await eel.obtener_pacientes_py()();

    const patientListElement = document.getElementById('patient-list');
    patientListElement.innerHTML = '';

    if (pacientes.length === 0) {
        patientListElement.innerHTML = '<li>No hay pacientes registrados.</li>';
        return;
    }

    pacientes.forEach(paciente => {
        const listItem = document.createElement('li');
        listItem.textContent = `${paciente.apellidos}, ${paciente.nombres}`;
        listItem.dataset.pacienteId = paciente.id; 
        
        // --- ¡NUEVO! Añadimos el "escuchador" de clics ---
        listItem.addEventListener('click', () => {
            // Marca este item como activo y quita la marca de los demás
            document.querySelectorAll('#patient-list li').forEach(li => li.classList.remove('active'));
            listItem.classList.add('active');
            
            // Llama a la función para mostrar los detalles
            mostrarDetallesPaciente(paciente.id);
        });
        
        patientListElement.appendChild(listItem);
    });
    
    console.log("Lista de pacientes cargada.");
}

// --- ¡NUEVA FUNCIÓN! ---
async function mostrarDetallesPaciente(pacienteId) {
    console.log(`Pidiendo detalles para el paciente ID: ${pacienteId}`);
    
    // Llama a la nueva función de Python
    const data = await eel.buscar_paciente_por_id_py(pacienteId)();

    const detailsContainer = document.getElementById('patient-details');
    
    if (!data.paciente) {
        detailsContainer.innerHTML = '<p>Error: No se encontraron los datos del paciente.</p>';
        return;
    }

    // Construimos el HTML con los detalles del paciente y su historial
    let html = `
        <h3>${data.paciente.nombres} ${data.paciente.apellidos}</h3>
        <p><strong>Cédula:</strong> ${data.paciente.cedula}</p>
        <p><strong>Teléfono:</strong> ${data.paciente.telefono}</p>
        <p><strong>Fecha de Nacimiento:</strong> ${data.paciente.fecha_nacimiento}</p>
        <hr>
        <h4>Historial de Consultas</h4>
    `;

    if (data.consultas.length > 0) {
        html += '<ul>';
        data.consultas.forEach(consulta => {
            html += `
                <li>
                    <strong>Fecha:</strong> ${consulta.fecha}<br>
                    <strong>Motivo:</strong> ${consulta.motivo_consulta}<br>
                    <strong>Valoración:</strong> ${consulta.valoracion}
                </li>
            `;
        });
        html += '</ul>';
    } else {
        html += '<p>No hay consultas registradas para este paciente.</p>';
    }

    // Inyectamos el HTML en el contenedor derecho
    detailsContainer.innerHTML = html;
}