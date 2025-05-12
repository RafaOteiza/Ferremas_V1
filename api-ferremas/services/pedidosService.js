const { db } = require('./firebase');
const collection = db.collection('pedidos');

exports.getAll = async () => {
  const snapshot = await collection.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

exports.getById = async (id) => {
  const doc = await collection.doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

exports.create = async (data) => {
  const pedido = {
    ...data,
    estado: 'pendiente',
    fecha: new Date().toISOString()
  };
  const docRef = await db.collection('pedidos').add(pedido);
  const newDoc = await docRef.get();
  return { id: newDoc.id, ...newDoc.data() };
};


exports.updateEstado = async (id, estado) => {
  await collection.doc(id).update({ estado });
  const updatedDoc = await collection.doc(id).get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
};
