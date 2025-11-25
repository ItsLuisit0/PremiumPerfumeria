// =====================================================
// ADMIN DASHBOARD - Premium Perfumería
// =====================================================

const API_URL = `${AppConfig.getApiUrl()}/api`;
let adminToken = null;
let adminUser = null;

// Pagination state
let currentPage = 1;
let totalPages = 1;
let itemsPerPage = 12;
let currentFilters = {};

// Image upload state
let selectedImage = null;
let selectedImageFile = null;

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
    
    // Cargar gráficas
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
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    // Close sidebar when clicking overlay (mobile)
    document.getElementById('sidebarOverlay')?.addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Close sidebar when clicking a nav link on mobile
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 992) {
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('sidebarOverlay');
                
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
    });

    // Búsqueda de perfumes
    document.getElementById('btnBuscar')?.addEventListener('click', function() {
        currentPage = 1;
        loadPerfumes();
    });

    // Clear filters
    document.getElementById('btnClearFilters')?.addEventListener('click', clearFilters);
    document.getElementById('goToStockSection')?.addEventListener('click', function(e) {
        e.preventDefault();
        navigateTo('stock');
    });


    // Enter key en search
    document.getElementById('searchPerfume')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            currentPage = 1;
            loadPerfumes();
        }
    });

    // Sorting change
    document.getElementById('sortPerfumes')?.addEventListener('change', function() {
        currentPage = 1;
        loadPerfumes();
    });

    // Guardar stock
    document.getElementById('saveStockBtn')?.addEventListener('click', saveStock);

    // Guardar descuento
    document.getElementById('saveDescuentoBtn')?.addEventListener('click', saveDescuento);

    // Actualizar preview de precio al cambiar descuento
    document.getElementById('editDescuentoValue')?.addEventListener('input', updatePrecioPreview);

    // Botón de agregar perfume
    document.getElementById('addPerfumeBtn')?.addEventListener('click', openAddPerfumeModal);
    
    // Guardar nuevo perfume
    document.getElementById('savePerfumeBtn')?.addEventListener('click', savePerfume);

    // Image upload events
    setupImageUpload();
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
            currentPage = 1;
            loadPerfumes();
            break;
        case 'reviews':
            loadReviews();
            break;
        case 'stock':
            loadStockBajo();
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
        const perfumesEl = document.getElementById('stat-perfumes');
        const reviewsEl = document.getElementById('stat-reviews');
        const stockEl = document.getElementById('stat-stock');
        const stockBajoEl = document.getElementById('stat-stock-bajo');

        if (perfumesEl) perfumesEl.textContent = stats.total_perfumes || 0;
        if (reviewsEl) reviewsEl.textContent = stats.total_reviews || 0;
        if (stockEl) stockEl.textContent = stats.stock_total || 0;
        if (stockBajoEl) stockBajoEl.textContent = stats.productos_stock_bajo || 0;

        const stockSummaryEl = document.getElementById('stockSummary');
        const stockBreakdownEl = document.getElementById('stockBreakdown');

        if (stockSummaryEl || stockBreakdownEl) {
            const productosStockBajo = stats.productos_stock_bajo || 0;
            const totalPerfumes = stats.total_perfumes || 0;
            const stockTotal = stats.stock_total || 0;
            const saludables = Math.max(totalPerfumes - productosStockBajo, 0);

            if (stockSummaryEl) {
                stockSummaryEl.innerHTML = `
                    <strong>${productosStockBajo}</strong> referencias están en nivel crítico de inventario.
                `;
            }

            if (stockBreakdownEl) {
                stockBreakdownEl.innerHTML = `
                    <li>Stock total disponible: <strong>${stockTotal}</strong></li>
                    <li>Perfumes saludables: <strong>${saludables}</strong></li>
                    <li>Perfumes con stock bajo: <strong class="text-warning">${productosStockBajo}</strong></li>
                `;
            }
        }
    }
}

