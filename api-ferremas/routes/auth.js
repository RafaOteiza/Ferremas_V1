const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middleware/authMiddleware');

router.post('/registro', authController.registrar);
router.post('/login', authController.login);
router.get('/perfil', verificarToken, authController.perfil);
router.post('/cambiar-password', verificarToken, authController.cambiarPassword);

module.exports = router;
