# 🚀 Guía de Despliegue a Producción - Perfumería Elegancia

## 📋 **CHECKLIST PREVIO AL DESPLIEGUE**

Antes de desplegar a producción, verifica que hayas completado estos pasos:

- [ ] Tienes un servidor/hosting con Node.js instalado
- [ ] Tienes acceso a una base de datos MySQL
- [ ] Tienes un dominio configurado
- [ ] Has probado la aplicación localmente sin errores

---

## 🔧 **PASO 1: CONFIGURAR EL BACKEND**

### 1.1 Subir archivos del backend al servidor

Sube toda la carpeta `backend` a tu servidor. Estructura esperada:
```
/tu-servidor/
  └── backend/
      ├── src/
      ├── package.json
      └── (otros archivos)
```

### 1.2 Crear el archivo `.env` en el servidor

En la carpeta `backend`, crea un archivo llamado `.env` con el siguiente contenido:

```env
# ==============================================
# PRODUCCIÓN - Perfumería Elegancia
# ==============================================

NODE_ENV=production
PORT=3000

# Base de datos
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql_segura
DB_NAME=perfumeria

# CORS - Pon tu dominio real aquí
CORS_ORIGIN=https://tuperfumeria.com,https://www.tuperfumeria.com
```

**⚠️ IMPORTANTE:**
- Reemplaza `tu_usuario_mysql` con tu usuario de MySQL
- Reemplaza `tu_contraseña_mysql_segura` con una contraseña fuerte
- Reemplaza `tuperfumeria.com` con tu dominio real
- Si usas `www`, agrega ambas versiones separadas por coma

### 1.3 Instalar dependencias

En el servidor, dentro de la carpeta `backend`, ejecuta:

```bash
cd backend
npm install --production
```

### 1.4 Iniciar el backend

Tienes varias opciones:

**Opción A: Con PM2 (recomendado para producción)**
```bash
npm install -g pm2
pm2 start src/app.js --name "perfumeria-api"
pm2 save
pm2 startup
```

**Opción B: Con nohup**
```bash
nohup npm start &
```

**Opción C: Con systemd (Linux)**
Crea un archivo `/etc/systemd/system/perfumeria.service`:
```ini
[Unit]
Description=Perfumeria API
After=network.target

[Service]
Type=simple
User=tu_usuario
WorkingDirectory=/ruta/a/backend
ExecStart=/usr/bin/node src/app.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Luego:
```bash
sudo systemctl enable perfumeria
sudo systemctl start perfumeria
```

### 1.5 Verificar que el backend funciona

Accede a: `http://tu-servidor-ip:3000/health`

Deberías ver:
```json
{
  "success": true,
  "message": "Servidor funcionando correctamente ✅",
  "database": "Conectada",
  "environment": "production"
}
```

---

## 🎨 **PASO 2: CONFIGURAR EL FRONTEND**

### 2.1 Actualizar la configuración del API

Edita el archivo `frontend/public/js/config.js`:

```javascript
production: {
    // Cambia esta URL a tu servidor backend real
    apiUrl: 'https://api.tuperfumeria.com'  // O http://tu-ip:3000
}
```

**Opciones de configuración:**

**Si tienes un dominio y subdominio para el API:**
```javascript
apiUrl: 'https://api.tuperfumeria.com'
```

**Si el backend está en el mismo servidor:**
```javascript
apiUrl: 'https://tuperfumeria.com/api'
```

**Si usas IP y puerto:**
```javascript
apiUrl: 'http://123.456.789.0:3000'
```

### 2.2 Subir el frontend

Sube toda la carpeta `frontend/public` a tu hosting web. La estructura debe ser:

```
/public_html/  (o /htdocs/ o /www/)
  ├── index.html
  ├── css/
  │   └── style.css
  ├── js/
  │   ├── config.js
  │   └── main.js
  └── imagenesPerfumes/
      └── (todas las imágenes)
```

### 2.3 Configurar el servidor web

**Si usas Apache:**

Crea o edita el archivo `.htaccess` en la raíz del frontend:

```apache
# Habilitar CORS
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
</IfModule>

# Comprimir archivos
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Cache para recursos estáticos
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

**Si usas Nginx:**

Agrega esto a tu configuración:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

# CORS para el API
location /api/ {
    proxy_pass http://localhost:3000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE' always;
}

# Cache para imágenes
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 🗄️ **PASO 3: CONFIGURAR LA BASE DE DATOS**

### 3.1 Crear la base de datos

Accede a tu panel de MySQL (phpMyAdmin, cPanel, etc.) y ejecuta:

```sql
CREATE DATABASE perfumeria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE perfumeria;
```

### 3.2 Importar las tablas

Copia y pega el SQL completo que te proporcioné (con las tablas `perfumes` y `reseñas`).

### 3.3 Verificar la conexión

El backend mostrará en los logs:
```
Conexión a la base de datos establecida correctamente.
```

---

## 🔒 **PASO 4: SEGURIDAD Y OPTIMIZACIONES**

### 4.1 Configurar HTTPS

**Es OBLIGATORIO usar HTTPS en producción.**

**Opción A: Con Let's Encrypt (Gratis)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tuperfumeria.com -d www.tuperfumeria.com
```

