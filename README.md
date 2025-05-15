# Ferremas_V1
# 🛒 FERREMAS – Sistema de E-Commerce con API RESTful + Frontend

FERREMAS es una aplicación de e-commerce modular construida con Node.js y Firebase en el backend, y un frontend HTML/Bootstrap para visualizar y gestionar productos, pedidos y usuarios autenticados.

---

## 📁 Estructura del Proyecto

```
INTEGRACION DE PLATAFORMAS/
│
├── api-ferremas/               # Backend RESTful
│   ├── controllers/            # Controladores por recurso
│   ├── docs/                   # Documentación (Swagger)
│   ├── middleware/             # JWT y validaciones
│   ├── node_modules/
│   ├── routes/                 # Definición de rutas
│   ├── scripts/                # Scripts opcionales
│   ├── services/               # Lógica de negocio
│   ├── app.js                  # Archivo principal del backend
│   ├── swagger.js              # Configuración de Swagger
│   ├── package.json
│   └── .env                    # Variables de entorno
│
├── fronted-ferremas/           # Frontend web (actualmente se usa index.html)
│   ├── imagenes/
│   ├── js/
│   ├── Productos/
│   ├── index.html              # Página principal
│   └── [otras vistas por rol, no activas]
│
└── README.md
```

---

## ⚙️ Instalación y Uso

### 1. Clonar el repositorio

```bash
git clone https://github.com/RafaOteiza/Ferremas_V1.git
cd Ferremas_V1/api-ferremas
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar entorno

Crear archivo `.env` con tus credenciales de Firebase:

```
PORT=4000
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=...
```

### 4. Iniciar servidor

```bash
npm start
```

- API disponible en: `http://localhost:4000`
- Documentación Swagger: `http://localhost:4000/api-docs`

---

## 🧪 Pruebas y Demostración

1. `POST /api/auth/login` → Obtener token JWT  
2. `GET /api/productos` → Ver catálogo  
3. `POST /api/carrito/agregar` → Agregar producto  
4. `POST /api/carrito/finalizar` → Generar pedido  
5. `GET /api/pedidos` → Consultar pedidos

👉 Usa encabezado:  
`Authorization: Bearer <token>`

---

## 🌐 Frontend

Abrir con Live Server:  
`fronted-ferremas/index.html`

Funcionalidades disponibles:
- Visualización de productos
- Carrito de compras
- Resumen y compra final vía API

---

## 📄 Swagger UI

La documentación está disponible en:

```text
http://localhost:4000/api-docs
```

Incluye todos los endpoints REST organizados por módulo:  
auth, productos, pedidos, carrito.

---

## 👥 Autores

- Rafael Oteiza  
- Matías Garrido  
- Luis Arenas
