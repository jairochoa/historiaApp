// web/script.js - VERSIÓN ÚNICA Y CORREGIDA

// --- VARIABLES GLOBALES DE ESTADO ---
let pacienteSeleccionadoId = null;
let modoFormularioPaciente = 'añadir';
let modoFormularioConsulta = 'añadir';
let consultaSeleccionadaId = null;

// --- FUNCIÓN DE ARRANQUE ---
window.onload = function() {
    setupEventListeners();
    cargarListaPacientes();
    configurarLimitesDeFechas();
};

// --- CONFIGURACIÓN DE EVENTOS ---
function setupEventListeners() {
    // 1. BARRA DE BÚSQUEDA
    const searchBar = document.getElementById('search-bar');
    searchBar.addEventListener('keyup', () => filtrarListaPacientes(searchBar.value));

    // 2. MODAL Y FORMULARIO DE PACIENTES
    const patientModal = document.getElementById('add-patient-modal');
    const addPatientBtn = document.getElementById('add-patient-btn');
    const patientForm = document.getElementById('patient-form');
    patientModal.querySelector('.close-btn').onclick = () => { patientModal.style.display = "none"; };
    addPatientBtn.onclick = () => abrirModalPaciente('añadir');

    patientForm.addEventListener('submit', handlePatientFormSubmit);

    // 3. MODAL Y FORMULARIO DE CONSULTAS
    const consultationModal = document.getElementById('add-consultation-modal');
    const consultationForm = document.getElementById('consultation-form');
    consultationModal.querySelector('.close-btn').onclick = () => { consultationModal.style.display = "none"; };
    
    consultationForm.addEventListener('submit', handleConsultationFormSubmit);

    // 4. MODAL DE VER DETALLES DE CONSULTA
    const viewModal = document.getElementById('view-consultation-modal');
    viewModal.querySelector('.close-btn').onclick = () => { viewModal.style.display = "none"; };

    // 5. CIERRE GENERAL DE MODALES
    window.onclick = function(event) {
        if (event.target == patientModal) patientModal.style.display = "none";
        if (event.target == consultationModal) consultationModal.style.display = "none";
        if (event.target == viewModal) viewModal.style.display = "none";
    };
}

// --- MANEJADORES DE FORMULARIOS ---

async function handlePatientFormSubmit(event) {
    event.preventDefault();
    // (Aquí va toda la lógica de validación y envío del formulario de paciente que ya tenías)
    const cedula = document.getElementById('cedula').value.trim();
    const nombres = document.getElementById('nombres').value.trim();
    const apellidos = document.getElementById('apellidos').value.trim();

    if (!cedula || !nombres || !apellidos) {
        return alert("Por favor, completa los campos obligatorios (Cédula, Nombres, Apellidos).");
    }
    
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
        document.getElementById('add-patient-modal').style.display = "none";
        cargarListaPacientes();
        if (modoFormularioPaciente === 'editar') {
            mostrarDetallesPaciente(pacienteSeleccionadoId);
        }
    } else {
        alert(resultado.mensaje);
    }
}

async function handleConsultationFormSubmit(event) {
    event.preventDefault();
    // (Aquí va toda la lógica de validación y envío del formulario de consulta que ya tenías)
    const furStr = document.getElementById('fur').value;
    const motivo = document.getElementById('motivo_consulta').value.trim();
    if (!furStr || !motivo) {
        return alert("Error: Los campos FUR y Motivo de Consulta son obligatorios.");
    }

    const consultaData = {
        paciente_id: pacienteSeleccionadoId,
        fecha: document.getElementById('fecha_consulta').value || new Date().toISOString().slice(0, 10),
        fur: furStr,
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
        document.getElementById('add-consultation-modal').style.display = "none";
        document.getElementById('consultation-form').reset();
        mostrarDetallesPaciente(pacienteSeleccionadoId);
    } else {
        alert(resultado.mensaje);
    }
}

// --- FUNCIONES DE CARGA Y RENDERIZADO ---

async function cargarListaPacientes() {
    let pacientes = await eel.obtener_pacientes_py()();
    renderizarListaPacientes(pacientes);
}

