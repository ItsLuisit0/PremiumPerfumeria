# 🔧 Solución a Errores de Producción

## Resumen de Errores Encontrados

### 1. ❌ Error CORS (Critical)
**Error:** `Access to fetch at 'https://perfumeriapremium-production.up.railway.app/api/perfumes' from origin 'https://premiumperfumeria.onrender.com' has been blocked by CORS policy`

**Causa:** El backend en Railway no tiene configurada la variable de entorno `CORS_ORIGIN` con el dominio del frontend en Render.

### 2. ❌ Error 404 - fondoDefinitivo.png
**Error:** `Failed to load resource: the server responded with a status of 404 ()`

**Causa:** Referencias a la imagen con extensión en minúsculas (`.png`) cuando el archivo real tiene extensión en mayúsculas (`.PNG`).

---

## ✅ Soluciones Aplicadas

### Solución 1: Error de Imagen (YA CORREGIDO ✓)
He actualizado todas las referencias de `fondoDefinitivo.png` a `fondoDefinitivo.PNG` en:
- ✓ `frontend/public/index.html` (6 referencias)
- ✓ `frontend/public/css/style.css` (1 referencia)
- ✓ `docs/index.html` (6 referencias)

**Acción requerida:** Hacer commit y push de los cambios, y redeploy en Render.

### Solución 2: Error CORS (PENDIENTE - REQUIERE CONFIGURACIÓN EN RAILWAY)

#### Pasos para Configurar CORS en Railway:

1. **Accede a Railway:**
   - Ve a https://railway.app
   - Inicia sesión y selecciona tu proyecto: `perfumeriapremium-production`

2. **Selecciona el Servicio Backend:**
   - Haz clic en el servicio que ejecuta tu backend (Node.js)

3. **Agregar Variable de Entorno:**
   - Ve a la pestaña **"Variables"** o **"Settings"**
   - Haz clic en **"+ New Variable"** o **"Add Variable"**
   - Agrega lo siguiente:
     ```
     Variable: CORS_ORIGIN
     Valor: https://premiumperfumeria.onrender.com
     ```

4. **Guardar y Redeploy:**
   - Haz clic en **"Save"** o **"Add"**
   - Railway automáticamente redeployará tu aplicación
   - Espera a que el deploy termine (usualmente 1-2 minutos)

5. **Verificar:**
   - Una vez terminado el deploy, verifica los logs en Railway
   - Deberías ver algo como:
     ```
     🌐 Orígenes CORS permitidos: [ 'https://premiumperfumeria.onrender.com' ]
     ```

#### Configuración Múltiple (Opcional):

Si necesitas permitir múltiples dominios, sepáralos con comas:
```
CORS_ORIGIN=https://premiumperfumeria.onrender.com,https://otro-dominio.com,https://dominio-local.com
```

---

## 🧪 Pruebas Después de la Corrección

1. **Verificar que no haya errores CORS:**
   - Abre https://premiumperfumeria.onrender.com
   - Abre las DevTools (F12)
   - Ve a la pestaña Console
   - **No** deberías ver el error de CORS
   - Los perfumes deberían cargarse correctamente

2. **Verificar que la imagen cargue:**
   - Verifica que el fondo del hero se vea correctamente
   - No debería haber error 404 de `fondoDefinitivo.png`

3. **Verificar la API:**
   - En la consola deberías ver:
     ```
     🚀 Modo: PRODUCCIÓN
     🌐 API URL: https://perfumeriapremium-production.up.railway.app
     ✅ Catálogo cargado correctamente
     ```

---

## 📝 Comandos Git para Aplicar los Cambios de Imagen

```bash
# Ver los cambios
git status

# Agregar los archivos modificados
git add frontend/public/index.html
git add frontend/public/css/style.css
git add docs/index.html

# Hacer commit
git commit -m "Fix: Corregir extensión de imagen fondoDefinitivo.PNG"

# Push a GitHub
git push origin main
```

Después del push:
- **Render** detectará automáticamente los cambios y redeployará el frontend

---

## 🔍 Explicación Técnica

### ¿Por qué ocurre el error CORS?

CORS (Cross-Origin Resource Sharing) es una política de seguridad del navegador que impide que un sitio web en un dominio (ej: `premiumperfumeria.onrender.com`) haga peticiones a otro dominio (ej: `perfumeriapremium-production.up.railway.app`) a menos que el servidor de destino lo permita explícitamente.

Tu backend tiene esta lógica en `backend/src/app.js`:

```javascript
const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : defaultDevOrigins;
```

Como `CORS_ORIGIN` no está definido en Railway, usa `defaultDevOrigins` que solo incluye:
- `http://127.0.0.1:5500`
- `http://localhost:3000`
- `http://localhost:5500`
- `http://localhost:8080`

Por eso bloquea las peticiones desde `https://premiumperfumeria.onrender.com`.

### ¿Por qué la imagen no cargaba?

En sistemas Unix/Linux (donde corren los servidores de Render), los nombres de archivo son **case-sensitive** (distinguen mayúsculas de minúsculas).

- El archivo real: `fondoDefinitivo.PNG`
- La referencia en el código: `fondoDefinitivo.png`

Son considerados como archivos diferentes, causando el error 404.

---

## 🎯 Checklist Final

- [x] Corregir referencias de imagen en frontend
- [x] Corregir referencias de imagen en docs
- [ ] Hacer commit y push de los cambios
- [ ] Configurar CORS_ORIGIN en Railway
- [ ] Verificar que Railway redeploy correctamente
- [ ] Probar el sitio en producción
- [ ] Verificar que no haya errores en la consola
- [ ] Verificar que los perfumes carguen correctamente

---

## 📞 Soporte

Si después de seguir estos pasos aún tienes problemas:
1. Verifica los logs del backend en Railway
2. Verifica los logs del frontend en Render
3. Comparte los errores específicos que aparezcan en la consola del navegador

