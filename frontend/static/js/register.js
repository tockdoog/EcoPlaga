// Elementos del DOM
const form = document.getElementById("registerForm");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const termsCheckbox = document.getElementById("terms");
const togglePasswordBtn = document.getElementById("togglePassword");

const strengthBar = document.getElementById("strengthBar");
const passwordHint = document.getElementById("passwordHint");

// Función para mostrar mensajes de error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add("show");
    successMessage.classList.remove("show");
    
    setTimeout(() => {
        errorMessage.classList.remove("show");
    }, 5000);
}

// Función para mostrar mensajes de éxito
function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.add("show");
    errorMessage.classList.remove("show");
}

// Función para manejar el estado de carga
function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    
    if (isLoading) {
        btnText.innerHTML = '<span class="loading"></span>';
    } else {
        btnText.textContent = "Crear Cuenta";
    }
}

// Validación de email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validación de nombre (mínimo 3 caracteres, solo letras y espacios)
function isValidName(name) {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,}$/;
    return nameRegex.test(name.trim());
}

// Calcular fortaleza de contraseña
function calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    return strength;
}

// Actualizar barra de fortaleza
function updatePasswordStrength() {
    const password = passwordInput.value;
    const strength = calculatePasswordStrength(password);
    
    strengthBar.className = 'strength-bar';
    
    if (password.length === 0) {
        passwordHint.textContent = 'La contraseña debe tener al menos 8 caracteres';
        passwordHint.style.color = '#666';
    } else if (strength <= 2) {
        strengthBar.classList.add('weak');
        passwordHint.textContent = 'Contraseña débil. Agrega mayúsculas, números y símbolos';
        passwordHint.style.color = '#e74c3c';
    } else if (strength <= 4) {
        strengthBar.classList.add('medium');
        passwordHint.textContent = 'Contraseña aceptable. Puedes hacerla más segura';
        passwordHint.style.color = '#f39c12';
    } else {
        strengthBar.classList.add('strong');
        passwordHint.textContent = '¡Contraseña segura!';
        passwordHint.style.color = '#27ae60';
    }
}

// Mostrar/ocultar contraseña
togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    confirmPasswordInput.type = type;
    togglePasswordBtn.textContent = type === 'password' ? '👁️' : '🙈';
});

// Actualizar fortaleza de contraseña en tiempo real
passwordInput.addEventListener('input', updatePasswordStrength);

// Validación en tiempo real de confirmación de contraseña
confirmPasswordInput.addEventListener('input', () => {
    if (confirmPasswordInput.value && confirmPasswordInput.value !== passwordInput.value) {
        confirmPasswordInput.classList.add('error');
        confirmPasswordInput.classList.remove('success');
    } else if (confirmPasswordInput.value === passwordInput.value && confirmPasswordInput.value.length > 0) {
        confirmPasswordInput.classList.remove('error');
        confirmPasswordInput.classList.add('success');
    } else {
        confirmPasswordInput.classList.remove('error', 'success');
    }
});

// Limpiar mensajes de error al escribir
[nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
    input.addEventListener('input', () => {
        errorMessage.classList.remove('show');
        input.classList.remove('error');
    });
});

// Manejador del envío del formulario
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Limpiar mensajes previos
    errorMessage.classList.remove("show");
    successMessage.classList.remove("show");
    
    // Obtener valores
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Validaciones del lado del cliente
    if (!isValidName(name)) {
        showError("El nombre debe tener al menos 3 caracteres y solo contener letras.");
        nameInput.classList.add('error');
        nameInput.focus();
        return;
    }
    
    if (!isValidEmail(email)) {
        showError("Por favor, ingresa un correo electrónico válido.");
        emailInput.classList.add('error');
        emailInput.focus();
        return;
    }
    
    if (password.length < 8) {
        showError("La contraseña debe tener al menos 8 caracteres.");
        passwordInput.classList.add('error');
        passwordInput.focus();
        return;
    }
    
    if (password !== confirmPassword) {
        showError("Las contraseñas no coinciden.");
        confirmPasswordInput.classList.add('error');
        confirmPasswordInput.focus();
        return;
    }
    
    if (!termsCheckbox.checked) {
        showError("Debes aceptar los términos y condiciones para continuar.");
        termsCheckbox.focus();
        return;
    }
    
    // Iniciar estado de carga
    setLoading(true);
    
    try {
        const res = await fetch("/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            showSuccess("¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...");
            
            // Limpiar formulario
            form.reset();
            strengthBar.className = 'strength-bar';
            
            // Redirigir después de 2 segundos
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
            
        } else {
            // Mostrar mensaje de error del servidor
            let errorMsg = "Error al crear la cuenta. Por favor, intenta nuevamente.";
            
            if (data.message) {
                errorMsg = data.message;
            } else if (data.detail) {
                errorMsg = data.detail;
            } else if (data.error) {
                errorMsg = data.error;
            }
            
            // Verificar si es un error de email duplicado
            if (errorMsg.toLowerCase().includes('email') || errorMsg.toLowerCase().includes('existe')) {
                emailInput.classList.add('error');
            }
            
            showError(errorMsg);
        }
        
    } catch (error) {
        console.error("Error en el registro:", error);
        showError("Error de conexión con el servidor. Por favor, verifica tu conexión e intenta nuevamente.");
    } finally {
        setLoading(false);
    }
});

// Prevenir envío con Enter en inputs individuales (excepto el último)
[nameInput, emailInput, passwordInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const nextInput = input.parentElement.parentElement.nextElementSibling?.querySelector('input');
            if (nextInput) {
                nextInput.focus();
            }
        }
    });
});

// Permitir envío con Enter en el último campo
confirmPasswordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && termsCheckbox.checked) {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
    }
});