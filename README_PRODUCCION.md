# 🚀 Perfumería Elegancia - Despliegue a Producción

## ⚡ INICIO RÁPIDO

Tu aplicación YA está configurada para detectar automáticamente si está en **desarrollo** o **producción**.

### 🔧 **LO ÚNICO QUE DEBES HACER:**

#### **1. Configura la URL del API (1 minuto)**

Abre: `frontend/public/js/config.js`

Línea 13, cambia esto:
```javascript
apiUrl: 'https://tu-servidor-backend.com'
```

Por tu URL real, ejemplo:
```javascript
apiUrl: 'https://api.tuperfumeria.com'
// O si está en el mismo servidor:
apiUrl: 'https://tuperfumeria.com/api'
// O si usas IP:
apiUrl: 'http://123.456.789.0:3000'
```

#### **2. Crea el archivo `.env` en el servidor (2 minutos)**

En la carpeta `backend` de tu servidor, crea un archivo llamado `.env`:

```env
NODE_ENV=production
PORT=3000

DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_segura
DB_NAME=perfumeria

CORS_ORIGIN=https://tuperfumeria.com,https://www.tuperfumeria.com
```

Reemplaza con tus datos reales.

#### **3. Sube los archivos (5 minutos)**

**Backend:**
- Sube la carpeta `backend` completa
- En el servidor, ejecuta:
  ```bash
  cd backend
  npm install --production
  pm2 start src/app.js --name perfumeria-api
  ```

**Frontend:**
- Sube todo el contenido de `frontend/public` a tu carpeta web (`public_html`, `htdocs`, etc.)

#### **4. Verifica que funciona (1 minuto)**

1. Accede a tu sitio web
2. Presiona **F12** para abrir la consola
3. Busca estos mensajes:
   ```
   🚀 Modo: PRODUCCIÓN
   🌐 API URL: https://tu-api.com
   ```
4. Prueba dejar una reseña

**¡Listo! Tu aplicación está en producción.** 🎉

---

## 📚 **DOCUMENTACIÓN COMPLETA**

Para una guía paso a paso detallada, lee: **[GUIA_PRODUCCION.md](./GUIA_PRODUCCION.md)**

Incluye:
- Configuración detallada del servidor
- Seguridad y HTTPS
- Monitoreo y logs
- Solución de problemas
- Checklist completo

---

## 🔄 **DESARROLLO vs PRODUCCIÓN**

### **En Desarrollo (local):**
- Detecta automáticamente `localhost` o `127.0.0.1`
- Usa `http://localhost:3000` como API
- Muestra logs detallados en consola
- Mensaje: `🔧 Modo: DESARROLLO`

### **En Producción:**
- Detecta que NO es localhost
- Usa la URL configurada en `config.js`
- Solo muestra logs de errores importantes
- Mensaje: `🚀 Modo: PRODUCCIÓN`

**No necesitas cambiar código, se adapta solo.** ✨

---

## 🛠️ **ARQUITECTURA**

```
┌─────────────────────────────────────────┐
│          FRONTEND (Vue.js 2)            │
│  - Catálogo de perfumes                 │
│  - Sistema de reseñas                   │
│  - Carrito de compras                   │
│  - Favoritos                            │
└──────────────┬──────────────────────────┘
               │
               │ HTTP/HTTPS
               │
┌──────────────▼──────────────────────────┐
│       BACKEND (Node.js + Express)       │
│  - API REST                             │
│  - Validaciones                         │
│  - CORS configurado                     │
│  - Rate limiting                        │
└──────────────┬──────────────────────────┘
               │
               │ MySQL
               │
┌──────────────▼──────────────────────────┐
│      BASE DE DATOS (MySQL)              │
│  - Tabla: perfumes                      │
│  - Tabla: reseñas                       │
└─────────────────────────────────────────┘
```

---

## 🔒 **SEGURIDAD**

✅ Helmet configurado
✅ CORS restricción por dominio
✅ Rate limiting
✅ Validación de datos (frontend y backend)
✅ Prepared statements (prevención SQL injection)
✅ Variables de entorno para credenciales

---

## 📊 **CARACTERÍSTICAS**

