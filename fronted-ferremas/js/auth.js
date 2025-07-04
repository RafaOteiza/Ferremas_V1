function getAuthApiBaseUrl() {
  const base = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://127.0.0.1:4000'
    : `http://${window.location.hostname}:4000`;
  return `${base}/api/auth`;
}

function mostrarCatalogo() {
  // En index.html, siempre se muestra el catálogo, carrusel y filtros.
  // No es necesario cambiar la visibilidad de otros elementos aquí, ya que
  // el perfil de usuario se maneja en cliente.html
}

document.addEventListener("DOMContentLoaded", () => {
  // En index.html, siempre se debe mostrar el catálogo y los elementos principales.
  mostrarCatalogo();

  // ---------- LOGIN ----------
  document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const correo = document.getElementById("correo").value;
    const password = document.getElementById("password").value;
    const mensajeLogin = document.getElementById("mensajeLogin");

    try {
      // 1. Iniciar sesión
      const res = await fetch(`${getAuthApiBaseUrl()}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");
  
      // Guardar el token JWT
      localStorage.setItem("token", data.token);
  
      // 2. Obtener el perfil del usuario con el token
      const perfilRes = await fetch(`${getAuthApiBaseUrl()}/perfil`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${data.token}`
        },
      });
      const perfilData = await perfilRes.json();

      if (!perfilRes.ok) throw new Error(perfilData.error || "Error al obtener el perfil de usuario");

      // Almacenar el usuario completo en localStorage
      localStorage.setItem("usuario", JSON.stringify({
        id: perfilData.id,
        nombre: perfilData.nombre,
        correo: perfilData.correo,
        rol: perfilData.rol,
      }));
  
      // 3. Verificar el rol
      if (perfilData.rol === "cliente") {
        // Mostrar toast de éxito de login
        const toastBody = document.querySelector("#toastCarrito .toast-body");
        toastBody.textContent = "✅ Sesión iniciada correctamente";
        const toast = new bootstrap.Toast(document.getElementById("toastCarrito"));
        toast.show();
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("clienteModal"));
        if (modal) modal.hide();
    
        // ACTUALIZA LA NAVBAR
        actualizarNavbarUsuario();
    
        // Redirigir a cliente.html
        setTimeout(() => {
          window.location.href = "cliente.html";
        }, 300); // Espera breve para asegurar cierre de modal
      } else {
        // Si no es cliente, mostrar alerta y no redirigir
        alert('Este acceso es solo para clientes.');
        localStorage.removeItem("token"); // Eliminar token si no es cliente
        localStorage.removeItem("usuario"); // Eliminar usuario si no es cliente
        actualizarNavbarUsuario(); // Actualizar navbar para reflejar logout
        mensajeLogin.textContent = 'Acceso denegado: solo para clientes.';
      }
    } catch (err) {
      mensajeLogin.textContent = err.message;
    }
  });
  
  // ---------- REGISTRO ----------
  document.getElementById("registroForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("regNombre").value;
    const correo = document.getElementById("regCorreo").value;
    const password = document.getElementById("regPassword").value;
  
    try {
      const res = await fetch(`${getAuthApiBaseUrl()}/registro`, {
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
      // modal.hide(); // Eliminada para permitir que Cypress haga clic en el botón de cierre
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
      const res = await fetch(`${getAuthApiBaseUrl()}/recuperar`, {
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
  
  // --- Botón Cerrar Sesión ---
  const btnCerrarSesion = document.getElementById("btnCerrarSesionNav");
  if (btnCerrarSesion) {
    btnCerrarSesion.onclick = () => {
      // Mostrar modal de despedida
      const toastBody = document.querySelector("#toastCarrito .toast-body");
      toastBody.textContent = "👋 ¡Gracias por tu visita! Sesión cerrada correctamente.";
      const toast = new bootstrap.Toast(document.getElementById("toastCarrito"));
      toast.show();

      // Limpiar datos de sesión
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      localStorage.removeItem("carrito");
      
      // Redirigir a index.html
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
    mostrarCatalogo();
    actualizarNavbarUsuario();
  });
  
  // Eliminado: El botón "Mi Cuenta" ahora redirige a cliente.html directamente desde index.html
  // document.getElementById("btnMiCuentaNav")?.addEventListener("click", (e) => {
  //   e.preventDefault();
  //   mostrarPerfilUsuario();
  // });
  
  actualizarNavbarUsuario();
  
  // Mostrar modal al hacer click en "Cambiar Contraseña" (solo en cliente.html)
  // document.getElementById('btnCambiarPassword').onclick = () => {
  //   document.getElementById('formCambiarPassword').reset();
  //   document.getElementById('alertaPassword').classList.add('d-none');
  //   new bootstrap.Modal(document.getElementById('modalCambiarPassword')).show();
  // };
  
  // Validación y envío del formulario (solo en cliente.html)
  // document.getElementById('formCambiarPassword').onsubmit = async function(e) {
  //   e.preventDefault();
  //   const actual = document.getElementById('passwordActual').value;
  //   const nueva = document.getElementById('passwordNueva').value;
  //   const nueva2 = document.getElementById('passwordNueva2').value;
  //   const alerta = document.getElementById('alertaPassword');
  
  //   // Validaciones
  //   if (nueva.length < 6) {
  //     alerta.textContent = "La nueva contraseña debe tener al menos 6 caracteres.";
  //     alerta.classList.remove('d-none');
  //     return;
  //   }
  //   if (nueva !== nueva2) {
  //     alerta.textContent = "Las contraseñas nuevas no coinciden.";
  //     alerta.classList.remove('d-none');
  //     return;
  //   }
  
  //   // Llamada al endpoint
  //   try {
  //     const token = localStorage.getItem('token');
  //     const res = await fetch(`${getAuthApiBaseUrl()}/cambiar-password`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': 'Bearer ' + token
  //       },
  //       body: JSON.stringify({
  //         passwordActual: actual,
  //         passwordNueva: nueva
  //       })
  //     });
  //     const data = await res.json();
  //     if (res.ok) {
  //       const toastBody = document.querySelector("#toastCarrito .toast-body");
  //       toastBody.textContent = "✅ Contraseña actualizada correctamente.";
  //       const toast = new bootstrap.Toast(document.getElementById("toastCarrito"));
  //       toast.show();
  //       bootstrap.Modal.getInstance(document.getElementById('modalCambiarPassword')).hide();
  //     } else {
  //       alerta.textContent = data.error || "Error al cambiar la contraseña.";
  //       alerta.classList.remove('d-none');
  //     }
  //   } catch (err) {
  //     alerta.textContent = err.message;
  //     alerta.classList.remove('d-none');
  //   }
  // };

  // Asegura que el botón Ver Carrito de la navbar abra el modal y renderice
  document.getElementById("btnVerCarritoNav")?.addEventListener("click", (e) => {
    e.preventDefault();
    const carritoModal = new bootstrap.Modal(document.getElementById('carritoModal'));
    renderizarCarrito(); // Asegura que el carrito se renderice antes de abrir el modal
    carritoModal.show();
  });
});

// Funciones del carrito (mantener)
function renderizarProductosCarrito(carrito) {
  const carritoLista = document.getElementById("carritoLista");
  if (!carritoLista) return; // Asegúrate de que el elemento exista

  carritoLista.innerHTML = "";
  let total = 0;

  if (carrito.length === 0) {
    carritoLista.innerHTML = "<li class=\"list-group-item text-center text-muted\">El carrito está vacío.</li>";
    document.getElementById("carritoTotal").textContent = "$0";
    return;
  }

  carrito.forEach((item) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <div>
        ${item.nombre} - $${item.precio} x ${item.cantidad}
        <small class="text-muted">(${item.presentacion})</small>
      </div>
      <div>
        <button class="btn btn-sm btn-outline-danger me-2 eliminar-item" data-id="${item.id}" data-presentacion="${item.presentacion}">🗑️</button>
        <span class="fw-bold">$${item.precio * item.cantidad}</span>
      </div>
    `;
    carritoLista.appendChild(li);
    total += item.precio * item.cantidad;
  });

  document.getElementById("carritoTotal").textContent = `$${total}`;
}

async function confirmarCompra() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const token = localStorage.getItem("token");

  if (!token) {
    // Si no hay token, se asume que el usuario no está logueado
    // Abrir modal de login/registro
    const clienteModal = new bootstrap.Modal(document.getElementById('clienteModal'));
    clienteModal.show();
    return;
  }

  if (carrito.length === 0) {
    alert("El carrito está vacío. Agrega productos antes de finalizar la compra.");
    return;
  }

  try {
    const res = await fetch('http://127.0.0.1:4000/api/compras', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ productos: carrito })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error al confirmar la compra');
    }

    // Limpiar carrito y mostrar mensaje de éxito
    localStorage.removeItem("carrito");
    renderizarProductosCarrito([]); // Actualizar la vista del carrito
    actualizarContadorCarrito(); // Actualizar el contador de la navbar

    // Mostrar toast de éxito
    const toastBody = document.querySelector("#toastCarrito .toast-body");
    toastBody.textContent = "🎉 ¡Compra realizada con éxito!";
    const toast = new bootstrap.Toast(document.getElementById("toastCarrito"));
    toast.show();

    // Cerrar modal de resumen y carrito
    const resumenModal = bootstrap.Modal.getInstance(document.getElementById("resumenCompraModal"));
    if (resumenModal) resumenModal.hide();
    const carritoModal = bootstrap.Modal.getInstance(document.getElementById("carritoModal"));
    if (carritoModal) carritoModal.hide();

    // Redirigir al perfil del cliente o actualizar la vista si es necesario
    // Esto es opcional, depende de la UX deseada después de la compra
    // window.location.href = "cliente.html";

  } catch (err) {
    alert("Error al finalizar la compra: " + err.message);
  }
}

function actualizarNavbarUsuario() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const saludoUsuarioLi = document.getElementById("saludoUsuarioLi");
  const saludoUsuario = document.getElementById("saludoUsuario");
  const btnPerfilNavLi = document.getElementById("btnPerfilNavLi");
  const btnCerrarSesionNavLi = document.getElementById("btnCerrarSesionNavLi");
  const btnLoginNavLi = document.getElementById("btnLoginNavLi");
  const btnVerCarritoNavLi = document.getElementById("btnVerCarritoNavLi");

  if (usuario && usuario.rol === "cliente") {
    if (saludoUsuarioLi) saludoUsuarioLi.classList.remove("d-none");
    if (saludoUsuario) saludoUsuario.textContent = `Hola, ${usuario.nombre || usuario.correo}`;
    if (btnPerfilNavLi) btnPerfilNavLi.classList.remove("d-none");
    if (btnCerrarSesionNavLi) btnCerrarSesionNavLi.classList.remove("d-none");
    if (btnLoginNavLi) btnLoginNavLi.classList.add("d-none");
    if (btnVerCarritoNavLi) btnVerCarritoNavLi.classList.remove("d-none");
  } else {
    if (saludoUsuarioLi) saludoUsuarioLi.classList.add("d-none");
    if (btnPerfilNavLi) btnPerfilNavLi.classList.add("d-none");
    if (btnCerrarSesionNavLi) btnCerrarSesionNavLi.classList.add("d-none");
    if (btnLoginNavLi) btnLoginNavLi.classList.remove("d-none");
    if (btnVerCarritoNavLi) btnVerCarritoNavLi.classList.remove("d-none");
  }
}

// Esta función es específica del perfil, no debería estar en index.html
function renderizarTotalCarritoPerfil() {
  // const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  // const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  // const perfilTotalCarrito = document.getElementById("perfilTotalCarrito");
  // if (perfilTotalCarrito) perfilTotalCarrito.textContent = total.toLocaleString('es-CL');
}

// Llamadas iniciales al cargar la página
actualizarNavbarUsuario();

async function iniciarSesion(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://127.0.0.1:4000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      
      // Sincronizar carrito si el usuario es cliente
      if (data.usuario.rol === 'cliente') {
        try {
          const carritoResponse = await fetch("http://127.0.0.1:4000/api/carrito", {
            headers: {
              "Authorization": "Bearer " + data.token
            }
          });
          
          if (carritoResponse.ok) {
            const carritoData = await carritoResponse.json();
            localStorage.setItem("carrito", JSON.stringify(carritoData));
            
            // Actualizar UI del carrito si las funciones están disponibles
            if (typeof actualizarCantidadCarrito === 'function') {
              actualizarCantidadCarrito();
            }
            if (typeof renderizarCarrito === 'function') {
              renderizarCarrito();
            }
          }
        } catch (error) {
          console.error("❌ Error al sincronizar carrito:", error);
        }
      }

      window.location.href = "index.html";
    } else {
      mostrarError(data.error || "Error al iniciar sesión");
    }
  } catch (error) {
    mostrarError("Error al conectar con el servidor");
  }
}
