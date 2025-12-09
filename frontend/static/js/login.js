// Elementos del DOM
const form = document.getElementById("loginForm");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const errorMessage = document.getElementById("errorMessage");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberMeCheckbox = document.getElementById("rememberMe");

// Función para mostrar mensajes de error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add("show");
    
    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => {
        errorMessage.classList.remove("show");
    }, 5000);
}

// Función para manejar el estado de carga
function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    
    if (isLoading) {
        btnText.innerHTML = '<span class="loading"></span>';
    } else {
        btnText.textContent = "Iniciar Sesión";
    }
}

// Cargar email guardado si existe
window.addEventListener('DOMContentLoaded', () => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }
});

// Validación básica de email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Manejador del envío del formulario
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Limpiar mensaje de error previo
    errorMessage.classList.remove("show");
    
    // Validación del lado del cliente
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!isValidEmail(email)) {
        showError("Por favor, ingresa un correo electrónico válido.");
        return;
    }
    
    if (password.length < 6) {
        showError("La contraseña debe tener al menos 6 caracteres.");
        return;
    }
    
    // Iniciar estado de carga
    setLoading(true);
    
    try {
        // Realizar petición al servidor
        const res = await fetch("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            // Guardar token en sessionStorage
            sessionStorage.setItem("token", data.access_token);
            
            // Guardar email si el usuario marcó "Recordarme"
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            
            // Redirigir al dashboard
            window.location.href = "/dashboard";
        } else {
            // Mostrar mensaje de error del servidor
            const errorMsg = data.message || data.detail || "Credenciales incorrectas. Por favor, verifica tu email y contraseña.";
            showError(errorMsg);
        }
        
    } catch (error) {
        console.error("Error en el login:", error);
        showError("Error de conexión con el servidor. Por favor, intenta nuevamente.");
    } finally {
        // Restaurar estado del botón
        setLoading(false);
    }
});

// Limpiar error al escribir
emailInput.addEventListener('input', () => {
    if (errorMessage.classList.contains('show')) {
        errorMessage.classList.remove('show');
    }
});

passwordInput.addEventListener('input', () => {
    if (errorMessage.classList.contains('show')) {
        errorMessage.classList.remove('show');
    }
});

// Manejar Enter en los inputs
emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        passwordInput.focus();
    }
});

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        form.dispatchEvent(new Event('submit'));
    }
});