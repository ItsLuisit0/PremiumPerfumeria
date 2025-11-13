const API_URL = `${AppConfig.getApiUrl()}/api`;
let adminToken = null;
let adminUser = null;

// =====================================================
// INICIALIZACIÓN
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    adminToken = localStorage.getItem('adminToken');
    adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

    if (!adminToken) {
        window.location.href = 'login.html';
        return;
    }

    // Mostrar nombre del admin
    document.getElementById('adminName').textContent = adminUser.nombre_completo || adminUser.username;

    // Cargar página inicial
    loadEstadisticas();
    
    // Cargar gráficas esenciales automáticamente
    setTimeout(() => {
        loadChartStockDistribucion();
        loadChartPerfumesPorCategoria();
    }, 500);

    // Event listeners
    setupEventListeners();
});

// =====================================================
// EVENT LISTENERS
// =====================================================

function setupEventListeners() {
    // Navegación
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            navigateTo(page);
        });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Sidebar toggle
    document.getElementById('sidebarCollapse').addEventListener('click', function() {
        document.getElementById('sidebar').classList.toggle('active');
    });

    // Búsqueda de perfumes
    document.getElementById('btnBuscar')?.addEventListener('click', loadPerfumes);

    // Guardar stock
    document.getElementById('saveStockBtn')?.addEventListener('click', saveStock);

    // Guardar descuento
    document.getElementById('saveDescuentoBtn')?.addEventListener('click', saveDescuento);

    // Actualizar preview de precio al cambiar descuento
    document.getElementById('editDescuentoValue')?.addEventListener('input', updatePrecioPreview);

    // Botón de actualizar gráficas
    document.getElementById('refreshChartsBtn')?.addEventListener('click', loadAnaliticas);

    // Botón de agregar perfume
    document.getElementById('addPerfumeBtn')?.addEventListener('click', openAddPerfumeModal);
    
    // Guardar nuevo perfume
    document.getElementById('savePerfumeBtn')?.addEventListener('click', savePerfume);
}

// =====================================================
// NAVEGACIÓN
// =====================================================

function navigateTo(page) {
    // Remover active de todos los links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Activar link actual
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });

    // Mostrar página seleccionada
    document.getElementById(`page-${page}`)?.classList.add('active');

    // Cargar datos según la página
    switch(page) {
        case 'estadisticas':
            loadEstadisticas();
            loadChartStockDistribucion();
            loadChartPerfumesPorCategoria();
            break;
        case 'perfumes':
            loadPerfumes();
            break;
        case 'reviews':
            loadReviews();
            break;
        case 'stock':
            loadStockBajoFull();
            break;
    }
}

// =====================================================
// API CALLS
// =====================================================

async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`,
                ...options.headers
            }
        });

        const data = await response.json();

        if (response.status === 401) {
            // Token expirado
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = 'login.html';
            return null;
        }

        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        showToast(error.message, 'danger');
        return null;
    }
}

// =====================================================
// ESTADÍSTICAS
// =====================================================

async function loadEstadisticas() {
    const data = await apiCall('/admin/estadisticas');
    
    if (data && data.success) {
        const stats = data.data;
        document.getElementById('stat-perfumes').textContent = stats.total_perfumes || 0;
        document.getElementById('stat-reviews').textContent = stats.total_reviews || 0;
        document.getElementById('stat-stock').textContent = stats.stock_total || 0;
        document.getElementById('stat-stock-bajo').textContent = stats.productos_stock_bajo || 0;
    }
}


// =====================================================
// PERFUMES
// =====================================================

async function loadPerfumes() {
    const search = document.getElementById('searchPerfume')?.value || '';
    const activo = document.getElementById('filterActivo')?.value || '';
    
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (activo) query.append('activo', activo);
    
    const data = await apiCall(`/admin/perfumes?${query.toString()}`);
    
    if (data && data.success) {
        const tbody = document.getElementById('perfumesTable');
        
        if (data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No se encontraron perfumes</td></tr>';
            return;
        }

        tbody.innerHTML = data.data.map(perfume => `
            <tr>
                <td>${perfume.id_perfume}</td>
                <td><strong>${perfume.nombre}</strong></td>
                <td>${perfume.marca}</td>
                <td>
                    <div>$${parseFloat(perfume.precio_minimo).toFixed(2)}</div>
                    ${perfume.descuento_porcentaje > 0 ? 
                        `<small class="text-success"><strong>$${parseFloat(perfume.precio_con_descuento).toFixed(2)}</strong></small>` 
                        : ''}
                </td>
                <td><span class="badge bg-${getStockBadgeColor(perfume.stock)}">${perfume.stock}</span></td>
                <td>
                    ${perfume.descuento_porcentaje > 0 ? 
                        `<span class="badge bg-success">${perfume.descuento_porcentaje}%</span>` 
                        : '<span class="badge bg-secondary">0%</span>'}
                </td>
                <td>
                    <span class="badge ${perfume.activo ? 'bg-success' : 'bg-secondary'}">
                        ${perfume.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="openEditStock(${perfume.id_perfume}, '${perfume.nombre.replace(/'/g, "\\'")}', ${perfume.stock})" title="Actualizar Stock">
                        <i class="fas fa-box"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="openEditDescuento(${perfume.id_perfume}, '${perfume.nombre.replace(/'/g, "\\'")}', ${parseFloat(perfume.precio_minimo)}, ${perfume.descuento_porcentaje})" title="Actualizar Descuento">
                        <i class="fas fa-percent"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// =====================================================
