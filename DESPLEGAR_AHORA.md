# ⚡ DESPLEGAR EN 3 PASOS

## 🎯 SOLO ESTO NECESITAS HACER:

### ✅ **PASO 1:** Edita 1 línea de código (30 segundos)

Abre: `frontend/public/js/config.js`

**Línea 13**, cambia:
```javascript
apiUrl: 'https://tu-servidor-backend.com'
```

Por tu URL real:
```javascript
apiUrl: 'https://api.tuperfumeria.com'
```

---

### ✅ **PASO 2:** Crea archivo `.env` en el servidor (1 minuto)

En tu servidor, dentro de la carpeta `backend`, crea un archivo `.env`:

```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_seguro
DB_NAME=perfumeria
CORS_ORIGIN=https://tuperfumeria.com
```

---

### ✅ **PASO 3:** Sube y ejecuta (2 minutos)

```bash
# Subir backend
cd backend
npm install --production
pm2 start src/app.js --name perfumeria-api

# Subir frontend a public_html/
# (toda la carpeta frontend/public)
```

---

## 🎉 ¡LISTO!

Accede a tu sitio y presiona F12.  
Deberías ver: `🚀 Modo: PRODUCCIÓN`

---

## 📚 ¿Necesitas más detalles?

Lee: **[GUIA_PRODUCCION.md](./GUIA_PRODUCCION.md)** para instrucciones completas.

---

**Total: 3 minutos ⏱️**

