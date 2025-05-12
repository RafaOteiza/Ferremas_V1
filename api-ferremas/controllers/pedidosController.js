const pedidosService = require('../services/pedidosService');

exports.obtenerPedidos = async (req, res) => {
  try {
    const pedidos = await pedidosService.getAll();
    res.status(200).json(pedidos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

exports.obtenerPedidoPorId = async (req, res) => {
  try {
    const pedido = await pedidosService.getById(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.status(200).json(pedido);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pedido' });
  }
};

exports.crearPedido = async (req, res) => {
  try {
    const datos = {
      ...req.body,
      usuario: {
        id: req.usuario.id,
        correo: req.usuario.correo,
        nombre: req.usuario.nombre
      }
    };
    const nuevo = await pedidosService.create(datos);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear pedido' });
  }
};


exports.cambiarEstadoPedido = async (req, res) => {
  try {
    const actualizado = await pedidosService.updateEstado(req.params.id, req.body.estado);
    res.status(200).json(actualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar estado' });
  }
};
