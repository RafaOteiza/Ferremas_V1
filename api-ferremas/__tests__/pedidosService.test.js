// __tests__/pedidosService.test.js

jest.mock("../services/firebase");

const pedidosService = require("../services/pedidosService");

describe("🧪 Pruebas de pedidosService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("✅ Obtener todos los pedidos", async () => {
    const resultado = await pedidosService.getAll();
    
    expect(Array.isArray(resultado)).toBe(true);
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado[0]).toHaveProperty("id", "pedido1");
    expect(resultado[0]).toHaveProperty("items");
    expect(resultado[0]).toHaveProperty("fecha");
    expect(resultado[0]).toHaveProperty("estado", "pendiente");
  });

  test("✅ Obtener pedido por ID", async () => {
    const pedidoId = "pedido1";
    const resultado = await pedidosService.getById(pedidoId);
    
    expect(resultado).toBeDefined();
    expect(resultado.id).toBe(pedidoId);
    expect(resultado).toHaveProperty("items");
    expect(resultado).toHaveProperty("fecha");
    expect(resultado).toHaveProperty("estado", "pendiente");
  });

  test("❌ Obtener pedido inexistente devuelve null", async () => {
    const resultado = await pedidosService.getById("NOEXISTE");
    expect(resultado).toBeNull();
  });

  test("✅ Crear nuevo pedido", async () => {
    const pedidoData = {
      items: [
        {
          id: "HE0001",
          nombre: "Taladro",
          precio: 1000,
          cantidad: 1
        }
      ]
    };

    const resultado = await pedidosService.create(pedidoData);
    
    expect(resultado).toHaveProperty("id");
    expect(resultado.items).toEqual(pedidoData.items);
    expect(resultado.estado).toBe("pendiente");
    expect(resultado).toHaveProperty("fecha");
  });

  test("✅ Actualizar estado de pedido", async () => {
    const pedidoId = "pedido1";
    const nuevoEstado = "en_proceso";

    const resultado = await pedidosService.updateEstado(pedidoId, nuevoEstado);
    
    expect(resultado).toBeDefined();
    expect(resultado.estado).toBe(nuevoEstado);
  });

  test("✅ Validar estructura completa de pedido creado", async () => {
    const pedidoData = {
      items: [
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
      ]
    };

    const resultado = await pedidosService.create(pedidoData);
    
    expect(resultado).toMatchObject({
      id: expect.any(String),
      items: pedidoData.items,
      estado: "pendiente",
      fecha: expect.any(String)
    });
  });
}); 