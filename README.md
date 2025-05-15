# Ferremas_V1
# 🛒 FERREMAS – Sistema de E-Commerce con API RESTful + Frontend

**FERREMAS** es una solución de comercio electrónico modular construida con Node.js y Firebase en el backend, 
y un frontend HTML/Bootstrap que permite gestionar productos, pedidos y autenticación de usuarios mediante JWT.

---

## 🧱 Estructura del Proyecto

INTEGRACION DE PLATAFORMAS/
│
├── api-ferremas/ # Backend API RESTful
│ ├── controllers/ # Lógica por recurso (productos, auth, etc.)
│ ├── docs/ # Documentación (Swagger)
│ ├── middleware/ # Autenticación, validaciones
│ ├── routes/ # Rutas por módulo
│ ├── scripts/ # Carga inicial (opcional)
│ ├── services/ # Lógica de acceso a datos (Firebase)
│ ├── app.js # Archivo principal
│ ├── swagger.js # Configuración Swagger UI
│ └── .env # Variables de entorno
│
├── fronted-ferremas/ # Frontend del e-commerce
│ ├── imagenes/ # Recursos gráficos
│ ├── js/ # Lógica de frontend
│ ├── Productos/ # Vista y lógica para productos
│ ├── index.html # Página principal del e-commerce
│ └── [otros .html no utilizados actualmente]
│
└── README.md

yaml
Copiar
Editar

---

## ⚙️ Instalación y uso

### 1. Clonar el repositorio

```bash
git clone https://github.com/RafaOteiza/Ferremas_V1.git
cd Ferremas_V1/api-ferremas
2. Instalar dependencias
bash
Copiar
Editar
npm install
3. Configurar variables de entorno
Crea un archivo .env con tus credenciales de Firebase:

ini
Copiar
Editar
PORT=4000
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=...
4. Iniciar servidor
bash
Copiar
Editar
npm start
La API estará disponible en: http://localhost:4000
Swagger UI: http://localhost:4000/api-docs

🧪 Pruebas y demostración
Flujo sugerido en Postman o Swagger:
POST /api/auth/login → Obtener token JWT

GET /api/productos → Ver catálogo

POST /api/carrito/agregar → Agregar productos

POST /api/carrito/finalizar → Crear pedido

GET /api/pedidos → Ver pedidos (según rol)

🔐 Usa el token en rutas protegidas:
Authorization: Bearer <token>

🌐 Frontend
Abrir fronted-ferremas/index.html con Live Server de VSCode.
Desde ahí se puede:

Ver productos desde la API

Agregar al carrito

Finalizar compra (llamando a la API)

📄 Documentación Swagger
Disponible en:
👉 http://localhost:4000/api-docs
Contiene todos los endpoints documentados con ejemplos.

👥 Autores
Rafael Oteiza
Matías Garrido
Luis Arenas