// RESEÑAS
// =====================================================

async function loadReviews() {
    const data = await apiCall('/admin/reviews');
    
    if (data && data.success) {
        const tbody = document.getElementById('reviewsTable');
        
        if (data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay reseñas</td></tr>';
            return;
        }

        tbody.innerHTML = data.data.map(review => `
            <tr>
                <td>${review.usuario}</td>
                <td>${review.nombre_perfume} <small class="text-muted">(${review.marca})</small></td>
                <td>${getStarRating(review.calificacion)}</td>
                <td>${review.comentario.substring(0, 50)}${review.comentario.length > 50 ? '...' : ''}</td>
                <td>
                    <span class="badge ${review.aprobada ? 'bg-success' : 'bg-warning'}">
                        ${review.aprobada ? 'Aprobada' : 'Pendiente'}
                    </span>
                </td>
                <td>
                    ${!review.aprobada ? `
                        <button class="btn btn-sm btn-success" onclick="moderarReview(${review.id_reseña}, true)">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="moderarReview(${review.id_reseña}, false)">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-danger" onclick="deleteReview(${review.id_reseña})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

async function moderarReview(id, aprobada) {
    const data = await apiCall(`/admin/reviews/${id}/moderar`, {
        method: 'PATCH',
        body: JSON.stringify({ aprobada })
    });
    
    if (data && data.success) {
        showToast(data.message, 'success');
        loadReviews();
    }
}

async function deleteReview(id) {
    if (!confirm('¿Estás seguro de eliminar esta reseña?')) return;
    
    const data = await apiCall(`/admin/reviews/${id}`, {
        method: 'DELETE'
    });
    
    if (data && data.success) {
        showToast('Reseña eliminada', 'success');
        loadReviews();
    }
}

// =====================================================
// STOCK
// =====================================================

async function loadStockBajoFull() {
    const data = await apiCall('/admin/stock-bajo');
    
    if (data && data.success) {
        const tbody = document.getElementById('stockTable');
        
        if (data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay productos con stock bajo</td></tr>';
            return;
        }

        tbody.innerHTML = data.data.map(producto => `
            <tr>
                <td>${producto.id_perfume}</td>
                <td><strong>${producto.nombre}</strong></td>
                <td>${producto.marca}</td>
                <td><span class="badge bg-${getStockBadgeColor(producto.stock)}">${producto.stock}</span></td>
                <td>$${parseFloat(producto.precio_minimo).toFixed(2)}</td>
                <td><span class="badge bg-${getEstadoBadgeColor(producto.estado_stock)}">${producto.estado_stock}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="openEditStock(${producto.id_perfume}, '${producto.nombre.replace(/'/g, "\\'")}', ${producto.stock})">
                        <i class="fas fa-edit"></i> Actualizar
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

function openEditStock(id, nombre, stockActual) {
    document.getElementById('editStockId').value = id;
    document.getElementById('editStockNombre').value = nombre;
    document.getElementById('editStockValue').value = stockActual;
    
    const modal = new bootstrap.Modal(document.getElementById('editStockModal'));
    modal.show();
}

async function saveStock() {
    const id = document.getElementById('editStockId').value;
    const stock = document.getElementById('editStockValue').value;
    
    const data = await apiCall(`/admin/perfumes/${id}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ stock: parseInt(stock) })
    });
    
    if (data && data.success) {
        showToast('Stock actualizado', 'success');
        bootstrap.Modal.getInstance(document.getElementById('editStockModal')).hide();
        
        // Recargar datos
        loadEstadisticas();
        if (document.getElementById('page-perfumes').classList.contains('active')) {
            loadPerfumes();
        }
        if (document.getElementById('page-stock').classList.contains('active')) {
            loadStockBajoFull();
        }
    }
}

// Abrir modal de descuento
function openEditDescuento(id, nombre, precioBase, descuentoActual) {
    document.getElementById('editDescuentoId').value = id;
    document.getElementById('editDescuentoNombre').value = nombre;
    document.getElementById('editDescuentoPrecioBase').value = precioBase.toFixed(2);
    document.getElementById('editDescuentoValue').value = descuentoActual;
    
    // Calcular precio final
    updatePrecioPreview();
    
    const modal = new bootstrap.Modal(document.getElementById('editDescuentoModal'));
    modal.show();
}

// Actualizar preview del precio final
function updatePrecioPreview() {
    const precioBase = parseFloat(document.getElementById('editDescuentoPrecioBase').value);
    const descuento = parseFloat(document.getElementById('editDescuentoValue').value) || 0;
    
    const precioFinal = precioBase * (1 - descuento / 100);
    document.getElementById('precioFinalPreview').textContent = `$${precioFinal.toFixed(2)}`;
    
    // Cambiar color según el descuento
    const preview = document.getElementById('precioFinalPreview');
    if (descuento === 0) {
        preview.className = 'fs-5 text-secondary ms-2';
    } else if (descuento < 20) {
        preview.className = 'fs-5 text-info ms-2';
    } else if (descuento < 50) {
        preview.className = 'fs-5 text-success ms-2';
    } else {
        preview.className = 'fs-5 text-danger ms-2';
    }
}

// Establecer descuento rápido
function setDescuentoRapido(descuento) {
    document.getElementById('editDescuentoValue').value = descuento;
    updatePrecioPreview();
}

// Guardar descuento
async function saveDescuento() {
    const id = document.getElementById('editDescuentoId').value;
    const descuento = parseFloat(document.getElementById('editDescuentoValue').value);
    
    if (isNaN(descuento) || descuento < 0 || descuento > 100) {
        showToast('El descuento debe estar entre 0 y 100', 'danger');
        return;
    }
    
    const data = await apiCall(`/admin/perfumes/${id}/descuento`, {
        method: 'PATCH',
        body: JSON.stringify({ descuento_porcentaje: descuento })
    });
    
    if (data && data.success) {
        showToast('¡Descuento actualizado correctamente!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('editDescuentoModal')).hide();
        
        // Recargar datos
        loadEstadisticas();
        if (document.getElementById('page-perfumes').classList.contains('active')) {
            loadPerfumes();
        }
    }
}

// Abrir modal de agregar perfume
function openAddPerfumeModal() {
    // Limpiar el formulario
    document.getElementById('addPerfumeForm').reset();
    
    // Asegurar que "Activo" esté marcado por defecto
    document.getElementById('addActivo').checked = true;
    document.getElementById('addDestacado').checked = false;
    
    // Abrir el modal
    const modal = new bootstrap.Modal(document.getElementById('addPerfumeModal'));
    modal.show();
}

// Guardar nuevo perfume
async function savePerfume() {
    // Validar formulario
    const form = document.getElementById('addPerfumeForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Recopilar datos del formulario
    const perfumeData = {
        marca: document.getElementById('addMarca').value.trim(),
        nombre: document.getElementById('addNombre').value.trim(),
        tipo: document.getElementById('addTipo').value,
        publico: document.getElementById('addPublico').value,
        descripcion: document.getElementById('addDescripcion').value.trim() || null,
        notas: document.getElementById('addNotas').value.trim() || null,
        precio_minimo: parseFloat(document.getElementById('addPrecio').value),
        mililitros: parseInt(document.getElementById('addMililitros').value),
        stock: parseInt(document.getElementById('addStock').value),
        imagen_url: document.getElementById('addImagenUrl').value.trim() || null,
        activo: document.getElementById('addActivo').checked,
        destacado: document.getElementById('addDestacado').checked
    };
    
    // Validaciones adicionales
    if (perfumeData.precio_minimo <= 0) {
        showToast('El precio debe ser mayor a 0', 'danger');
        return;
    }
    
    if (perfumeData.mililitros <= 0) {
        showToast('Los mililitros deben ser mayores a 0', 'danger');
        return;
    }
    
    // Enviar al servidor
    const data = await apiCall('/admin/perfumes', {
        method: 'POST',
        body: JSON.stringify(perfumeData)
    });
    
    if (data && data.success) {
        showToast('✅ Perfume agregado exitosamente!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('addPerfumeModal')).hide();
        
        // Recargar datos
        loadEstadisticas();
        if (document.getElementById('page-perfumes').classList.contains('active')) {
            loadPerfumes();
        }
    }
}

// =====================================================
// LOGOUT
// =====================================================

async function logout() {
    await apiCall('/admin/logout', { method: 'POST' });
    
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = 'login.html';
}

// =====================================================
// UTILIDADES
// =====================================================

function getStockBadgeColor(stock) {
    if (stock === 0) return 'danger';
    if (stock <= 5) return 'danger';
    if (stock <= 10) return 'warning';
    return 'success';
}

function getEstadoBadgeColor(estado) {
    switch(estado) {
        case 'SIN STOCK': return 'danger';
        case 'CRÍTICO': return 'danger';
        case 'BAJO': return 'warning';
        default: return 'success';
    }
}

function getStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '⭐' : '☆';
    }
    return stars;
}

function showToast(message, type = 'info') {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    toast.style.zIndex = '9999';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// =====================================================
// ANALÍTICAS - HIGHCHARTS
// =====================================================

async function loadAnaliticas() {
    // Recargar gráficas esenciales del dashboard
    await Promise.all([
        loadChartStockDistribucion(),
        loadChartPerfumesPorCategoria()
    ]);
    
    showToast('Gráficas actualizadas', 'success');
}

// 1. Perfumes por Categoría (Pie Chart)
async function loadChartPerfumesPorCategoria() {
    const data = await apiCall('/admin/estadisticas/categoria');
    
    if (data && data.success) {
        const chartData = data.data.map(item => ({
            name: item.categoria,
            y: parseInt(item.total_productos),
            drilldown: item.categoria
        }));
        
        Highcharts.chart('chartPerfumesPorCategoria', {
            chart: {
                type: 'pie'
            },
            title: {
                text: null
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f}%'
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: 'Perfumes',
                colorByPoint: true,
                data: chartData
            }],
            colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b']
        });
    }
}

// 2. Perfumes por Marca (Bar Chart - Top 10)
async function loadChartPerfumesPorMarca() {
    const data = await apiCall('/admin/estadisticas/marca');
    
    if (data && data.success) {
        // Tomar solo las primeras 10 marcas
        const top10 = data.data.slice(0, 10);
        const categories = top10.map(item => item.marca);
        const seriesData = top10.map(item => parseInt(item.total_productos));
        
        Highcharts.chart('chartPerfumesPorMarca', {
            chart: {
                type: 'column'
            },
            title: {
                text: null
            },
            xAxis: {
                categories: categories,
                title: {
                    text: 'Marcas'
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Cantidad de Perfumes'
                }
            },
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true
                    },
                    colorByPoint: true
                }
            },
            series: [{
                name: 'Perfumes',
                data: seriesData,
                showInLegend: false
            }],
            colors: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81']
        });
    }
}

