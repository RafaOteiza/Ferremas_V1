const pedidosService = require('../services/pedidosService');
const { db } = require('../services/firebase');

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

exports.marcarPedidoComoPagado = async (req, res) => {
  try {
    const actualizado = await pedidosService.marcarComoPagado(
      req.params.id,
      req.usuario.correo
    );
    res.status(200).json(actualizado);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error al marcar como pagado' });
  }
};

exports.actualizarTipoEntrega = async (req, res) => {
  try {
    const { tipoEntrega } = req.body;
    const id = req.params.id;
    // Determinar prefijo
    const prefix = tipoEntrega === 'despacho' ? 'DES' : 'RET';
    // Contar pedidos existentes con ese tipo
    const snapshot = await db.collection('pedidos').where('tipoEntrega', '==', tipoEntrega).get();
    const correlativo = (snapshot.size + 1).toString().padStart(4, '0');
    const codigoPedido = `${prefix}_${correlativo}`;
    // Actualizar tipo de entrega y código correlativo
    const actualizado = await pedidosService.updateTipoEntrega(id, tipoEntrega, codigoPedido);
    res.status(200).json(actualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