function renderizarListaPacientes(listaDePacientes) {
    const patientListElement = document.getElementById('patient-list');
    patientListElement.innerHTML = '';
    if (listaDePacientes.length === 0) {
        patientListElement.innerHTML = '<li>No se encontraron pacientes.</li>';
        return;
    }
    listaDePacientes.forEach(paciente => {
        const listItem = document.createElement('li');
        listItem.textContent = `${paciente.apellidos}, ${paciente.nombres}`;
        listItem.className = 'list-group-item list-group-item-action';
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
    pacienteSeleccionadoId = pacienteId;
    const data = await eel.buscar_paciente_por_id_py(pacienteId)();
    const detailsContainer = document.getElementById('patient-details');
    
    if (!data.paciente) {
        detailsContainer.innerHTML = '<div class="card"><div class="card-body text-center"><p class="text-muted">Selecciona un paciente de la lista.</p></div></div>';
        return;
    }

    // --- CAMBIO CLAVE AQUÍ: CONSTRUIMOS EL ENCABEZADO DINÁMICO ---
    
    // 1. Calculamos la edad usando nuestra nueva función.
    const edad = calcularEdad(data.paciente.fecha_nacimiento);
    
    // 2. Preparamos las partes del encabezado.
    const nombreCompleto = `${data.paciente.nombres} ${data.paciente.apellidos}`;
    const edadTexto = `${edad} años`;
    // El comentario solo se añade si existe, y AHORA lo envolvemos en un <span>.
    const comentario = data.paciente.comentario 
    ? `/ <span class="header-comment">${data.paciente.comentario}</span>` 
    : '';

    // 3. Unimos todo.
    const encabezadoDinamico = `${nombreCompleto} / ${edadTexto} ${comentario}`;
    
    // --- FIN DEL CAMBIO ---

    let html = `
        <div class="card">
            <div class="card-header">
                <h3 class="mb-0">${encabezadoDinamico}</h3>
            <div>
            <div class="card-body">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Cédula</th>
                            <th>Fecha de Nacimiento</th>
                            <th>Domicilio</th>
                            <th>Teléfono</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${data.paciente.cedula}</td>
                            <td>${data.paciente.fecha_nacimiento}</td>
                            <td>${data.paciente.domicilio}</td>
                            <td>${data.paciente.telefono || ''}</td>
                            <td class="text-end">
                                <button id="edit-patient-btn" class="btn btn-secondary btn-sm">Editar</button>
                                <button id="delete-patient-btn" class="btn btn-danger btn-sm">Eliminar</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
 
                <hr>
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h4 class="mb-0">Historial de Consultas</h4>
                    <button id="add-consultation-btn" class="btn btn-primary">Añadir Consulta</button>
                </div>
    `;

    // --- Construcción de la tabla de consultas (sin cambios) ---
    if (data.consultas.length > 0) {
        html += `
            <table class="table table-striped table-hover mt-3">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Motivo</th>
                        <th>Diagnóstico</th>
                        <th class="text-end">Acciones</th>
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
                    <td class="text-end">
                        <button class="btn btn-sm btn-info view-consultation-btn" data-consulta-id="${consulta.id}">Ver</button>
                        <button class="btn btn-sm btn-secondary edit-consultation-btn" data-consulta-id="${consulta.id}">Editar</button>
                        <button class="btn btn-sm btn-danger delete-consultation-btn" data-consulta-id="${consulta.id}">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        html += `</tbody></table>`;
    } else {
        html += '<p>No hay consultas registradas para este paciente.</p>';
    }
    
    html += `</div></div>`; // Cierre de card-body y card
    detailsContainer.innerHTML = html;

    // --- ACTIVACIÓN DE TODOS LOS BOTONES ---
    document.getElementById('edit-patient-btn').addEventListener('click', () => abrirModalPaciente('editar', data.paciente));
    document.getElementById('delete-patient-btn').addEventListener('click', () => eliminarPaciente(data.paciente));
    document.getElementById('add-consultation-btn').addEventListener('click', () => abrirModalConsulta('añadir'));
    document.querySelectorAll('.view-consultation-btn').forEach(b => b.addEventListener('click', (e) => mostrarModalDetalleConsulta(e.target.dataset.consultaId)));
    document.querySelectorAll('.edit-consultation-btn').forEach(b => b.addEventListener('click', (e) => abrirModalConsulta('editar', e.target.dataset.consultaId)));
    document.querySelectorAll('.delete-consultation-btn').forEach(b => b.addEventListener('click', (e) => eliminarConsulta(e.target.dataset.consultaId)));
}

// --- FUNCIONES AUXILIARES (las que faltaban o estaban repetidas) ---

async function filtrarListaPacientes(termino) {
    const pacientesFiltrados = await eel.buscar_pacientes_py(termino)();
    renderizarListaPacientes(pacientesFiltrados);
}

function configurarLimitesDeFechas() {
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha_nacimiento').max = hoy;
    document.getElementById('fur').max = hoy;
    if (document.getElementById('fecha_consulta')) {
        document.getElementById('fecha_consulta').max = hoy;
    }
}

function abrirModalPaciente(modo = 'añadir', pacienteData = null) {
    const modal = document.getElementById('add-patient-modal');
    const form = document.getElementById('patient-form');
    modoFormularioPaciente = modo;
    
    if (modo === 'editar') {
        modal.querySelector('h2').textContent = 'Editar Datos del Paciente';
        modal.querySelector('button[type="submit"]').textContent = 'Actualizar Datos';
        Object.keys(pacienteData).forEach(key => {
            const input = form.querySelector(`#${key}`);
            if (input) input.value = pacienteData[key];
        });
    } else {
        modal.querySelector('h2').textContent = 'Añadir Nuevo Paciente';
        modal.querySelector('button[type="submit"]').textContent = 'Guardar Paciente';
        form.reset();
    }
    modal.style.display = 'block';
}

