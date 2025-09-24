// web/login.js

window.onload = function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const loginButton = document.getElementById('login-button');
    const buttonText = loginButton.querySelector('.button-text');
    const buttonSpinner = loginButton.querySelector('.button-spinner');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // --- UX Mejorada: Mostrar estado de carga ---
        errorMessage.textContent = ''; // Limpia errores anteriores
        loginButton.disabled = true;
        buttonText.style.display = 'none';
        buttonSpinner.style.display = 'inline-block';
        // -----------------------------------------

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const resultado = await eel.login_py(username, password)();
        
        if (!resultado.exito) {
            errorMessage.textContent = resultado.mensaje;
            // --- Restaurar botón en caso de error ---
            loginButton.disabled = false;
            buttonText.style.display = 'inline-block';
            buttonSpinner.style.display = 'none';
            // ------------------------------------
        }
        // Si el login es exitoso, Python se encargará de redirigir
    });
};

// Python llamará a esta función cuando el login sea exitoso
eel.expose(redirigir_a_main, 'redirigir_a_main');
function redirigir_a_main() {
    window.location.href = 'main.html';
}