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
    };

    // Acción: Cerrar el modal de paciente con el botón 'x'
    patientModalCloseBtn.onclick = function() {
        patientModal.style.display = "none";
    };
    
    // Acción: Enviar el formulario de paciente (para Añadir o Editar)
    patientForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        // VALIDACIÓN FRONTEND
        const cedula = document.getElementById('cedula').value.trim();
        const nombres = document.getElementById('nombres').value.trim();
        const apellidos = document.getElementById('apellidos').value.trim();

        if (!cedula || !nombres || !apellidos) {
            alert("Por favor, completa todos los campos obligatorios (Cédula, Nombres, Apellidos).");
            return;
        }
        
        // VALIDACIÓN DE FECHA DE NACIMIENTO
        const fechaNacimientoStr = document.getElementById('fecha_nacimiento').value;
        if (fechaNacimientoStr) {
            const fechaNacimiento = new Date(fechaNacimientoStr);
            const hoy = new Date();
            const anioMinimo = hoy.getFullYear() - 120;

            fechaNacimiento.setUTCHours(0, 0, 0, 0);
            hoy.setUTCHours(0, 0, 0, 0);

            if (fechaNacimiento > hoy) {
                alert("Error: La fecha de nacimiento no puede ser en el futuro.");
                return;
            }
            if (fechaNacimiento.getFullYear() < anioMinimo) {
                alert("Error: La edad del paciente parece irreal. Por favor, verifica la fecha de nacimiento.");
                return;
            }
        }

        const pacienteData = {
            cedula: cedula,
            nombres: nombres,
            apellidos: apellidos,
            fecha_nacimiento: fechaNacimientoStr,
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

    consultationModalCloseBtn.onclick = function() {
        consultationModal.style.display = "none";
    };

    consultationForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // VALIDACIÓN DE CONSULTA
        const furStr = document.getElementById('fur').value; // Usamos un nombre consistente
        const motivo = document.getElementById('motivo_consulta').value.trim();

        if (!furStr || !motivo) {
            alert("Error: Los campos FUR y Motivo de Consulta son obligatorios.");
            return;
        }

        const fechaFur = new Date(furStr);
        const hoy = new Date();
        const anioMinimo = hoy.getFullYear() - 3;

        fechaFur.setUTCHours(0, 0, 0, 0);
        hoy.setUTCHours(0, 0, 0, 0);

        if (fechaFur > hoy) {
            alert("Error: La fecha FUR no puede ser en el futuro.");
            return;
        }
        if (fechaFur.getFullYear() < anioMinimo) {
            alert("Error: La fecha FUR es demasiado antigua. Por favor, verifícala.");
            return;
        }

        // --- RECOLECCIÓN DE DATOS CORREGIDA ---
        const consultaData = {
            paciente_id: pacienteSeleccionadoId,
            fur: furStr, // Usamos la variable validada
            gestas_parto: parseInt(document.getElementById('gestas_parto').value) || 0,
            gestas_cesarea: parseInt(document.getElementById('gestas_cesarea').value) || 0,
            gestas_aborto: parseInt(document.getElementById('gestas_aborto').value) || 0,
            anticonceptivos: document.getElementById('anticonceptivos').value,
            antecedentes_personales: document.getElementById('antecedentes_personales').value,
            antecedentes_familiares: document.getElementById('antecedentes_familiares').value,
            motivo_consulta: motivo,
            examen_fisico: document.getElementById('examen_fisico').value,
            ecografia: document.getElementById('ecografia').value,
            diagnostico: document.getElementById('diagnostico').value,
            plan: document.getElementById('plan').value,
            medio_pago: document.getElementById('medio_pago').value
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

   // Lógica para cerrar el modal de detalles
    const viewModal = document.getElementById('view-consultation-modal');
    const viewModalCloseBtn = viewModal.querySelector('.close-btn');

    viewModalCloseBtn.onclick = function() {
        viewModal.style.display = "none";
    }

    // Actualizamos el window.onclick para que también cierre este modal
    window.onclick = function(event) {
        // ... (tu if para patientModal) ...
        // ... (tu if para consultationModal) ...
        if (event.target == viewModal) {
            viewModal.style.display = "none";
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
    // Usamos clases de Bootstrap para una tabla estilizada y responsiva
    html += `
        <table class="table table-striped table-hover mt-3">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Motivo de la Consulta</th>
                    <th>Diagnóstico</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    data.consultas.forEach(consulta => {
        html += `
            <tr>
                <td>${consulta.fecha}</td>
                <td>${consulta.motivo_consulta || ''}</td>
                <td>${consulta.diagnostico || ''}</td>
                <td>
                    <button class="btn btn-sm btn-info view-consultation-btn" data-consulta-id="${consulta.id}">Ver Detalles</button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;
    } else {
        html += '<p>No hay consultas registradas para este paciente.</p>';
    }
    
    // Inserta todo el HTML generado en el contenedor de detalles.
    detailsContainer.innerHTML = html;

    // --- Damos vida a los nuevos botones de "Ver Detalles" ---
    document.querySelectorAll('.view-consultation-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const consultaId = event.target.dataset.consultaId;
            // Llamamos a una nueva función para mostrar el modal con los detalles
            mostrarModalDetalleConsulta(consultaId);
        });
    });

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


