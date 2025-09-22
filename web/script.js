// web/script.js

// Se declara UNA SOLA VEZ aquí, en el ámbito global.
let pacienteSeleccionadoId = null;
let modoFormularioPaciente = 'añadir';
let modoFormularioConsulta = 'añadir';
let consultaSeleccionadaId = null;


window.onload = function() {
    setupEventListeners();
    cargarListaPacientes();
};

// en web/script.js

function setupEventListeners() {
    
    // --- 1. BARRA DE BÚSQUEDA ---
    const searchBar = document.getElementById('search-bar');
    searchBar.addEventListener('keyup', () => {
        filtrarListaPacientes(searchBar.value);
    });

    // --- 2. MODAL Y FORMULARIO DE PACIENTES ---
    const patientModal = document.getElementById('add-patient-modal');
    const addPatientBtn = document.getElementById('add-patient-btn');
    const patientModalCloseBtn = patientModal.querySelector('.close-btn');
    const patientForm = document.getElementById('patient-form');
    
    // Acción: Abrir el modal para AÑADIR un nuevo paciente
    addPatientBtn.onclick = function() {
        modoFormularioPaciente = 'añadir';
        patientForm.reset(); 
        patientModal.querySelector('h2').textContent = 'Registrar Nuevo Paciente';
        patientModal.querySelector('button[type="submit"]').textContent = 'Guardar Paciente';
        patientModal.style.display = "block";
    }

    // Acción: Cerrar el modal de paciente con el botón 'x'
    patientModalCloseBtn.onclick = function() {
        patientModal.style.display = "none";
    }
    
    // Acción: Enviar el formulario de paciente (para Añadir o Editar)
    patientForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        // --- VALIDACIÓN FRONTEND AÑADIDA ---
        const cedula = document.getElementById('cedula').value.trim();
        const nombres = document.getElementById('nombres').value.trim();
        const apellidos = document.getElementById('apellidos').value.trim();

        if (cedula === '' || nombres === '' || apellidos === '') {
            alert("Por favor, completa todos los campos obligatorios (Cédula, Nombres, Apellidos).");
            return; // Detiene el envío si la validación falla
        }
        // --- FIN DE LA VALIDACIÓN ---

        const pacienteData = {
            cedula: cedula,
            nombres: nombres,
            apellidos: apellidos,
            fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
            telefono: document.getElementById('telefono').value,
            domicilio: document.getElementById('domicilio').value,
            comentario: document.getElementById('comentario').value
        };

        let resultado;
        if (modoFormularioPaciente === 'editar') {
            resultado = await eel.modificar_paciente_py(pacienteSeleccionadoId, pacienteData)();
        } else {
            resultado = await eel.agregar_paciente_py(pacienteData)();
        }

        if (resultado.exito) {
            alert(resultado.mensaje);
            patientModal.style.display = "none";
            cargarListaPacientes();
            if (modoFormularioPaciente === 'editar') {
                mostrarDetallesPaciente(pacienteSeleccionadoId);
            }
        } else {
            alert(resultado.mensaje);
        }
    });

    // --- 3. MODAL Y FORMULARIO DE CONSULTAS ---
    const consultationModal = document.getElementById('add-consultation-modal');
    const consultationForm = document.getElementById('consultation-form');
    const consultationModalCloseBtn = consultationModal.querySelector('.close-btn');

    // Acción: Cerrar el modal de consulta con el botón 'x'
    consultationModalCloseBtn.onclick = function() {
        consultationModal.style.display = "none";
    }

    // Acción: Enviar el formulario de consulta (para Añadir o Editar)
    consultationForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Aquí también deberíamos añadir validación para los campos de consulta
        const consultaData = {
            paciente_id: pacienteSeleccionadoId,
            fecha: document.getElementById('fecha_consulta').value, // Asumiendo que añades un campo de fecha
            // ... Recolecta todos los demás campos de la consulta ...
        };

        let resultado;
        if (modoFormularioConsulta === 'editar') {
            resultado = await eel.modificar_consulta_py(consultaSeleccionadaId, consultaData)();
        } else {
            resultado = await eel.agregar_consulta_py(consultaData)();
        }

        if (resultado.exito) {
            alert(resultado.mensaje);
            consultationModal.style.display = "none";
            consultationForm.reset();
            mostrarDetallesPaciente(pacienteSeleccionadoId);
        } else {
            alert(resultado.mensaje);
        }
    });

    // --- 4. LÓGICA GENERAL DE CIERRE DE MODALES ---
    window.onclick = function(event) {
        if (event.target == patientModal) {
            patientModal.style.display = "none";
        }
        if (event.target == consultationModal) {
            consultationModal.style.display = "none";
        }
    }
}

