document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const errorMessage = document.getElementById("errorMessage");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        errorMessage.style.display = "none";

        const data = {
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
        };

        try {
            const res = await fetch("/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                errorMessage.textContent = result.detail || "Credenciales incorrectas";
                errorMessage.style.display = "block";
                return;
            }

            // guardo el token
            localStorage.setItem("token", result.access_token);

            // redirijo al dashboard
            window.location.href = "/dashboard";

        } catch (err) {
            errorMessage.textContent = "Error al conectar con el servidor";
            errorMessage.style.display = "block";
        }
    });
});