// =====================================================
// PERFUMES con PAGINACIÓN y ORDENAMIENTO
// =====================================================

async function loadPerfumes() {
    const search = document.getElementById('searchPerfume')?.value || '';
    const activoFilter = document.getElementById('filterActivo')?.value || '';
    const sort = document.getElementById('sortPerfumes')?.value || 'nombre_asc';
    
    currentFilters = { search, activo: activoFilter, sort };
    
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    
    // Por defecto mostrar solo perfumes activos, a menos que se seleccione explícitamente "Inactivos"
    if (activoFilter) {
        query.append('activo', activoFilter);
    } else {
        // Si no hay filtro, mostrar solo activos por defecto
        query.append('activo', 'true');
    }
    
    query.append('page', currentPage);
    query.append('limit', itemsPerPage);
    
    // Parsing de sort
    const [sortField, sortOrder] = sort.split('_');
    query.append('sortField', sortField === 'precio' ? 'precio_minimo' : sortField);
    query.append('sortOrder', sortOrder);
    
    const data = await apiCall(`/admin/perfumes?${query.toString()}`);
    
    if (data && data.success) {
        renderPerfumesGrid(data.data);
        renderPagination(data.total || data.pagination?.total || 0);
    }
}

function renderPerfumesGrid(perfumes) {
    const grid = document.getElementById('perfumesGrid');
    
    if (perfumes.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="bi bi-search" style="font-size: 64px; color: var(--text-muted); margin-bottom: 16px;"></i>
                <p style="color: var(--text-muted); font-size: 18px;">No se encontraron perfumes</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = perfumes.map(p => `
        <div class="perfume-card">
            <div class="perfume-image">
                <img src="${p.imagen_url ? (p.imagen_url.startsWith('http') ? p.imagen_url : `../${p.imagen_url}`) : '../ImagenesPerfumes/placeholder.svg'}" 
                     alt="${p.nombre}" 
                     onerror="this.src='../ImagenesPerfumes/placeholder.svg'">
            </div>
            <div class="perfume-info">
                <div class="perfume-brand">${p.marca}</div>
                <div class="perfume-name">${p.nombre}</div>
                <div class="perfume-details">
                    <div class="perfume-price">$${parseFloat(p.precio_minimo).toFixed(2)}</div>
                    <div class="perfume-stock ${p.stock < 10 ? 'low' : ''}">
                        <i class="bi bi-box-seam"></i> ${p.stock}
                    </div>
                </div>
                ${p.descuento_porcentaje > 0 ? `
                    <div style="background: rgba(239, 68, 68, 0.1); padding: 8px; border-radius: 8px; text-align: center; margin-bottom: 12px;">
                        <small style="color: #ef4444; font-weight: 600;">
                            <i class="bi bi-percent"></i> ${p.descuento_porcentaje}% OFF
                        </small>
                    </div>
                ` : ''}
                <div class="perfume-actions">
                    <button class="btn-action edit" onclick="editPerfume(${p.id_perfume})">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn-action" style="background: rgba(212, 175, 55, 0.1); color: var(--primary-gold); border: 1px solid var(--border-gold);" 
                            onclick="openStockModal(${p.id_perfume}, '${p.nombre}', ${p.stock})">
                        <i class="bi bi-box"></i> Stock
                    </button>
                    <button class="btn-action" style="background: rgba(251, 146, 60, 0.1); color: #fb923c; border: 1px solid rgba(251, 146, 60, 0.3);" 
                            onclick="openDescuentoModal(${p.id_perfume}, '${p.nombre}', ${p.precio_minimo}, ${p.descuento_porcentaje || 0})">
                        <i class="bi bi-percent"></i>
                    </button>
                    <button class="btn-action delete" onclick="deletePerfume(${p.id_perfume}, '${p.nombre}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderPagination(total) {
    totalPages = Math.ceil(total / itemsPerPage);
    const container = document.getElementById('paginationContainer');
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    const startItem = ((currentPage - 1) * itemsPerPage) + 1;
    const endItem = Math.min(currentPage * itemsPerPage, total);

    let pagesHTML = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pagesHTML += `
            <button class="btn-page ${i === currentPage ? 'active' : ''}" 
                    onclick="goToPage(${i})">
                ${i}
            </button>
        `;
    }

    container.innerHTML = `
        <div class="pagination-info">
            Mostrando ${startItem} - ${endItem} de ${total}
        </div>
        <div class="pagination-buttons">
            <button class="btn-page" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                <i class="bi bi-chevron-left"></i>
            </button>
            ${pagesHTML}
            <button class="btn-page" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                <i class="bi bi-chevron-right"></i>
            </button>
        </div>
    `;
}

function goToPage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    currentPage = page;
    loadPerfumes();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearFilters() {
    document.getElementById('searchPerfume').value = '';
    document.getElementById('filterActivo').value = '';
    document.getElementById('sortPerfumes').value = 'nombre_asc';
    currentPage = 1;
    loadPerfumes();
}

// =====================================================
// CRUD PERFUMES
// =====================================================

function openAddPerfumeModal() {
    // Reset form
    document.getElementById('addPerfumeForm').reset();
    document.getElementById('editPerfumeId').value = '';
    document.getElementById('modalTitle').textContent = 'Agregar Nuevo Perfume';
    document.getElementById('addActivo').checked = true;
    resetImageUpload();
    
    const modal = new bootstrap.Modal(document.getElementById('addPerfumeModal'));
    modal.show();
}

async function editPerfume(id) {
    const data = await apiCall(`/admin/perfumes/${id}`);
    
    if (data && data.success) {
        const perfume = data.data;
        
        document.getElementById('editPerfumeId').value = id;
        document.getElementById('addMarca').value = perfume.marca;
        document.getElementById('addNombre').value = perfume.nombre;
        document.getElementById('addTipo').value = perfume.tipo;
        document.getElementById('addPublico').value = perfume.publico;
        document.getElementById('addDescripcion').value = perfume.descripcion || '';
        document.getElementById('addNotas').value = perfume.notas || '';
        document.getElementById('addPrecio').value = perfume.precio_minimo;
        document.getElementById('addMililitros').value = perfume.mililitros;
        document.getElementById('addStock').value = perfume.stock;
        document.getElementById('addActivo').checked = perfume.activo;
        document.getElementById('addImagenUrl').value = perfume.imagen_url || '';
        
        // Set imagen preview
        if (perfume.imagen_url) {
            const preview = document.getElementById('uploadPreview');
            const placeholder = document.getElementById('uploadPlaceholder');
            const previewImage = document.getElementById('previewImage');
            
            previewImage.src = `../${perfume.imagen_url}`;
            placeholder.style.display = 'none';
            preview.style.display = 'block';
        }
        
        document.getElementById('modalTitle').textContent = 'Editar Perfume';
        
        const modal = new bootstrap.Modal(document.getElementById('addPerfumeModal'));
        modal.show();
    }
}

async function savePerfume() {
    const id = document.getElementById('editPerfumeId').value;
    const marca = document.getElementById('addMarca').value.trim();
    const nombre = document.getElementById('addNombre').value.trim();
    
    // Validación
    if (!marca || !nombre || !document.getElementById('addTipo').value || !document.getElementById('addPublico').value) {
        showToast('Por favor completa todos los campos requeridos', 'danger');
        return;
    }

    const btn = document.getElementById('savePerfumeBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';

    try {
        let imagenUrl = document.getElementById('addImagenUrl').value.trim();
        
        // Si hay una imagen nueva seleccionada, subirla primero
        if (selectedImageFile) {
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Subiendo imagen...';
            
            const formData = new FormData();
            formData.append('imagen', selectedImageFile);
            formData.append('marca', marca);
            formData.append('nombre', nombre);
            
            const uploadResponse = await fetch(`${API_URL}/admin/upload/imagen`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                },
                body: formData
            });
            
            const uploadData = await uploadResponse.json();
            
            if (!uploadResponse.ok) {
                throw new Error(uploadData.message || 'Error al subir la imagen');
            }
            
            imagenUrl = uploadData.data.imagen_url;
        }
        
        // Ahora guardar el perfume con la URL de la imagen
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando perfume...';
        
        const perfumeData = {
            marca: marca,
            nombre: nombre,
            tipo: document.getElementById('addTipo').value,
            publico: document.getElementById('addPublico').value,
            descripcion: document.getElementById('addDescripcion').value.trim(),
            notas: document.getElementById('addNotas').value.trim(),
            precio_minimo: parseFloat(document.getElementById('addPrecio').value),
            mililitros: parseInt(document.getElementById('addMililitros').value),
            stock: parseInt(document.getElementById('addStock').value),
            activo: document.getElementById('addActivo').checked === true, // Asegurar boolean true
            destacado: false, // Por defecto no destacado
            imagen_url: imagenUrl
        };
        
        console.log('📦 Datos del perfume a guardar:', perfumeData);

        const endpoint = id ? `/admin/perfumes/${id}` : '/admin/perfumes';
        const method = id ? 'PUT' : 'POST';

        const data = await apiCall(endpoint, {
            method: method,
            body: JSON.stringify(perfumeData)
        });

        if (data && data.success) {
            showToast(id ? 'Perfume actualizado correctamente' : 'Perfume creado correctamente', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addPerfumeModal')).hide();
            loadPerfumes();
            loadEstadisticas();
        }
    } catch (error) {
        console.error('Error al guardar perfume:', error);
        showToast(error.message || 'Error al guardar el perfume', 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check-lg"></i> Guardar Perfume';
    }
}

async function deletePerfume(id, nombre) {
    if (!confirm(`¿Estás seguro de eliminar el perfume "${nombre}"?`)) return;

    const data = await apiCall(`/admin/perfumes/${id}`, {
        method: 'DELETE'
    });

    if (data && data.success) {
        showToast('Perfume eliminado correctamente', 'success');
        loadPerfumes();
        loadEstadisticas();
    }
}

// =====================================================
// STOCK & DESCUENTO
// =====================================================

function openStockModal(id, nombre, stock) {
    document.getElementById('editStockId').value = id;
    document.getElementById('editStockNombre').value = nombre;
    document.getElementById('editStockValue').value = stock;
    
    const modal = new bootstrap.Modal(document.getElementById('editStockModal'));
    modal.show();
}

async function saveStock() {
    const id = document.getElementById('editStockId').value;
    const stock = parseInt(document.getElementById('editStockValue').value);

    if (stock < 0) {
        showToast('El stock no puede ser negativo', 'danger');
        return;
    }

    const data = await apiCall(`/admin/perfumes/${id}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ stock })
    });

    if (data && data.success) {
        showToast('Stock actualizado correctamente', 'success');
        bootstrap.Modal.getInstance(document.getElementById('editStockModal')).hide();
        loadPerfumes();
        loadEstadisticas();
    }
}

