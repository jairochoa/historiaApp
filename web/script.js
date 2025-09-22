// web/script.js

// Se declara UNA SOLA VEZ aquí, en el ámbito global.
let pacienteSeleccionadoId = null;

window.onload = function() {
    setupEventListeners();
    cargarListaPacientes();
};

function setupEventListeners() {
    // --- Lógica para el Modal de Nuevo Paciente ---
    const patientModal = document.getElementById('add-patient-modal');
    const addPatientBtn = document.getElementById('add-patient-btn');
    const patientModalCloseBtn = patientModal.querySelector('.close-btn');

    addPatientBtn.onclick = function() {
        patientModal.style.display = "block";
    }
    patientModalCloseBtn.onclick = function() {
        patientModal.style.display = "none";
    }

    // --- Lógica para el Modal de Nueva Consulta ---
    const consultationModal = document.getElementById('add-consultation-modal');
    const consultationModalCloseBtn = consultationModal.querySelector('.close-btn');

    consultationModalCloseBtn.onclick = function() {
        consultationModal.style.display = "none";
    }
    
    // Cierre de modales al hacer clic fuera
    window.onclick = function(event) {
        if (event.target == patientModal) {
            patientModal.style.display = "none";
        }
        if (event.target == consultationModal) {
            consultationModal.style.display = "none";
        }
    }

    // --- Lógica para el envío del Formulario de PACIENTE ---
    // Le damos un nombre único a la variable del formulario: 'patientForm'
    const patientForm = document.getElementById('patient-form');
    patientForm.addEventListener('submit', async function(event) {
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
            patientModal.style.display = "none";
            patientForm.reset();
            cargarListaPacientes();
        } else {
            alert(resultado.mensaje);
        }
    })

    // --- Lógica para el envío del Formulario de CONSULTA ---
    const consultationForm = document.getElementById('consultation-form');
    consultationForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const consultaData = {
            paciente_id: pacienteSeleccionadoId,
            fecha: new Date().toISOString().slice(0, 10),
            fur: document.getElementById('fur').value,
            gestas_parto: parseInt(document.getElementById('gestas_parto').value) || 0,
            gestas_cesarea: parseInt(document.getElementById('gestas_cesarea').value) || 0,
            gestas_aborto: parseInt(document.getElementById('gestas_aborto').value) || 0,
            anticonceptivos: document.getElementById('anticonceptivos').value,
            antecedentes_personales: document.getElementById('antecedentes_personales').value,
            antecedentes_familiares: document.getElementById('antecedentes_familiares').value,
            motivo_consulta: document.getElementById('motivo_consulta').value,
            examen_fisico: document.getElementById('examen_fisico').value,
            ecografia: document.getElementById('ecografia').value,
            diagnostico: document.getElementById('diagnostico').value,
            plan: document.getElementById('plan').value,
            medio_pago: document.getElementById('medio_pago').value
        };

        const resultado = await eel.agregar_consulta_py(consultaData)();

        if (resultado.exito) {
            alert(resultado.mensaje);
            consultationModal.style.display = "none";
            consultationForm.reset();
            mostrarDetallesPaciente(pacienteSeleccionadoId);
        } else {
            alert(resultado.mensaje);
        }
    });
}

function abrirModalConsulta() {
    if (!pacienteSeleccionadoId) {
        alert("Por favor, selecciona un paciente primero.");
        return;
    }
    const modal = document.getElementById('add-consultation-modal');
    modal.style.display = 'block';
}

async function cargarListaPacientes() {
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
}

async function mostrarDetallesPaciente(pacienteId) {
    // Se le asigna un valor a la variable global, SIN 'let'.
    pacienteSeleccionadoId = pacienteId;
    
    const data = await eel.buscar_paciente_por_id_py(pacienteId)();
    const detailsContainer = document.getElementById('patient-details');
    
    if (!data.paciente) {
        detailsContainer.innerHTML = '<p>Error: No se encontraron los datos del paciente.</p>';
        return;
    }

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
        html += '<ul class="consultation-list">';
        data.consultas.forEach(consulta => {
            html += `
                <li>
                    <strong>Fecha: ${consulta.fecha}</strong><br>
                    <strong>Motivo:</strong> ${consulta.motivo_consulta || 'N/A'}<br>
                    <strong>Diagnóstico:</strong> ${consulta.diagnostico || 'N/A'}
                </li>
            `;
        });
        html += '</ul>';
    } else {
        html += '<p>No hay consultas registradas para este paciente.</p>';
    }
    detailsContainer.innerHTML = html;

    document.getElementById('add-consultation-btn').addEventListener('click', abrirModalConsulta);
}