window.onload = function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const resultado = await eel.login_py(username, password)();
        
        if (!resultado.exito) {
            errorMessage.textContent = resultado.mensaje;
        }
    });
};

// Python llamará a esta función JS cuando el login sea exitoso
eel.expose(redirigir_a_main, 'redirigir_a_main');
function redirigir_a_main() {
    // Redirige a la página principal de la aplicación
    window.location.href = 'main.html';
}