function openDescuentoModal(id, nombre, precio, descuento) {
    document.getElementById('editDescuentoId').value = id;
    document.getElementById('editDescuentoNombre').value = nombre;
    document.getElementById('editDescuentoPrecioBase').value = parseFloat(precio).toFixed(2);
    document.getElementById('editDescuentoValue').value = descuento;
    updatePrecioPreview();
    
    const modal = new bootstrap.Modal(document.getElementById('editDescuentoModal'));
    modal.show();
}

function updatePrecioPreview() {
    const precio = parseFloat(document.getElementById('editDescuentoPrecioBase').value) || 0;
    const descuento = parseFloat(document.getElementById('editDescuentoValue').value) || 0;
    const precioFinal = precio * (1 - descuento / 100);
    document.getElementById('precioFinalPreview').textContent = `$${precioFinal.toFixed(2)}`;
}

async function saveDescuento() {
    const id = document.getElementById('editDescuentoId').value;
    const descuento = parseFloat(document.getElementById('editDescuentoValue').value) || 0;

    if (descuento < 0 || descuento > 100) {
        showToast('El descuento debe estar entre 0 y 100', 'danger');
        return;
    }

    const data = await apiCall(`/admin/perfumes/${id}/descuento`, {
        method: 'PATCH',
        body: JSON.stringify({ descuento_porcentaje: descuento })
    });

    if (data && data.success) {
        showToast('Descuento actualizado correctamente', 'success');
        bootstrap.Modal.getInstance(document.getElementById('editDescuentoModal')).hide();
        loadPerfumes();
    }
}

