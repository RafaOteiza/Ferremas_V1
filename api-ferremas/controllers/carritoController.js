const carritoService = require('../services/carritoService');

exports.obtenerCarrito = async (req, res) => {
  try {
    const carrito = await carritoService.get();
    res.json(carrito);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
};

exports.agregarProducto = async (req, res) => {
  try {
    const resultado = await carritoService.add(req.body);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar producto' });
  }
};

exports.removerProducto = async (req, res) => {
  try {
    const resultado = await carritoService.remove(req.body.id);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error al remover producto' });
  }
};

exports.finalizarCompra = async (req, res) => {
  try {
    const resultado = await carritoService.finalize();
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error al finalizar compra' });
  }
};
