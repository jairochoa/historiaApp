// web/script.js

// Se declara UNA SOLA VEZ aquí, en el ámbito global.
let pacienteSeleccionadoId = null;
let modoFormularioPaciente = 'añadir';

window.onload = function() {
    setupEventListeners();
    cargarListaPacientes();
};

// en web/script.js

function setupEventListeners() {
    // --- Lógica para el Modal de Nuevo Paciente ---
    const patientModal = document.getElementById('add-patient-modal');
    const addPatientBtn = document.getElementById('add-patient-btn');
    const patientModalCloseBtn = patientModal.querySelector('.close-btn');
    const patientForm = document.getElementById('patient-form'); // Declarado una sola vez aquí

    addPatientBtn.onclick = function() {
        modoFormularioPaciente = 'añadir';
        patientForm.reset(); 
        patientModal.querySelector('h2').textContent = 'Registrar Nuevo Paciente';
        patientModal.querySelector('button[type="submit"]').textContent = 'Guardar Paciente';
        patientModal.style.display = "block";
    }

    patientModalCloseBtn.onclick = function() {
        patientModal.style.display = "none";
    }

    // --- Lógica para el Modal de Nueva Consulta ---
    const consultationModal = document.getElementById('add-consultation-modal');
    const consultationModalCloseBtn = consultationModal.querySelector('.close-btn');
    const consultationForm = document.getElementById('consultation-form');

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

    // --- Lógica ÚNICA Y CORRECTA para el envío del Formulario de PACIENTE ---
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

        let resultado;
        // La condición IF/ELSE es la clave para decidir si añadir o editar
        if (modoFormularioPaciente === 'editar') {
            console.log("MODO EDITAR: Enviando actualización para paciente ID:", pacienteSeleccionadoId);
            resultado = await eel.modificar_paciente_py(pacienteSeleccionadoId, pacienteData)();
        } else {
            console.log("MODO AÑADIR: Enviando nuevo paciente a Python:", pacienteData);
            resultado = await eel.agregar_paciente_py(pacienteData)();
        }

        if (resultado.exito) {
            alert(resultado.mensaje);
            patientModal.style.display = "none";
            cargarListaPacientes();
            // Si estábamos editando, refrescamos la vista de detalles
            if (modoFormularioPaciente === 'editar') {
                mostrarDetallesPaciente(pacienteSeleccionadoId);
            }
        } else {
            alert(resultado.mensaje);
        }
    });

    // --- Lógica para el envío del Formulario de CONSULTA ---
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

// en web/script.js

async function mostrarDetallesPaciente(pacienteId) {
    // Asigna el ID del paciente seleccionado a la variable global.
    pacienteSeleccionadoId = pacienteId;
    
    // Llama a Python para obtener los datos completos del paciente.
    const data = await eel.buscar_paciente_por_id_py(pacienteId)();
    const detailsContainer = document.getElementById('patient-details');
    
    // Si por alguna razón el paciente no se encuentra, muestra un mensaje y termina.
    if (!data.paciente) {
        detailsContainer.innerHTML = '<p>Selecciona un paciente de la lista para ver sus detalles.</p>';
        return;
    }

    // Construye el bloque de HTML para los detalles del paciente.
    let html = `
        <div class="details-header">
            <h3>${data.paciente.nombres} ${data.paciente.apellidos}</h3>
            <div>
                <button id="edit-patient-btn" class="btn-secondary">Editar</button>
                <button id="delete-patient-btn" class="btn btn-danger">Eliminar</button>
            </div>
        </div>
        <p><strong>Cédula:</strong> ${data.paciente.cedula}</p>
        <p><strong>Teléfono:</strong> ${data.paciente.telefono}</p>
        <p><strong>Domicilio:</strong> ${data.paciente.domicilio || '<em>No especificado.</em>'}</p>
        <p><strong>Comentario:</strong> ${data.paciente.comentario || '<em>Sin comentario.</em>'}</p>
        <hr>
        <div class="consultation-header">
            <h4>Historial de Consultas</h4>
            <button id="add-consultation-btn" class="btn">Añadir Consulta</button>
        </div>
    `;

    // Construye la lista de consultas si existen.
    if (data.consultas.length > 0) {
        html += '<ul class="consultation-list">';
        data.consultas.forEach(consulta => {
            // Aquí puedes añadir más detalles de la consulta si quieres
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
    
    // Inserta todo el HTML generado en el contenedor de detalles.
    detailsContainer.innerHTML = html;

    // --- Activación de los Botones ---

    // 1. Botón "Editar Paciente"
    document.getElementById('edit-patient-btn').addEventListener('click', () => {
        const patientModal = document.getElementById('add-patient-modal');
        
        modoFormularioPaciente = 'editar';
        patientModal.querySelector('h2').textContent = 'Editar Datos del Paciente';
        patientModal.querySelector('button[type="submit"]').textContent = 'Actualizar Datos';

        // Rellenamos el formulario con los datos del paciente.
        document.getElementById('cedula').value = data.paciente.cedula;
        document.getElementById('nombres').value = data.paciente.nombres;
        document.getElementById('apellidos').value = data.paciente.apellidos;
        document.getElementById('fecha_nacimiento').value = data.paciente.fecha_nacimiento;
        document.getElementById('telefono').value = data.paciente.telefono;
        document.getElementById('domicilio').value = data.paciente.domicilio;
        document.getElementById('comentario').value = data.paciente.comentario;

        patientModal.style.display = 'block';
    });

    // 2. Botón "Añadir Consulta"
    document.getElementById('add-consultation-btn').addEventListener('click', abrirModalConsulta);

    // 3. ¡NUEVO! Botón "Eliminar Paciente"
    document.getElementById('delete-patient-btn').addEventListener('click', async () => {
        // Mostramos una ventana de confirmación nativa del navegador
        const confirmacion = confirm(
            `¿Estás segura de que deseas eliminar a ${data.paciente.nombres} ${data.paciente.apellidos}?\n\nEsta acción es irreversible y borrará todo su historial.`
        );

        if (confirmacion) {
            console.log(`Enviando solicitud para eliminar paciente ID: ${pacienteId}`);
            const resultado = await eel.eliminar_paciente_py(pacienteId)();
            alert(resultado.mensaje);

            if (resultado.exito) {
                // Si se borró, limpiamos la vista de detalles y refrescamos la lista
                detailsContainer.innerHTML = '<p>Selecciona un paciente de la lista para ver sus detalles.</p>';
                cargarListaPacientes();
            }
        } else {
            console.log("El usuario canceló la eliminación.");
        }
    });

}