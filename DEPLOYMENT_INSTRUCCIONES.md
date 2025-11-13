# 🚀 Instrucciones para Despliegue en Producción

## Problema Resuelto ✅

Se ha arreglado el error de CORS que impedía el login al dashboard en producción. Los cambios realizados fueron:

### 1. **Frontend - Configuración Dinámica de API** 
Se actualizaron los archivos para que usen automáticamente la URL correcta según el entorno:
- ✅ `docs/admin/login.html` - Ahora usa `config.js` 
- ✅ `docs/admin/dashboard.html` - Ahora importa `config.js`
- ✅ `docs/admin/assets/dashboard.js` - Usa la URL dinámica

### 2. **Backend - CORS Actualizado**
Se configuró el backend para aceptar requests desde tu dominio de producción:
- ✅ Origen agregado: `https://premiumperfumeria.onrender.com`
- ✅ Configuración automática según el entorno (desarrollo/producción)

---

## 📋 Pasos para Completar el Despliegue

### Paso 1: Commit y Push al Repositorio

```bash
# Ver los cambios realizados
git status

# Agregar todos los archivos modificados
git add .

# Hacer commit con un mensaje descriptivo
git commit -m "Fix: Configurar CORS y URLs dinámicas para producción"

# Subir los cambios a GitHub
git push origin main
```

### Paso 2: Configurar Variables de Entorno en Railway (Backend)

Ve a tu proyecto en Railway y asegúrate de tener estas variables configuradas:

```env
# Entorno
NODE_ENV=production

# Puerto (Railway lo asigna automáticamente)
PORT=3000

# Base de datos MySQL (Railway)
MYSQL_HOST=<tu-host-mysql>
MYSQL_USER=<tu-usuario>
MYSQL_PASSWORD=<tu-password>
MYSQL_DATABASE=perfumeria2
MYSQL_PORT=3306

# Seguridad - JWT
JWT_SECRET=<generar-uno-seguro>
JWT_EXPIRES_IN=24h

# CORS - Origen del frontend
CORS_ORIGIN=https://premiumperfumeria.onrender.com
```

**💡 Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Paso 3: Verificar Configuración del Frontend en Render

1. Ve a tu dashboard de Render: https://dashboard.render.com
2. Selecciona tu sitio estático: `premiumperfumeria`
3. Verifica que esté desplegando desde el directorio correcto: `/docs`
4. Si hiciste el commit en el Paso 1, Render debería redesplegar automáticamente

### Paso 4: Verificar URLs en `config.js`

El archivo `docs/js/config.js` debe tener:

```javascript
production: {
    apiUrl: 'https://perfumeriapremium-production.up.railway.app'
}
```

✅ Ya está configurado correctamente en tu proyecto.

---

## 🧪 Pruebas Post-Despliegue

### 1. Probar el Backend (Railway)

```bash
# Health check
curl https://perfumeriapremium-production.up.railway.app/health

# Listar perfumes
curl https://perfumeriapremium-production.up.railway.app/api/perfumes
```

### 2. Probar el Frontend (Render)

1. Abre: https://premiumperfumeria.onrender.com
2. Verifica que la tienda cargue correctamente
3. Ve al dashboard: https://premiumperfumeria.onrender.com/admin/login.html
4. Intenta hacer login con las credenciales:
   - Usuario: `admin`
   - Contraseña: `admin123`

### 3. Verificar Consola del Navegador

Abre las herramientas de desarrollador (F12) y verifica:

```
🌐 Entorno: Producción
🔗 API URL: https://perfumeriapremium-production.up.railway.app
```

---

## 🔍 Solución de Problemas

### Error: "Failed to fetch" o CORS

**Causas posibles:**
1. El backend no está corriendo en Railway
2. Las variables de entorno no están configuradas
3. La URL del backend es incorrecta

**Solución:**
```bash
# Verificar que el backend responda
curl https://perfumeriapremium-production.up.railway.app/health

# Ver logs del backend en Railway
# Dashboard > Tu Proyecto > Deployments > Ver logs
```

### Error: "Credenciales inválidas"

**Causa:** No se ha creado el usuario administrador en la base de datos.

**Solución:**
```bash
# Conectarse al backend en Railway (usando CLI de Railway)
railway connect
railway run node scripts/createAdmin.js

# O ejecutar el script directamente en Railway
```

### Frontend muestra URLs de localhost

**Causa:** El archivo `config.js` no se está cargando o hay error de JavaScript.

**Solución:**
1. Abre la consola del navegador (F12)
2. Verifica si hay errores de carga de scripts
3. Asegúrate de que `config.js` se cargue antes que otros scripts

---

## 📊 Monitoreo

### Logs del Backend (Railway)

1. Ve a Railway Dashboard
2. Selecciona tu proyecto
3. Click en "Deployments"
4. Click en "View Logs"

**Busca estos mensajes:**
```
✅ Trust proxy habilitado para producción
🌐 Orígenes CORS permitidos: [ 'https://premiumperfumeria.onrender.com' ]
🚀 Servidor iniciado en puerto 3000
```

### Logs del Frontend (Render)

1. Ve a Render Dashboard
2. Selecciona tu sitio
3. Click en "Logs"

**Verifica:**
- Build exitoso
- Deploy completado

---

## 🔐 Seguridad Post-Despliegue

### 1. Cambiar Credenciales por Defecto

```bash
# Conéctate al backend y ejecuta:
railway connect
railway run node scripts/updateAdmin.js

# Sigue las instrucciones para crear un nuevo admin y eliminar el default
```

### 2. Ocultar Información de Desarrollo

Edita `docs/admin/login.html` y elimina o comenta este bloque:

```html
<!-- Información de credenciales por defecto (solo desarrollo) -->
<div class="alert alert-info mt-3 text-center" style="background: rgba(255,255,255,0.9); border-radius: 10px;">
    <small>
        <strong>Credenciales actuales:</strong><br>
        Usuario: <code>admin</code><br>
        Contraseña: <code>admin123</code>
    </small>
</div>
```

### 3. Configurar Rate Limiting Personalizado

En `backend/src/app.js`, el rate limiting ya está configurado para producción:
- 1000 requests por 15 minutos
- Healthchecks excluidos

---

## ✅ Checklist Final

Antes de considerar el despliegue completo, verifica:

- [ ] Commit y push de los cambios al repositorio
- [ ] Variables de entorno configuradas en Railway
- [ ] Backend desplegado y respondiendo en Railway
- [ ] Frontend desplegado y funcionando en Render
- [ ] Login al dashboard funciona correctamente
- [ ] CORS sin errores en la consola del navegador
- [ ] Credenciales de administrador cambiadas
- [ ] Información de desarrollo removida del login
- [ ] Base de datos con datos de prueba o producción
- [ ] Respaldos de la base de datos configurados

---

## 📞 Soporte

Si encuentras algún problema:

1. **Revisa los logs** en Railway y Render
2. **Verifica la consola del navegador** (F12)
3. **Confirma las URLs** en `config.js`
4. **Prueba los endpoints** con curl o Postman

---

## 🎉 Éxito

Si todo funciona correctamente, deberías poder:
- ✅ Acceder a la tienda en producción
- ✅ Hacer login al dashboard de administración
- ✅ Gestionar perfumes, reseñas y ver estadísticas
- ✅ No ver errores de CORS en la consola

**¡Tu aplicación está lista para producción!** 🚀

