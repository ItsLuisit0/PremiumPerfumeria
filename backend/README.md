# Backend - Perfumería Premium API

API RESTful para el sistema de e-commerce de Perfumería Premium.

## 🚀 Stack Tecnológico

- **Node.js** 18.x
- **Express** 4.18
- **MySQL** 8.0
- **JWT** para autenticación
- **bcryptjs** para hash de contraseñas
- **express-validator** para validación

## 📁 Estructura

```
backend/
├── src/
│   ├── app.js                 # Punto de entrada
│   ├── controllers/           # Lógica de negocio
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── perfumeController.js
│   │   └── reviewController.js
│   ├── routes/                # Definición de rutas
│   │   ├── admin.js
│   │   └── perfumes.js
│   ├── middleware/            # Middlewares
│   │   └── auth.js            # Autenticación JWT
│   ├── db/                    # Configuración de BD
│   │   └── db.js
│   └── ImagenesPerfumes/      # Imágenes de productos
├── scripts/                   # Scripts de utilidad
│   ├── createAdmin.js
│   ├── createAdminSimple.js
│   └── updateAdmin.js
├── package.json
└── .env.example
```

## 🔧 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
nano .env  # Editar con tus valores
```

## ⚙️ Configuración

Edita el archivo `.env`:

```env
NODE_ENV=development
PORT=3000

# Base de datos
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=tu-password
MYSQL_DATABASE=perfumeria2
MYSQL_PORT=3306

# Seguridad
JWT_SECRET=tu-secret-super-seguro
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📊 Base de Datos

Estructura de tablas principales:

- `perfumes` - Catálogo de productos
- `reseñas` - Reseñas de usuarios
- `administradores` - Usuarios admin
- `tokens_revocados` - Control de sesiones
- `logs_actividad` - Auditoría

### Importar Schema

```bash
mysql -u root -p perfumeria2 < database/schema.sql
```

## 🎮 Scripts Disponibles

```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start

# Crear administrador
npm run create-admin
# o directamente:
node scripts/createAdmin.js
```

## 🌐 API Endpoints

### Públicos (Sin autenticación)

#### Perfumes
```
GET    /api/perfumes              # Listar perfumes (paginado)
GET    /api/perfumes/:id          # Obtener perfume por ID
GET    /api/perfumes/:id/reviews  # Obtener reseñas de un perfume
POST   /api/perfumes/:id/reviews  # Crear reseña
```

#### Salud
```
GET    /health                    # Estado del servidor
GET    /                          # Info de la API
```

### Privados (Requieren autenticación)

#### Autenticación
```
POST   /api/admin/login           # Login
POST   /api/admin/logout          # Logout (requiere token)
GET    /api/admin/profile         # Perfil del usuario
PUT    /api/admin/change-password # Cambiar contraseña
```

#### Admin - Perfumes
```
GET    /api/admin/perfumes        # Listar (con filtros)
GET    /api/admin/perfumes/:id    # Obtener por ID
POST   /api/admin/perfumes        # Crear
PUT    /api/admin/perfumes/:id    # Actualizar
DELETE /api/admin/perfumes/:id    # Eliminar (soft delete)
PATCH  /api/admin/perfumes/:id/stock     # Actualizar stock
PATCH  /api/admin/perfumes/:id/descuento # Actualizar descuento
```

#### Admin - Reseñas
```
GET    /api/admin/reviews                # Listar reseñas
PATCH  /api/admin/reviews/:id/moderar    # Aprobar/rechazar
DELETE /api/admin/reviews/:id            # Eliminar
```

#### Admin - Estadísticas
```
GET    /api/admin/estadisticas           # Estadísticas generales
GET    /api/admin/estadisticas/categoria # Por categoría
GET    /api/admin/estadisticas/marca     # Por marca
GET    /api/admin/stock-bajo             # Productos con stock bajo
GET    /api/admin/logs                   # Logs de actividad
```

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación.

### Login
```bash
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "id_admin": 1,
    "username": "admin",
    "email": "admin@perfumeria.com",
    "rol": "superadmin"
  }
}
```

### Usar Token

En las peticiones siguientes, incluir el token:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 🛡️ Seguridad

### Características implementadas:

- ✅ JWT con expiración
- ✅ Tokens revocables (logout)
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Helmet para headers de seguridad
- ✅ Validación de inputs
- ✅ SQL injection protection (prepared statements)
- ✅ Control de roles (superadmin, admin, moderador)

### Roles

- **superadmin**: Acceso completo
- **admin**: CRUD de perfumes y moderación de reseñas
- **moderador**: Solo moderación de reseñas

## 📈 Optimizaciones

- ✅ Caché de imágenes en memoria
- ✅ Paginación en endpoints
- ✅ Compresión con gzip
- ✅ Connection pooling para MySQL
- ✅ Logging con Morgan

## 🐛 Debugging

### Logs

El servidor registra automáticamente:
- Solicitudes HTTP (Morgan)
- Errores de BD
- Intentos de autenticación
- Alertas de configuración

### Modo Desarrollo

```bash
NODE_ENV=development npm run dev
```

Logs más detallados y rate limiting relajado.

## 🚀 Despliegue en Railway

Ver [DEPLOYMENT.md](../DEPLOYMENT.md) para guía completa.

**Resumen:**
1. Crear proyecto en Railway
2. Agregar MySQL
3. Configurar variables de entorno
4. Deploy automático desde GitHub

## 📝 Variables de Entorno Requeridas

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `NODE_ENV` | Entorno (development/production) | ✅ |
| `PORT` | Puerto del servidor | ✅ |
| `MYSQL_HOST` | Host de MySQL | ✅ |
| `MYSQL_USER` | Usuario de MySQL | ✅ |
| `MYSQL_PASSWORD` | Contraseña de MySQL | ✅ |
| `MYSQL_DATABASE` | Nombre de la BD | ✅ |
| `JWT_SECRET` | Secret para JWT | ✅ |
| `CORS_ORIGIN` | Orígenes permitidos | ✅ |

## 🧪 Testing

```bash
# Probar endpoint de salud
curl http://localhost:3000/health

# Probar login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Probar listar perfumes
curl http://localhost:3000/api/perfumes
```

## 📚 Documentación Adicional

- [API completa](./docs/API.md)
- [Base de datos](./docs/DATABASE.md)
- [Despliegue](../DEPLOYMENT.md)

## 🤝 Contribuir

1. Crea una rama para tu feature
2. Implementa tus cambios
3. Asegúrate de que todo funcione
4. Crea un Pull Request

## 📄 Licencia

Propietario - Perfumería Premium

---

**Desarrollado con ❤️ para Perfumería Premium**

