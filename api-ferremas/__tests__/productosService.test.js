// __tests__/productosService.test.js

// 👇 Usa el mock de firebase.js que creamos
jest.mock("../services/firebase");

const productService = require("../services/productosService");

describe("🧪 Pruebas de productosService", () => {
  test("✅ Crear un nuevo producto con ID incremental basado en la categoría", async () => {
    const nuevoProducto = {
      nombre: "Destornillador",
      categoria: "Herramientas Manuales", // debe generar un ID como HM0002
    };

    const productoCreado = await productService.create(nuevoProducto);

    expect(productoCreado).toHaveProperty("id");
    expect(productoCreado.id).toMatch(/^HM\d{4}$/); // ID debe comenzar con HM y 4 dígitos
    expect(productoCreado.nombre).toBe("Destornillador");
    expect(productoCreado.categoria).toBe("Herramientas Manuales");
  });

  test("✅ Crear producto con diferentes categorías", async () => {
    const categorias = [
      { categoria: "Herramientas Electricas", prefijo: "HE" },
      { categoria: "Herramientas Manuales", prefijo: "HM" },
      { categoria: "Accesorios", prefijo: "AC" }
    ];

    for (const cat of categorias) {
      const producto = await productService.create({
        nombre: `Producto ${cat.categoria}`,
        categoria: cat.categoria
      });
      expect(producto.id).toMatch(new RegExp(`^${cat.prefijo}\\d{4}$`));
    }
  });

  test("✅ Crear producto con diferentes formatos de precio", async () => {
    const casosPrecio = [
      { precio: 1000, esperado: [1000] },
      { precio: [1000, 2000], esperado: [1000, 2000] }
    ];

    for (const caso of casosPrecio) {
      const producto = await productService.create({
        nombre: "Producto Precio",
        categoria: "Herramientas Manuales",
        precio: caso.precio
      });
      expect(producto.precio).toEqual(caso.esperado);
      expect(producto.valor).toBeDefined();
    }
  });

  test("🔁 Obtener todos los productos", async () => {
    const productos = await productService.getAll();

    expect(Array.isArray(productos)).toBe(true);
    expect(productos.length).toBeGreaterThan(0);
    expect(productos[0]).toHaveProperty("id");
    expect(productos[0]).toHaveProperty("nombre");
    expect(productos[0]).toHaveProperty("precio");
    expect(productos[0]).toHaveProperty("fechaCreacion");
  });

  test("🔍 Obtener producto por ID", async () => {
    const producto = await productService.getById("HE0001");

    expect(producto).toBeDefined();
    expect(producto.id).toBe("HE0001");
    expect(producto.nombre).toBe("Taladro");
    expect(producto.precio).toBeDefined();
    expect(producto.fechaCreacion).toBeDefined();
  });

  test("❌ Obtener producto inexistente devuelve null", async () => {
    const producto = await productService.getById("NOEXISTE123");
    expect(producto).toBeNull();
  });

  test("🔄 Actualizar producto existente", async () => {
    const id = "HE0001";
    const datosActualizacion = {
      nombre: "Taladro Actualizado",
      precio: 1500
    };

    const productoActualizado = await productService.update(id, datosActualizacion);
    expect(productoActualizado.id).toBe(id);
    expect(productoActualizado.nombre).toBe("Taladro Actualizado");
    expect(productoActualizado.precio).toEqual([1500]);
  });

  test("❌ Actualizar producto inexistente lanza error", async () => {
    const id = "NOEXISTE123";
    const datosActualizacion = {
      nombre: "Producto Nuevo"
    };

    await expect(productService.update(id, datosActualizacion))
      .rejects
      .toThrow(`Producto con ID ${id} no encontrado`);
  });

  test("🗑️ Eliminar producto existente", async () => {
    const id = "HE0001";
    await expect(productService.remove(id)).resolves.not.toThrow();
  });

  test("❌ Eliminar producto inexistente", async () => {
    const id = "NOEXISTE123";
    await expect(productService.remove(id)).rejects.toThrow("Producto con ID NOEXISTE123 no encontrado");
  });

  test("✅ Validar estructura completa de producto creado", async () => {
    const nuevoProducto = {
      nombre: "Producto Completo",
      categoria: "Herramientas Manuales",
      precio: [1000, 2000],
      descripcion: "Descripción del producto",
      stock: 10
    };

    const productoCreado = await productService.create(nuevoProducto);

    expect(productoCreado).toMatchObject({
      id: expect.stringMatching(/^HM\d{4}$/),
      nombre: "Producto Completo",
      categoria: "Herramientas Manuales",
      precio: [1000, 2000],
      valor: [1000, 2000],
      descripcion: "Descripción del producto",
      stock: 10,
      fechaCreacion: expect.any(String)
    });
  });
});
