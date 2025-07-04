function getApiUrl() {
  const base = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://127.0.0.1:4000'
    : `http://${window.location.hostname}:4000`;
  return `${base}/api/productos`;
}

let todosLosProductos = [];
let productosMostrados = 0;
const productosPorPagina = 6;
let categoriaSeleccionada = "todas";
let textoBusqueda = "";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch(getApiUrl());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    todosLosProductos = await response.json();
    aplicarFiltros();

    document.getElementById("verMasBtn").addEventListener("click", mostrarMasProductos);
    cargarFiltradoPorCategorias();
    configurarBuscador();
    actualizarCantidadCarrito();
  } catch (error) {
    console.error("❌ Error al cargar productos:", error);
    const errorMessageDiv = document.getElementById("productosErrorMessage");
    if (errorMessageDiv) {
      errorMessageDiv.textContent = "Hubo un error al cargar los productos. Por favor, intente más tarde.";
      errorMessageDiv.classList.remove("d-none");
    }
  }
});

function aplicarFiltros() {
  let filtrados = [...todosLosProductos];

  if (categoriaSeleccionada !== "todas") {
    filtrados = filtrados.filter(p => p.categoria === categoriaSeleccionada);
  }

  if (textoBusqueda) {
    filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(textoBusqueda));
  }

  productosMostrados = productosPorPagina;
  mostrarProductos(filtrados.slice(0, productosMostrados));
  actualizarBotonVerMas(filtrados.length);
}

function mostrarMasProductos() {
  let filtrados = [...todosLosProductos];
  if (categoriaSeleccionada !== "todas") {
    filtrados = filtrados.filter(p => p.categoria === categoriaSeleccionada);
  }
  if (textoBusqueda) {
    filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(textoBusqueda));
  }

  const nuevos = filtrados.slice(productosMostrados, productosMostrados + productosPorPagina);
  mostrarProductos(nuevos, true);
  productosMostrados += productosPorPagina;
  actualizarBotonVerMas(filtrados.length);
}

function mostrarProductos(productos, append = false) {
  const contenedor = document.getElementById("productosContainer");
  if (!append) contenedor.innerHTML = "";

  productos.forEach(prod => {
    const imagen = prod.imagen?.replace(/'/g, "\\'") || '';
    const precio = Array.isArray(prod.precio) ? prod.precio[0] : prod.precio;
    const idProducto = prod.id || '';
    
    const card = document.createElement("div");
    card.className = "col-md-4 mb-4";
    card.innerHTML = `
      <div class="product-card h-100">
        <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${prod.nombre}</h5>
          <p class="card-text"><strong>Marca:</strong> ${prod.marca}</p>
          <p class="card-text"><strong>Precio:</strong> $${precio.toLocaleString()}</p>
          <button class="btn btn-primary mt-auto" onclick="agregarAlCarrito('${idProducto}', '${prod.nombre}', ${precio}, '${imagen}')" data-cy="add-to-cart-button">Agregar al carrito</button>
        </div>
      </div>
    `;
    contenedor.appendChild(card);
  });
}

function actualizarBotonVerMas(total) {
  const btn = document.getElementById("verMasBtn");
  btn.style.display = productosMostrados < total ? "block" : "none";
}

function cargarFiltradoPorCategorias() {
  const botones = document.querySelectorAll("#filtrosCategoria button");
  botones.forEach(btn => {
    btn.addEventListener("click", () => {
      botones.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      categoriaSeleccionada = btn.dataset.categoria;
      aplicarFiltros();
    });
  });
}

function configurarBuscador() {
  const input = document.getElementById("buscador");
  input.addEventListener("input", () => {
    textoBusqueda = input.value.toLowerCase();
    aplicarFiltros();
  });
}
