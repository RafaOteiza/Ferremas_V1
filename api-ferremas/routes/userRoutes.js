const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

// Rutas de Usuarios
router.route('/')
  .get(verificarToken, verificarRol(['admin']), userController.getAllUsers) // Solo Admin puede obtener todos los usuarios
  .post(verificarToken, verificarRol(['admin']), userController.createUser); // Solo Admin puede crear usuarios

router.route('/:id')
  .get(verificarToken, verificarRol(['admin']), userController.getUserById) // Solo Admin puede obtener usuario por ID
  .put(verificarToken, verificarRol(['admin']), userController.updateUser) // Solo Admin puede actualizar usuarios
  .delete(verificarToken, verificarRol(['admin']), userController.deleteUser); // Solo Admin puede eliminar usuarios

module.exports = router; 