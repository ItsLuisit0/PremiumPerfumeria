# Configuración de Railway para Producción

## Variables de Entorno Necesarias

En el dashboard de Railway, configura las siguientes variables de entorno:

### Base de Datos MySQL
```
MYSQL_HOST=your-mysql-host
MYSQL_USER=root
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=perfumeria2
MYSQL_PORT=3306
```

O usa la URL completa de conexión:
```
MYSQL_URL=mysql://user:password@host:port/database
```

### Configuración de la Aplicación
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### CORS (Opcional)
```
CORS_ORIGIN=https://perfumeriapremium-production.up.railway.app
```

### Cloudinary (Opcional - para subir imágenes)
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Pasos para Deployar

1. **Conecta tu repositorio** a Railway
2. **Configura las variables de entorno** en el dashboard
3. **Agrega un servicio MySQL** en Railway (o usa una base de datos externa)
4. **Verifica los logs** en Railway para ver si hay errores de conexión

## Verificación

Una vez desplegado, verifica:
- `/health` - Debe responder con estado del servidor
- `/api/perfumes` - Debe devolver los perfumes

## Troubleshooting

Si ves error 500:
1. Revisa los logs en Railway: `railway logs`
2. Verifica que todas las variables de entorno estén configuradas
3. Confirma que la base de datos esté accesible desde Railway
4. Verifica que la tabla `perfumes` exista en la base de datos

