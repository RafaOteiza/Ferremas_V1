// __tests__/__mocks__/firebase.js

// Mock de Firebase para pruebas
const mockCollections = {};

function getOrCreateCollection(name) {
  if (!mockCollections[name]) {
    mockCollections[name] = [];
  }
  return mockCollections[name];
}

function mockDoc(collection, id) {
  return {
    get: () => {
      const doc = collection.find(d => d.id === id);
      return Promise.resolve({
        exists: !!doc,
        id,
        data: () => doc || {}
      });
    },
    set: (data) => {
      const idx = collection.findIndex(d => d.id === id);
      if (idx >= 0) {
        collection[idx] = { ...data, id };
      } else {
        collection.push({ ...data, id });
      }
      return Promise.resolve();
    },
    update: (data) => {
      const idx = collection.findIndex(d => d.id === id);
      if (idx >= 0) {
        collection[idx] = { ...collection[idx], ...data };
      }
      return Promise.resolve();
    },
    delete: () => {
      const idx = collection.findIndex(d => d.id === id);
      if (idx >= 0) {
        collection.splice(idx, 1);
      }
      return Promise.resolve();
    }
  };
}

function buildCollectionAPI(collection, filters = []) {
  const api = {
    where: (field, operator, value) => buildCollectionAPI(collection, [...filters, { field, operator, value }]),
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
      // Permitir agregar con ID específico si se pasa en los datos
      const id = data.id || `doc_${collection.length + 1}`;
      // Si ya existe un documento con ese ID, no lo dupliques
      const exists = collection.find(d => d.id === id);
      if (!exists) {
        collection.push({ ...data, id });
      }
      return Promise.resolve({
        id,
        get: () => Promise.resolve({
          id,
          data: () => ({ ...data, id })
        })
      });
    }
  };
  return api;
}

function mockCollection(name) {
  const collection = getOrCreateCollection(name);
  return buildCollectionAPI(collection, []);
}

const db = {
  collection: (name) => mockCollection(name)
};

// Inicializar datos de prueba
function initializeTestData() {
  // Productos de prueba
  const productosCollection = getOrCreateCollection('productos');
  productosCollection.push({
    id: 'HE0001',
    nombre: 'Taladro',
    categoria: 'Herramientas Electricas',
    precio: [1000],
    fechaCreacion: new Date().toISOString()
  });

  // Usuarios de prueba
  const usuariosCollection = getOrCreateCollection('usuarios');
  usuariosCollection.push({
    id: 'user1',
    nombre: 'Usuario Prueba',
    correo: 'test@example.com',
    password: 'hashedPassword',
    rol: 'cliente'
  });

  // Carrito de prueba
  const carritoCollection = getOrCreateCollection('carritoTemporal');
  carritoCollection.push({
    id: 'cliente',
    items: []
  });

  // Pedidos de prueba
  const pedidosCollection = getOrCreateCollection('pedidos');
  pedidosCollection.push({
    id: 'pedido1',
    items: [],
    fecha: new Date().toISOString(),
    estado: 'pendiente'
  });
}

// Limpiar las colecciones antes de cada prueba
global.beforeEach && beforeEach(() => {
  Object.keys(mockCollections).forEach(key => {
    mockCollections[key] = [];
  });
  initializeTestData();
});

// Inicializar datos de prueba al cargar el mock
initializeTestData();

module.exports = { db };
