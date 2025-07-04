// Configuración global de Jest
jest.mock('./services/firebase', () => require('./__mocks__/firebase'));
 
// Limpiar todos los mocks antes de cada prueba
beforeEach(() => {
  jest.clearAllMocks();
}); 