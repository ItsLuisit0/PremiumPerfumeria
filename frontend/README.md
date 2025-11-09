# Perfumería Premium - Frontend

## Descripción
Frontend del e-commerce de Perfumería Premium. Sitio estático con Vue.js 2, Bootstrap 5.

## 🌐 Acceso al Panel de Administración

### En Producción:
```
https://tu-app.onrender.com/admin/login.html
```

### En Desarrollo Local:
```
http://localhost:5500/admin/login.html
```

**Credenciales por defecto:**
- Usuario: `admin`
- Contraseña: `admin123`

⚠️ **Ver `ACCESO_ADMIN.md` para más detalles**

---

## Despliegue en Render

### Configuración
- **Tipo**: Static Site
- **Root Directory**: `frontend`
- **Publish Directory**: `public`
- **Build Command**: (ninguno - es HTML estático)

### Pasos para desplegar

1. Conecta este repositorio a Render
2. Selecciona "Static Site"
3. Configura:
   - **Root Directory**: `frontend`
   - **Publish Directory**: `public`
4. Despliega

### Configuración Post-Despliegue

Después del despliegue, necesitas actualizar:

1. En `public/js/config.js`:
   - Actualizar `production.apiUrl` con tu URL de Railway
   - Ejemplo: `https://tu-backend.up.railway.app`

2. En Railway (Backend):
   - Agregar variable de entorno `CORS_ORIGIN` con tu URL de Render
   - Ejemplo: `https://tu-app.onrender.com`

## Estructura
```
frontend/
├── public/
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── ImagenesPerfumes/
│   └── admin/              # ⭐ Panel de Administración
│       ├── login.html
│       ├── dashboard.html
│       └── assets/
└── README.md
```

## Desarrollo Local

Sirve los archivos con cualquier servidor HTTP:

```bash
# Con Python
cd public
python -m http.server 5500

# Con Node.js
npx serve public -p 5500

# Con VS Code Live Server
# Click derecho en index.html > Open with Live Server
```

## Variables de Configuración

Edita `public/js/config.js` para configurar:
- URL del backend (desarrollo y producción)
- Número de WhatsApp
- Redes sociales

## URLs Importantes

Después del despliegue:

```
Sitio Principal:  https://tu-app.onrender.com
Panel Admin:      https://tu-app.onrender.com/admin/login.html
Dashboard:        https://tu-app.onrender.com/admin/dashboard.html
```

## Seguridad del Admin

🔒 **Importante:**
1. Cambia la contraseña por defecto después del primer login
2. No compartas las credenciales del superadmin
3. Crea usuarios específicos para cada persona
4. Revisa los logs regularmente

Ver `ACCESO_ADMIN.md` para guía completa de seguridad.
