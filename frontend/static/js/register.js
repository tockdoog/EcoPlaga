// frontend/static/js/register.js
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");
    const errorMessage = document.getElementById("errorMessage");
    const successMessage = document.getElementById("successMessage");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        errorMessage.style.display = "none";
        successMessage.style.display = "none";

        const data = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            farm_name: document.getElementById("farm_name").value,
            role: document.getElementById("role").value,  // NUEVO
            password: document.getElementById("password").value,
        };

        // Validación de rol
        if (!data.role) {
            errorMessage.textContent = "Debes seleccionar un rol";
            errorMessage.style.display = "block";
            return;
        }

        try {
            const res = await fetch("/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                errorMessage.textContent = result.detail || "Error al registrarse.";
                errorMessage.style.display = "block";
                return;
            }

            successMessage.textContent = "Registro exitoso. Redirigiendo...";
            successMessage.style.display = "block";

            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);

        } catch (err) {
            errorMessage.textContent = "Error de conexión con el servidor";
            errorMessage.style.display = "block";
        }
    });
});