// =====================================================
// IMAGE UPLOAD con DRAG & DROP
// =====================================================

function setupImageUpload() {
    const uploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('imageInput');
    const removeBtn = document.getElementById('removeImageBtn');

    // Click to upload
    uploadArea.addEventListener('click', function(e) {
        if (e.target !== removeBtn && !removeBtn.contains(e.target)) {
            imageInput.click();
        }
    });

    // File input change
    imageInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            handleImageFile(e.target.files[0]);
        }
    });

    // Drag & Drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleImageFile(files[0]);
        }
    });

    // Remove image
    removeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        resetImageUpload();
    });
}

function handleImageFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Por favor selecciona un archivo de imagen válido', 'danger');
        return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        showToast('La imagen no debe exceder 5MB', 'danger');
        return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('uploadPreview');
        const placeholder = document.getElementById('uploadPlaceholder');
        const previewImage = document.getElementById('previewImage');
        
        previewImage.src = e.target.result;
        placeholder.style.display = 'none';
        preview.style.display = 'block';
        
        // Store file data
        selectedImageFile = file;
        selectedImage = e.target.result;
        
        // Set image URL (you would upload this to a server in production)
        // For now, we'll generate a filename based on marca and nombre
        const marca = document.getElementById('addMarca').value.trim().replace(/\s+/g, '_');
        const nombre = document.getElementById('addNombre').value.trim().replace(/\s+/g, '_');
        const ext = file.name.split('.').pop();
        const imageName = `ImagenesPerfumes/${marca}_${nombre}.${ext}`;
        document.getElementById('addImagenUrl').value = imageName;
    };
    
    reader.readAsDataURL(file);
}

