# 🎯 Dashboard de Administración - Perfumería

## 🔐 Acceso al Dashboard

### URL de Login
```
http://127.0.0.1:5500/docs/admin/login.html
```

### Credenciales por Defecto
```
Usuario: admin
Contraseña: admin123
```

---

## 📊 Funcionalidades

### 1. **Dashboard Principal (Estadísticas y Analíticas)**
Página integrada con resumen del catálogo y gráficas interactivas:

#### 📈 Resumen del Catálogo
- Total de perfumes activos
- Total de reseñas aprobadas  
- Stock total disponible
- Alertas de productos con stock bajo

#### 📊 Gráficas Esenciales (2 gráficas interactivas con Highcharts)
1. **Estado del Inventario** (Pie Chart)
   - 5 niveles: Sin Stock, Crítico, Bajo, Normal, Alto
   - Vista rápida del estado general del inventario
   
2. **Distribución por Categoría** (Pie Chart)
   - Distribución por género (Hombre/Mujer/Unisex)
   - Porcentajes de cada categoría

### 2. **Gestión de Perfumes**

#### Agregar Nuevo Perfume
1. Ve a **Perfumes** en el menú lateral
2. Haz clic en el botón verde **"+ Agregar Perfume"**
3. Completa el formulario con la información del perfume:
   - **Marca*** (requerido): Ej: Dior
   - **Nombre*** (requerido): Ej: Sauvage
   - **Tipo*** (requerido): Eau de Parfum, Eau de Toilette, etc.
   - **Categoría*** (requerido): Hombre, Mujer o Unisex
   - **Descripción**: Texto descriptivo del perfume
   - **Notas**: Notas olfativas del perfume
   - **Precio*** (requerido): Precio en pesos
   - **ML*** (requerido): Mililitros de la presentación
   - **Stock Inicial*** (requerido): Cantidad inicial en inventario
   - **URL de Imagen**: Ruta de la imagen (opcional, se genera automáticamente si se deja vacío)
   - **Perfume Activo**: Switch para activar/desactivar
   - **Marcar como Destacado**: Switch para productos destacados
4. Haz clic en **"Guardar Perfume"**

#### Actualizar Stock
1. Ve a **Perfumes** en el menú lateral
2. Haz clic en el botón azul 📦 del perfume que deseas actualizar
3. Ingresa el nuevo stock
4. Guarda los cambios

#### Actualizar Descuentos ⭐
1. Ve a **Perfumes** en el menú lateral
2. Haz clic en el botón amarillo **%** del perfume
3. El modal te mostrará:
   - Precio base del perfume
   - Campo para ingresar el descuento (0-100%)
   - **Preview del precio final** actualizado en tiempo real
   - Botones de descuento rápido (10%, 15%, 20%, 25%, 30%, 50%)
4. Selecciona un descuento rápido o ingresa uno personalizado
5. Haz clic en "Aplicar Descuento"

**Características del Descuento:**
- ✅ Preview en tiempo real del precio final
- ✅ Botones rápidos para descuentos comunes
- ✅ Validación automática (0-100%)
- ✅ Se visualiza en la tabla con badge verde
- ✅ Muestra precio original y precio con descuento

### 3. **Gestión de Reseñas**
- Aprobar reseñas pendientes ✅
- Rechazar reseñas ❌
- Eliminar reseñas 🗑️
- Ver calificaciones de usuarios

### 4. **Control de Stock Bajo**
- Vista dedicada de productos con stock crítico
- Códigos de color:
  - 🔴 Rojo: Sin stock o crítico (≤5 unidades)
  - 🟡 Amarillo: Stock bajo (≤10 unidades)
  - 🟢 Verde: Stock normal

---

## 🛠️ Características Técnicas

### Seguridad
- ✅ Autenticación JWT
- ✅ Tokens con expiración de 24 horas
- ✅ Control de roles (superadmin, admin, moderador)
- ✅ Logout seguro con revocación de tokens

### UI/UX
- ✅ Diseño moderno con gradientes
- ✅ Animaciones suaves
- ✅ Responsive (funciona en móvil)
- ✅ Notificaciones toast
- ✅ Preview en tiempo real de cambios
- ✅ **Highcharts** para visualización de datos

### Rendimiento
- ✅ Actualizaciones en tiempo real
- ✅ Caché de datos
- ✅ Carga optimizada de tablas
- ✅ Carga paralela de gráficas

---

## 🔄 Actualizar Administrador

Si necesitas resetear el administrador:

```bash
node backend/scripts/updateAdmin.js
```

Este script:
- Elimina el administrador antiguo
- Crea uno nuevo con las credenciales por defecto
- Muestra la información de acceso

---

## 🎨 Estructura de Archivos

```
docs/admin/
├── login.html              # Página de login
├── dashboard.html          # Dashboard principal
├── assets/
│   ├── dashboard.css       # Estilos del dashboard
│   └── dashboard.js        # Funcionalidad del dashboard (incluye Highcharts)
└── README.md              # Este archivo
```

---

## 📝 Notas Importantes

1. **Siempre cierra sesión** cuando termines de usar el dashboard
2. **Los descuentos** se aplican automáticamente en el frontend de clientes
3. **El stock** se actualiza en tiempo real
4. **Las reseñas pendientes** deben ser moderadas manualmente
5. **Las analíticas** se cargan con datos reales de la base de datos

---

## 🐛 Solución de Problemas

### "Credenciales inválidas"
1. Verifica que el backend esté corriendo (`npm start` en `/backend`)
2. Ejecuta `node backend/scripts/updateAdmin.js`
3. Usa las credenciales: `admin` / `admin123`

### "Token expirado"
- Simplemente vuelve a hacer login

### "Error al conectar"
- Verifica que el backend esté en `http://localhost:3000`
- Revisa la consola del navegador (F12)

### "Las gráficas no cargan"
- Asegúrate de tener conexión a internet (Highcharts se carga desde CDN)
- Verifica que haya datos en la base de datos
- Revisa la consola del navegador para errores

---

## ✨ Mejoras Futuras

- [ ] Agregar nuevos perfumes desde el dashboard
- [ ] Editar información completa de perfumes
- [ ] Subir imágenes de perfumes
- [ ] Filtros avanzados en analíticas (por fecha, rango)
- [ ] Gráficas adicionales (ventas, tendencias temporales)
- [ ] Exportar reportes completos en PDF
- [ ] Gestión de administradores (crear, editar, eliminar)
- [ ] Historial de cambios (logs completos)
- [ ] Notificaciones en tiempo real

---

## 📊 Librerías Utilizadas

- **Bootstrap 5.3.2** - Framework CSS
- **Font Awesome 6.5.1** - Iconos
- **Highcharts** - Gráficas interactivas
- **Fetch API** - Comunicación con el backend
- **JWT** - Autenticación segura

---

**Desarrollado para Perfumería Elegancia** 💜

Con amor y código 💻✨

