const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');

router.get('/', carritoController.obtenerCarrito);
router.post('/agregar', carritoController.agregarProducto);
router.post('/remover', carritoController.removerProducto);
router.post('/finalizar', carritoController.finalizarCompra);

module.exports = router;
