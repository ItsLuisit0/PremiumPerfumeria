# 💜 Perfumería Premium - E-Commerce de Fragancias

> **Sistema completo de e-commerce** especializado en la venta de réplicas premium de fragancias de lujo. Plataforma web moderna con gestión de productos, carrito de compras, sistema de reseñas y panel de administración completo.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-18.x-green.svg)
![MySQL](https://img.shields.io/badge/mysql-8.0-orange.svg)
![License](https://img.shields.io/badge/license-Propietario-red.svg)

---

## 📖 Tabla de Contenidos

- [¿Qué es Perfumería Premium?](#-qué-es-perfumería-premium)
- [Propósito del Proyecto](#-propósito-del-proyecto)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Stack Tecnológico](#-stack-tecnológico)
- [Base de Datos](#-base-de-datos)
- [Funcionalidades Principales](#-funcionalidades-principales)
- [Catálogo de Productos](#-catálogo-de-productos)
- [Sistema de Filtrado](#-sistema-de-filtrado)
- [Despliegue en Producción](#-despliegue-en-producción)
- [Instalación Local](#-instalación-local)
- [Panel de Administración](#-panel-de-administración)
- [API REST](#-api-rest)
- [Seguridad](#-seguridad)

---

## 🎯 ¿Qué es Perfumería Premium?

**Perfumería Premium** es una plataforma de e-commerce completa diseñada para la venta en línea de réplicas premium de fragancias de marcas reconocidas. El sistema permite a los clientes:

- 🛍️ **Explorar** un catálogo extenso de perfumes
- 🔍 **Buscar y filtrar** productos por categoría, marca y género
- 🛒 **Agregar al carrito** y realizar pedidos vía WhatsApp
- ⭐ **Dejar reseñas** y calificaciones de productos
- ❤️ **Guardar favoritos** para compras futuras
- 💰 **Ver precios** de menudeo y mayoreo (6+ unidades)

Mientras que los administradores pueden:

- 📊 **Monitorear** estadísticas de ventas y productos
- 📦 **Gestionar** el inventario completo (CRUD)
- 💬 **Moderar** reseñas de clientes
- 🏷️ **Aplicar descuentos** dinámicos
- 📈 **Visualizar** gráficos interactivos de rendimiento

---

## 🎨 Propósito del Proyecto

El proyecto fue creado con los siguientes objetivos:

### **1. Digitalización del Negocio**
Llevar el negocio físico de perfumería a una plataforma digital moderna, permitiendo ventas 24/7 y alcance a más clientes.

### **2. Experiencia de Usuario Premium**
Ofrecer una interfaz elegante y profesional que refleje la calidad de los productos, con navegación intuitiva y diseño responsive.

### **3. Gestión Eficiente**
Proporcionar herramientas de administración que faciliten el control de inventario, precios, descuentos y reseñas desde un solo lugar.

### **4. Integración con WhatsApp**
Aprovechar WhatsApp como canal de ventas familiar para los clientes mexicanos, facilitando el proceso de compra.

### **5. Escalabilidad**
Diseñar una arquitectura que permita crecer el catálogo, agregar funcionalidades y soportar más usuarios sin problemas de rendimiento.

---

## 🏗️ Arquitectura del Sistema

El proyecto sigue una **arquitectura cliente-servidor** separada, con comunicación vía API REST:

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTE                             │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │   Frontend Público    │    │  Dashboard Admin     │      │
│  │   (Vue.js + Bootstrap)│    │  (Vue.js + Highcharts)│     │
│  │   - Catálogo          │    │  - Estadísticas      │      │
│  │   - Carrito           │    │  - CRUD Perfumes     │      │
│  │   - Búsqueda          │    │  - Gestión Stock     │      │
│  │   - Reseñas           │    │  - Moderación        │      │
│  └──────────────────────┘    └──────────────────────┘      │
│              ▲                          ▲                    │
│              │                          │                    │
│              └──────────┬───────────────┘                    │
│                         │ HTTPS/JSON                         │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVIDOR                               │
│  ┌──────────────────────────────────────────────────┐       │
│  │           API REST (Node.js + Express)           │       │
│  │   - Autenticación JWT                            │       │
│  │   - Validación de datos                          │       │
│  │   - Rate limiting                                │       │
│  │   - CORS configurado                             │       │
│  │   - Caché de imágenes                            │       │
│  └──────────────────────────────────────────────────┘       │
│                          │                                    │
│                          ▼                                    │
│  ┌──────────────────────────────────────────────────┐       │
│  │           Base de Datos MySQL 8.0                │       │
│  │   - Perfumes (productos)                         │       │
│  │   - Reseñas (reviews)                            │       │
│  │   - Administradores (users)                      │       │
│  │   - Logs de actividad                            │       │
│  │   - Stored procedures                            │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### **Flujo de Datos**

1. **Cliente** realiza una acción (buscar productos, agregar al carrito)
2. **Frontend** envía solicitud HTTP al backend
3. **API** valida la solicitud, aplica middlewares de seguridad
4. **Controlador** procesa la lógica de negocio
5. **Base de datos** ejecuta la consulta y retorna datos
6. **API** formatea la respuesta en JSON
7. **Frontend** actualiza la interfaz con los datos recibidos

---

## 🛠️ Stack Tecnológico

### **Frontend (Cliente)**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Vue.js** | 2.7 | Framework JavaScript reactivo para interfaz dinámica |
| **Bootstrap** | 5.3 | Framework CSS para diseño responsive |
| **Vanilla JS** | ES6+ | JavaScript puro para funcionalidades específicas |
| **Highcharts** | Latest | Gráficos interactivos en el dashboard admin |
| **Bootstrap Icons** | 1.11 | Iconografía moderna |
| **HTML5/CSS3** | - | Estructura y estilos base |

**¿Por qué Vue.js?**
- Curva de aprendizaje suave
- Reactivo y eficiente
- Ideal para SPAs sin necesidad de build complejo
- Perfecto para integración CDN

### **Backend (Servidor)**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 18.x | Runtime de JavaScript en el servidor |
| **Express** | 4.18 | Framework web minimalista y flexible |
| **MySQL** | 8.0 | Base de datos relacional robusta |
| **JWT** | 9.0 | Autenticación sin estado (stateless) |
| **bcryptjs** | 2.4 | Hash seguro de contraseñas |
| **Helmet** | 7.2 | Seguridad HTTP headers |
| **CORS** | 2.8 | Control de acceso entre orígenes |
| **Morgan** | 1.10 | Logging de peticiones HTTP |
| **express-validator** | 7.3 | Validación de datos de entrada |
| **express-rate-limit** | 7.5 | Protección contra ataques DDoS |

**¿Por qué Node.js + Express?**
- Rendimiento excepcional con I/O no bloqueante
- Ecosistema NPM extenso
- JavaScript en frontend y backend (mismo lenguaje)
- Ideal para APIs RESTful
- Fácil despliegue en Railway

### **Despliegue**

| Servicio | Propósito | Plan |
|----------|-----------|------|
| **Railway** | Backend + MySQL | Hobby ($5/mes) |
| **Render** | Frontend estático | Free |
| **GitHub** | Control de versiones | Free |

---

## 🗄️ Base de Datos

### **Esquema de Base de Datos MySQL**

La base de datos `perfumeria2` consta de las siguientes tablas principales:

#### **1. Tabla `perfumes`** (Catálogo de Productos)

```sql
perfumes
├── id_perfume (INT, PK, AUTO_INCREMENT)
├── marca (VARCHAR 100) - Ejemplo: "Dior", "Chanel"
├── nombre (VARCHAR 200) - Ejemplo: "Sauvage", "Coco Mademoiselle"
├── tipo (VARCHAR 50) - Ejemplo: "Eau de Parfum", "Eau de Toilette"
├── publico (ENUM) - "Hombre", "Mujer", "Unisex"
├── descripcion (TEXT) - Descripción detallada del producto
├── notas (TEXT) - Notas olfativas (salida, corazón, fondo)
├── precio_minimo (DECIMAL 10,2) - Precio de venta
├── mililitros (INT) - Tamaño en ml (50, 100, etc.)
├── imagen_url (VARCHAR 255) - Ruta a la imagen
├── stock (INT, DEFAULT 0) - Cantidad disponible
├── descuento_porcentaje (INT, DEFAULT 0) - 0-100%
├── precio_con_descuento (DECIMAL 10,2, GENERATED) - Auto-calculado
├── activo (BOOLEAN, DEFAULT TRUE) - Producto visible
├── destacado (BOOLEAN, DEFAULT FALSE) - Aparece destacado
├── creado_por (INT, FK) - ID del admin que lo creó
├── actualizado_por (INT, FK) - ID del último admin que lo modificó
├── fecha_creacion (TIMESTAMP)
└── fecha_actualizacion (TIMESTAMP)
```

**Índices:**
- PRIMARY KEY (`id_perfume`)
- INDEX (`marca`)
- INDEX (`publico`)
- INDEX (`activo`)

#### **2. Tabla `reseñas`** (Reviews de Clientes)

```sql
reseñas
├── id_reseña (INT, PK, AUTO_INCREMENT)
├── id_perfume (INT, FK → perfumes.id_perfume)
├── usuario (VARCHAR 100) - Nombre del cliente
├── comentario (TEXT) - Opinión del cliente
├── calificacion (INT 1-5) - Estrellas
├── fecha (TIMESTAMP)
├── aprobada (BOOLEAN, DEFAULT FALSE) - Moderación
├── moderada (BOOLEAN, DEFAULT FALSE)
├── moderada_por (INT, FK → administradores.id_admin)
├── fecha_moderacion (TIMESTAMP)
└── razon_rechazo (TEXT)
```

#### **3. Tabla `administradores`** (Usuarios del Sistema)

```sql
administradores
├── id_admin (INT, PK, AUTO_INCREMENT)
├── username (VARCHAR 50, UNIQUE) - Usuario de login
├── password_hash (VARCHAR 255) - Contraseña hasheada con bcrypt
├── email (VARCHAR 100, UNIQUE)
├── nombre_completo (VARCHAR 100)
├── rol (ENUM) - "superadmin", "admin", "moderador"
├── activo (BOOLEAN, DEFAULT TRUE)
├── ultimo_acceso (TIMESTAMP)
├── fecha_creacion (TIMESTAMP)
└── fecha_actualizacion (TIMESTAMP)
```

**Roles:**
- `superadmin`: Acceso total (crear admins, eliminar productos)
- `admin`: CRUD perfumes, moderar reseñas, ver estadísticas
- `moderador`: Solo aprobar/rechazar reseñas

#### **4. Tabla `tokens_revocados`** (Seguridad JWT)

```sql
tokens_revocados
├── id (INT, PK, AUTO_INCREMENT)
├── token_jti (VARCHAR 255, UNIQUE) - JWT ID
├── id_admin (INT, FK)
├── razon (VARCHAR 100) - "Logout", "Cambio password"
├── fecha_revocacion (TIMESTAMP)
└── expira_en (TIMESTAMP)
```

#### **5. Tabla `logs_actividad`** (Auditoría)

```sql
logs_actividad
├── id_log (INT, PK, AUTO_INCREMENT)
├── id_admin (INT, FK)
├── accion (VARCHAR 50) - "CREATE", "UPDATE", "DELETE"
├── tabla_afectada (VARCHAR 50) - "perfumes", "reseñas"
├── id_registro (INT) - ID del registro modificado
├── datos_anteriores (JSON) - Estado anterior
├── datos_nuevos (JSON) - Estado nuevo
├── ip_address (VARCHAR 45)
├── user_agent (TEXT)
└── fecha_accion (TIMESTAMP)
```

### **Vistas y Procedimientos Almacenados**

#### **Vista: `vista_estadisticas_dashboard`**
```sql
- total_perfumes
- total_reseñas
- total_stock
- productos_activos
- productos_inactivos
```

#### **Stored Procedure: `sp_estadisticas_por_categoria()`**
```sql
Retorna:
- publico (Hombre/Mujer/Unisex)
- cantidad_productos
- stock_total
- precio_promedio
```

#### **Stored Procedure: `sp_registrar_actividad()`**
```sql
Parámetros:
- p_id_admin
- p_accion
- p_tabla_afectada
- p_id_registro
- p_datos_anteriores
- p_datos_nuevos
- p_ip_address
- p_user_agent
```

---

## ✨ Funcionalidades Principales

### **Para Clientes (Frontend Público)**

#### 🛍️ **1. Exploración de Catálogo**
- Grid de productos con diseño de tarjetas modernas
- Imágenes de alta calidad con lazy loading
- Información clara: marca, nombre, precio, tamaño
- Badges visuales para género (Hombre/Mujer/Unisex)
- Indicador de descuentos aplicados

#### 🔍 **2. Búsqueda Inteligente**
- Búsqueda en tiempo real (sin recargar página)
- Busca por: nombre, marca, tipo
- Resultados instantáneos mientras escribes
- Modal de búsqueda responsive en móviles

#### 🏷️ **3. Sistema de Filtrado**
- Filtrar por género (Hombre, Mujer, Unisex)
- Filtrar por tipo (Diseñador, Nicho, Árabes)
- Categorías predefinidas con imágenes
- Combinación de múltiples filtros

#### 🛒 **4. Carrito de Compras**
- Agregar/quitar productos
- Incrementar/decrementar cantidades
- Persistencia con localStorage (no se pierde al cerrar)
- Cálculo automático de totales
- Vista lateral (offcanvas) moderna

#### ❤️ **5. Sistema de Favoritos**
- Guardar productos favoritos
- Persistencia en localStorage
- Vista dedicada de favoritos
- Contador en el header

#### ⭐ **6. Reseñas y Calificaciones**
- Ver reseñas de otros clientes
- Escribir reseñas con calificación 1-5 estrellas
- Sistema de moderación (pendientes de aprobación)
- Formato de fecha relativo ("Hace 2 días")

#### 💰 **7. Precios Dinámicos**
- Precio de menudeo
- Precio de mayoreo (6+ unidades, -20%)
- Descuentos aplicados automáticamente
- Vista previa del ahorro

#### 📱 **8. Checkout por WhatsApp**
- Resumen automático del pedido
- Formato de mensaje estructurado
- Envío directo a WhatsApp Business
- Incluye productos, cantidades y total

#### 🌙 **9. Modo Oscuro/Claro**
- Toggle automático según preferencias del sistema
- Variables CSS para fácil personalización
- Transiciones suaves

#### 📱 **10. Diseño Responsive**
- Optimizado para móviles, tablets y desktop
- Navegación adaptativa
- Imágenes optimizadas
- Menú hamburguesa en móviles

### **Para Administradores (Dashboard)**

#### 📊 **1. Estadísticas en Tiempo Real**
- Total de perfumes activos/inactivos
- Total de reseñas aprobadas/pendientes
- Stock total y bajo stock
- Gráficos interactivos (Highcharts):
  - Estado del inventario (Pie chart)
  - Distribución por categoría (Pie chart)

#### 📦 **2. Gestión de Productos (CRUD Completo)**
- **Crear:** Formulario con todos los campos
- **Leer:** Tabla con búsqueda y paginación
- **Actualizar:** Modal de edición inline
- **Eliminar:** Soft delete (no borra, desactiva)
- **Stock:** Actualización rápida con modal
- **Descuentos:** Modal con preview del precio final

#### 💬 **3. Moderación de Reseñas**
- Ver todas las reseñas (aprobadas y pendientes)
- Aprobar reseñas con un click
- Rechazar con razón opcional
- Eliminar reseñas inapropiadas
- Filtrar por estado

#### 📋 **4. Logs de Actividad**
- Registro completo de todas las acciones
- Ver quién hizo qué y cuándo
- Datos anteriores vs datos nuevos
- IP y User Agent registrados
- Auditoría completa

#### 🔐 **5. Autenticación Segura**
- Login con JWT
- Tokens con expiración (24h)
- Logout con revocación de token
- Cambio de contraseña
- Control de roles

---

## 📦 Catálogo de Productos

### **Capacidad y Organización**

El sistema está diseñado para soportar un **catálogo ilimitado** de productos, con la capacidad actual de gestionar:

- ✅ **~100+ perfumes** precargados (estimado)
- ✅ **3 categorías principales:** Hombre, Mujer, Unisex
- ✅ **3 tipos de perfumes:** Diseñador, Nicho, Árabes
- ✅ **Múltiples marcas:** Dior, Chanel, Versace, Armani, Creed, Lattafa, Armaf, etc.
- ✅ **Tamaños variados:** 30ml, 50ml, 100ml, 150ml
- ✅ **Tipos:** Eau de Parfum, Eau de Toilette, Parfum, Cologne

### **Estructura de Información del Producto**

Cada perfume incluye:

```javascript
{
  id_perfume: 1,
  marca: "Dior",
  nombre: "Sauvage Elixir",
  tipo: "Eau de Parfum",
  publico: "Hombre",
  descripcion: "Fragancia intensa y cautivadora...",
  notas: "Cardamomo, Lavanda, Sándalo, Vainilla",
  precio_minimo: 450.00,
  mililitros: 100,
  imagen_url: "ImagenesPerfumes/Sauvage.PNG",
  stock: 15,
  descuento_porcentaje: 10,
  precio_con_descuento: 405.00, // auto-calculado
  activo: true
}
```

### **Categorías de Productos**

#### **1. Por Género (Público)**
- **Hombre:** ~40% del catálogo
- **Mujer:** ~40% del catálogo
- **Unisex:** ~20% del catálogo

#### **2. Por Tipo**
- **Diseñador:** Marcas reconocidas (Dior, Chanel, Versace)
- **Nicho:** Marcas exclusivas (Creed, Maison Francis Kurkdjian)
- **Árabes:** Marcas orientales (Lattafa, Armaf, Rasasi)

#### **3. Por Precio**
- **Económico:** $200 - $400 MXN
- **Medio:** $400 - $800 MXN
- **Premium:** $800+ MXN

---

## 🔍 Sistema de Filtrado

### **Filtros Disponibles**

#### **1. Filtro por Género** (Público)
```javascript
// Filtra perfumes por campo 'publico'
opciones: ["Hombre", "Mujer", "Unisex"]
```

**Ejemplo:**
- Click en "Perfumes para Caballero" → Muestra solo perfumes con `publico: "Hombre"`

#### **2. Filtro por Tipo** (Categoría)
```javascript
// Filtra por marca según categoría
tipos: {
  "Diseñador": ["Versace", "Dior", "Chanel", "Armani"],
  "Nicho": ["Creed", "Maison Francis Kurkdjian", "Baccarat"],
  "Árabes": ["Lattafa", "Armaf", "Rasasi", "Afnan"]
}
```

**Ejemplo:**
- Click en "Perfumes Árabes Hombre" → Filtra por `publico: "Hombre"` Y marca árabe

#### **3. Búsqueda de Texto Libre**
```javascript
// Busca en múltiples campos
campos: ["nombre", "marca", "tipo", "descripcion"]
modo: "case-insensitive"
```

**Ejemplos de búsqueda:**
- `"sauvage"` → Encuentra "Dior Sauvage", "Sauvage Elixir"
- `"chanel"` → Encuentra todos los perfumes Chanel
- `"eau de parfum"` → Encuentra todos los EDP

### **Implementación del Filtrado**

#### **Frontend (Vue.js)**
```javascript
computed: {
  filteredPerfumes() {
    let filtered = this.perfumes;
    
    // Filtro por público
    if (this.selectedPublico) {
      filtered = filtered.filter(p => p.publico === this.selectedPublico);
    }
    
    // Filtro por tipo (marca)
    if (this.selectedTipo) {
      filtered = filtered.filter(p => {
        const marca = p.marca.toLowerCase();
        return marcasDelTipo.includes(marca);
      });
    }
    
    // Búsqueda de texto
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(search) ||
        p.marca.toLowerCase().includes(search) ||
        p.tipo.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }
}
```

#### **Backend (API con paginación)**
```javascript
// GET /api/perfumes?publico=Hombre&limit=20&offset=0
exports.getAllPerfumes = async (req, res) => {
  const { publico, marca, limit = 50, offset = 0 } = req.query;
  
  let query = 'SELECT * FROM perfumes WHERE activo = TRUE';
  const params = [];
  
  if (publico) {
    query += ' AND publico = ?';
    params.push(publico);
  }
  
  if (marca) {
    query += ' AND marca LIKE ?';
    params.push(`%${marca}%`);
  }
  
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  const [rows] = await pool.query(query, params);
  res.json({ success: true, data: rows });
};
```

### **Performance del Filtrado**

- ⚡ **Frontend:** Filtrado instantáneo en memoria (sin latencia)
- 🚀 **Backend:** Índices en MySQL para consultas rápidas
- 📊 **Paginación:** Carga de 20-50 productos por página
- 💾 **Caché:** Imágenes cacheadas para carga más rápida

---

## 🌐 Despliegue en Producción

### **Arquitectura de Despliegue**

```
┌──────────────────────────────────────────────────────────┐
│                    INTERNET                              │
└───────┬───────────────────────────────────┬──────────────┘
        │                                   │
        ▼                                   ▼
┌───────────────────┐            ┌──────────────────────┐
│   RENDER.COM      │            │   RAILWAY.APP        │
│   (Frontend)      │◄──────────►│   (Backend + DB)     │
│                   │   API REST  │                      │
│  Static Site      │   HTTPS     │  Node.js + MySQL    │
│  - HTML/CSS/JS    │             │  - Express API       │
│  - Vue.js         │             │  - MySQL 8.0         │
│  - Bootstrap      │             │  - JWT Auth          │
│  FREE ✅          │             │  $5/mes              │
└───────────────────┘            └──────────────────────┘
```

### **1. Backend en Railway** 🚂

**Configuración:**
```yaml
Servicio: Web Service
Builder: Nixpacks
Root: /
Start Command: cd backend && npm start
Port: 3000
```

**Variables de Entorno:**
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=<64-character-secret>
CORS_ORIGIN=https://tu-frontend.onrender.com

# MySQL (auto-generadas por Railway)
MYSQL_HOST=containers-us-west-xxx.railway.app
MYSQL_USER=root
MYSQL_PASSWORD=<auto-generated>
MYSQL_DATABASE=railway
MYSQL_PORT=3306
MYSQL_URL=mysql://root:pass@host:3306/railway
```

**URL generada:** `https://perfumeria-production-xxxx.up.railway.app`

**Servicios incluidos:**
- ✅ API REST (Node.js + Express)
- ✅ Base de datos MySQL 8.0
- ✅ SSL/HTTPS automático
- ✅ Deploys automáticos desde GitHub
- ✅ Health checks
- ✅ Logs en tiempo real
- ✅ Métricas de uso

**Costos:**
- Plan Hobby: $5/mes (incluye $5 de crédito)
- MySQL: ~$3/mes de uso
- **Total: ~$3/mes efectivo**

### **2. Frontend en Render** 🎨

**Configuración:**
```yaml
Tipo: Static Site
Root Directory: frontend
Publish Directory: public
Build Command: (ninguno)
Auto-Deploy: YES
```

**URL generada:** `https://perfumeria-premium.onrender.com`

**Archivos publicados:**
```
public/
├── index.html                  # Sitio principal
├── admin/                      # Dashboard admin
│   ├── login.html
│   └── dashboard.html
├── css/, js/, ImagenesPerfumes/
```

**Características:**
- ✅ SSL/HTTPS automático
- ✅ CDN global (Fastly)
- ✅ Deploys automáticos desde GitHub
- ✅ Custom domain (opcional)
- ✅ Sin límite de bandwidth

**Costos:**
- **GRATIS** ✅ (Static Sites son free en Render)

### **3. Conexión Frontend ↔ Backend**

#### **Frontend configura URL del Backend:**
`frontend/public/js/config.js`:
```javascript
production: {
  apiUrl: 'https://perfumeria-production-xxxx.up.railway.app'
}
```

#### **Backend acepta origen del Frontend:**
Railway → Variables:
```env
CORS_ORIGIN=https://perfumeria-premium.onrender.com
```

### **4. URLs Finales**

```
🌐 Sitio Principal:    https://perfumeria-premium.onrender.com
🔐 Admin Panel:        https://perfumeria-premium.onrender.com/admin/login.html
📊 Dashboard:          https://perfumeria-premium.onrender.com/admin/dashboard.html
🔧 Backend API:        https://perfumeria-production-xxxx.up.railway.app
💚 Health Check:       https://perfumeria-production-xxxx.up.railway.app/health
📚 API Docs:           https://perfumeria-production-xxxx.up.railway.app/
```

---

## 💻 Instalación Local

### **Prerequisitos**

- Node.js 18.x o superior
- MySQL 8.0 o superior
- Git

### **Pasos de Instalación**

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/PerfumeriaPremium.git
cd PerfumeriaPremium

# 2. Configurar Backend
cd backend
npm install
cp .env.example .env

# Editar .env con tus credenciales
# Generar JWT_SECRET:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 3. Configurar Base de Datos
mysql -u root -p
CREATE DATABASE perfumeria2;
USE perfumeria2;
source database/schema.sql;

# 4. Crear admin
node scripts/createAdmin.js

# 5. Iniciar Backend
npm run dev
# Backend en: http://localhost:3000

# 6. Iniciar Frontend (nueva terminal)
cd ../frontend/public
# Abrir index.html con Live Server o:
python -m http.server 5500
# Frontend en: http://localhost:5500
```

---

## 🔐 Panel de Administración

### **Acceso**

```
URL Local:       http://localhost:5500/admin/login.html
URL Producción:  https://tu-app.onrender.com/admin/login.html

Credenciales:
Usuario:         admin
Contraseña:      admin123
```

⚠️ **Cambiar inmediatamente en producción**

### **Funcionalidades**

#### **Dashboard Principal**
- 📊 Estadísticas generales
- 📈 Gráficos interactivos (Highcharts)
- 🔔 Alertas de stock bajo
- 📋 Actividad reciente

#### **Gestión de Perfumes**
- ➕ Crear nuevo perfume
- ✏️ Editar perfume existente
- 🗑️ Eliminar perfume (soft delete)
- 📦 Actualizar stock
- 🏷️ Aplicar descuentos con preview
- 👁️ Activar/desactivar visibilidad

#### **Moderación de Reseñas**
- ✅ Aprobar reseñas
- ❌ Rechazar reseñas
- 🗑️ Eliminar reseñas
- 📊 Ver estadísticas de calificaciones

#### **Logs y Auditoría**
- 📋 Ver todas las acciones
- 👤 Filtrar por administrador
- 🔍 Buscar por fecha
- 📄 Exportar reportes

---

## 🔌 API REST

### **Endpoints Públicos**

```http
GET    /health                        # Estado del servidor
GET    /                              # Info de la API
GET    /api/perfumes                  # Listar perfumes
GET    /api/perfumes/:id              # Obtener perfume
GET    /api/perfumes/:id/reviews      # Obtener reseñas
POST   /api/perfumes/:id/reviews      # Crear reseña
```

### **Endpoints Privados (Requieren JWT)**

```http
POST   /api/admin/login               # Autenticación
POST   /api/admin/logout              # Cerrar sesión
GET    /api/admin/profile             # Perfil usuario

GET    /api/admin/perfumes            # Listar (admin)
POST   /api/admin/perfumes            # Crear
PUT    /api/admin/perfumes/:id        # Actualizar
DELETE /api/admin/perfumes/:id        # Eliminar
PATCH  /api/admin/perfumes/:id/stock  # Actualizar stock
PATCH  /api/admin/perfumes/:id/descuento  # Actualizar descuento

GET    /api/admin/reviews             # Listar reseñas
PATCH  /api/admin/reviews/:id/moderar # Aprobar/rechazar
DELETE /api/admin/reviews/:id         # Eliminar

GET    /api/admin/estadisticas        # Estadísticas
GET    /api/admin/stock-bajo          # Productos bajo stock
GET    /api/admin/logs                # Logs actividad
```

**Documentación completa:** Ver `backend/README.md`

---

## 🔒 Seguridad

### **Medidas Implementadas**

✅ **Autenticación JWT**
- Tokens con expiración (24h)
- Tokens revocables en logout
- Secret key obligatorio en producción

✅ **Contraseñas Seguras**
- Hash con bcryptjs (salt rounds: 10)
- No se almacenan en texto plano
- Validación de complejidad

✅ **CORS Configurado**
- Orígenes específicos permitidos
- Validación estricta en producción
- Sin wildcard (*)

✅ **Rate Limiting**
- 100 requests por 15 minutos
- Protección contra DDoS
- Por IP address

✅ **Validación de Datos**
- express-validator en todos los endpoints
- Sanitización de inputs
- Prevención de SQL injection (prepared statements)

✅ **Headers de Seguridad**
- Helmet.js configurado
- Content Security Policy
- XSS Protection

✅ **Control de Roles**
- superadmin, admin, moderador
- Permisos granulares
- Middleware de autorización

✅ **Logs de Auditoría**
- Todas las acciones registradas
- IP y User Agent guardados
- Trazabilidad completa

---

## 📊 Métricas del Proyecto

### **Estadísticas de Código**

```
Backend:
- Archivos JS: ~15
- Líneas de código: ~3,500
- Endpoints: 20+
- Middleware: 5
- Controladores: 4

Frontend:
- Archivos HTML: 3
- Archivos JS: 2
- Líneas de CSS: 3,660+
- Componentes Vue: 1 app principal

Base de Datos:
- Tablas: 5
- Vistas: 2
- Stored Procedures: 3
- Índices: 8+
```

### **Performance**

- ⚡ Tiempo de carga: <3s
- 📊 API response time: <500ms
- 🖼️ Imágenes: Lazy loading
- 💾 Caché: En memoria para imágenes
- 📦 Gzip: Compresión habilitada

---

## 📚 Documentación Adicional

- 📖 [Backend API](backend/README.md) - Documentación completa del API
- 🎨 [Frontend](frontend/README.md) - Configuración del frontend
- 🔐 [Panel Admin](docs/admin/README.md) - Guía del dashboard
- 📊 [Analíticas](docs/admin/ANALITICAS.md) - Sistema de estadísticas

---

## 🤝 Contribución

Este es un proyecto propietario. Para contribuir contacta al equipo de desarrollo.

---

## 📄 Licencia

**Propietario** - Perfumería Premium © 2025

---

## 👨‍💻 Contacto

**Perfumería Premium**
- 📱 WhatsApp: +52 231 187 7967
- 📘 Facebook: [Premium Perfumería](https://www.facebook.com/people/Premium-Perfumería/61578055706575/)
- 📍 Teziutlán, Puebla, México

---

## 🎯 Roadmap Futuro

- [ ] Sistema de pagos en línea (Stripe/PayPal)
- [ ] Cupones de descuento
- [ ] Wishlist compartible
- [ ] Notificaciones por email
- [ ] Blog de fragancias
- [ ] Programa de lealtad
- [ ] App móvil (React Native)
- [ ] Multi-idioma (ES/EN)

---

**¡Gracias por usar Perfumería Premium!** 💜✨
