# 🚀 Guía para Configurar la Base de Datos en Railway

## 📋 Pasos para Solucionar el Error de Conexión

### 1️⃣ Verificar Variables de Entorno en Railway

En Railway, cuando agregas un servicio MySQL, automáticamente se crean variables de entorno. Necesitas verificar que estén disponibles:

1. Ve a tu proyecto en Railway
2. Haz clic en el servicio **PerfumeriaPremium** (tu aplicación)
3. Ve a la pestaña **Variables**
4. Verifica que existan estas variables (deben estar automáticamente si conectaste MySQL):
   - `MYSQL_HOST`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`
   - `MYSQL_PORT`

**Si NO están disponibles:**
- Ve al servicio **MySQL**
- Haz clic en **Variables**
- Copia las variables que veas allí
- Vuelve al servicio **PerfumeriaPremium**
- Agrega manualmente las variables con los mismos valores

### 2️⃣ Conectar MySQL al Servicio de la Aplicación

1. En Railway, ve a tu servicio **PerfumeriaPremium**
2. Haz clic en la pestaña **Settings**
3. Busca la sección **Service Connections** o **Dependencies**
4. Conecta el servicio **MySQL** a tu aplicación
5. Esto hará que Railway inyecte automáticamente las variables de entorno

### 3️⃣ Ejecutar el Script SQL en la Base de Datos

Tienes dos opciones:

#### Opción A: Usando Railway CLI (Recomendado)

1. Instala Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Inicia sesión:
   ```bash
   railway login
   ```

3. Conecta a tu proyecto:
   ```bash
   railway link
   ```

4. Conecta a MySQL y ejecuta el script:
   ```bash
   railway connect mysql
   ```
   Luego ejecuta:
   ```sql
   source backend/database/COMPLETA_perfumeria2.sql
   ```

#### Opción B: Usando MySQL Workbench o DBeaver

1. En Railway, ve al servicio **MySQL**
2. Haz clic en la pestaña **Connect**
3. Copia la cadena de conexión o los datos de conexión
4. Conéctate usando MySQL Workbench o DBeaver
5. Ejecuta el script `backend/database/COMPLETA_perfumeria2.sql`

#### Opción C: Usando la Terminal de Railway

1. En Railway, ve al servicio **MySQL**
2. Haz clic en la pestaña **Connect**
3. Usa la opción **MySQL Shell** o **Terminal**
4. Ejecuta:
   ```bash
   mysql -u $MYSQLUSER -p$MYSQLPASSWORD -h $MYSQLHOST $MYSQLDATABASE < backend/database/COMPLETA_perfumeria2.sql
   ```

### 4️⃣ Verificar que la Aplicación se Conecte

1. Después de ejecutar el script SQL, vuelve a Railway
2. Ve al servicio **PerfumeriaPremium**
3. Haz clic en **Deploy** o espera a que se reinicie automáticamente
4. Ve a la pestaña **Deploy Logs**
5. Deberías ver: `✅ Conexión a la base de datos establecida correctamente.`

### 5️⃣ Verificar que Todo Funcione

1. Una vez que la aplicación esté corriendo, prueba acceder a:
   - `https://tu-app.railway.app/api/perfumes`
2. Deberías recibir una respuesta JSON con los perfumes

## 🔧 Solución de Problemas

### Error: "ECONNREFUSED"

**Causa:** La aplicación no puede conectarse a MySQL

**Solución:**
1. Verifica que el servicio MySQL esté corriendo (debe tener un checkmark verde)
2. Verifica que las variables de entorno estén configuradas
3. Asegúrate de que el servicio MySQL esté conectado al servicio de la aplicación

### Error: "Access denied for user"

**Causa:** Credenciales incorrectas

**Solución:**
1. Verifica las variables de entorno `MYSQL_USER` y `MYSQL_PASSWORD`
2. Asegúrate de que coincidan con las del servicio MySQL

### Error: "Unknown database 'perfumeria2'"

**Causa:** La base de datos no existe

**Solución:**
1. Ejecuta el script SQL completo (`COMPLETA_perfumeria2.sql`)
2. Verifica que la variable `MYSQL_DATABASE` tenga el valor correcto

## 📝 Notas Importantes

- El código ya está actualizado para usar las variables de entorno de Railway (`MYSQL_HOST`, `MYSQL_USER`, etc.)
- Si prefieres usar tus propias variables (`DB_HOST`, `DB_USER`, etc.), también funcionará
- El script SQL crea la base de datos `perfumeria2` si no existe
- Las credenciales por defecto del administrador son:
  - Usuario: `admin`
  - Contraseña: `admin123`

## ✅ Checklist

- [ ] Variables de entorno configuradas en Railway
- [ ] Servicio MySQL conectado a la aplicación
- [ ] Script SQL ejecutado en la base de datos
- [ ] Aplicación reiniciada y corriendo
- [ ] Logs muestran conexión exitosa
- [ ] API responde correctamente

