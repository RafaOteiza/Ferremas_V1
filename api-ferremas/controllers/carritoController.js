const carritoService = require('../services/carritoService');

exports.obtenerCarrito = async (req, res) => {
  try {
    const carrito = await carritoService.get(req.usuario.id);
    res.json(carrito);
  } catch (error) {
    console.error("❌ Error en carritoController:", error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
};

exports.agregarProducto = async (req, res) => {
  try {
    const producto = req.body;

    if (!producto || typeof producto !== 'object') {
      return res.status(400).json({ error: 'Datos del producto no válidos' });
    }

    const { id, nombre, precio, cantidad } = producto;

    if (!id || !nombre || !precio || !cantidad) {
      return res.status(400).json({ error: 'Faltan datos requeridos para agregar el producto' });
    }

    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({ error: 'ID de usuario no disponible. Autenticación requerida.' });
    }

    const carrito = await carritoService.add(req.usuario.id, producto);
    res.json(carrito);
  } catch (error) {
    console.error("❌ Error en carritoController:", error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
};

exports.removerProducto = async (req, res) => {
  try {
    const carrito = await carritoService.remove(req.usuario.id, req.body.id);
    res.json(carrito);
  } catch (error) {
    console.error("❌ Error en carritoController:", error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
};

exports.finalizarCompra = async (req, res) => {
  try {
    const { tipoEntrega } = req.body;
    const pedido = await carritoService.finalize(req.usuario.id, tipoEntrega);
    if (!pedido) {
      return res.status(400).json({ error: 'Carrito vacío' });
    }
    res.json(pedido);
  } catch (error) {
    console.error("❌ Error en carritoController:", error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
};

exports.vaciarCarrito = async (req, res) => {
  try {
    const carrito = await carritoService.vaciar(req.usuario.id);
    res.json(carrito);
  } catch (error) {
    console.error("❌ Error en carritoController:", error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
};

exports.actualizarCantidadProducto = async (req, res) => {
  try {
    const { id, cantidad } = req.body;

    if (!id || typeof cantidad === 'undefined' || cantidad < 0) {
      return res.status(400).json({ error: 'Datos de actualización de cantidad inválidos: ID o cantidad faltante/inválida.' });
    }

    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({ error: 'ID de usuario no disponible. Autenticación requerida.' });
    }

    const carritoActualizado = await carritoService.updateQuantity(req.usuario.id, id, cantidad);
    res.json(carritoActualizado);
  } catch (error) {
    console.error("❌ Error en carritoController (actualizarCantidadProducto):", error);
    res.status(500).json({ error: error.message || 'Error interno del servidor al actualizar la cantidad del producto.' });
  }
};
