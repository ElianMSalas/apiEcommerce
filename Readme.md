# Ecommerce API

API RESTful completa para un sistema de ecommerce con autenticación, gestión de productos, carrito de compras, procesamiento de órdenes y pagos con Stripe.

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-5.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)
![Stripe](https://img.shields.io/badge/Stripe-Payment-blueviolet)
![License](https://img.shields.io/badge/license-MIT-green)

## Características

- ✅ **Autenticación JWT** - Registro, login, refresh tokens y gestión de sesiones
- ✅ **Gestión de Productos** - CRUD completo con búsqueda, filtros y paginación
- ✅ **Upload de Imágenes** - Integración con Cloudinary (hasta 5 imágenes por producto)
- ✅ **Categorías** - Organización jerárquica de productos
- ✅ **Carrito de Compras** - Sistema completo con validación de stock
- ✅ **Órdenes** - Creación, seguimiento y gestión de órdenes
- ✅ **Pagos con Stripe** - Checkout seguro, webhooks y confirmaciones
- ✅ **Sistema de Roles** - Permisos granulares (user/admin)
- ✅ **Documentación Swagger** - API docs interactiva y completa
- ✅ **Validación Robusta** - Validación de datos con Joi
- ✅ **Gestión de Stock** - Control automático de inventario

## Tecnologías

| Tecnología | Uso |
|------------|-----|
| **Node.js** | Runtime de JavaScript |
| **Express** | Framework web minimalista |
| **PostgreSQL** | Base de datos relacional |
| **Sequelize** | ORM para PostgreSQL |
| **JWT** | Autenticación basada en tokens |
| **Stripe** | Procesamiento de pagos |
| **Cloudinary** | Almacenamiento de imágenes |
| **Swagger** | Documentación automática de API |
| **Bcrypt** | Hash de contraseñas |
| **Joi** | Validación de esquemas |
| **Multer** | Manejo de archivos multipart |

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.x ([Descargar](https://nodejs.org/))
- **PostgreSQL** >= 14.x ([Descargar](https://www.postgresql.org/download/))
- **npm** o **yarn**
- Cuenta de **Stripe** ([Registrarse](https://stripe.com))
- Cuenta de **Cloudinary** ([Registrarse](https://cloudinary.com))

## Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/ecommerce-api.git
cd ecommerce-api
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
```env
# ======================
# SERVER CONFIGURATION
# ======================
NODE_ENV=development
PORT=3000

# ======================
# DATABASE (PostgreSQL)
# ======================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=tu_password_seguro

# ======================
# JWT AUTHENTICATION
# ======================
JWT_SECRET=tu_jwt_secret_super_seguro_cambiar_en_produccion
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro_cambiar_en_produccion
JWT_REFRESH_EXPIRES_IN=30d

# ======================
# CLOUDINARY (Imágenes)
# ======================
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# ======================
# STRIPE (Pagos)
# ======================
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_de_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_de_stripe
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_de_stripe
STRIPE_SUCCESS_URL=http://localhost:3000/api/payments/success
STRIPE_CANCEL_URL=http://localhost:3000/api/payments/cancel

# ======================
# FRONTEND (Opcional)
# ======================
FRONTEND_URL=http://localhost:5173
```

### 4. Crear la base de datos

**Opción A: Desde psql**
```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE ecommerce_db;

# Salir
\q
```

**Opción B: Desde pgAdmin**
1. Abre pgAdmin
2. Click derecho en "Databases"
3. Create → Database
4. Name: `ecommerce_db`
5. Save

### 5. Iniciar el servidor

**Modo desarrollo (con auto-reload):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

El servidor estará corriendo en:
```
http://localhost:3000
Documentación: http://localhost:3000/api-docs
```

## Documentación de la API

Una vez iniciado el servidor, accede a la documentación interactiva de Swagger:

**[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

Desde Swagger puedes:
- Ver todos los endpoints disponibles
- Probar cada endpoint directamente
- Ver ejemplos de request/response
- Autenticarte con tu token JWT

## Endpoints Principales

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario | No |
| `POST` | `/api/auth/login` | Iniciar sesión | No |
| `POST` | `/api/auth/refresh` | Refrescar token | No |
| `POST` | `/api/auth/logout` | Cerrar sesión | Sí |
| `GET` | `/api/auth/me` | Obtener usuario actual | Sí |

### Productos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/products` | Listar productos (filtros, búsqueda, paginación) | No |
| `GET` | `/api/products/:slug` | Obtener producto por slug | No |
| `POST` | `/api/products` | Crear producto | Admin |
| `PUT` | `/api/products/:id` | Actualizar producto | Admin |
| `DELETE` | `/api/products/:id` | Eliminar producto | Admin |

**Query params para GET /api/products:**
- `page` - Número de página (default: 1)
- `limit` - Resultados por página (default: 12)
- `search` - Buscar por nombre o descripción
- `category` - Filtrar por slug de categoría
- `minPrice` - Precio mínimo
- `maxPrice` - Precio máximo
- `sort` - Ordenar: `price_asc`, `price_desc`, `name_asc`, `name_desc`, `newest`

### Categorías

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/categories` | Listar categorías | No |
| `GET` | `/api/categories/:slug` | Obtener categoría por slug | No |
| `POST` | `/api/categories` | Crear categoría | Admin |
| `PUT` | `/api/categories/:id` | Actualizar categoría | Admin |
| `DELETE` | `/api/categories/:id` | Eliminar categoría | Admin |

### Carrito

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/cart` | Obtener mi carrito | Sí |
| `POST` | `/api/cart/items` | Agregar producto al carrito | Sí |
| `PUT` | `/api/cart/items/:productId` | Actualizar cantidad | Sí |
| `DELETE` | `/api/cart/items/:productId` | Eliminar producto | Sí |
| `DELETE` | `/api/cart` | Vaciar carrito | Sí |

### Órdenes

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/orders/my-orders` | Mis órdenes | Sí |
| `GET` | `/api/orders/my-orders/:orderNumber` | Detalle de orden | Sí |
| `POST` | `/api/orders` | Crear orden desde carrito | Sí |
| `PUT` | `/api/orders/:orderNumber/cancel` | Cancelar orden | Sí |
| `GET` | `/api/orders` | Todas las órdenes | Admin |
| `PUT` | `/api/orders/:orderNumber/status` | Actualizar estado | Admin |

**Estados de órdenes:**
- `pending` - Pendiente de pago
- `paid` - Pagada
- `processing` - En proceso
- `shipped` - Enviada
- `delivered` - Entregada
- `cancelled` - Cancelada
- `refunded` - Reembolsada

### Pagos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/payments/create-checkout-session` | Crear sesión de pago | Sí |
| `GET` | `/api/payments/status/:orderId` | Estado del pago | Sí |
| `GET` | `/api/payments/success` | Página de éxito | No |
| `GET` | `/api/payments/cancel` | Página de cancelación | No |
| `POST` | `/api/payments/webhook` | Webhook de Stripe | No |

## Autenticación

La API usa **JWT (JSON Web Tokens)** para autenticación.

### 1. Registrar usuario
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Iniciar sesión
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@ejemplo.com",
  "password": "password123"
}
```

### 3. Usar el token

Incluye el token en el header `Authorization` de cada petición protegida:
```bash
GET /api/cart
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Roles y Permisos

### Usuario Normal (`user`)
Ver productos y categorías  
Gestionar su carrito  
Crear y ver sus órdenes  
Cancelar sus órdenes (solo pending/paid)  
Procesar pagos  

### Administrador (`admin`)
Todo lo anterior +  
Crear, editar y eliminar productos  
Crear, editar y eliminar categorías  
Ver todas las órdenes del sistema  
Actualizar estado de cualquier orden  

### Crear un usuario administrador

Por defecto, todos los usuarios se registran como `user`. Para crear un admin:

**Opción 1: Desde la base de datos**
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@ejemplo.com';
```

**Opción 2: Registrar y luego actualizar manualmente**
1. Regístrate normalmente
2. Actualiza el rol en la BD
3. Vuelve a hacer login para obtener nuevo token

## Configuración de Stripe

### 1. Obtener API Keys

1. Crea una cuenta en [Stripe](https://stripe.com)
2. Ve a **Developers → API Keys**
3. Copia:
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...)
4. Pégalas en tu `.env`

### 2. Configurar Webhook (Desarrollo Local)

**Instalar Stripe CLI:**
```bash
# Mac
brew install stripe/stripe-cli/stripe

# Windows (Scoop)
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_X.X.X_linux_x86_64.tar.gz
tar -xvf stripe_X.X.X_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

**Autenticar y escuchar webhooks:**
```bash
# Autenticar
stripe login

# Escuchar webhooks (deja esto corriendo en una terminal)
stripe listen --forward-to localhost:3000/api/payments/webhook
```

Copia el **webhook signing secret** (`whsec_...`) y agrégalo a tu `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui
```

### 3. Flujo de Pago Completo

1. **Usuario crea orden**
```bash
   POST /api/orders
```

2. **Usuario solicita pagar**
```bash
   POST /api/payments/create-checkout-session
   Body: { "orderId": "uuid-de-la-orden" }
```

3. **Backend retorna URL de Stripe**
```json
   {
     "sessionId": "cs_test_...",
     "url": "https://checkout.stripe.com/pay/cs_test_..."
   }
```

4. **Usuario completa pago en Stripe**
   - Stripe redirige a `success_url` o `cancel_url`

5. **Stripe envía webhook**
   - Backend recibe notificación
   - Actualiza orden: `status = 'paid'`, `paymentStatus = 'completed'`

6. **Usuario verifica estado**
```bash
   GET /api/payments/status/:orderId
```

## Testing con Postman

### Importar colección

1. Inicia el servidor
2. Ve a: `http://localhost:3000/api-docs.json`
3. En Postman: Import → Link → Pega la URL
4. Click "Import"

### Configurar variables de entorno

Crea un entorno en Postman con:
```
base_url = http://localhost:3000
auth_token = (se auto-completa al hacer login)
admin_token = (token de usuario admin)
product_id = (ID de un producto de prueba)
order_id = (ID de una orden de prueba)
```

### Flujo de prueba completo

1. **Registrar usuario**: `POST /api/auth/register`
2. **Login** (guarda token): `POST /api/auth/login`
3. **Listar productos**: `GET /api/products`
4. **Ver detalle**: `GET /api/products/:slug`
5. **Agregar al carrito**: `POST /api/cart/items`
6. **Ver carrito**: `GET /api/cart`
7. **Crear orden**: `POST /api/orders`
8. **Iniciar pago**: `POST /api/payments/create-checkout-session`
9. **Ver mis órdenes**: `GET /api/orders/my-orders`

## Estructura del Proyecto
```
ecommerce-api/
│
├── src/
│   ├── config/
│   │   ├── database.js          # Configuración de Sequelize/PostgreSQL
│   │   ├── cloudinary.js        # Config y multer para Cloudinary
│   │   ├── stripe.js            # Inicialización de Stripe
│   │   └── swagger.js           # Definición de documentación OpenAPI
│   │
│   ├── controllers/
│   │   ├── auth.controller.js   # Login, registro, refresh
│   │   ├── product.controller.js # CRUD de productos
│   │   ├── category.controller.js # CRUD de categorías
│   │   ├── cart.controller.js   # Gestión del carrito
│   │   ├── order.controller.js  # Creación y gestión de órdenes
│   │   └── payment.controller.js # Stripe checkout y webhooks
│   │
│   ├── middleware/
│   │   ├── auth.js              # authenticate & authorizeAdmin
│   │   └── validate.js          # Validación con Joi
│   │
│   ├── models/
│   │   ├── User.js              # Modelo de usuario
│   │   ├── Product.js           # Modelo de producto
│   │   ├── Category.js          # Modelo de categoría
│   │   ├── Order.js             # Modelo de orden
│   │   ├── OrderItem.js         # Items de la orden
│   │   └── index.js             # Asociaciones y exportación
│   │
│   ├── routes/
│   │   ├── auth.routes.js       # Rutas de autenticación
│   │   ├── product.routes.js    # Rutas de productos
│   │   ├── category.routes.js   # Rutas de categorías
│   │   ├── cart.routes.js       # Rutas del carrito
│   │   ├── order.routes.js      # Rutas de órdenes
│   │   └── payment.routes.js    # Rutas de pagos
│   │
│   └── utils/
│       ├── cart.js              # Lógica del carrito en memoria
│       └── helpers.js           # Funciones auxiliares
│
├── .env                         # Variables de entorno (NO SUBIR)
├── .gitignore                   # Archivos ignorados por git
├── package.json                 # Dependencias del proyecto
├── server.js                    # Punto de entrada de la app
└── README.md                    # Este archivo
```

## Deployment

### Preparación

**1. Variables de entorno:**
- No uses valores por defecto en producción
- Genera secrets seguros: `openssl rand -base64 32`
- Usa claves de producción de Stripe

**2. Base de datos:**
- Usa PostgreSQL en la nube (Railway, Neon, Supabase)
- Configura backups automáticos

**3. Webhook de Stripe:**
- Configura endpoint: `https://tu-dominio.com/api/payments/webhook`
- Usa webhook secret de producción

### Deploy en Railway
```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Agregar PostgreSQL
railway add

# Configurar variables de entorno
railway variables

# Deploy
railway up
```

### Deploy en Render

1. Crea cuenta en [Render](https://render.com)
2. New → Web Service
3. Conecta repositorio de GitHub
4. Configuración:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Agrega variables de entorno
6. Add PostgreSQL database
7. Deploy

### Deploy en Heroku
```bash
# Login
heroku login

# Crear app
heroku create tu-app-ecommerce

# Agregar PostgreSQL
heroku addons:create heroku-postgresql:mini

# Configurar variables
heroku config:set JWT_SECRET=tu_secret
heroku config:set STRIPE_SECRET_KEY=sk_live_...
# ... resto de variables

# Deploy
git push heroku main

# Abrir app
heroku open
```

## Scripts Disponibles
```json
{
  "start": "node server.js",           // Producción
  "dev": "nodemon server.js",          // Desarrollo con auto-reload
  "test": "jest",                      // Ejecutar tests (si existen)
  "db:migrate": "npx sequelize-cli db:migrate",  // Correr migraciones
  "db:seed": "npx sequelize-cli db:seed:all"     // Ejecutar seeders
}
```

## Solución de Problemas

### Error: Cannot connect to database

**Solución:**
```bash
# Verifica que PostgreSQL esté corriendo
sudo service postgresql status

# Inicia PostgreSQL si está detenido
sudo service postgresql start

# Verifica credenciales en .env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tu_password_correcto
```

### Error: Stripe webhook signature verification failed

**Solución:**
```bash
# Verifica STRIPE_WEBHOOK_SECRET en .env
# En desarrollo, debe coincidir con el output de:
stripe listen --forward-to localhost:3000/api/payments/webhook

# El webhook secret cambia cada vez que ejecutas stripe listen
# Cópialo y actualiza .env
```

### Error: Cloudinary upload failed

**Solución:**
```env
# Verifica credenciales en .env
CLOUDINARY_CLOUD_NAME=tu_cloud_name_exacto
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Las credenciales están en:
# Dashboard de Cloudinary → Settings → Account
```

### Error: Port 3000 already in use

**Solución:**
```bash
# Encuentra proceso usando el puerto
lsof -i :3000

# Mata el proceso
kill -9 PID_DEL_PROCESO

# O cambia el puerto en .env
PORT=3001
```

### Error: JWT malformed

**Solución:**
```bash
# Asegúrate de enviar el token correctamente:
Authorization: Bearer tu_token_aqui

# NO incluyas "Bearer" dos veces
# NO agregues espacios extra
```

## Base de Datos

### Diagrama ER Simplificado
```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   User      │       │   Product    │       │  Category   │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id          │       │ id           │       │ id          │
│ name        │       │ name         │──────▶│ name        │
│ email       │       │ price        │       │ slug        │
│ password    │       │ stock        │       │ description │
│ role        │       │ images[]     │       └─────────────┘
└─────────────┘       │ categoryId   │
      │               └──────────────┘
      │                      │
      ▼                      │
┌─────────────┐             │
│   Order     │             │
├─────────────┤             │
│ id          │             │
│ orderNumber │             │
│ userId      │             │
│ status      │             │
│ total       │             │
└─────────────┘             │
      │                      │
      ▼                      │
┌──────────────┐            │
│  OrderItem   │            │
├──────────────┤            │
│ id           │            │
│ orderId      │            │
│ productId    │────────────┘
│ quantity     │
│ unitPrice    │
└──────────────┘
```

## Seguridad

### Implementado

Bcrypt para hash de contraseñas  
JWT para autenticación stateless  
Helmet para headers de seguridad  
CORS configurado  
Validación de inputs con Joi  
SQL injection protegido (Sequelize ORM)  

## Autor

**Tu Nombre**
- GitHub: [@elianmsalas](https://github.com/elianmsalas)
- Email: emunozsalas@icloud.com
- LinkedIn: [Tu Perfil](https://linkedin.com/in/elianmsalas)

## Soporte

¿Necesitas ayuda?

- **Email:** emunozsalas@icloud.com
## Agradecimientos

Este proyecto fue construido usando:

- [Express.js](https://expressjs.com/) - Framework web
- [Sequelize](https://sequelize.org/) - ORM para SQL
- [Stripe](https://stripe.com/) - Procesamiento de pagos
- [Cloudinary](https://cloudinary.com/) - Gestión de imágenes
- [Swagger](https://swagger.io/) - Documentación de API
- [JWT.io](https://jwt.io/) - Autenticación con tokens

## Roadmap

### v1.1.0 (Próximamente)
- [ ] Sistema de reviews y ratings
- [ ] Wishlist/Lista de deseos
- [ ] Sistema de cupones y descuentos
- [ ] Notificaciones por email (Nodemailer)

### v1.2.0 (Futuro)
- [ ] Dashboard de administración
- [ ] Estadísticas y reportes
- [ ] Gestión de múltiples direcciones
- [ ] Histórico de búsquedas

### v2.0.0 (En consideración)
- [ ] Sistema de reseñas con imágenes
- [ ] Chat de soporte
- [ ] Programa de puntos/lealtad
- [ ] Multi-idioma
- [ ] Multi-moneda

## Estado del Proyecto

![Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Maintenance](https://img.shields.io/badge/maintained-yes-green.svg)

**Última actualización:** Febrero 2024  
**Versión estable:** v1.0.0  

---

<div align="center">

Este proyecto incluye claves de prueba de Stripe.  
Para producción, asegúrate de usar claves reales y configurar HTTPS/SSL.

[⬆ Volver arriba](#-ecommerce-api)

</div>