function resetImageUpload() {
    const preview = document.getElementById('uploadPreview');
    const placeholder = document.getElementById('uploadPlaceholder');
    const previewImage = document.getElementById('previewImage');
    const imageInput = document.getElementById('imageInput');
    
    previewImage.src = '';
    placeholder.style.display = 'block';
    preview.style.display = 'none';
    imageInput.value = '';
    document.getElementById('addImagenUrl').value = '';
    
    selectedImage = null;
    selectedImageFile = null;
}

// =====================================================
// REVIEWS
// =====================================================

async function loadReviews() {
    const data = await apiCall('/admin/reviews');
    
    if (data && data.success) {
        const tbody = document.getElementById('reviewsTable');
        
        if (data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay reseñas</td></tr>';
            return;
        }

        tbody.innerHTML = data.data.map(r => `
            <tr>
                <td>${r.usuario}</td>
                <td>${r.nombre_perfume}</td>
                <td>${'⭐'.repeat(r.calificacion)}</td>
                <td>${r.comentario || '-'}</td>
                <td>
                    <span class="badge ${r.aprobada ? 'bg-success' : 'bg-warning'}">
                        ${r.aprobada ? 'Aprobado' : 'Pendiente'}
                    </span>
                </td>
                <td>
                    ${!r.aprobada ? `<button class="btn btn-sm btn-success" onclick="approveReview(${r.id_reseña})">Aprobar</button>` : ''}
                    <button class="btn btn-sm btn-danger" onclick="deleteReview(${r.id_reseña})">Eliminar</button>
                </td>
            </tr>
        `).join('');
    }
}