### **Frontend:**
- ✅ Catálogo de 47 perfumes
- ✅ Búsqueda en tiempo real
- ✅ Filtros por género (Hombre, Mujer, Unisex)
- ✅ Sistema de favoritos (localStorage)
- ✅ Carrito de compras persistente
- ✅ Modal de detalles con reseñas
- ✅ Integración con WhatsApp
- ✅ Diseño responsive
- ✅ Toasts de notificación
- ✅ Animaciones suaves

### **Backend:**
- ✅ API REST
- ✅ CRUD de reseñas
- ✅ Validación robusta
- ✅ Rate limiting
- ✅ Servir imágenes con caché
- ✅ Logs optimizados por ambiente
- ✅ Health check endpoint
- ✅ Manejo de errores centralizado

---

## 🗂️ **ESTRUCTURA DEL PROYECTO**

```
Perfumeria/
├── backend/
│   ├── src/
│   │   ├── app.js                    # Servidor principal
│   │   ├── controllers/
│   │   │   ├── perfumeController.js  # Lógica de perfumes
│   │   │   └── reviewController.js   # Lógica de reseñas
│   │   ├── db/
│   │   │   └── db.js                 # Conexión MySQL
│   │   └── routes/
│   │       └── perfumes.js           # Rutas API
│   ├── package.json
│   ├── .env                          # Variables de entorno (NO subir a Git)
│   └── env.example.txt               # Plantilla de .env
│
├── frontend/
│   └── public/
│       ├── index.html                # Página principal
│       ├── css/
│       │   └── style.css             # Estilos
│       ├── js/
│       │   ├── config.js             # ⭐ Configuración de entornos
│       │   └── main.js               # Lógica Vue.js
│       └── imagenesPerfumes/         # Imágenes de productos
│
├── GUIA_PRODUCCION.md                # 📚 Guía completa de despliegue
├── CAMBIOS_PRODUCCION.md             # 📝 Lista de cambios realizados
├── README_PRODUCCION.md              # 📖 Este archivo
└── prueba_resenas.html               # 🧪 Archivo de prueba (opcional)
```

---

## 🔧 **COMANDOS ÚTILES**

### **Desarrollo:**
```bash
# Backend
cd backend
npm start

# Frontend
# Abre index.html con Live Server o en el navegador
```

### **Producción (con PM2):**
```bash
# Iniciar
pm2 start src/app.js --name perfumeria-api

# Ver logs
pm2 logs perfumeria-api

# Reiniciar
pm2 restart perfumeria-api

# Estado
pm2 status

# Monitoreo
pm2 monit
```

---

## 🆘 **PROBLEMAS COMUNES**

### **Error de CORS**
**Síntoma:** `CORS policy: No 'Access-Control-Allow-Origin' header is present`

**Solución:**
1. Verifica que `backend/.env` tenga tu dominio en `CORS_ORIGIN`
2. Reinicia el backend: `pm2 restart perfumeria-api`

### **API URL no configurada**
**Síntoma:** Advertencia en consola sobre URL no configurada

**Solución:**
Edita `frontend/public/js/config.js` línea 13 con tu URL real

### **Error de conexión a base de datos**
**Síntoma:** `Error al conectar a la base de datos`

**Solución:**
Verifica credenciales en `backend/.env`

---

## 📞 **CONTACTO**

- WhatsApp: 231-187-7967
- Número: 5212311877967

---

## 📝 **LICENCIA**

© 2025 Elegancia Perfumería. Todos los derechos reservados.

---

## 🎯 **PRÓXIMOS PASOS**

Después de desplegar:

1. [ ] Configura backup automático de la base de datos
2. [ ] Instala un certificado SSL (Let's Encrypt gratis)
3. [ ] Configura Google Analytics (opcional)
4. [ ] Prueba todas las funcionalidades
5. [ ] Monitorea los logs regularmente

---

## ✨ **MEJORAS FUTURAS (OPCIONAL)**

- Panel de administración para gestionar perfumes
- Autenticación de usuarios
- Historial de pedidos
- Pasarela de pago
- Sistema de cupones/descuentos
- Notificaciones por email
- PWA (Progressive Web App)
- Modo oscuro

---

**¡Tu aplicación está lista para brillar en producción! 🚀✨**

