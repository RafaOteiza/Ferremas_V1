
# 🛒 FERREMAS – Sistema de E-Commerce Modular con API RESTful y Frontend Integrado

FERREMAS es una plataforma e-commerce diseñada para digitalizar las operaciones de una ferretería tradicional, integrando procesos de ventas, stock, autenticación de usuarios y generación de pedidos. El sistema permite a clientes comprar en línea y a distintos roles internos (admin, vendedor, bodeguero, contador) operar desde una intranet conectada.

---

## 📦 Tecnologías y Arquitectura

- **Backend:** Node.js + Express
- **Base de Datos:** Firebase (Cloud Firestore)
- **Frontend:** HTML + CSS + Bootstrap + JS puro
- **Documentación API:** Swagger (OpenAPI 3.0)
- **Seguridad:** Autenticación JWT, control por roles
- **Pruebas:** Cypress, Postman, K6 (rendimiento)

---

## 📁 Estructura del Proyecto

```
FERREMAS_V1/
│
├── api-ferremas/               # Backend modular con documentación Swagger
│   ├── controllers/            # Lógica de control por módulo
│   ├── services/               # Reglas de negocio
│   ├── middleware/             # Autenticación y validación
│   ├── routes/                 # Endpoints RESTful
│   ├── docs/                   # Swagger UI
│   └── app.js / swagger.js     # Configuración y carga de rutas
│
├── fronted-ferremas/           # Frontend HTML + Bootstrap
│   ├── index.html              # Sitio público con login y carrito
│   ├── cliente.html            # Vista cliente autenticado
│   ├── js/                     # Lógica JS separada por módulos
│   ├── imagenes/
│   └── otras vistas (admin, vendedor, etc.)
│
├── cypress/                    # Pruebas automatizadas E2E
├── Casos_Prueba_Integracion_Ferremas.xlsx
└── README.md
```

---

## ⚙️ Instalación y Ejecución

### 1. Clona el repositorio

```bash
git clone https://github.com/RafaOteiza/Ferremas_V1.git
cd Ferremas_V1/api-ferremas
```

### 2. Instala dependencias

```bash
npm install
```

### 3. Configura el archivo `.env`

```env
PORT=4000
FIREBASE_PROJECT_ID=ferremas-xxxxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=xxxxx@ferremas.iam.gserviceaccount.com
```

### 4. Inicia el servidor

```bash
npm start
```

La API estará disponible en: `http://localhost:4000`  
Swagger UI: `http://localhost:4000/api-docs`

---

## 🧪 Casos de Prueba Automatizados (Cypress)

Casos destacados:

- ✅ Login, catálogo, carrito y compra completa
- ✅ Control visual + validación backend de stock
- ✅ Protección de rutas con JWT y roles
- ✅ Pruebas de rendimiento con K6 (concurrentes)
- ✅ Seguridad frente a manipulación del localStorage

Para ejecutar Cypress:

```bash
npx cypress open
```

---

## 🔐 Endpoints Principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST   | `/api/auth/login`     | Iniciar sesión y obtener JWT |
| GET    | `/api/productos`      | Listar productos |
| POST   | `/api/carrito/agregar`| Agregar al carrito |
| POST   | `/api/carrito/finalizar` | Confirmar pedido |
| GET    | `/api/pedidos`        | Listar pedidos por usuario |

Agregar header:  
```http
Authorization: Bearer <JWT_token>
```

---

## 🌐 Frontend

Abrir con navegador o Live Server desde:

```bash
fronted-ferremas/index.html
```

Funcionalidades:
- Visualizar productos
- Buscar y filtrar
- Agregar al carrito con control de stock
- Login/registro desde modal
- Finalización de compra con resumen

---

## 📑 Documentación API (Swagger)

Acceso local:

```
http://localhost:4000/api-docs
```

Incluye:
- Schemas
- Rutas agrupadas por recurso
- Ejemplos de entrada/salida
- Seguridad JWT

---

## 👥 Autores

- Rafael Oteiza  
- Matías Garrido  
- Luis Arenas

---

> Proyecto desarrollado para la asignatura **ASY5131 – Integración de Plataformas** en DUOC UC.