// 3. Distribución de Stock (Pie Chart)
async function loadChartStockDistribucion() {
    const data = await apiCall('/admin/perfumes?activo=true');
    
    if (data && data.success) {
        const perfumes = data.data;
        
        // Clasificar por stock
        const sinStock = perfumes.filter(p => p.stock === 0).length;
        const stockCritico = perfumes.filter(p => p.stock > 0 && p.stock <= 5).length;
        const stockBajo = perfumes.filter(p => p.stock > 5 && p.stock <= 10).length;
        const stockNormal = perfumes.filter(p => p.stock > 10 && p.stock <= 20).length;
        const stockAlto = perfumes.filter(p => p.stock > 20).length;
        
        Highcharts.chart('chartStockDistribucion', {
            chart: {
                type: 'pie'
            },
            title: {
                text: null
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)'
                    }
                }
            },
            series: [{
                name: 'Perfumes',
                colorByPoint: true,
                data: [
                    { name: 'Sin Stock', y: sinStock, color: '#ef4444' },
                    { name: 'Stock Crítico (1-5)', y: stockCritico, color: '#f59e0b' },
                    { name: 'Stock Bajo (6-10)', y: stockBajo, color: '#fbbf24' },
                    { name: 'Stock Normal (11-20)', y: stockNormal, color: '#10b981' },
                    { name: 'Stock Alto (20+)', y: stockAlto, color: '#059669' }
                ]
            }]
        });
    }
}

