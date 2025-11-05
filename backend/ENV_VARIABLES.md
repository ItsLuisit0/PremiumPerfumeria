# Variables de Entorno - Backend

## Instrucciones de Configuración

Crea un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```env
# ==============================================
# CONFIGURACIÓN DEL SERVIDOR
# ==============================================

# Puerto en el que correrá el servidor
PORT=3000

# Ambiente de ejecución (development, production, test)
NODE_ENV=development

# ==============================================
# CONFIGURACIÓN DE BASE DE DATOS
# ==============================================

# Host de la base de datos MySQL
DB_HOST=localhost

# Usuario de la base de datos
DB_USER=root

# Contraseña de la base de datos (REQUERIDA en producción)
DB_PASSWORD=

# Nombre de la base de datos
DB_NAME=perfumeria

# ==============================================
# CONFIGURACIÓN DE CORS
# ==============================================

# Orígenes permitidos para CORS (separados por comas)
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500,http://localhost:8080
```

## Notas Importantes

1. **NUNCA** subas el archivo `.env` al repositorio (está en `.gitignore`)
2. En **producción**, `DB_PASSWORD` es **OBLIGATORIA**
3. Configura `CORS_ORIGIN` con tu dominio de producción
4. Para Railway, configura estas variables en el panel de Railway

## Ejemplo de Producción (Railway)

```env
PORT=3000
NODE_ENV=production
DB_HOST=tu-host-mysql.railway.app
DB_USER=root
DB_PASSWORD=tu_password_segura
DB_NAME=perfumeria
CORS_ORIGIN=https://itsluisit0.github.io
```

