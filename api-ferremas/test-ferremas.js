import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 5,
  duration: '30s',
};

const BASE_URL = 'http://localhost:4000/api';
const USER = {
  correo: 'mat.garrido@duocuc.cl',
  password: 'Knotfest.11'
};

export default function () {
  // 1. Login para obtener el token
  let loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify(USER), {
    headers: { 'Content-Type': 'application/json' }
  });
  check(loginRes, { 'login 200': (r) => r.status === 200 });
  let token = loginRes.json('token');
  check(token, { 'token recibido': (t) => !!t });
  let authHeaders = { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } };

  // 2. Renderizado del catálogo (no requiere token)
  let resCatalogo = http.get(`${BASE_URL}/productos`);
  check(resCatalogo, { 'catálogo 200': (r) => r.status === 200 });

  // 3. Agregar producto HE0001 al carrito
  let producto = {
    id: "HE0001",
    nombre: "Lijadora orbital eléctrica 200W",
    precio: 28990,
    cantidad: 1
  };
  let addRes = http.post(`${BASE_URL}/carrito/agregar`, JSON.stringify(producto), authHeaders);
  check(addRes, { 'producto agregado': (r) => r.status === 200 });

  // 4. Cargar el carrito
  let resCarrito = http.get(`${BASE_URL}/carrito`, authHeaders);
  check(resCarrito, { 'carrito 200': (r) => r.status === 200 });

  // 5. Iniciar pago Webpay (simula el flujo real)
  let usuario = {
    id: loginRes.json('usuario.id') || "User_001",
    correo: USER.correo,
    nombre: loginRes.json('usuario.nombre') || "Matias Garrido"
  };
  let productos = [producto];
  let total = producto.precio * producto.cantidad;
  let tipoEntrega = 'retiro_local';

  let initPayload = JSON.stringify({
    productos,
    total,
    usuario,
    tipoEntrega
  });

  let initRes = http.post(`${BASE_URL}/webpay/init`, initPayload, authHeaders);
  check(initRes, { 'webpay init 200': (r) => r.status === 200 });
  let pedidoId = initRes.json('pedidoId');
  check(pedidoId, { 'pedidoId recibido': (id) => !!id });

  // 6. Consultar el pedido en la API (debe ser público)
  let pedidoRes = http.get(`${BASE_URL}/pedidos/${pedidoId}`);
  check(pedidoRes, { 'pedido consultado': (r) => r.status === 200 });
  check(pedidoRes, { 'pedido tiene estado': (r) => !!r.json('estado') });

  sleep(1);
}