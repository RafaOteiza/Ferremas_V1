const API_LOGIN = "http://127.0.0.1:4000/api/auth/login";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const correo = document.getElementById("correo").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(API_LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");

    localStorage.setItem("token", data.token);

    // Decodifica el payload del JWT para obtener datos del usuario
    const payload = JSON.parse(atob(data.token.split(".")[1]));
    localStorage.setItem("usuario", JSON.stringify({
      id: payload.id,
      nombre: payload.nombre,
      correo: payload.correo,
      rol: payload.rol,
    }));

    window.location.href = "index.html";
  } catch (error) {
    document.getElementById("mensajeError").textContent = error.message;
  }
});
