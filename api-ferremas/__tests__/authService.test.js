// 🛑 MOCKS antes de todo
jest.mock("bcryptjs", () => ({
  hash: jest.fn(() => Promise.resolve("hashedPassword")),
  compare: jest.fn((password, hash) => {
    console.log("✅ MOCK bcrypt.compare =>", { password, hash });
    return Promise.resolve(password === "password123" && hash === "hashedPassword");
  })
}));

// Mock de jsonwebtoken
const jwt = require("jsonwebtoken");
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("fake.jwt.token")
}));

// Luego importa los módulos normalmente
const bcrypt = require("bcryptjs");
const authService = require("../services/authService");
const { db } = require("../services/firebase");

// -----------------------------------------------------
// TESTS
// -----------------------------------------------------

describe("🧪 Pruebas de authService", () => {
  beforeEach(() => {
    // Reestablecer manualmente el mock de bcrypt.compare
    bcrypt.compare.mockImplementation((password, hash) => {
      console.log("🛠️ Re-mock bcrypt.compare", { password, hash });
      return Promise.resolve(password === "password123" && hash === "hashedPassword");
    });

    // Reestablecer el mock de jwt.sign
    jwt.sign.mockReturnValue("fake.jwt.token");

    const usuariosCollection = db.collection("usuarios");
    usuariosCollection.add({
      id: "user1",
      nombre: "Usuario Prueba",
      correo: "test@example.com",
      password: "hashedPassword",
      rol: "cliente"
    });
  });

  test("✅ Registrar nuevo usuario", async () => {
    const usuario = {
      nombre: "Usuario Test",
      correo: "test@test.com",
      password: "password123",
      rol: "cliente"
    };

    const resultado = await authService.registrar(usuario);

    expect(resultado).toHaveProperty("id");
    expect(resultado.nombre).toBe(usuario.nombre);
    expect(resultado.correo).toBe(usuario.correo);
    expect(resultado.rol).toBe(usuario.rol);
    expect(resultado).not.toHaveProperty("password");
  });

  test("✅ Login exitoso", async () => {
    const credenciales = {
      correo: "test@example.com",
      password: "password123"
    };

    const resultado = await authService.login(credenciales);
    console.log("🧪 Resultado login:", resultado);

    expect(resultado).toHaveProperty("token");
    expect(resultado.token).toBe("fake.jwt.token");
  });

  test("❌ Login con credenciales inválidas", async () => {
    const credenciales = {
      correo: "nonexistent@test.com",
      password: "wrongpassword"
    };

    await expect(authService.login(credenciales))
      .rejects
      .toThrow("Credenciales inválidas");
  });

  test("✅ Obtener perfil de usuario", async () => {
    const userId = "user1";
    const resultado = await authService.obtenerPerfil(userId);
    
    expect(resultado).toHaveProperty("id", userId);
    expect(resultado).toHaveProperty("nombre", "Usuario Prueba");
    expect(resultado).toHaveProperty("correo", "test@example.com");
  });

  test("❌ Obtener perfil de usuario inexistente", async () => {
    const userId = "nonexistent";
    const resultado = await authService.obtenerPerfil(userId);
    expect(resultado).toBeNull();
  });

  test("✅ Cambiar contraseña exitosamente", async () => {
    const userId = "user1";
    const passwordActual = "oldPassword";
    const passwordNueva = "newPassword";

    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("hashedNewPassword");

    const resultado = await authService.cambiarPassword(userId, passwordActual, passwordNueva);

    expect(resultado).toEqual({ success: true });
  });

  test("❌ Cambiar contraseña con contraseña actual incorrecta", async () => {
    const userId = "user1";
    const passwordActual = "wrongPassword";
    const passwordNueva = "newPassword";

    bcrypt.compare.mockResolvedValue(false);

    const resultado = await authService.cambiarPassword(userId, passwordActual, passwordNueva);

    expect(resultado).toEqual({
      success: false,
      error: "Contraseña actual incorrecta."
    });
  });

  test("❌ Cambiar contraseña de usuario inexistente", async () => {
    const userId = "nonexistent";
    const passwordActual = "oldPassword";
    const passwordNueva = "newPassword";

    const resultado = await authService.cambiarPassword(userId, passwordActual, passwordNueva);
    
    expect(resultado).toEqual({
      success: false,
      error: "Usuario no encontrado."
    });
  });
});