**Opción B: Con tu proveedor de hosting**
- Accede al panel de control
- Busca "SSL/TLS" o "Certificado"
- Activa Let's Encrypt o sube tu certificado

### 4.2 Variables de entorno sensibles

**NUNCA** subas el archivo `.env` a Git. Asegúrate de que esté en `.gitignore`:

```
# .gitignore
backend/.env
backend/node_modules/
```

### 4.3 Firewall

Configura el firewall para permitir solo los puertos necesarios:

```bash
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # API (si está en puerto separado)
sudo ufw enable
```

### 4.4 Backup automático

Crea un script de backup diario para la base de datos:

```bash
#!/bin/bash
# backup.sh
mysqldump -u usuario -p'contraseña' perfumeria > backup_$(date +%Y%m%d).sql
```

Agrégalo al crontab:
```bash
crontab -e
# Agregar: 0 2 * * * /ruta/al/backup.sh
```

---

## 🧪 **PASO 5: PRUEBAS EN PRODUCCIÓN**

### 5.1 Verificar el backend

1. Accede a: `https://api.tuperfumeria.com/health`
2. Deberías ver el mensaje de éxito

### 5.2 Verificar el frontend

1. Accede a: `https://tuperfumeria.com`
2. Abre la consola del navegador (F12)
3. Busca: `🚀 Modo: PRODUCCIÓN`
4. Verifica que no haya errores de CORS

### 5.3 Probar las reseñas

1. Haz clic en un perfume
2. Ve a "Ver Detalles"
3. Intenta dejar una reseña
4. Verifica que se guarde correctamente

---

## 📊 **PASO 6: MONITOREO**

### 6.1 Logs del backend

```bash
# Con PM2
pm2 logs perfumeria-api

# Con systemd
sudo journalctl -u perfumeria -f

# Log directo
tail -f /ruta/a/backend/logs/app.log
```

### 6.2 Monitorear rendimiento

```bash
# Uso de recursos con PM2
pm2 monit

# Estado de la aplicación
pm2 status
```

---

## 🆘 **SOLUCIÓN DE PROBLEMAS**

### Error: "CORS policy error"

**Causa:** El dominio del frontend no está en CORS_ORIGIN

**Solución:**
1. Edita `backend/.env`
2. Agrega tu dominio a CORS_ORIGIN:
   ```
   CORS_ORIGIN=https://tuperfumeria.com,https://www.tuperfumeria.com
   ```
3. Reinicia el backend: `pm2 restart perfumeria-api`

### Error: "Cannot connect to database"

**Causa:** Credenciales incorrectas o base de datos no accesible

**Solución:**
1. Verifica las credenciales en `backend/.env`
2. Verifica que MySQL esté corriendo: `sudo systemctl status mysql`
3. Verifica que la base de datos existe: `mysql -u root -p -e "SHOW DATABASES;"`

### Error: "API URL not configured"

**Causa:** No actualizaste `config.js`

**Solución:**
1. Edita `frontend/public/js/config.js`
2. Cambia `production.apiUrl` a tu URL real
3. Vuelve a subir el archivo

### Error 502 Bad Gateway

**Causa:** El backend no está corriendo

**Solución:**
```bash
pm2 restart perfumeria-api
# o
sudo systemctl restart perfumeria
```

---

## ✅ **CHECKLIST FINAL**

Antes de dar por terminado el despliegue, verifica:

- [ ] ✅ Backend corriendo y accesible
- [ ] ✅ Frontend cargando correctamente
- [ ] ✅ Base de datos conectada
- [ ] ✅ HTTPS funcionando
- [ ] ✅ CORS configurado correctamente
- [ ] ✅ Puedes ver el catálogo de perfumes
- [ ] ✅ Puedes ver reseñas existentes
- [ ] ✅ Puedes enviar nuevas reseñas
- [ ] ✅ El carrito funciona
- [ ] ✅ WhatsApp funciona
- [ ] ✅ Las imágenes cargan correctamente
- [ ] ✅ No hay errores en la consola

---

## 📞 **CONTACTO Y SOPORTE**

Si tienes problemas durante el despliegue:

1. Revisa los logs del backend
2. Abre la consola del navegador (F12)
3. Verifica la configuración de `.env` y `config.js`
4. Asegúrate de que HTTPS esté activo

---

## 🎉 **¡FELICIDADES!**

Tu aplicación de Perfumería Elegancia ahora está en producción. 🚀

**Recuerda:**
- Hacer backups regulares de la base de datos
- Mantener Node.js y las dependencias actualizadas
- Monitorear los logs regularmente
- Revisar las reseñas de clientes

¡Éxito con tu tienda online! 💪

