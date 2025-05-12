const API_BASE = "http://127.0.0.1:4000/api/auth";

document.addEventListener("DOMContentLoaded", () => {

  // ---------- LOGIN ----------
  document.getElementById("formLogin")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const correo = document.getElementById("correo").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");

      localStorage.setItem("token", data.token);

      // Decodifica el token para extraer datos del usuario
      const payload = JSON.parse(atob(data.token.split(".")[1]));
      localStorage.setItem("usuario", JSON.stringify({
        id: payload.id,
        nombre: payload.nombre,
        correo: payload.correo,
        rol: payload.rol,
      }));

      // Mostrar toast de éxito de login
      const toastBody = document.querySelector("#toastCarrito .toast-body");
      toastBody.textContent = "✅ Sesión iniciada correctamente";
      const toast = new bootstrap.Toast(document.getElementById("toastCarrito"));
      toast.show();

      // Cerrar modal
      const modal = bootstrap.Modal.getInstance(document.getElementById("clienteModal"));
      modal.hide();

      // ACTUALIZA LA NAVBAR
      actualizarNavbarUsuario();

      // Mostrar perfil de usuario inmediatamente
      mostrarPerfilUsuario();
    } catch (err) {
      document.getElementById("mensajeLogin").textContent = err.message;
    }
  });

  // ---------- REGISTRO ----------
  document.getElementById("registroForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("regNombre").value;
    const correo = document.getElementById("regCorreo").value;
    const password = document.getElementById("regPassword").value;

    try {
      const res = await fetch(`${API_BASE}/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, password, rol: "cliente" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrarse");

      // Mostrar toast de éxito
      const toastBody = document.querySelector("#toastCarrito .toast-body");
      toastBody.textContent = "✅ Usuario registrado correctamente. Ahora puedes iniciar sesión.";
      const toast = new bootstrap.Toast(document.getElementById("toastCarrito"));
      toast.show();

      // Cerrar modal y limpiar formulario
      const modal = bootstrap.Modal.getInstance(document.getElementById("clienteModal"));
      modal.hide();
      document.getElementById("registroForm").reset();
    } catch (err) {
      document.getElementById("mensajeRegistro").textContent = err.message;
    }
  });

  // ---------- RECUPERAR CONTRASEÑA ----------
  document.getElementById("recuperarForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const correo = document.getElementById("recCorreo").value;

    try {
      const res = await fetch(`${API_BASE}/recuperar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al recuperar contraseña");

      // Mostrar toast simulado
      const toastBody = document.querySelector("#toastCarrito .toast-body");
      toastBody.textContent = "📧 Se ha enviado un enlace de recuperación (simulado).";
      const toast = new bootstrap.Toast(document.getElementById("toastCarrito"));
      toast.show();

      document.getElementById("recuperarForm").reset();
    } catch (err) {
      document.getElementById("mensajeRecuperar").textContent = err.message;
    }
  });

  // --- VISTA CLIENTE AL CARGAR LA PÁGINA ---
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (usuario && usuario.rol === "cliente") {
    mostrarPerfilUsuario();
  }

  // --- Botón Cerrar Sesión ---
  const btnCerrarSesion = document.getElementById("btnCerrarSesion");
  if (btnCerrarSesion) {
    btnCerrarSesion.onclick = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      // Opcional: también puedes limpiar el carrito si lo deseas
      // localStorage.removeItem("carrito");
      window.location.href = "index.html";
    };
  }

  document.getElementById("btnVerCatalogo")?.addEventListener("click", (e) => {
    e.preventDefault();
    mostrarCatalogo();
    // Scroll suave al catálogo
    document.getElementById("tituloCatalogo")?.scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("btnInicioNav")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("catalogo").style.display = "block";
    document.getElementById("vistaCliente").style.display = "none";
    document.getElementById("filtrosBusqueda").style.display = "block";
    actualizarNavbarUsuario();
  });

  document.getElementById("btnMiCuentaNav")?.addEventListener("click", (e) => {
    e.preventDefault();
    mostrarPerfilUsuario();
  });

  actualizarNavbarUsuario();

  // Mostrar modal al hacer click en "Cambiar Contraseña"
  document.getElementById('btnCambiarPassword').onclick = () => {
    document.getElementById('formCambiarPassword').reset();
    document.getElementById('alertaPassword').classList.add('d-none');
    new bootstrap.Modal(document.getElementById('modalCambiarPassword')).show();
  };

  // Validación y envío del formulario
  document.getElementById('formCambiarPassword').onsubmit = async function(e) {
    e.preventDefault();
    const actual = document.getElementById('passwordActual').value;
    const nueva = document.getElementById('passwordNueva').value;
    const nueva2 = document.getElementById('passwordNueva2').value;
    const alerta = document.getElementById('alertaPassword');

    // Validaciones
    if (nueva.length < 6) {
      alerta.textContent = "La nueva contraseña debe tener al menos 6 caracteres.";
      alerta.classList.remove('d-none');
      return;
    }
    if (nueva !== nueva2) {
      alerta.textContent = "Las contraseñas nuevas no coinciden.";
      alerta.classList.remove('d-none');
      return;
    }

    // Llamada al endpoint
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:4000/api/auth/cambiar-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          passwordActual: actual,
          passwordNueva: nueva
        })
      });
      const data = await res.json();
      if (res.ok) {
        alerta.classList.add('d-none');
        bootstrap.Modal.getInstance(document.getElementById('modalCambiarPassword')).hide();
        const toastBody = document.querySelector("#toastCarrito .toast-body");
        toastBody.textContent = "Contraseña cambiada con éxito. Por seguridad, vuelve a iniciar sesión.";
        const toast = new bootstrap.Toast(document.getElementById("toastCarrito"));
        toast.show();
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          window.location.reload();
        }, 2000);
      } else {
        alerta.textContent = data.error || "Error al cambiar la contraseña.";
        alerta.classList.remove('d-none');
      }
    } catch (err) {
      alerta.textContent = "Error de red o servidor.";
      alerta.classList.remove('d-none');
    }
  };

  document.getElementById("btnVerCarrito")?.addEventListener("click", (e) => {
    e.preventDefault();
    const modalEl = document.getElementById("carritoModal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  });

  document.getElementById("btnVolverCatalogo")?.addEventListener("click", (e) => {
    e.preventDefault();
    mostrarCatalogo();
  });

  document.getElementById("logoInicio")?.addEventListener("click", (e) => {
    e.preventDefault();
    mostrarCatalogo();
    actualizarNavbarUsuario();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

function mostrarVistaCliente(usuario) {
  // Oculta el catálogo y muestra la vista cliente
  const catalogo = document.getElementById("catalogo");
  if (catalogo) catalogo.style.display = "none";
  const vistaCliente = document.getElementById("vistaCliente");
  if (vistaCliente) vistaCliente.style.display = "block";

  // Oculta el botón de iniciar sesión
  const btnLogin = document.querySelector('[data-bs-target="#clienteModal"]');
  if (btnLogin) btnLogin.style.display = "none";

  // Oculta los filtros y buscador
  const filtros = document.getElementById("filtrosBusqueda");
  if (filtros) filtros.style.display = "none";

  // Muestra los datos personales
  const nombreSpan = document.getElementById("clienteNombre");
  const nombreDatos = document.getElementById("clienteNombreDatos");
  const correoDatos = document.getElementById("clienteCorreoDatos");
  if (nombreSpan) nombreSpan.textContent = usuario.nombre;
  if (nombreDatos) nombreDatos.textContent = usuario.nombre;
  if (correoDatos) correoDatos.textContent = usuario.correo;

  // Renderiza el carrito
  renderizarCarritoCliente();

  // Botón de confirmar compra
  const btnConfirmar = document.getElementById("btnClienteConfirmarCompra");
  if (btnConfirmar) btnConfirmar.onclick = confirmarCompraCliente;

  actualizarNavbarUsuario();
}

function renderizarCarritoCliente() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const lista = document.getElementById("clienteCarritoLista");
  if (!lista) return;
  lista.innerHTML = "";
  let total = 0;
  carrito.forEach(item => {
    total += item.precio * item.cantidad;
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <div>
        <strong>${item.nombre}</strong> <span class="badge bg-secondary ms-2">x${item.cantidad}</span><br>
        <span>$${item.precio.toLocaleString()}</span>
      </div>
      <span class="text-end">$${(item.precio * item.cantidad).toLocaleString()}</span>
    `;
    lista.appendChild(li);
  });
  const totalSpan = document.getElementById("clienteCarritoTotal");
  if (totalSpan) totalSpan.textContent = `$${total.toLocaleString()}`;
}

async function confirmarCompraCliente() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const token = localStorage.getItem("token");
  const mensajeExito = document.getElementById("mensajeCompraExitosa");
  const mensajeError = document.getElementById("mensajeCompraError");
  if (mensajeExito) mensajeExito.textContent = "";
  if (mensajeError) mensajeError.textContent = "";

  if (!carrito.length) {
    if (mensajeError) mensajeError.textContent = "El carrito está vacío.";
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:4000/api/pedidos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        clienteId: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        productos: carrito
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al confirmar compra");
    if (mensajeExito) mensajeExito.textContent = "¡Compra realizada con éxito!";
    // Vacía el carrito local
    localStorage.setItem("carrito", JSON.stringify([]));
    renderizarCarritoCliente();
  } catch (err) {
    if (mensajeError) mensajeError.textContent = err.message;
  }
}

function actualizarNavbarUsuario() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  // Li wrappers
  const saludoLi = document.getElementById("saludoUsuarioLi");
  const perfilLi = document.getElementById("btnPerfilNavLi");
  const cerrarLi = document.getElementById("btnCerrarSesionNavLi");
  const carritoLi = document.getElementById("btnVerCarritoNavLi");
  const loginLi = document.getElementById("btnLoginNavLi");
  const saludo = document.getElementById("saludoUsuario");

  if (usuario && usuario.rol) {
    if (saludoLi) saludoLi.classList.remove("d-none");
    if (perfilLi) perfilLi.classList.remove("d-none");
    if (cerrarLi) cerrarLi.classList.remove("d-none");
    if (carritoLi) carritoLi.classList.remove("d-none");
    if (loginLi) loginLi.classList.add("d-none");
    if (saludo) saludo.textContent = `Hola, ${usuario.nombre || usuario.correo}`;
  } else {
    if (saludoLi) saludoLi.classList.add("d-none");
    if (perfilLi) perfilLi.classList.add("d-none");
    if (cerrarLi) cerrarLi.classList.add("d-none");
    if (carritoLi) carritoLi.classList.add("d-none");
    if (loginLi) loginLi.classList.remove("d-none");
  }
}

function mostrarPerfilUsuario() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) return;
  document.getElementById("perfilUsuario").classList.remove("d-none");
  document.getElementById("catalogo").classList.add("d-none");
  document.getElementById("filtrosBusqueda").classList.add("d-none");
  document.getElementById("carouselHero").classList.add("d-none");
  // Llenar datos personales
  document.getElementById("perfilNombre").textContent = usuario.nombre;
  document.getElementById("perfilCorreo").textContent = usuario.correo;
  document.getElementById("perfilRol").textContent = usuario.rol;
  renderizarTotalCarritoPerfil();
}

function mostrarCatalogo() {
  document.getElementById("perfilUsuario")?.classList.add("d-none");
  document.getElementById("catalogo")?.classList.remove("d-none");
  document.getElementById("carouselHero")?.classList.remove("d-none");
  document.getElementById("filtrosBusqueda")?.classList.remove("d-none");
  // Oculta otras secciones si las tienes (resumenCompra, etc.)
}

document.getElementById("btnPerfilNav")?.addEventListener("click", (e) => {
  e.preventDefault();
  mostrarPerfilUsuario();
});
document.getElementById("btnVolverCatalogoPerfil")?.addEventListener("click", (e) => {
  e.preventDefault();
  mostrarCatalogo();
});
document.getElementById("btnVerCarritoPerfil")?.addEventListener("click", (e) => {
  e.preventDefault();
  const modalEl = document.getElementById("carritoModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
});
document.getElementById("btnVerCarritoNav")?.addEventListener("click", (e) => {
  e.preventDefault();
  const modalEl = document.getElementById("carritoModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
});

function renderizarCarritoPerfil() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const lista = document.getElementById("perfilCarritoLista");
  if (!lista) return;
  lista.innerHTML = "";
  let total = 0;
  carrito.forEach(item => {
    total += item.precio * item.cantidad;
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center border-0 bg-light px-0";
    li.innerHTML = `
      <div>
        <strong>${item.nombre}</strong> <span class="badge bg-secondary ms-2">x${item.cantidad}</span><br>
        <span>$${item.precio.toLocaleString()}</span>
      </div>
      <span class="text-end">$${(item.precio * item.cantidad).toLocaleString()}</span>
    `;
    lista.appendChild(li);
  });
  const totalSpan = document.getElementById("perfilCarritoTotal");
  if (totalSpan) totalSpan.textContent = `$${total.toLocaleString()}`;
}

// Cerrar sesión
document.getElementById("btnCerrarSesionNav")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  // localStorage.removeItem("carrito"); // si quieres limpiar el carrito
  actualizarNavbarUsuario();
  mostrarCatalogo(); // Vuelve a la vista principal
});

// Navegación SPA
function mostrarCatalogo() {
  document.getElementById("perfilUsuario")?.classList.add("d-none");
  document.getElementById("catalogo")?.classList.remove("d-none");
  document.getElementById("carouselHero")?.classList.remove("d-none");
  document.getElementById("filtrosBusqueda")?.classList.remove("d-none");
  // Oculta otras secciones si las tienes (resumenCompra, etc.)
}

function mostrarPerfilUsuario() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) return;
  document.getElementById("perfilUsuario").classList.remove("d-none");
  document.getElementById("catalogo").classList.add("d-none");
  document.getElementById("filtrosBusqueda").classList.add("d-none");
  document.getElementById("carouselHero").classList.add("d-none");
  // Llenar datos personales
  document.getElementById("perfilNombre").textContent = usuario.nombre;
  document.getElementById("perfilCorreo").textContent = usuario.correo;
  document.getElementById("perfilRol").textContent = usuario.rol;
  renderizarTotalCarritoPerfil();
}

// Enlaces de navegación
document.getElementById("btnInicioNav")?.addEventListener("click", (e) => {
  e.preventDefault();
  mostrarCatalogo();
});
document.getElementById("btnVerCatalogo")?.addEventListener("click", (e) => {
  e.preventDefault();
  mostrarCatalogo();
});
document.getElementById("btnPerfilNav")?.addEventListener("click", (e) => {
  e.preventDefault();
  mostrarPerfilUsuario();
});
document.getElementById("btnVerCarritoNav")?.addEventListener("click", (e) => {
  e.preventDefault();
  const modalEl = document.getElementById("carritoModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
});