async function eliminarPaciente(pacienteData) {
    const confirmacion = confirm(`¿Estás segura de que deseas eliminar a ${pacienteData.nombres} ${pacienteData.apellidos}?\n\nEsta acción es irreversible.`);
    if (confirmacion) {
        const resultado = await eel.eliminar_paciente_py(pacienteData.id)();
        alert(resultado.mensaje);
        if (resultado.exito) {
            document.getElementById('patient-details').innerHTML = '<div class="card"><div class="card-body text-center"><p class="text-muted">Selecciona un paciente de la lista.</p></div></div>';
            cargarListaPacientes();
        }
    }
}

async function abrirModalConsulta(modo = 'añadir', consultaId = null) {
    const modal = document.getElementById('add-consultation-modal');
    const form = document.getElementById('consultation-form');
    modoFormularioConsulta = modo;
    
    if (modo === 'editar') {
        const consultaData = await eel.buscar_consulta_py(consultaId)();
        if (!consultaData) return alert("Error: No se encontraron los datos de la consulta.");
        document.getElementById('fecha_consulta').value = consultaData.fecha;
        
        consultaSeleccionadaId = consultaId;
        modal.querySelector('h2').textContent = 'Editar Consulta';
        modal.querySelector('button[type="submit"]').textContent = 'Actualizar Consulta';
        Object.keys(consultaData).forEach(key => {
            const input = form.querySelector(`#${key}`);
            if (input) input.value = consultaData[key];
        });
    } else {
        consultaSeleccionadaId = null;
        modal.querySelector('h2').textContent = 'Añadir Nueva Consulta';
        modal.querySelector('button[type="submit"]').textContent = 'Guardar Consulta';
        document.getElementById('fecha_consulta').value = new Date().toISOString().slice(0, 10);
        form.reset();
    }
    modal.style.display = 'block';
}

async function eliminarConsulta(consultaId) {
    const confirmacion = confirm("¿Estás segura de que deseas eliminar esta entrada del historial?");
    if (confirmacion) {
        const resultado = await eel.eliminar_consulta_py(consultaId)();
        alert(resultado.mensaje);
        if (resultado.exito) {
            mostrarDetallesPaciente(pacienteSeleccionadoId);
        }
    }
}

async function mostrarModalDetalleConsulta(consultaId) {
    const modal = document.getElementById('view-consultation-modal');
    const contentDiv = document.getElementById('consultation-details-content');
    contentDiv.innerHTML = '<p>Cargando detalles...</p>';
    modal.style.display = 'block';

    const consulta = await eel.buscar_consulta_py(consultaId)();
    if (consulta) {
        const totalGestas = (consulta.gestas_parto || 0) + (consulta.gestas_cesarea || 0) + (consulta.gestas_aborto || 0);
        contentDiv.innerHTML = `
            <div class="consultation-details-grid">
                <p><strong>Fecha:</strong> ${consulta.fecha}</p>
                <p><strong>FUR:</strong> ${consulta.fur}</p>
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

/**
 * Calcula la edad a partir de una fecha de nacimiento en formato YYYY-MM-DD.
 * @param {string} fechaNacimientoStr - La fecha de nacimiento.
 * @returns {number|string} La edad en años o 'N/A' si la fecha es inválida.
 */
function calcularEdad(fechaNacimientoStr) {
    if (!fechaNacimientoStr) {
        return 'N/A';
    }
    const fechaNacimiento = new Date(fechaNacimientoStr);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();

    // Ajusta la edad si aún no ha cumplido años este año
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }
    return edad;
}