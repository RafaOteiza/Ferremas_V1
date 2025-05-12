const API_URL = "http://127.0.0.1:4000/api/productos";
let todosLosProductos = [];
let productosMostrados = 0;
const productosPorPagina = 6;
let categoriaSeleccionada = "todas";
let textoBusqueda = "";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch(API_URL);
    todosLosProductos = await response.json();
    aplicarFiltros();

    document.getElementById("verMasBtn").addEventListener("click", mostrarMasProductos);
    cargarFiltradoPorCategorias();
    configurarBuscador();
    actualizarCantidadCarrito();
  } catch (error) {
    console.error("❌ Error al cargar productos:", error);
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
    const card = document.createElement("div");
    card.className = "col-md-4 mb-4";
    card.innerHTML = `
      <div class="product-card h-100">
        <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${prod.nombre}</h5>
          <p class="card-text"><strong>Marca:</strong> ${prod.marca}</p>
          <p class="card-text"><strong>Precio:</strong> $${prod.precio.toLocaleString()}</p>
          <button class="btn btn-primary mt-auto" onclick="agregarAlCarrito('${prod.id}', '${prod.nombre}', ${prod.precio}, '${prod.imagen}')">Agregar al carrito</button>
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
