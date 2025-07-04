const { db } = require('./firebase');

exports.getAll = async () => {
  const collection = db.collection('pedidos');
  const snapshot = await collection.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

exports.getById = async (id) => {
  if (!id) {
    throw new Error('ID de pedido requerido');
  }

  const collection = db.collection('pedidos');
  const doc = await collection.doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data();
  // Robustecer: asegurar que todos los campos relevantes estén presentes
  return {
    id: doc.id,
    ...data,
    authorizationCode: data.authorizationCode || '-',
    cardNumber: data.cardNumber || data.ultimos4 || '-',
    ultimos4: data.ultimos4 || '-',
    fecha_pago: data.fecha_pago || null,
    direccion: data.direccion || '-',
    usuario: data.usuario || { nombre: '-', correo: '-' },
    items: Array.isArray(data.items) ? data.items : [],
    estado: data.estado || '-',
    tipoEntrega: data.tipoEntrega || '-',
    fecha: data.fecha || null,
    total: data.total || null
  };
};

exports.create = async (data) => {
  if (!data || !data.items || !data.items.length || !data.tipoEntrega) {
    throw new Error('Datos de pedido inválidos (falta tipoEntrega)');
  }
  const collection = db.collection('pedidos');
  // Generar correlativo
  const prefix = data.tipoEntrega === 'despacho' ? 'DES' : 'RET';
  const snapshot = await collection.where('tipoEntrega', '==', data.tipoEntrega).get();
  const correlativo = (snapshot.size + 1).toString().padStart(4, '0');
  const codigoPedido = `${prefix}_${correlativo}`;
  // Preparar estructura final
  const pedido = {
    ...data,
    id: codigoPedido,
    estado: data.tipoEntrega === 'despacho' ? 'Pendiente por Despacho' : 'Pendiente por Retiro',
    fecha: new Date().toISOString()
  };
  // Crear el documento con el ID correlativo
  const docRef = collection.doc(codigoPedido);
  await docRef.set(pedido);
  const newDoc = await docRef.get();
  return { id: newDoc.id, ...newDoc.data() };
};

exports.updateEstado = async (id, estado) => {
  if (!id || !estado) {
    throw new Error('ID y estado son requeridos');
  }

  const estadosValidos = ['pendiente', 'en_proceso', 'completado', 'cancelado'];
  if (!estadosValidos.includes(estado)) {
    throw new Error('Estado no válido');
  }

  const collection = db.collection('pedidos');
  const docRef = collection.doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error('Pedido no encontrado');
  }

  await docRef.update({ estado });
  const updatedDoc = await docRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

exports.marcarComoPagado = async (id, confirmadoPor) => {
  const docRef = db.collection('pedidos').doc(id);
  const doc = await docRef.get();

  if (!doc.exists) throw new Error('Pedido no encontrado');

  await docRef.update({
    pagado: true,
    estado: 'pagado',
    confirmado_por: confirmadoPor,
    fecha_pago: new Date().toISOString()
  });

  const actualizado = await docRef.get();
  return { id: actualizado.id, ...actualizado.data() };
};

exports.updateTipoEntrega = async (id, tipoEntrega, codigoPedido) => {
  if (!id || !tipoEntrega) {
    throw new Error('ID y tipo de entrega son requeridos');
  }
  const tiposValidos = ['despacho', 'retiro_local'];
  if (!tiposValidos.includes(tipoEntrega)) {
    throw new Error('Tipo de entrega no válido');
  }
  const docRef = db.collection('pedidos').doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error('Pedido no encontrado');

  // Actualizar solo los campos necesarios, manteniendo el ID original
  const updateData = {
    tipoEntrega,
    codigoPedido,
    estado: tipoEntrega === 'despacho' ? 'Pendiente por Despacho' : 'Pendiente por Retiro',
  };
  await docRef.update(updateData);

  const actualizado = await docRef.get();
  return { id: actualizado.id, ...actualizado.data() };
};