// 4. Reseñas por Calificación (Column Chart)
async function loadChartReseñasPorCalificacion() {
    const data = await apiCall('/admin/reviews?aprobada=true');
    
    if (data && data.success) {
        const reviews = data.data;
        
        // Contar por calificación
        const calificaciones = [1, 2, 3, 4, 5];
        const counts = calificaciones.map(cal => 
            reviews.filter(r => r.calificacion === cal).length
        );
        
        Highcharts.chart('chartReseñasPorCalificacion', {
            chart: {
                type: 'column'
            },
            title: {
                text: null
            },
            xAxis: {
                categories: ['⭐ 1 Estrella', '⭐⭐ 2 Estrellas', '⭐⭐⭐ 3 Estrellas', '⭐⭐⭐⭐ 4 Estrellas', '⭐⭐⭐⭐⭐ 5 Estrellas'],
                title: {
                    text: 'Calificación'
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Cantidad de Reseñas'
                }
            },
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true
                    },
                    colorByPoint: true
                }
            },
            series: [{
                name: 'Reseñas',
                data: counts,
                showInLegend: false
            }],
            colors: ['#ef4444', '#f59e0b', '#fbbf24', '#84cc16', '#10b981']
        });
    }
}

// 5. Distribución de Precios (Area Chart)
async function loadChartRangoPrecios() {
    const data = await apiCall('/admin/perfumes?activo=true');
    
    if (data && data.success) {
        const perfumes = data.data;
        
        // Clasificar por rangos de precio
        const rangos = [
            { name: '$0-300', min: 0, max: 300 },
            { name: '$301-450', min: 301, max: 450 },
            { name: '$451-550', min: 451, max: 550 },
            { name: '$551-700', min: 551, max: 700 },
            { name: '$701+', min: 701, max: Infinity }
        ];
        
        const counts = rangos.map(rango => 
            perfumes.filter(p => parseFloat(p.precio_minimo) >= rango.min && parseFloat(p.precio_minimo) <= rango.max).length
        );
        
        Highcharts.chart('chartRangoPrecios', {
            chart: {
                type: 'areaspline'
            },
            title: {
                text: null
            },
            xAxis: {
                categories: rangos.map(r => r.name)
            },
            yAxis: {
                title: {
                    text: 'Cantidad de Perfumes'
                }
            },
            plotOptions: {
                areaspline: {
                    fillOpacity: 0.5
                }
            },
            series: [{
                name: 'Perfumes',
                data: counts,
                color: '#667eea',
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, 'rgba(102, 126, 234, 0.5)'],
                        [1, 'rgba(102, 126, 234, 0.1)']
                    ]
                }
            }]
        });
    }
}

