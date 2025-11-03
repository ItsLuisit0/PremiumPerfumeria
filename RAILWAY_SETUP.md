# 🚂 Guía de Despliegue en Railway - Premium Perfumeria

## ❌ **ERROR QUE ESTÁS VIENDO:**

```
Error creating build plan with Railpack
Deployment failed during build process
```

## ✅ **SOLUCIÓN:**

He creado los archivos de configuración necesarios:
- ✅ `railway.json` - Configuración principal de Railway
- ✅ `nixpacks.toml` - Instrucciones de build
- ✅ `Procfile` - Comando de inicio
- ✅ `.gitignore` - Archivos a ignorar

---

## 🔧 **PASOS PARA SOLUCIONAR:**

### **PASO 1: Sube los archivos nuevos a Git**

```bash
git add railway.json nixpacks.toml Procfile .gitignore
git commit -m "Add Railway configuration files"
git push origin main
```

### **PASO 2: Configura las Variables de Entorno en Railway**

1. Ve a tu proyecto en Railway
2. Click en tu servicio
3. Ve a la pestaña **"Variables"**
4. Agrega estas variables:

```env
NODE_ENV=production
PORT=3000
```

**⚠️ IMPORTANTE:** NO agregues las variables de base de datos todavía, las agregaremos después.

### **PASO 3: Agrega la Base de Datos MySQL**

1. En tu proyecto de Railway, click en **"+ New"**
2. Selecciona **"Database"** → **"Add MySQL"**
3. Railway creará automáticamente la base de datos
4. Espera unos segundos a que esté lista (ícono verde)

### **PASO 4: Conecta el Backend con MySQL**

1. Click en tu servicio **backend** (no la base de datos)
2. Ve a **"Variables"**
3. Click en **"+ New Variable"** → **"Add Reference"**
4. Selecciona la base de datos MySQL
5. Agrega estas referencias (Railway las llenará automáticamente):
   - `MYSQLHOST` → Renombrar a `DB_HOST`
   - `MYSQLUSER` → Renombrar a `DB_USER`
   - `MYSQLPASSWORD` → Renombrar a `DB_PASSWORD`
   - `MYSQLDATABASE` → Renombrar a `DB_NAME`
   - `MYSQLPORT` → Puedes ignorar este

O cópialas manualmente:
```env
DB_HOST=${{MySQL.MYSQLHOST}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
```

6. Agrega también:
```env
CORS_ORIGIN=*
```
(Más adelante cambiarás esto por tu dominio real)

### **PASO 5: Importa la Base de Datos**

1. En Railway, click en tu base de datos MySQL
2. Ve a la pestaña **"Data"** o **"Connect"**
3. Copia las credenciales de conexión
4. Usa un cliente MySQL (como TablePlus, MySQL Workbench, o phpMyAdmin)
5. Conecta con esas credenciales
6. Ejecuta el SQL completo de tu base de datos (tablas `perfumes` y `reseñas`)

**Alternativa - Desde terminal:**
```bash
# Usa las credenciales que Railway te da
mysql -h <RAILWAY_HOST> -u <RAILWAY_USER> -p<RAILWAY_PASSWORD> <RAILWAY_DATABASE> < tu_base_de_datos.sql
```

### **PASO 6: Redeploy**

1. Ve a la pestaña **"Deployments"**
2. Click en **"Deploy"** (botón derecho superior)
3. O haz cualquier cambio y push a Git para trigger un deploy automático

### **PASO 7: Verifica que funciona**

Una vez que el deploy termine exitoso:

1. Railway te dará una URL como: `https://perfumeria-production.up.railway.app`
2. Accede a: `https://tu-url.railway.app/health`
3. Deberías ver:
   ```json
   {
     "success": true,
     "message": "Servidor funcionando correctamente ✅",
     "database": "Conectada",
     "environment": "production"
   }
   ```

---

## 🎯 **CONFIGURAR EL FRONTEND**

Una vez que el backend funcione:

### **Opción A: Netlify (Recomendado)**

