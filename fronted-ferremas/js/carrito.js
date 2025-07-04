let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function agregarAlCarrito(id, nombre, precio, imagen) {
  const existente = carrito.find(item => item.id === id);
  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ id, nombre, precio, cantidad: 1, imagen });
  }
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarCantidadCarrito();
  mostrarToast("Producto agregado al carrito");

  const token = localStorage.getItem("token");
  if (token) {
    fetch("http://127.0.0.1:4000/api/carrito/agregar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        id: String(id),
        nombre,
        precio,
        cantidad: 1
      })
    })
    .then(async res => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error desconocido');
      }
    })
    .catch(error => {
      console.error("❌ Error al agregar producto:", error.message);
      mostrarToast(error.message);
    });
  }

  renderizarCarrito();
}

function actualizarCantidadCarrito() {
  const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const contador = document.getElementById("contadorCarrito");
  if (contador) contador.textContent = total;
}

function mostrarToast(mensaje) {
  const toastEl = document.getElementById("toastCarrito");
  if (!toastEl) return;
  const toastBody = toastEl.querySelector(".toast-body");
  toastBody.textContent = mensaje;
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

function renderizarCarrito() {
  const lista = document.getElementById("carritoLista");
  if (!lista) return;
  lista.innerHTML = "";

  const modalFooter = document.querySelector("#carritoModal .modal-footer");

  carrito.forEach((item, i) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <div class="d-flex align-items-center">
        <img src="${item.imagen}" width="50" class="me-3 rounded" alt="${item.nombre}">
        <div>
          <strong>${item.nombre}</strong><br>
          <span>$${item.precio.toLocaleString()}</span>
        </div>
      </div>
      <div class="d-flex align-items-center">
        <button class="btn btn-sm btn-outline-secondary me-1" onclick="cambiarCantidad(${i}, -1)">-</button>
        <span>${item.cantidad}</span>
        <button class="btn btn-sm btn-outline-secondary ms-1" onclick="cambiarCantidad(${i}, 1)">+</button>
        <button class="btn btn-sm btn-danger ms-3" onclick="eliminarDelCarrito(${i})">🗑️</button>
      </div>
    `;
    lista.appendChild(li);
  });

  const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
  const totalElement = document.getElementById("carritoTotal");
  if (totalElement) totalElement.textContent = `$${total.toLocaleString()}`;

  if (carrito.length > 0) {
    if (modalFooter) modalFooter.style.display = "flex";
  } else {
    if (modalFooter) modalFooter.style.display = "none";
  }
}

function cambiarCantidad(index, delta) {
  const item = carrito[index];
  item.cantidad += delta;

  if (item.cantidad <= 0) {
    carrito.splice(index, 1);
    mostrarToast("Producto eliminado del carrito");
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://127.0.0.1:4000/api/carrito/remover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ id: item.id })
      }).catch(error => {
        console.error("❌ Error al sincronizar eliminación con backend:", error);
      });
    }
  } else {
    mostrarToast(delta > 0 ? "Cantidad aumentada" : "Cantidad reducida");
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://127.0.0.1:4000/api/carrito/actualizarCantidad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          id: item.id,
          cantidad: item.cantidad
        })
      })
      .then(async res => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Error desconocido al actualizar cantidad');
        }
      })
      .catch(error => {
        console.error("❌ Error al sincronizar cantidad con backend:", error.message);
        mostrarToast(error.message);
      });
    }
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderizarCarrito();
  actualizarCantidadCarrito();
}

function eliminarDelCarrito(index) {
  const id = carrito[index].id;
  carrito.splice(index, 1);

  const token = localStorage.getItem("token");
  if (token) {
    fetch("http://127.0.0.1:4000/api/carrito/remover", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ id })
    }).catch(error => {
      console.error("❌ Error al sincronizar eliminación con backend:", error);
    });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderizarCarrito();
  actualizarCantidadCarrito();
  mostrarToast("Producto eliminado del carrito");
}

function renderizarTotalCarritoPerfil() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  let total = 0;
  carrito.forEach(item => {
    total += item.precio * item.cantidad;
  });
  const totalSpan = document.getElementById("perfilTotalCarrito");
  if (totalSpan) totalSpan.textContent = total.toLocaleString();
}

function vaciarCarrito(suprimirToast = false) {
  const token = localStorage.getItem("token");
  if (token) {
    fetch("http://127.0.0.1:4000/api/carrito/vaciar", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token
      }
    }).catch(error => {
      console.error("❌ Error al sincronizar vaciado con backend:", error);
    });
  }

  carrito = [];
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderizarCarrito();
  actualizarCantidadCarrito();
  if (!suprimirToast) {
    mostrarToast("Carrito vaciado");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  actualizarCantidadCarrito();
  renderizarCarrito();

  document.getElementById("carritoModal")?.addEventListener("shown.bs.modal", renderizarCarrito);

  document.getElementById("vaciarCarrito")?.addEventListener("click", () => {
    const modal = new bootstrap.Modal(document.getElementById("confirmarVaciarModal"));
    modal.show();
  });

  document.getElementById("confirmarVaciarBtn")?.addEventListener("click", () => {
    vaciarCarrito();
    bootstrap.Modal.getInstance(document.getElementById("confirmarVaciarModal"))?.hide();
  });

  // Evento para abrir el modal de resumen al hacer clic en Finalizar Compra
  document.getElementById("btnFinalizarCompra")?.addEventListener("click", () => {
    if (carrito.length === 0) {
      mostrarToast("El carrito está vacío. Agrega productos antes de finalizar la compra.");
      return;
    }
    const carritoModal = bootstrap.Modal.getInstance(document.getElementById("carritoModal"));
    if (carritoModal) carritoModal.hide(); // Ocultar modal de carrito
    renderizarResumenCompra();
    const resumenCompraModal = new bootstrap.Modal(document.getElementById("resumenCompraModal"));
    resumenCompraModal.show();
  });

  // Evento para confirmar el resumen y abrir el modal de tipo de entrega
  document.getElementById("btnConfirmarResumen")?.addEventListener("click", () => {
    const resumenCompraModal = bootstrap.Modal.getInstance(document.getElementById("resumenCompraModal"));
    if (resumenCompraModal) resumenCompraModal.hide(); // Ocultar modal de resumen
    const tipoEntregaModal = new bootstrap.Modal(document.getElementById("tipoEntregaModal"));
    tipoEntregaModal.show();
  });

  // Evento para seleccionar Despacho
  document.getElementById("btnDespacho")?.addEventListener("click", () => {
    realizarCompraFinal("despacho");
  });

  // Evento para seleccionar Retiro en Local
  document.getElementById("btnRetiroLocal")?.addEventListener("click", () => {
    realizarCompraFinal("retiro_local");
  });

  // Nueva función para renderizar el resumen de la compra
  function renderizarResumenCompra() {
    const resumenLista = document.getElementById("resumenLista");
    const resumenTotalElement = document.getElementById("resumenTotal");
    if (!resumenLista || !resumenTotalElement) return;

    resumenLista.innerHTML = "";
    let total = 0;

    if (carrito.length === 0) {
      resumenLista.innerHTML = "<li class=\"list-group-item text-center text-muted\">El carrito está vacío.</li>";
      resumenTotalElement.textContent = "$0";
      return;
    }

    carrito.forEach((item) => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <div>
          <strong>${item.nombre}</strong><br>
          <span>$${item.precio.toLocaleString()} x ${item.cantidad}</span>
        </div>
        <span class="fw-bold">$${(item.precio * item.cantidad).toLocaleString()}</span>
      `;
      resumenLista.appendChild(li);
      total += item.precio * item.cantidad;
    });

    resumenTotalElement.textContent = `$${total.toLocaleString()}`;
  }

  // Función que ahora realiza la llamada final a la API con el tipo de entrega
  async function realizarCompraFinal(tipoEntrega) {
    const token = localStorage.getItem("token");
    if (!token) {
      mostrarToast("Debes iniciar sesión para finalizar la compra.");
      const clienteModal = new bootstrap.Modal(document.getElementById('clienteModal'));
      clienteModal.show();
      return;
    }

    if (carrito.length === 0) {
      mostrarToast("El carrito está vacío. Agrega productos antes de finalizar la compra.");
      return;
    }

    // OBTENER USUARIO DEL LOCALSTORAGE
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

    try {
      const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
      const res = await fetch('http://127.0.0.1:4000/api/webpay/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          productos: carrito,
          total,
          usuario,
          tipoEntrega
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar pago Webpay');
      }
      localStorage.setItem('pedidoId', data.pedidoId);
      window.location.href = data.url + '?token_ws=' + data.token;
    } catch (error) {
      console.error("❌ Error al iniciar pago Webpay:", error.message);
      mostrarToast(error.message);
    }
  }
});