function abrirModalConsulta(modo = 'añadir', consultaData = null) {
    const modal = document.getElementById('add-consultation-modal');
    const form = document.getElementById('consultation-form');
    
    modoFormularioConsulta = modo;
    
    if (modo === 'editar') {
        consultaSeleccionadaId = consultaData.id;
        modal.querySelector('h2').textContent = 'Editar Consulta';
        // Rellenamos el formulario con los datos de la consulta
        Object.keys(consultaData).forEach(key => {
            const input = form.querySelector(`#${key}`);
            if (input) {
                input.value = consultaData[key];
            }
        });
    } else {
        consultaSeleccionadaId = null;
        modal.querySelector('h2').textContent = 'Añadir Nueva Consulta';
        form.reset();
    }
    
    modal.style.display = 'block';
}

async function cargarListaPacientes() {
    console.log("Pidiendo la lista inicial de pacientes a Python...");
    let pacientes = await eel.obtener_pacientes_py()();
    renderizarListaPacientes(pacientes);
    console.log("Lista inicial de pacientes cargada.");
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

    if (data.consultas.length > 0) {
        html += '<ul class="consultation-list">';
        data.consultas.forEach(consulta => {
            // Añadimos los botones de Editar y Eliminar a cada consulta
            html += `
                <li>
                    <div>
                        <strong>Fecha: ${consulta.fecha}</strong><br>
                        <strong>Motivo:</strong> ${consulta.motivo_consulta || 'N/A'}<br>
                        <strong>Diagnóstico:</strong> ${consulta.diagnostico || 'N/A'}
                    </div>
                    <div>
                        <button class="edit-consultation-btn" data-consulta-id="${consulta.id}">✏️</button>
                        <button class="delete-consultation-btn" data-consulta-id="${consulta.id}">&times;</button>
                    </div>
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

    document.querySelectorAll('.edit-consultation-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            const consultaId = event.target.dataset.consultaId;
            const consultaData = await eel.buscar_consulta_py(consultaId)();
            if (consultaData) {
                abrirModalConsulta('editar', consultaData);
            }
        });
    });


    document.querySelectorAll('.delete-consultation-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            const consultaId = event.target.dataset.consultaId;
            
            const confirmacion = confirm("¿Estás segura de que deseas eliminar esta entrada del historial?");
            
            if (confirmacion) {
                console.log(`Enviando solicitud para eliminar consulta ID: ${consultaId}`);
                const resultado = await eel.eliminar_consulta_py(consultaId)();
                alert(resultado.mensaje);

                if (resultado.exito) {
                    // Si se borró, simplemente refrescamos la vista de detalles
                    mostrarDetallesPaciente(pacienteId);
                }
            }
        });
    });
}

async function filtrarListaPacientes(termino) {
    console.log(`Filtrando pacientes con el término: ${termino}`);
    // Llama a la nueva función de Python para buscar
    const pacientesFiltrados = await eel.buscar_pacientes_py(termino)();
    // Usa la nueva función para "dibujar" los resultados
    renderizarListaPacientes(pacientesFiltrados);
}

// --- ¡NUEVA FUNCIÓN REFACTORIZADA! ---
// Esta función ahora tiene la única responsabilidad de "dibujar" la lista
function renderizarListaPacientes(listaDePacientes) {
    const patientListElement = document.getElementById('patient-list');
    patientListElement.innerHTML = ''; // Limpiamos la lista

    if (listaDePacientes.length === 0) {
        patientListElement.innerHTML = '<li>No se encontraron pacientes.</li>';
        return;
    }

    listaDePacientes.forEach(paciente => {
        const listItem = document.createElement('li');
        listItem.textContent = `${paciente.apellidos}, ${paciente.nombres}`;
        listItem.dataset.pacienteId = paciente.id;
        
        listItem.addEventListener('click', () => {
            // Quitamos la clase 'active' de cualquier otro elemento
            document.querySelectorAll('#patient-list li').forEach(li => li.classList.remove('active'));
            listItem.classList.add('active'); // Se la ponemos al actual
            
            mostrarDetallesPaciente(paciente.id);
        });
        
        patientListElement.appendChild(listItem);
    });
}
