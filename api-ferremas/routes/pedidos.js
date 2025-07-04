const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

// 📦 Ver todos los pedidos (admin, vendedor, contador, bodeguero)
router.get(
  '/',
  verificarToken,
  verificarRol(['admin', 'vendedor', 'contador', 'bodeguero']),
  pedidosController.obtenerPedidos
);

// 🔍 Ver pedido por ID (acceso público)
router.get(
  '/:id',
  pedidosController.obtenerPedidoPorId
);

// 🛒 Crear pedido (cliente, bodeguero)
router.post(
  '/',
  verificarToken,
  verificarRol(['cliente', 'bodeguero']),
  pedidosController.crearPedido
);

// 🔄 Cambiar estado del pedido (admin, vendedor)
router.put(
  '/:id/estado',
  verificarToken,
  verificarRol(['admin', 'vendedor']),
  pedidosController.cambiarEstadoPedido
);

// 🔄 Marcar pedido como pagado (admin)
router.put(
  '/:id/pagar',
  verificarToken,
  verificarRol(['admin']),
  pedidosController.marcarPedidoComoPagado
);

// 🏷️ Actualizar tipo de entrega (cliente)
router.patch(
  '/:id/tipo-entrega',
  verificarToken,
  verificarRol(['cliente']),
  pedidosController.actualizarTipoEntrega
);

module.exports = router;