async function approveReview(id) {
    const data = await apiCall(`/admin/reviews/${id}/moderar`, {
        method: 'PATCH',
        body: JSON.stringify({ aprobada: true })
    });

    if (data && data.success) {
        showToast('Reseña aprobada', 'success');
        loadReviews();
    }
}

async function deleteReview(id) {
    if (!confirm('¿Eliminar esta reseña?')) return;

    const data = await apiCall(`/admin/reviews/${id}`, {
        method: 'DELETE'
    });

    if (data && data.success) {
        showToast('Reseña eliminada', 'success');
        loadReviews();
    }
}

// =====================================================
// STOCK BAJO
// =====================================================

async function loadStockBajo() {
    const data = await apiCall('/admin/stock-bajo');
    
    if (data && data.success) {
        const tbody = document.getElementById('stockTable');
        
        if (data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay productos con stock bajo</td></tr>';
            return;
        }

        tbody.innerHTML = data.data.map(p => `
            <tr>
                <td>${p.id_perfume}</td>
                <td><strong>${p.nombre}</strong></td>
                <td>${p.marca}</td>
                <td><span class="text-danger fw-bold">${p.stock}</span></td>
                <td>$${parseFloat(p.precio_minimo).toFixed(2)}</td>
                <td>
                    <span class="badge ${p.activo ? 'bg-success' : 'bg-secondary'}">
                        ${p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" 
                            onclick="openStockModal(${p.id_perfume}, '${p.nombre}', ${p.stock})">
                        Actualizar Stock
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// =====================================================
// GRÁFICAS
// =====================================================

async function loadChartStockDistribucion() {
    const data = await apiCall('/admin/estadisticas');
    
    if (data && data.success) {
        const stats = data.data;
        const saludables = Math.max((stats.total_perfumes || 0) - (stats.productos_stock_bajo || 0), 0);
        const criticos = stats.productos_stock_bajo || 0;

        Highcharts.chart('chartStockDistribucion', {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent',
                style: {
                    fontFamily: 'Montserrat, sans-serif'
                }
            },
            title: {
                text: null
            },
            credits: {
                enabled: false
            },
            tooltip: {
                pointFormat: '<span style="color:{point.color}">\u25CF</span> {point.name}: <b>{point.y}</b>'
            },
            plotOptions: {
                pie: {
                    innerSize: '65%',
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}<br><b>{point.y}</b>',
                        style: {
                            color: '#f5f5f5',
                            fontSize: '12px',
                            textOutline: 'none'
                        }
                    }
                }
            },
            series: [{
                name: 'Referencias',
                data: [
                    { name: 'Inventario saludable', y: saludables, color: '#22c55e' },
                    { name: 'Stock bajo', y: criticos, color: '#f87171' }
                ]
            }]
        });
    }
}

async function loadChartPerfumesPorCategoria() {
    const response = await apiCall('/admin/estadisticas/categoria');
    
    if (response && response.success) {
        const categorias = response.data || [];

        if (categorias.length === 0) {
            document.getElementById('chartPerfumesPorCategoria').innerHTML = '<p class="text-center text-muted mb-0">Sin datos suficientes para graficar</p>';
            return;
        }
        
        const labels = categorias.map(c => c.categoria);
        const totalSeries = categorias.map(c => Number(c.total) || 0);
        const activosSeries = categorias.map(c => Number(c.activos) || 0);
        const destacadosSeries = categorias.map(c => Number(c.destacados) || 0);
        const stockSeries = categorias.map(c => Number(c.stock_total) || 0);
        const descuentoProm = categorias.map(c => Number(c.descuento_promedio) || 0);

        Highcharts.chart('chartPerfumesPorCategoria', {
            chart: {
                backgroundColor: 'transparent',
                style: {
                    fontFamily: 'Montserrat, sans-serif'
                }
            },
            title: {
                text: null
            },
            credits: {
                enabled: false
            },
            xAxis: {
                categories: labels,
                crosshair: true,
                labels: {
                    style: {
                        color: '#f5f5f5'
                    }
                },
                lineColor: 'rgba(255,255,255,0.1)'
            },
            yAxis: [{
                title: {
                    text: 'Cantidad de perfumes',
                    style: { color: '#f5f5f5' }
                },
                labels: {
                    style: { color: '#f5f5f5' }
                },
                gridLineColor: 'rgba(212, 175, 55, 0.1)'
            }, {
                title: {
                    text: 'Stock disponible (unidades)',
                    style: { color: '#93c5fd' }
                },
                labels: {
                    style: { color: '#93c5fd' }
                },
                opposite: true,
                gridLineWidth: 0
            }],
            legend: {
                align: 'left',
                verticalAlign: 'top',
                y: 0,
                itemStyle: {
                    color: '#f5f5f5'
                }
            },
            tooltip: {
                shared: true,
                formatter: function () {
                    const point = this.points[0]?.point;
                    const index = point?.index ?? 0;
                    const descuento = Number(descuentoProm[index] || 0);
                    const precio = Number(categorias[index]?.precio_promedio || 0);
                    return `
                        <span style="font-size:13px"><b>${labels[index]}</b></span><br/>
                        ${this.points.map(p => `
                            <span style="color:${p.color};font-weight:bold">\u25CF</span> ${p.series.name}: <b>${p.y}</b><br/>
                        `).join('')}
                        <span style="color:#a5b4fc">\u25CF</span> Precio promedio: <b>$${precio.toFixed(2)}</b><br/>
                        <span style="color:#fda4af">\u25CF</span> Descuento promedio: <b>${descuento.toFixed(2)}%</b>
                    `;
                }
            },
            plotOptions: {
                column: {
                    borderRadius: 4,
                    pointPadding: 0.15,
                    groupPadding: 0.2,
                    dataLabels: {
                        enabled: true,
                        style: {
                            color: '#fefefe',
                            textOutline: 'none',
                            fontSize: '11px'
                        }
                    }
                }
            },
            series: [
                {
                    name: 'Total por categoría',
                    type: 'column',
                    data: totalSeries,
                    color: '#fbbf24'
                },
                {
                    name: 'Activos',
                    type: 'column',
                    data: activosSeries,
                    color: '#34d399'
                },
                {
                    name: 'Destacados',
                    type: 'column',
                    data: destacadosSeries,
                    color: '#c084fc'
                },
                {
                    name: 'Stock total (u.)',
                    type: 'spline',
                    yAxis: 1,
                    data: stockSeries,
                    color: '#60a5fa',
                    marker: {
                        lineWidth: 2,
                        lineColor: '#1d4ed8',
                        fillColor: '#bfdbfe'
                    }
                }
            ]
        });
    }
}

// =====================================================
// UTILIDADES
// =====================================================

function showToast(message, type = 'info') {
    // Simple toast notification (you can use a library like Toastify for better UX)
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    toast.style.zIndex = '9999';
    toast.innerHTML = `
        <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
        ${message}
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function logout() {
    if (confirm('¿Cerrar sesión?')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = 'login.html';
    }
}

// =====================================================
// GLOBAL FUNCTIONS (for onclick handlers)
// =====================================================
window.goToPage = goToPage;
window.editPerfume = editPerfume;
window.deletePerfume = deletePerfume;
window.openStockModal = openStockModal;
window.openDescuentoModal = openDescuentoModal;
window.approveReview = approveReview;
window.deleteReview = deleteReview;

