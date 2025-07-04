const express = require('express');
const router = express.Router();
const webpayController = require('../controllers/webpayController');
const { verificarToken } = require('../middleware/authMiddleware');

// Inicializar pago Webpay (crea pedido pendiente y retorna token/url)
router.post('/init', verificarToken, webpayController.initPago);

// Confirmar pago Webpay (commit)
router.get('/commit', webpayController.confirmarPago);
router.post('/commit', webpayController.confirmarPago);

module.exports = router; 