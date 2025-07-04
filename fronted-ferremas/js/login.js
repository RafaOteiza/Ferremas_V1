const API_URL = "http://127.0.0.1:4000/api";
const API_LOGIN = `${API_URL}/auth/login`;
const API_REGISTER = `${API_URL}/auth/register`;

// Inicializar el modal de registro
const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));

// Manejar el enlace de registro
document.querySelector('[data-cy="register-link"]').addEventListener('click', (e) => {
  e.preventDefault();
  registerModal.show();
});

// Manejar el formulario de login
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

    // Redirigir según el rol
    switch(payload.rol) {
      case 'cliente':
        window.location.href = "cliente.html";
        break;
      case 'vendedor':
        window.location.href = "vendedor.html";
        break;
      case 'bodeguero':
        window.location.href = "bodeguero.html";
        break;
      case 'contador':
        window.location.href = "contador.html";
        break;
      default:
        window.location.href = "index.html";
    }
  } catch (error) {
    document.getElementById("mensajeError").textContent = error.message;
  }
});

// Manejar el formulario de registro
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const nombre = document.getElementById("registerNombre").value;
  const rol = document.getElementById("registerRol").value;

  try {
    const res = await fetch(API_REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nombre, rol }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Error al registrar usuario");

    // Mostrar mensaje de éxito
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success mt-3';
    alertDiv.textContent = 'Usuario registrado exitosamente';
    document.getElementById("registerForm").appendChild(alertDiv);

    // Cerrar el modal después de 2 segundos
    setTimeout(() => {
      registerModal.hide();
      // Limpiar el formulario
      document.getElementById("registerForm").reset();
      // Remover el mensaje de éxito
      alertDiv.remove();
    }, 2000);

  } catch (error) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger mt-3';
    alertDiv.textContent = error.message;
    document.getElementById("registerForm").appendChild(alertDiv);

    // Remover el mensaje de error después de 3 segundos
    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  }
});
