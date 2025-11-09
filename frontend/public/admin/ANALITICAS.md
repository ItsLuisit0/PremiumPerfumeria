# 📊 Sistema de Analíticas - Perfumería Dashboard

## 🎯 Resumen

Sistema completo de visualización de datos con **7 gráficas interactivas** usando **Highcharts**, todas alimentadas con **datos reales** de la base de datos MySQL.

---

## 📈 Gráficas Implementadas

### 1️⃣ Perfumes por Categoría
**Tipo:** Pie Chart (Gráfica Circular)

**Datos mostrados:**
- Hombre
- Mujer  
- Unisex

**Características:**
- Porcentajes automáticos
- Colores vibrantes diferenciados
- Hover para ver cantidad exacta
- Leyenda interactiva

**Endpoint usado:** `/admin/estadisticas/categoria`

---

### 2️⃣ Top 10 Marcas
**Tipo:** Column Chart (Gráfica de Columnas)

**Datos mostrados:**
- Las 10 marcas con más perfumes en inventario
- Cantidad de perfumes por marca

**Características:**
- Barras verticales con colores únicos
- Etiquetas de datos en la parte superior
- Ordenado de mayor a menor

**Endpoint usado:** `/admin/estadisticas/marca`

---

### 3️⃣ Distribución de Stock
**Tipo:** Pie Chart (Gráfica Circular)

**Clasificación:**
```
🔴 Sin Stock (0 unidades)
🟠 Stock Crítico (1-5 unidades)
🟡 Stock Bajo (6-10 unidades)
🟢 Stock Normal (11-20 unidades)
🟢 Stock Alto (20+ unidades)
```

**Características:**
- Código de colores según criticidad
- Cantidad y porcentaje visible
- Click para resaltar segmento

**Endpoint usado:** `/admin/perfumes?activo=true`

---

### 4️⃣ Reseñas por Calificación
**Tipo:** Column Chart (Gráfica de Columnas)

**Datos mostrados:**
```
⭐ 1 Estrella    - Color Rojo
⭐⭐ 2 Estrellas  - Color Naranja
⭐⭐⭐ 3 Estrellas - Color Amarillo
⭐⭐⭐⭐ 4 Estrellas - Color Lima
⭐⭐⭐⭐⭐ 5 Estrellas - Color Verde
```

**Características:**
- Barras con gradiente de color
- Del rojo (malo) al verde (excelente)
- Contador de reseñas por nivel

**Endpoint usado:** `/admin/reviews?aprobada=true`

---

### 5️⃣ Distribución de Precios
**Tipo:** Area Spline Chart (Gráfica de Área)

**Rangos:**
```
$0-300      (Económicos)
$301-450    (Rango Medio-Bajo)
$451-550    (Rango Medio)
$551-700    (Rango Medio-Alto)
$701+       (Premium)
```

**Características:**
- Línea suave con relleno degradado
- Color morado (tema del dashboard)
- Hover para ver cantidad exacta

**Endpoint usado:** `/admin/perfumes?activo=true`

---

### 6️⃣ Perfumes Destacados
**Tipo:** Donut Chart (Gráfica de Dona)

**Datos mostrados:**
- Perfumes Destacados (rojo)
- Perfumes Regulares (gris)

**Características:**
- Centro vacío (estilo donut)
- Porcentajes visibles
- Comparación visual rápida

**Endpoint usado:** `/admin/perfumes?activo=true`

---

### 7️⃣ Stock por Perfume (Top 20 Críticos)
**Tipo:** Horizontal Bar Chart (Barras Horizontales)

**Datos mostrados:**
- Los 20 perfumes con MENOS stock
- Nombre del perfume + marca
- Stock actual

**Características:**
```
🔴 Rojo:    0-5 unidades (CRÍTICO)
🟠 Naranja: 6-10 unidades (BAJO)
🟢 Verde:   11+ unidades (NORMAL)
```

**Características especiales:**
- Colores por zonas según criticidad
- Ordenado de menor a mayor stock
- Etiquetas con cantidad exacta
- Perfecto para identificar qué reabastecer

**Endpoint usado:** `/admin/perfumes?activo=true`

---

## 🎨 Características Generales

### Interactividad
✅ **Hover/Tooltip** - Ver detalles al pasar el mouse
✅ **Zoom** - Ampliar áreas de interés
✅ **Selección** - Resaltar segmentos
✅ **Leyenda interactiva** - Mostrar/ocultar series

### Exportación
✅ **PNG** - Imagen rasterizada
✅ **JPG** - Imagen comprimida
✅ **PDF** - Documento portable
✅ **CSV** - Datos en Excel

