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

  carrito.forEach((item, i) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <div class="d-flex align-items-center">
        <img src="${item.imagen}" width="50" class="me-3 rounded">
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
}

function cambiarCantidad(index, delta) {
  carrito[index].cantidad += delta;

  if (carrito[index].cantidad <= 0) {
    carrito.splice(index, 1);
    mostrarToast("Producto eliminado del carrito");
  } else {
    mostrarToast(delta > 0 ? "Cantidad aumentada" : "Cantidad reducida");
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderizarCarrito();
  actualizarCantidadCarrito();
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
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

document.addEventListener("DOMContentLoaded", () => {
  actualizarCantidadCarrito();
  renderizarCarrito();

  document.getElementById("carritoModal")?.addEventListener("shown.bs.modal", renderizarCarrito);

  document.getElementById("vaciarCarrito")?.addEventListener("click", () => {
    const modal = new bootstrap.Modal(document.getElementById("confirmarVaciarModal"));
    modal.show();
  });

  document.getElementById("confirmarVaciarBtn")?.addEventListener("click", () => {
    carrito = [];
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
    actualizarCantidadCarrito();
    mostrarToast("Carrito vaciado");
    bootstrap.Modal.getInstance(document.getElementById("confirmarVaciarModal"))?.hide();
  });
});