// En web/script.js

window.onload = function() {
    setupEventListeners();
    cargarListaPacientes();
    configurarLimitesDeFechas(); // <-- Llama a la nueva función
};

// --- ¡NUEVA FUNCIÓN! ---
function configurarLimitesDeFechas() {
    const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    // Establece la fecha máxima para la fecha de nacimiento y FUR como hoy
    document.getElementById('fecha_nacimiento').max = hoy;
    document.getElementById('fur').max = hoy; // Asumiendo que el ID es 'fur'
}

async function mostrarModalDetalleConsulta(consultaId) {
    const modal = document.getElementById('view-consultation-modal');
    const contentDiv = document.getElementById('consultation-details-content');
    
    // Mostramos un loader mientras buscamos los datos
    contentDiv.innerHTML = '<p>Cargando detalles...</p>';
    modal.style.display = 'block';

    // Llamamos a la función de Python que ya teníamos para buscar una consulta por ID
    const consulta = await eel.buscar_consulta_py(consultaId)();

    if (consulta) {
        // Calculamos el total de gestas
        const totalGestas = (consulta.gestas_parto || 0) + (consulta.gestas_cesarea || 0) + (consulta.gestas_aborto || 0);

        // Construimos el HTML con todos los detalles en una rejilla
        contentDiv.innerHTML = `
            <div class="consultation-details-grid">
                <p><strong>Fecha:</strong> ${consulta.fecha}</p>
                <p><strong>FUR:</strong> ${consulta.FUR}</p>
                <p><strong>Motivo:</strong> ${consulta.motivo_consulta || ''}</p>
                <p><strong>Diagnóstico:</strong> ${consulta.diagnostico || ''}</p>
                <p><strong>Examen Físico:</strong> ${consulta.examen_fisico || ''}</p>
                <p><strong>Plan:</strong> ${consulta.plan || ''}</p>
                <p><strong>Ecografía:</strong> ${consulta.ecografia || ''}</p>
                <p><strong>Medio de Pago:</strong> ${consulta.medio_pago || ''}</p>
                <p><strong>Gestas (Total: ${totalGestas}):</strong> P:${consulta.gestas_parto}, C:${consulta.gestas_cesarea}, A:${consulta.gestas_aborto}</p>
                <p><strong>Anticonceptivos:</strong> ${consulta.anticonceptivos || ''}</p>
            </div>
            <hr>
            <p><strong>Antecedentes Personales:</strong> ${consulta.antecedentes_personales || ''}</p>
            <p><strong>Antecedentes Familiares:</strong> ${consulta.antecedentes_familiares || ''}</p>
        `;
    } else {
        contentDiv.innerHTML = '<p>Error: No se pudieron cargar los detalles de la consulta.</p>';
    }
}