1. Ve a https://netlify.com
2. Arrastra la carpeta `frontend/public`
3. Antes de subir, edita `frontend/public/js/config.js`:
   ```javascript
   production: {
       apiUrl: 'https://tu-url.railway.app'  // Tu URL de Railway
   }
   ```
4. Sube a Netlify
5. Netlify te dará una URL como: `premium-perfumeria.netlify.app`

### **Opción B: También en Railway**

Puedes desplegar el frontend también en Railway:

1. Crea un nuevo servicio en el mismo proyecto
2. Selecciona el mismo repositorio
3. Configura:
   - **Root Directory:** `frontend/public`
   - **Build Command:** (dejar vacío)
   - **Start Command:** `npx serve -s . -p $PORT`
4. Instala serve: Agrega a `frontend/package.json`:
   ```json
   {
     "scripts": {
       "start": "npx serve -s public -p $PORT"
     },
     "dependencies": {
       "serve": "^14.2.0"
     }
   }
   ```

---

## 🔄 **ACTUALIZAR CORS**

Una vez que tengas la URL del frontend:

1. Ve a Railway → Tu servicio backend → Variables
2. Actualiza `CORS_ORIGIN`:
   ```
   https://premium-perfumeria.netlify.app
   ```
3. El backend se redeployará automáticamente

---

## 🆘 **SOLUCIÓN DE PROBLEMAS**

### **Error: "Cannot connect to database"**

**Causa:** Variables de base de datos no configuradas o incorrectas

**Solución:**
1. Verifica que agregaste la base de datos MySQL en Railway
2. Verifica que las variables `DB_HOST`, `DB_USER`, etc. estén configuradas
3. Mira los logs: Click en tu servicio → "Deployments" → "View logs"

### **Error: "CORS policy error"**

**Causa:** El frontend no está en la lista de orígenes permitidos

**Solución:**
1. Actualiza `CORS_ORIGIN` con la URL de tu frontend
2. O temporalmente usa `CORS_ORIGIN=*` para probar

### **Error: "Port already in use"**

**Causa:** Railway asigna el puerto automáticamente

**Solución:**
Tu código ya está correcto, Railway usa la variable `PORT` que definimos.

### **El deploy tarda mucho**

Railway free tier puede ser lento. Si tarda más de 5 minutos, cancela y redeploy.

---

## 📝 **CHECKLIST COMPLETO**

- [ ] ✅ Archivos de configuración subidos a Git (railway.json, nixpacks.toml, Procfile)
- [ ] ✅ Variables de entorno configuradas en Railway (NODE_ENV, PORT)
- [ ] ✅ Base de datos MySQL agregada en Railway
- [ ] ✅ Variables de DB conectadas (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
- [ ] ✅ Tablas importadas en la base de datos (perfumes, reseñas)
- [ ] ✅ Deploy exitoso (sin errores rojos)
- [ ] ✅ Endpoint /health responde correctamente
- [ ] ✅ Frontend desplegado (Netlify o Railway)
- [ ] ✅ config.js actualizado con URL del backend
- [ ] ✅ CORS_ORIGIN actualizado con URL del frontend
- [ ] ✅ Probado: puedes ver perfumes
- [ ] ✅ Probado: puedes dejar reseñas

---

## 🎉 **¡ÉXITO!**

Si todo funciona:
- Backend: `https://tu-backend.railway.app`
- Frontend: `https://tu-frontend.netlify.app`
- Base de datos: MySQL en Railway

**Tu aplicación Premium Perfumeria está en producción! 🚀**

---

## 💡 **TIPS ADICIONALES**

1. **Monitoreo:** Railway te muestra métricas de CPU, RAM y tráfico
2. **Logs:** Siempre revisa los logs si algo falla
3. **Dominio custom:** Puedes agregar tu dominio en Railway Settings
4. **Backups:** Railway no hace backups automáticos, usa Railway CLI o exporta manualmente
5. **Sleeping:** El free tier de Railway "duerme" después de inactividad, el primer request puede ser lento

---

**¿Necesitas ayuda?** Revisa los logs en Railway → View logs

