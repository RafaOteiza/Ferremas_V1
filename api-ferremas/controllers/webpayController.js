const pedidosService = require('../services/pedidosService');
const { WebpayPlus, Options, Environment } = require('transbank-sdk'); // Descomenta e instala el SDK oficial para integración real

const options = new Options(
  '597055555532', // Código de comercio de integración Webpay Plus
  '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C', // API Key de integración
  Environment.Integration
);

// Inicializar pago Webpay
exports.initPago = async (req, res) => {
  try {
    // 1. Generar ID correlativo (RET_XXXX o DES_XXXX) según tipoEntrega
    const tipoEntrega = req.body.tipoEntrega;
    const prefix = tipoEntrega === 'despacho' ? 'DES' : 'RET';
    const collection = require('../services/firebase').db.collection('pedidos');
    const snapshot = await collection.where('id', '>=', prefix + '_0000').where('id', '<', prefix + '_9999').get();
    let maxNum = 0;
    snapshot.forEach(doc => {
      const match = doc.id.match(/_(\d{4})$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const correlativo = (maxNum + 1).toString().padStart(4, '0');
    const pedidoId = `${prefix}_${correlativo}`;

    // 2. Crear pedido pendiente en Firestore con ese ID
    const datosPedido = {
      id: pedidoId,
      items: req.body.productos,
      total: req.body.total,
      tipoEntrega,
      estado: tipoEntrega === 'despacho' ? 'Pendiente por Despacho' : 'Pendiente por Retiro',
      fecha: new Date().toISOString(),
      usuario: {
        id: req.usuario.id,
        correo: req.usuario.correo,
        nombre: req.usuario.nombre
      }
    };
    await collection.doc(pedidoId).set(datosPedido);

    // 3. Crear transacción en Webpay Plus usando el ID correlativo como buyOrder
    const buyOrder = pedidoId;
    const sessionId = 'sesion_' + pedidoId;
    const returnUrl = 'http://localhost:4000/api/webpay/commit'; // Cambia esto según tu entorno

    const transaction = new WebpayPlus.Transaction(options);
    const response = await transaction.create(
      buyOrder,
      sessionId,
      datosPedido.total,
      returnUrl
    );

    // response.token y response.url
    res.json({ token: response.token, url: response.url, pedidoId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Confirmar pago Webpay (commit)
exports.confirmarPago = async (req, res) => {
  try {
    // Robustecer obtención del token
    let token = null;
    if (req.body && (req.body.token_ws || req.body.token)) token = req.body.token_ws || req.body.token;
    else if (req.query && (req.query.token_ws || req.query.token)) token = req.query.token_ws || req.query.token;
    console.log('Token recibido:', token);
    console.log('Body:', req.body);
    console.log('Query:', req.query);
    if (!token) {
      console.log('Redirecting with error: falta token');
      return res.redirect(`/pago_exitoso.html?error=falta_token`);
    }

    const transaction = new WebpayPlus.Transaction(options);
    let result;
    try {
      result = await transaction.commit(token);
      console.log('Resultado del commit:', result);
    } catch (err) {
      console.log('Error en commit:', err);
      console.log('Redirecting with error: commit');
      return res.redirect(`/pago_exitoso.html?error=commit`);
    }

    // Usar snake_case para los campos del resultado de Webpay
    const pedidoId = result.buy_order;
    // Buscar y actualizar el pedido usando buy_order como ID
    const collection = require('../services/firebase').db.collection('pedidos');
    const docRef = collection.doc(pedidoId);
    const doc = await docRef.get();
    if (doc.exists && result.status === 'AUTHORIZED') {
      await docRef.update({
        pagado: true,
        estado: 'pagado',
        fecha_pago: result.transaction_date || new Date().toISOString(),
        authorizationCode: result.authorization_code || '-',
        transactionDate: result.transaction_date || '-',
        paymentType: result.payment_type_code || '-',
        cardNumber: (result.card_detail && result.card_detail.card_number) ? result.card_detail.card_number : '-',
        responseCode: result.response_code || '-',
        vci: result.vci || '-',
        installmentsAmount: result.installments_amount || null,
        installmentsNumber: result.installments_number || null
      });
      console.log('Pedido actualizado en Firestore:', pedidoId);
    } else {
      console.log('No se encontró el pedido en Firestore o el pago no fue autorizado:', pedidoId, result.status);
    }

    if (pedidoId) {
      console.log('Redirecting with pedidoId:', pedidoId);
      return res.redirect(`/pago_exitoso.html?id=${pedidoId}`);
    } else {
      console.log('Redirecting with error: sin buyOrder');
      return res.redirect(`/pago_exitoso.html?error=sin_buyorder`);
    }
  } catch (error) {
    console.log('Error general en confirmarPago:', error);
    console.log('Redirecting with error: general');
    return res.redirect(`/pago_exitoso.html?error=general`);
  }
}; 