// 6. Perfumes Destacados vs Regulares (Donut Chart)
async function loadChartDestacados() {
    const data = await apiCall('/admin/perfumes?activo=true');
    
    if (data && data.success) {
        const perfumes = data.data;
        const destacados = perfumes.filter(p => p.destacado).length;
        const regulares = perfumes.filter(p => !p.destacado).length;
        
        Highcharts.chart('chartDestacados', {
            chart: {
                type: 'pie'
            },
            title: {
                text: null
            },
            plotOptions: {
                pie: {
                    innerSize: '50%',
                    depth: 45,
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b><br>{point.y} ({point.percentage:.1f}%)'
                    }
                }
            },
            series: [{
                name: 'Perfumes',
                data: [
                    { name: 'Destacados', y: destacados, color: '#ef4444' },
                    { name: 'Regulares', y: regulares, color: '#6b7280' }
                ]
            }]
        });
    }
}

// 7. Stock por Perfume (Bar Chart Horizontal - Top 20 con menos stock)
async function loadChartStockPorPerfume() {
    const data = await apiCall('/admin/perfumes?activo=true');
    
    if (data && data.success) {
        // Ordenar por stock ascendente y tomar los primeros 20
        const perfumes = data.data
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 20);
        
        const nombres = perfumes.map(p => `${p.nombre} (${p.marca})`);
        const stocks = perfumes.map(p => p.stock);
        
        Highcharts.chart('chartStockPorPerfume', {
            chart: {
                type: 'bar'
            },
            title: {
                text: null
            },
            xAxis: {
                categories: nombres,
                title: {
                    text: 'Perfumes'
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Stock Disponible'
                }
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true
                    },
                    zones: [
                        { value: 5, color: '#ef4444' },  // Rojo para stock crítico
                        { value: 10, color: '#f59e0b' }, // Naranja para stock bajo
                        { color: '#10b981' }             // Verde para stock normal
                    ]
                }
            },
            legend: {
                enabled: false
            },
            series: [{
                name: 'Stock',
                data: stocks
            }]
        });
    }
}

