// web/script.js

window.onload = function() {
    setupEventListeners();
    cargarListaPacientes();
};

function setupEventListeners() {
    // --- Lógica para el Modal de Nuevo Paciente ---
    const modal = document.getElementById('add-patient-modal');
    const btn = document.getElementById('add-patient-btn');
    const span = document.getElementsByClassName('close-btn')[0];

    btn.onclick = function() {
        modal.style.display = "block";
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // --- Lógica para el envío del Formulario ---
    const form = document.getElementById('patient-form');
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const pacienteData = {
            cedula: document.getElementById('cedula').value,
            nombres: document.getElementById('nombres').value,
            apellidos: document.getElementById('apellidos').value,
            fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
            telefono: document.getElementById('telefono').value,
            domicilio: document.getElementById('domicilio').value,
            comentario: document.getElementById('comentario').value
        };

        const resultado = await eel.agregar_paciente_py(pacienteData)();

        if (resultado.exito) {
            alert(resultado.mensaje);
            modal.style.display = "none";
            form.reset();
            cargarListaPacientes();
        } else {
            alert(resultado.mensaje);
        }
    });
}


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
        listItem.addEventListener('click', () => {
            document.querySelectorAll('#patient-list li').forEach(li => li.classList.remove('active'));
            listItem.classList.add('active');
            mostrarDetallesPaciente(paciente.id);
        });
        patientListElement.appendChild(listItem);
    });
    console.log("Lista de pacientes cargada.");
}

let pacienteSeleccionadoId = null;

async function mostrarDetallesPaciente(pacienteId) {
    pacienteSeleccionadoId = pacienteId; // Guardamos el ID del paciente actual
    console.log(`Pidiendo detalles para el paciente ID: ${pacienteId}`);
    
    const data = await eel.buscar_paciente_por_id_py(pacienteId)();
    const detailsContainer = document.getElementById('patient-details');
    
    if (!data.paciente) {
        detailsContainer.innerHTML = '<p>Error: No se encontraron los datos del paciente.</p>';
        return;
    }

    // Construimos el HTML con los detalles del paciente
    let html = `
        <h3>${data.paciente.nombres} ${data.paciente.apellidos}</h3>
        <p><strong>Cédula:</strong> ${data.paciente.cedula}</p>
        <p><strong>Teléfono:</strong> ${data.paciente.telefono}</p>
        <p><strong>Comentario:</strong> ${data.paciente.comentario || '<em>Sin comentario.</em>'}</p>
        <hr>
        <div class="consultation-header">
            <h4>Historial de Consultas</h4>
            <button id="add-consultation-btn" class="btn">Añadir Consulta</button>
        </div>
    `;

    if (data.consultas.length > 0) {
        html += '<ul>';
        data.consultas.forEach(consulta => {
            html += `<li><strong>Fecha:</strong> ${consulta.fecha}<br><strong>Motivo:</strong> ${consulta.motivo_consulta}<br><strong>Valoración:</strong> ${consulta.valoracion}</li>`;
        });
        html += '</ul>';
    } else {
        html += '<p>No hay consultas registradas para este paciente.</p>';
    }
    detailsContainer.innerHTML = html;
    
    document.getElementById('add-consultation-btn').addEventListener('click', () => {
        abrirModalConsulta();
    });
}