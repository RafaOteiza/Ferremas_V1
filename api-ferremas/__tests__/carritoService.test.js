const carritoService = require("../services/carritoService");

// Mock de Firebase
jest.mock("../services/firebase");

describe("🧪 Pruebas de carritoService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("✅ Obtener carrito vacío", async () => {
    const resultado = await carritoService.get();
    expect(resultado).toEqual({ id: "cliente", items: [] });
});

  test("✅ Agregar producto al carrito", async () => {
    const producto = {
      id: "HE0001",
      nombre: "Taladro",
      precio: 1000,
      cantidad: 1
    };

    const resultado = await carritoService.add(producto);
    
    expect(resultado.items).toHaveLength(1);
    expect(resultado.items[0]).toEqual(producto);
  });

  test("✅ Agregar producto existente incrementa cantidad", async () => {
    const producto = {
      id: "HE0001",
      nombre: "Taladro",
      precio: 1000,
      cantidad: 1
    };

    // Primera adición
    await carritoService.add(producto);
    
    // Segunda adición del mismo producto
    const resultado = await carritoService.add(producto);
    
    expect(resultado.items).toHaveLength(1);
    expect(resultado.items[0].cantidad).toBe(2);
  });

  test("✅ Agregar diferentes productos al carrito", async () => {
    const productos = [
      {
        id: "HE0001",
        nombre: "Taladro",
        precio: 1000,
        cantidad: 1
      },
      {
        id: "HM0001",
        nombre: "Destornillador",
        precio: 500,
        cantidad: 2
      }
    ];

    for (const producto of productos) {
      await carritoService.add(producto);
    }

    const resultado = await carritoService.get();

    expect(resultado.items).toHaveLength(2);
    expect(resultado.items).toEqual(expect.arrayContaining(productos));
  });

  test("✅ Eliminar producto del carrito", async () => {
    const producto = {
      id: "HE0001",
      nombre: "Taladro",
      precio: 1000,
      cantidad: 1
    };

    // Agregar producto
    await carritoService.add(producto);
    
    // Eliminar producto
    const resultado = await carritoService.remove(producto.id);

    expect(resultado.items).toHaveLength(0);
  });

  test("✅ Eliminar producto inexistente del carrito", async () => {
    const resultado = await carritoService.remove("NOEXISTE");
    expect(resultado.items).toHaveLength(0);
  });

  test("✅ Finalizar carrito con productos", async () => {
    const producto = {
      id: "HE0001",
      nombre: "Taladro",
      precio: 1000,
      cantidad: 1
    };

    // Agregar producto
    await carritoService.add(producto);
    
    // Finalizar carrito
    const resultado = await carritoService.finalize();

    expect(resultado).toHaveProperty("items");
    expect(resultado).toHaveProperty("fecha");
    expect(resultado.items).toHaveLength(1);
    expect(resultado.items[0]).toEqual(producto);
  });

  test("❌ Finalizar carrito vacío lanza error", async () => {
    await expect(carritoService.finalize())
      .rejects
      .toThrow("Carrito vacío");
  });
});

function mockWhere(collection, filters = []) {
  // Devuelve un objeto con los mismos métodos que una colección real
  return {
    where: (field, operator, value) => mockWhere(collection, [...filters, { field, operator, value }]),
    get: () => {
      let filtered = collection;
      for (const { field, operator, value } of filters) {
        if (operator === '>=') filtered = filtered.filter(doc => doc[field] >= value);
        else if (operator === '<') filtered = filtered.filter(doc => doc[field] < value);
        else if (operator === '==') filtered = filtered.filter(doc => doc[field] === value);
      }
      return Promise.resolve({
        empty: filtered.length === 0,
        docs: filtered.map(doc => ({
          id: doc.id,
          data: () => doc
        }))
      });
    },
    doc: (id) => mockDoc(collection, id),
    add: (data) => {
      const id = `doc_${collection.length + 1}`;
      collection.push({ ...data, id });
      return Promise.resolve({
        id,
        get: () => Promise.resolve({
          id,
          data: () => ({ ...data, id })
        })
      });
    }
  };
}

function mockCollection(name) {
  const collection = getOrCreateCollection(name);
  return mockWhere(collection, []);
}
