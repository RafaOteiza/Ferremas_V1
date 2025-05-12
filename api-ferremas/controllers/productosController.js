const productosService = require('../services/productosService');

exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await productosService.getAll();
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

exports.obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await productosService.getById(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar producto' });
  }
};

exports.crearProducto = async (req, res) => {
  try {
    const nuevo = await productosService.create(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

exports.actualizarProducto = async (req, res) => {
  try {
    const actualizado = await productosService.update(req.params.id, req.body);
    res.status(200).json(actualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

exports.eliminarProducto = async (req, res) => {
  try {
    await productosService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};
