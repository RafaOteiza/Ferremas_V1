const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { db } = require('./services/firebase');
const path = require('path');

dotenv.config();

const app = express();

// ✅ Middleware global con origen permitido
app.use(cors({
  origin: '*' // Permitir todos los orígenes para desarrollo/pruebas
}));
app.use(express.json());

// 🔍 Ruta de prueba: conexión simple
app.get('/ping', (req, res) => {
  res.send('pong');
});

// 🔧 Ruta raíz
app.get('/', (req, res) => {
  res.send('API FERREMAS operativa ✅');
});

// 🔥 Test conexión Firebase
app.get('/test-firebase', async (req, res) => {
  console.log('📡 Ruta /test-firebase llamada');

  try {
    const snapshot = await db.collection('productos').get();
    const productos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('🧾 Productos encontrados:', productos);
    res.status(200).json(productos);
  } catch (error) {
    console.error('❌ Error al conectar con Firebase:', error);
    res.status(500).json({ error: 'Error al conectar con Firebase' });
  }
});

// 📘 Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 📦 Rutas de la API
const productosRoutes = require('./routes/productos');
app.use('/api/productos', productosRoutes);

const carritoRoutes = require('./routes/carrito');
app.use('/api/carrito', carritoRoutes);

const pedidosRoutes = require('./routes/pedidos');
app.use('/api/pedidos', pedidosRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const webpayRoutes = require('./routes/webpay');
app.use('/api/webpay', webpayRoutes);

// 🔁 Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

app.use(express.static(path.join(__dirname, '../fronted-ferremas')));