### Responsive
✅ Se adaptan automáticamente al tamaño de pantalla
✅ Funciona en desktop, tablet y móvil
✅ Redimensionamiento inteligente

### Performance
✅ Carga paralela de todas las gráficas
✅ Animaciones suaves al renderizar
✅ Actualización manual con botón
✅ Cache de datos optimizado

---

## 🔄 Flujo de Datos

```
┌─────────────────┐
│  MySQL Database │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Backend API    │
│  (Node.js)      │
└────────┬────────┘
         │
         ↓ (JSON)
┌─────────────────┐
│  Dashboard.js   │
│  (JavaScript)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Highcharts    │
│   (Render)      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  HTML Canvas    │
│  (Visualización)│
└─────────────────┘
```

---

## 🚀 Cómo Usar

### 1. Acceder a Analíticas
```
1. Login en: http://127.0.0.1:5500/docs/admin/login.html
2. Usuario: admin
3. Contraseña: admin123
4. Click en "Analíticas" en el menú lateral
```

### 2. Actualizar Datos
```
- Click en el botón "Actualizar Gráficas"
- Las 7 gráficas se recargan en paralelo
- Toast de confirmación al finalizar
```

### 3. Exportar Gráfica
```
1. Hover sobre cualquier gráfica
2. Click en el menú "☰" (esquina superior derecha)
3. Seleccionar formato: PNG, JPG, PDF, CSV
4. El archivo se descarga automáticamente
```

### 4. Interactuar con Gráficas
```
- Hover: Ver tooltips con detalles
- Click en leyenda: Mostrar/ocultar series
- Click en segmento: Resaltar
- Doble click: Reset zoom
```

---

## 📊 Ejemplos de Insights

### Insights que puedes obtener:

✅ **¿Qué categoría vende más?**
   - Ver gráfica "Perfumes por Categoría"
   - Identificar el segmento más grande

✅ **¿Qué marcas dominar el inventario?**
   - Ver gráfica "Top 10 Marcas"
   - Las barras más altas = más productos

✅ **¿Cuántos productos están en riesgo?**
   - Ver gráfica "Distribución de Stock"
   - Sumar porcentajes de rojo + naranja

✅ **¿Los clientes están satisfechos?**
   - Ver gráfica "Reseñas por Calificación"
   - Si 4-5 estrellas > 70% = excelente

✅ **¿Qué rango de precio predomina?**
   - Ver gráfica "Distribución de Precios"
   - El pico más alto indica el rango dominante

✅ **¿Cuántos productos son premium?**
   - Ver gráfica "Perfumes Destacados"
   - Porcentaje en rojo

✅ **¿Qué necesito reabastecer urgentemente?**
   - Ver gráfica "Stock por Perfume"
   - Las barras rojas = prioridad máxima

---

## 🎨 Paleta de Colores

```css
Primary Gradient: #667eea → #764ba2 (Morado)
Success:         #10b981 (Verde)
Warning:         #f59e0b (Naranja)
Danger:          #ef4444 (Rojo)
Info:            #4facfe (Azul)
Secondary:       #6b7280 (Gris)
```

---

## 🔧 Personalización

### Agregar más gráficas:

1. Crear contenedor en `dashboard.html`:
```html
<div id="chartNuevaGrafica" style="height: 350px;"></div>
```

2. Crear función en `dashboard.js`:
```javascript
async function loadChartNuevaGrafica() {
    const data = await apiCall('/admin/endpoint');
    Highcharts.chart('chartNuevaGrafica', {
        // ... configuración
    });
}
```

3. Agregar a `loadAnaliticas()`:
```javascript
await Promise.all([
    loadChartPerfumesPorCategoria(),
    // ... otras gráficas
    loadChartNuevaGrafica()  // ← Nueva
]);
```

---

## 📚 Recursos

- [Highcharts Docs](https://www.highcharts.com/docs/)
- [Ejemplos de Gráficas](https://www.highcharts.com/demo)
- [API Reference](https://api.highcharts.com/highcharts/)

---

## ✅ Checklist de Implementación

- [x] Integrar Highcharts CDN
- [x] Crear página de analíticas en HTML
- [x] Implementar 7 tipos de gráficas
- [x] Conectar con endpoints del backend
- [x] Agregar interactividad (hover, click)
- [x] Implementar exportación de datos
- [x] Hacer responsive todas las gráficas
- [x] Agregar animaciones de carga
- [x] Botón de actualización manual
- [x] Documentación completa

---

**🎉 Sistema de Analíticas Completado al 100%**

Con datos reales, gráficas interactivas y exportación de reportes.

💜 **Perfumería Elegancia Dashboard**

