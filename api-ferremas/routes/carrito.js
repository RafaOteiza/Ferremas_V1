const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

router.get('/', verificarToken, verificarRol(['cliente', 'admin']), carritoController.obtenerCarrito);
router.post('/agregar', verificarToken, verificarRol(['cliente']), carritoController.agregarProducto);
router.post('/remover', verificarToken, verificarRol(['cliente']), carritoController.removerProducto);
router.post('/finalizar', verificarToken, verificarRol(['cliente']), carritoController.finalizarCompra);
router.post('/vaciar', verificarToken, verificarRol(['cliente']), carritoController.vaciarCarrito);
router.post('/actualizarCantidad', verificarToken, verificarRol(['cliente']), carritoController.actualizarCantidadProducto);

module.exports = router;
