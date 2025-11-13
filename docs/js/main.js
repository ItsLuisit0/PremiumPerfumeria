document.addEventListener('DOMContentLoaded', () => {
    // Obtener la URL del API desde la configuración
    const API_BASE_URL = AppConfig.getApiUrl();

    new Vue({
        el: '#app',
        data: {
            perfumes: [],
            cart: [],
            selectedPerfume: null,
            modalQuantity: 1,
            newReview: {
                usuario: '',
                comentario: '',
                calificacion: null
            },
            reviews: [],
            searchTerm: '',
            selectedPublico: null,
            selectedTipo: null, // Tipo de perfume (Diseñador, Nicho, Árabes, etc.)
            selectedCategory: null, // Nueva propiedad para categorías
            errorApi: null,
            isLoading: false,
            isSubmittingReview: false,
            searchTimeout: null,
            currentRating: 0,
            hoverRating: 0,
            mobileMenuOpen: false,
            cartOpen: false, // Carrito Tailwind slide-over
            lastFocusedElement: null,
            toast: {
                show: false,
                message: '',
                type: 'info'
            },
            showFavoritesView: false,
            showDesignerFilter: false, // Para filtro por diseñador
            showComingSoonView: false, // Vista de próximamente
            comingSoonSection: '', // Nombre de la sección próximamente
            observer: null,
            favoriteIds: [],
            sidebarOpen: false,
            searchModalOpen: false,
            searchFocused: false,
            perfumeReviews: [],
            currentCarouselIndex: 0,
            carouselInterval: null,
            isMayoreo: false,
            popularSearches: ['Sauvage', 'Aventus', 'Yara', 'Chanel', 'Dior', 'Bleu de Chanel', 'Baccarat Rouge', 'Khamrah']
        },
        computed: {
            searchResults() {
                if (!this.searchTerm || this.searchTerm.length < 2) {
                    return [];
                }
                
                const searchLower = this.searchTerm.toLowerCase();
                return this.perfumes.filter(perfume =>
                    perfume.nombre.toLowerCase().includes(searchLower) ||
                    perfume.marca.toLowerCase().includes(searchLower) ||
                    (perfume.tipo && perfume.tipo.toLowerCase().includes(searchLower)) ||
                    (perfume.publico && perfume.publico.toLowerCase().includes(searchLower))
                );
            },
            filteredPerfumes() {
                let filtered = this.perfumes;
                
                // Filtrar por público (Hombre, Mujer, Unisex)
                if (this.selectedPublico) {
                    filtered = filtered.filter(perfume => perfume.publico === this.selectedPublico);
                }
                
                // Filtrar por tipo (Diseñador, Nicho, Árabes, etc.)
                if (this.selectedTipo) {
                    const tipoLower = this.selectedTipo.toLowerCase();
                    filtered = filtered.filter(perfume => {
                        const marcaLower = perfume.marca ? perfume.marca.toLowerCase() : '';
                        
                        // FILTRO: Árabes
                        if (tipoLower.includes('arab') || tipoLower.includes('árabe')) {
                            const marcasArabes = ['lattafa', 'armaf', 'rasasi', 'afnan'];
                            return marcasArabes.some(marca => marcaLower.includes(marca));
                        }
                        
                        // FILTRO: Diseñador
                        if (tipoLower.includes('diseñ') || tipoLower.includes('disen')) {
                            const marcasDisenador = [
                                'versace', 'dior', 'carolina herrera', 'chanel', 'montblanc',
                                'jean paul gaultier', 'valentino', 'giorgio armani', 'armani',
                                'yves saint laurent', 'dkny', 'moschino', 'cacharel'
                            ];
                            return marcasDisenador.some(marca => marcaLower.includes(marca));
                        }
                        
                        // FILTRO: Nicho
                        if (tipoLower.includes('nicho')) {
                            const marcasNicho = ['creed', 'maison francis kurkdjian', 'baccarat'];
                            return marcasNicho.some(marca => marcaLower.includes(marca));
                        }
                        
                        return false;
                    });
                }
                
                // Filtrar por búsqueda
                if (this.searchTerm) {
                    const searchLower = this.searchTerm.toLowerCase();
                    filtered = filtered.filter(perfume =>
                        perfume.nombre.toLowerCase().includes(searchLower) ||
                        perfume.marca.toLowerCase().includes(searchLower) ||
                        (perfume.tipo && perfume.tipo.toLowerCase().includes(searchLower))
                    );
                }
                
                // ORDENAR: Si es categoría Diseñador, ordenar primero Hombre, luego Mujer
                if (this.selectedCategory === 'Disenador') {
                    filtered.sort((a, b) => {
                        const ordenPublico = { 'Hombre': 1, 'Unisex': 2, 'Mujer': 3 };
                        return (ordenPublico[a.publico] || 99) - (ordenPublico[b.publico] || 99);
                    });
                }
                
                return filtered;
            },
            cartTotalPrice() {
                return this.cart.reduce((total, item) => {
                    const precio = item.descuento_porcentaje > 0 ? item.precio_con_descuento : item.precio_minimo;
                    return total + (precio * item.quantity);
                }, 0);
            },
            cartItemCount() {
                return this.cart.reduce((total, item) => total + item.quantity, 0);
            },
            hasProducts() {
                return this.perfumes.length > 0;
            },
            favoriteItems() {
                return this.perfumes.filter(p => this.favoriteIds.includes(p.id_perfume));
            }
        },
        methods: {
            initObserver() {
                if (this.observer) {
                    this.observer.disconnect();
                }
                this.observer = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.1 });

                this.$nextTick(() => {
                    const cards = document.querySelectorAll('.product-card:not(.is-visible)');
                    cards.forEach(card => this.observer.observe(card));
                });
            },
            getImageUrl(imageUrl) {
                // Las imágenes ya vienen con la URL completa desde fetchPerfumes
                return imageUrl || this.getPlaceholderImage();
            },
            getPlaceholderImage() {
                return 'data:image/svg+xml,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
                        <rect width="400" height="400" fill="#1a1a1a"/>
                        <g transform="translate(200, 200)">
                            <circle cx="0" cy="-20" r="40" fill="#333"/>
                            <path d="M -30 30 L -30 50 Q -30 60, -20 60 L 20 60 Q 30 60, 30 50 L 30 30 Z" fill="#333"/>
                            <text x="0" y="100" font-family="Arial" font-size="16" fill="#666" text-anchor="middle">
                                Sin imagen
                            </text>
                        </g>
                    </svg>
                `);
            },
            handleImageError(event) {
                console.warn('Error cargando imagen, usando placeholder:', event.target.src);
                // Crear un placeholder elegante en lugar de ocultar la imagen
                const placeholder = 'data:image/svg+xml,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
                        <rect width="400" height="400" fill="#f5f5f5"/>
                        <g transform="translate(200, 200)">
                            <circle cx="0" cy="-20" r="40" fill="#e0e0e0"/>
                            <path d="M -30 30 L -30 50 Q -30 60, -20 60 L 20 60 Q 30 60, 30 50 L 30 30 Z" fill="#e0e0e0"/>
                            <text x="0" y="100" font-family="Arial" font-size="16" fill="#999" text-anchor="middle">
                                Imagen no disponible
                            </text>
                        </g>
                    </svg>
                `);
                event.target.src = placeholder;
                event.target.style.opacity = '0.6';
            },
            async fetchPerfumes() {
                this.isLoading = true;
                this.errorApi = null;
                try {
                    const response = await fetch(`${API_BASE_URL}/api/perfumes`);
                    if (!response.ok) {
                        throw new Error(`Error ${response.status}: No se pudieron cargar los perfumes`);
                    }
                    const responseData = await response.json();
                    
                    // Manejar respuesta con paginación o array directo (retrocompatibilidad)
                    const perfumesData = responseData.data || responseData;
                    
                    // Las imágenes están en el mismo servidor (Render - carpeta docs/)
                    // Siempre usar rutas relativas
                    const imageBaseUrl = './';
                    
                    this.perfumes = perfumesData.map(p => ({
                        ...p,
                        imagen_url: `${imageBaseUrl}${p.imagen_url}`
                    }));
                    // this.showToast('success', 'Catálogo cargado correctamente');
                } catch (error) {
                    console.error("Error al obtener perfumes:", error);
                    this.errorApi = "No se pudieron cargar los perfumes. Intente nuevamente más tarde.";
                    this.showToast('danger', 'Error al cargar el catálogo');
                } finally {
                    this.isLoading = false;
                }
            },
            async fetchReviews(perfumeId) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/perfumes/${perfumeId}/reviews`);
                    if (!response.ok) {
                        throw new Error(`Error ${response.status} al cargar reseñas`);
                    }
                    const responseData = await response.json();
                    
                    // Manejar respuesta con paginación o array directo (retrocompatibilidad)
                    const reviewsData = responseData.data || responseData;
                    
                    this.reviews = reviewsData;
                    this.perfumeReviews = reviewsData;
                } catch (error) {
                    console.error("Error al obtener reseñas:", error);
                    this.reviews = [];
                    this.perfumeReviews = [];
                }
            },
            saveCartToStorage() {
                try {
                    localStorage.setItem('perfumeriaCart', JSON.stringify(this.cart));
                } catch (error) {
                    console.error('Error al guardar carrito:', error);
                    this.showToast('warning', 'No se pudo guardar el carrito en este dispositivo');
                }
            },
            loadCartFromStorage() {
                try {
                    const savedCart = localStorage.getItem('perfumeriaCart');
                    if (savedCart) {
                        this.cart = JSON.parse(savedCart);
                    }
                } catch (error) {
                    console.error('Error al cargar carrito:', error);
                    this.cart = [];
                }
            },
            toggleMobileMenu() {
                this.mobileMenuOpen = !this.mobileMenuOpen;
                if (this.mobileMenuOpen) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            },
            scrollToProducts() {
                document.getElementById('main-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
            },
            showPerfumeDetail(perfume) {
                this.selectedPerfume = perfume;
                this.modalQuantity = 1;
                this.newReview = { usuario: '', comentario: '', calificacion: null };
                this.currentRating = 0;
                this.fetchReviews(perfume.id_perfume);
                // Scroll al inicio de la página
                this.$nextTick(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            },
            closePerfumeDetail() {
                this.selectedPerfume = null;
                this.perfumeReviews = [];
                this.reviews = [];
                this.newReview = {
                    usuario: '',
                    comentario: '',
                    calificacion: null
                };
                this.isMayoreo = false;
                
                // Limpiar todos los filtros para volver al catálogo completo
                this.searchTerm = '';
                this.selectedCategory = null;
                this.selectedPublico = null;
                this.selectedTipo = null;
                this.showFavoritesView = false;
                
                this.$nextTick(() => {
                    this.initObserver();
                    // Volver al inicio siempre
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            },
            addToCart(perfume, quantity, event, esMayoreo = false) {
                if (!perfume || quantity <= 0) return;

                if (event) {
                    const card = event.target.closest('.product-card, .modal-content');
                    if (card) {
                        const productImage = card.querySelector('.product-image, .product-modal-image img');
                        const cartButton = document.querySelector('.cart-button');

                        if (productImage && cartButton) {
                            const imageRect = productImage.getBoundingClientRect();
                            const cartRect = cartButton.getBoundingClientRect();

                            const flyingImage = productImage.cloneNode(true);
                            flyingImage.classList.add('flying-image');

                            flyingImage.style.position = 'fixed';
                            flyingImage.style.left = `${imageRect.left}px`;
                            flyingImage.style.top = `${imageRect.top}px`;
                            flyingImage.style.width = `${imageRect.width}px`;
                            flyingImage.style.height = `${imageRect.height}px`;

                            document.body.appendChild(flyingImage);

                            requestAnimationFrame(() => {
                                flyingImage.style.transform = `translate(${cartRect.left - imageRect.left}px, ${cartRect.top - imageRect.top}px) scale(0.1)`;
                                flyingImage.style.opacity = '0';
                            });

                            setTimeout(() => {
                                flyingImage.remove();
                            }, 1000); // Match transition duration
                        }
                    }
                }

                // Crear una copia del perfume para modificar el precio si es mayoreo
                let perfumeParaCarrito = { ...perfume };
                
                // Calcular el precio correcto según el modo
                if (esMayoreo) {
                    // Precio base (con descuento si lo tiene)
                    let precioBase = perfume.descuento_porcentaje > 0 ? perfume.precio_con_descuento : perfume.precio_minimo;
                    // Aplicar descuento de mayoreo (20%)
                    let precioMayoreo = precioBase * 0.8;
                    
                    // Actualizar los precios en la copia
                    perfumeParaCarrito.precio_minimo = precioMayoreo;
                    perfumeParaCarrito.precio_con_descuento = precioMayoreo;
                    perfumeParaCarrito.es_mayoreo = true;
                    perfumeParaCarrito.descuento_mayoreo = 20; // Guardamos el porcentaje de descuento de mayoreo
                }

                const existingItem = this.cart.find(item => 
                    item.id_perfume === perfume.id_perfume && item.es_mayoreo === esMayoreo
                );
                
                if (existingItem) {
                    existingItem.quantity = Math.min(existingItem.quantity + quantity, 100);
                } else {
                    this.cart.push({ ...perfumeParaCarrito, quantity });
                }
                
                const tipoCompra = esMayoreo ? 'mayoreo' : 'menudeo';
                // Solo mostrar toast para mayoreo
                if (esMayoreo) {
                    this.showToast('success', `${perfume.nombre} (${tipoCompra}) añadido al carrito`);
                }

                const cartButton = document.querySelector('.cart-button');
                if (cartButton) {
                    cartButton.classList.add('jiggle');
                    setTimeout(() => {
                        cartButton.classList.remove('jiggle');
                    }, 500);
                }

                // Abrir el carrito automáticamente
                const cartOffcanvas = document.getElementById('cartOffcanvas');
                if (cartOffcanvas) {
                    const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(cartOffcanvas);
                    bsOffcanvas.show();
                }
            },
            removeFromCart(index) {
                if (index >= 0 && index < this.cart.length) {
                    this.cart.splice(index, 1);
                    this.showToast('danger', 'Producto eliminado del carrito');
                }
            },
            updateCartQuantity(index, newQuantity) {
                if (index >= 0 && index < this.cart.length) {
                    const item = this.cart[index];
                    if (newQuantity > 0) {
                        item.quantity = Math.min(newQuantity, 100);
                    } else {
                        this.removeFromCart(index);
                    }
                }
            },
            clearCart() {
                this.cart = [];
                this.showToast('info', 'Carrito vaciado');
            },
            increaseQuantity() {
                if (this.modalQuantity < 10) this.modalQuantity++;
            },
            decreaseQuantity() {
                if (this.modalQuantity > 1) this.modalQuantity--;
            },
            filterPerfumes(publico) {
                this.selectedPublico = publico;
                this.searchTerm = '';
                this.selectedPerfume = null;
            },
            filterByCategory(category) {
                this.selectedCategory = category;
                this.selectedPublico = category;
                this.selectedTipo = null; // Resetear tipo cuando se filtra por categoría simple
                this.searchTerm = '';
                this.selectedPerfume = null;
                this.showFavoritesView = false;
                this.showComingSoonView = false;
                
                // Siempre volver al inicio cuando se cambia de categoría
                this.$nextTick(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            },
            filterByCategoryAdvanced(publico, tipo, categoryName) {
                this.selectedPublico = publico;
                this.selectedTipo = tipo;
                this.selectedCategory = categoryName;
                this.searchTerm = '';
                this.selectedPerfume = null;
                this.showFavoritesView = false;
                this.showComingSoonView = false;
                this.scrollToProducts();
            },
            getCategoryTitle(category) {
                const titles = {
                    'Hombre': 'PERFUMES PARA CABALLERO',
                    'Mujer': 'PERFUMES PARA DAMA',
                    'Unisex': 'PERFUMES UNISEX',
                    'Sets': 'SETS DE PERFUMES',
                    'ArabesHombre': 'PERFUMES ÁRABES PARA HOMBRE',
                    'ArabesMujer': 'PERFUMES ÁRABES PARA MUJER',
                    'Disenador': 'PERFUMES DE DISEÑADOR',
                    'Nicho': 'PERFUMES DE NICHO'
                };
                return titles[category] || 'LO MÁS NUEVO';
            },
            onSearchInput() {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    // Solo hacer scroll a productos si hay búsqueda
                    if (this.searchTerm && this.searchTerm.length >= 2) {
                        this.scrollToProducts();
                    }
                }, 300);
            },
            onSearchFocus() {
                this.searchFocused = true;
            },
            onSearchBlur() {
                // Delay para permitir clicks en el dropdown
                setTimeout(() => {
                    this.searchFocused = false;
                }, 200);
            },
            highlightMatch(text) {
                if (!this.searchTerm || !text) return text;
                const regex = new RegExp(`(${this.searchTerm})`, 'gi');
                return text.replace(regex, '<mark class="bg-primary/30 text-primary px-1 rounded">$1</mark>');
            },
            selectSearchResult(perfume) {
                this.showPerfumeDetail(perfume);
                this.searchFocused = false;
                this.closeSearchModal();
                // Limpiar búsqueda automáticamente al seleccionar un perfume
                this.searchTerm = '';
            },
            viewAllResults() {
                this.searchFocused = false;
                this.$nextTick(() => {
                    const perfumesSection = document.querySelector('.products-section');
                    if (perfumesSection) {
                        perfumesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            },
            quickFilterCategory(categoria) {
                this.searchTerm = '';
                this.selectedTipo = categoria;
                this.selectedPublico = null;
                this.selectedCategory = null;
                this.showFavoritesView = false;
                this.closeSearchModal();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            quickFilterPublic(publico) {
                this.searchTerm = '';
                this.selectedPublico = publico;
                this.selectedTipo = null;
                this.selectedCategory = null;
                this.showFavoritesView = false;
                this.closeSearchModal();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            clearSearch() {
                this.searchTerm = '';
                this.selectedPublico = null;
                this.selectedTipo = null;
                this.selectedCategory = null;
                // Cerrar modal si está abierto
                if (this.searchModalOpen) {
                    this.searchModalOpen = false;
                    document.body.style.overflow = '';
                }
                // Scroll al inicio
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            async submitReview() {
                if (!this.selectedPerfume) {
                    console.error('No hay perfume seleccionado');
                    this.showToast('danger', 'No hay perfume seleccionado');
                    return;
                }

                // Validaciones
                if (!this.newReview.usuario || this.newReview.usuario.trim().length < 2) {
                    this.showToast('warning', 'El nombre debe tener al menos 2 caracteres');
                    return;
                }

                // Validación mejorada de comentario con contador
                const comentarioLength = this.newReview.comentario ? this.newReview.comentario.trim().length : 0;
                const minLength = 20; // Aumentado a 20 caracteres para comentarios más útiles
                const maxLength = 500;
                
                if (!this.newReview.comentario || comentarioLength < minLength) {
                    const faltantes = minLength - comentarioLength;
                    this.showToast('warning', `⚠️ Tu comentario es muy corto. Necesitas ${faltantes} caracteres más para enviarlo (mínimo ${minLength} caracteres)`);
                    return;
                }

                if (comentarioLength > maxLength) {
                    const excedentes = comentarioLength - maxLength;
                    this.showToast('warning', `⚠️ Tu comentario es muy largo. Reduce ${excedentes} caracteres (máximo ${maxLength} caracteres)`);
                    return;
                }

                if (!this.newReview.calificacion || this.newReview.calificacion === 0 || this.newReview.calificacion === null) {
                    this.showToast('warning', 'Por favor selecciona una calificación (1 a 5 estrellas)');
                    return;
                }

                this.isSubmittingReview = true;

                // NO incluir id_perfume en el body, va en la URL
                const reviewData = {
                    usuario: this.newReview.usuario.trim(),
                    comentario: this.newReview.comentario.trim(),
                    calificacion: parseInt(this.newReview.calificacion)
                };

                try {
                    console.log('📤 Enviando reseña...', reviewData);
                    const response = await fetch(`${API_BASE_URL}/api/perfumes/${this.selectedPerfume.id_perfume}/reviews`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(reviewData)
                    });

                    console.log('📥 Respuesta del servidor:', response.status);
                    const responseData = await response.json();
                    console.log('📦 Datos de respuesta:', responseData);

                    if (!response.ok) {
                        // Mostrar errores específicos del servidor
                        if (responseData.errors && Array.isArray(responseData.errors)) {
                            const errorMsg = responseData.errors.join(', ');
                            this.showToast('warning', errorMsg);
                            console.error('❌ Errores de validación:', responseData.errors);
                        } else if (responseData.message) {
                            this.showToast('danger', responseData.message);
                            console.error('❌ Error del servidor:', responseData.message);
                        } else {
                            throw new Error(`Error ${response.status}: ${response.statusText}`);
                        }
                        return;
                    }

                    console.log('✅ Reseña enviada exitosamente');
                    this.showToast('success', '¡Gracias por tu reseña!');
                    this.newReview = {
                        usuario: '',
                        comentario: '',
                        calificacion: null
                    };
                    this.currentRating = 0;
                    await this.fetchReviews(this.selectedPerfume.id_perfume);
                } catch (error) {
                    console.error("❌ Error al enviar reseña:", error);
                    this.showToast('danger', `Error: ${error.message || 'No se pudo enviar la reseña'}`);
                } finally {
                    this.isSubmittingReview = false;
                }
            },
            setRating(rating) {
                this.newReview.calificacion = rating;
            },
            isFavorite(perfume) {
                return this.favoriteIds.includes(perfume.id_perfume);
            },
            toggleFavorite(perfume) {
                const index = this.favoriteIds.indexOf(perfume.id_perfume);
                if (index !== -1) {
                    this.favoriteIds.splice(index, 1);
                    // this.showToast('info', `${perfume.nombre} eliminado de favoritos`);
                } else {
                    this.favoriteIds.push(perfume.id_perfume);
                    // this.showToast('success', `${perfume.nombre} añadido a favoritos`);
                    
                    // Abrir automáticamente la colección de favoritos
                    this.$nextTick(() => {
                        this.showFavoritesView = true;
                        this.selectedCategory = null;
                        this.selectedPublico = null;
                        this.selectedTipo = null;
                        this.searchTerm = '';
                        this.selectedPerfume = null;
                        this.showComingSoonView = false;
                        
                        // Scroll al inicio
                        setTimeout(() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 100);
                    });
                }
            },
            loadFavorites() {
                try {
                    const favorites = localStorage.getItem('perfumeriaFavorites');
                    if (favorites) {
                        this.favoriteIds = JSON.parse(favorites);
                        console.log('✅ Favoritos cargados:', this.favoriteIds.length);
                    }
                } catch (error) {
                    console.error('Error al cargar favoritos:', error);
                    this.favoriteIds = [];
                }
            },
            saveFavorites() {
                try {
                    localStorage.setItem('perfumeriaFavorites', JSON.stringify(this.favoriteIds));
                } catch (error) {
                    console.error('Error al guardar favoritos:', error);
                }
            },
            checkoutWhatsapp() {
                if (this.cart.length === 0) {
                    this.showToast('warning', 'Tu carrito está vacío');
                    return;
                }

                let message = "¡Hola! Me gustaría hacer un pedido de los siguientes perfumes:\n\n";
                
                this.cart.forEach((item, index) => {
                    message += `${index + 1}. ${item.nombre} (${item.marca}) - ${item.mililitros}ml\n`;
                    message += `   Cantidad: ${item.quantity}\n`;
                    message += `   Precio unitario: ${item.precio_minimo}\n`;
                    message += `   Subtotal: ${(item.precio_minimo * item.quantity).toFixed(2)}\n\n`;
                });
                
                message += `💰 *TOTAL: ${this.cartTotalPrice.toFixed(2)} MXN*\n\n`;
               
                const whatsappUrl = `https://wa.me/${AppConfig.whatsapp.number}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
                this.showToast('success', 'Redirigiendo a WhatsApp para completar tu compra');
            },
            sanitizeInput(input) {
                const div = document.createElement('div');
                div.textContent = input;
                return div.innerHTML;
            },
            showToast(type, message) {
                this.toast.type = type;
                this.toast.message = message;
                this.toast.show = true;
                setTimeout(() => { this.toast.show = false; }, 4000);
            },
            formatPrice(price) {
                return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
            },
            getNotasSalida(notas) {
                if (!notas) return 'No disponible';
                const parts = notas.split(/[,;]/);
                return parts.slice(0, Math.ceil(parts.length / 3)).join(', ').trim() || 'No especificadas';
            },
            getNotasCorazon(notas) {
                if (!notas) return 'No disponible';
                const parts = notas.split(/[,;]/);
                const third = Math.ceil(parts.length / 3);
                return parts.slice(third, third * 2).join(', ').trim() || 'No especificadas';
            },
            getNotasFondo(notas) {
                if (!notas) return 'No disponible';
                const parts = notas.split(/[,;]/);
                const third = Math.ceil(parts.length / 3);
                return parts.slice(third * 2).join(', ').trim() || 'No especificadas';
            },
            selectMenudeo() {
                this.isMayoreo = false;
            },
            selectMayoreo(perfume) {
                this.isMayoreo = true;
                
                // Mostrar alerta y agregar 6 piezas automáticamente con precio de mayoreo
                this.showToast('info', '📦 Mayoreo a partir de 6 piezas. Se agregarán automáticamente 6 unidades al carrito con 20% de descuento.');
                
                // Esperar un momento para que se vea la alerta y luego agregar al carrito con precio de mayoreo
                setTimeout(() => {
                    this.addToCart(perfume, 6, null, true); // true = es mayoreo
                }, 800);
            },
            getPrecioBase(perfume) {
                // Retorna el precio base sin descuento
                if (perfume.descuento_porcentaje > 0) {
                    return perfume.precio_minimo;
                }
                return perfume.precio_minimo;
            },
            getPrecioFinal(perfume) {
                // Calcular precio final considerando descuento del perfume y mayoreo
                let precio = perfume.precio_minimo;
                
                // Si el perfume ya tiene descuento, usar ese precio
                if (perfume.descuento_porcentaje > 0) {
                    precio = perfume.precio_con_descuento;
                }
                
                // Si es mayoreo, aplicar 20% de descuento adicional
                if (this.isMayoreo) {
                    precio = precio * 0.8; // 20% de descuento
                }
                
                return precio;
            },
            getToastIcon(type) {
                const icons = { success: 'bi-check-circle-fill', danger: 'bi-x-circle-fill', warning: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' };
                return icons[type] || icons.info;
            },
            toggleSidebar() {
                this.sidebarOpen = !this.sidebarOpen;
                if (this.sidebarOpen) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            },
            closeSidebar() {
                this.sidebarOpen = false;
                document.body.style.overflow = '';
            },
            toggleSearchModal() {
                this.searchModalOpen = !this.searchModalOpen;
                if (this.searchModalOpen) {
                    this.$nextTick(() => {
                        if (this.$refs.searchModalInput) {
                            this.$refs.searchModalInput.focus();
                        }
                    });
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            },
            closeSearchModal() {
                this.searchModalOpen = false;
                // NO limpiar searchTerm para mantener los resultados visibles
                document.body.style.overflow = '';
            },
            formatDate(dateString) {
                const date = new Date(dateString);
                const now = new Date();
                const diffTime = Math.abs(now - date);
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 0) {
                    return 'Hoy';
                } else if (diffDays === 1) {
                    return 'Ayer';
                } else if (diffDays < 7) {
                    return `Hace ${diffDays} días`;
                } else if (diffDays < 30) {
                    const weeks = Math.floor(diffDays / 7);
                    return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
                } else if (diffDays < 365) {
                    const months = Math.floor(diffDays / 30);
                    return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
                } else {
                    const years = Math.floor(diffDays / 365);
                    return `Hace ${years} ${years === 1 ? 'año' : 'años'}`;
                }
            },
            getRatingText(rating) {
                const texts = {
                    1: '⭐ Malo',
                    2: '⭐⭐ Regular',
                    3: '⭐⭐⭐ Bueno',
                    4: '⭐⭐⭐⭐ Muy bueno',
                    5: '⭐⭐⭐⭐⭐ Excelente'
                };
                return texts[rating] || '';
            },
            startCarousel() {
                // Cambiar cada 3 segundos
                this.carouselInterval = setInterval(() => {
                    this.currentCarouselIndex = (this.currentCarouselIndex + 1) % 4;
                }, 3000);
            },
            showComingSoon(sectionName) {
                console.log('🔍 showComingSoon llamado con:', sectionName);
                this.comingSoonSection = sectionName;
                this.showComingSoonView = true;
                this.selectedPerfume = null;
                this.showFavoritesView = false;
                this.searchTerm = '';
                this.selectedPublico = null;
                this.selectedCategory = null;
                console.log('✅ showComingSoonView:', this.showComingSoonView);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            closeComingSoon() {
                this.showComingSoonView = false;
                this.comingSoonSection = '';
                // Volver al inicio y mostrar el hero
                this.selectedCategory = null;
                this.selectedPublico = null;
                this.searchTerm = '';
                this.selectedPerfume = null;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        watch: {
            cart: { handler: 'saveCartToStorage', deep: true },
            favoriteIds: { handler: 'saveFavorites' },
            searchTerm: 'onSearchInput',
            filteredPerfumes: 'initObserver',
            favoriteItems: 'initObserver',
            showFavoritesView: 'initObserver'
        },
        mounted() {
            // Establecer modo oscuro siempre
            document.documentElement.setAttribute('data-theme', 'dark');
            
            this.fetchPerfumes().then(() => {
                this.loadCartFromStorage();
                this.loadFavorites();
                this.initObserver();
            });
            const modalElement = document.getElementById('perfumeDetailModal');
            if (modalElement) {
                modalElement.addEventListener('hidden.bs.modal', () => {
                    this.selectedPerfume = null;
                    if (this.lastFocusedElement) this.lastFocusedElement.focus();
                });
            }
            this.startCarousel(); // Iniciar carrusel
        },
        beforeDestroy() {
            if (this.carouselInterval) {
                clearInterval(this.carouselInterval);
            }
        }
    });
});