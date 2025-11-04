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
                calificacion: 0
            },
            reviews: [],
            searchTerm: '',
            selectedPublico: null,
            errorApi: null,
            isLoading: false,
            isSubmittingReview: false,
            searchTimeout: null,
            currentRating: 0,
            mobileMenuOpen: false,
            lastFocusedElement: null,
            toast: {
                show: false,
                message: '',
                type: 'info'
            },
            showFavoritesView: false,
            observer: null,
            favoriteIds: [], // Reactive list of favorite perfume IDs
            isDarkMode: false // Dark mode state
        },
        computed: {
            filteredPerfumes() {
                let filtered = this.perfumes;
                if (this.selectedPublico) {
                    filtered = filtered.filter(perfume => perfume.publico === this.selectedPublico);
                }
                if (this.searchTerm) {
                    const searchLower = this.searchTerm.toLowerCase();
                    filtered = filtered.filter(perfume =>
                        perfume.nombre.toLowerCase().includes(searchLower) ||
                        perfume.marca.toLowerCase().includes(searchLower) ||
                        (perfume.tipo && perfume.tipo.toLowerCase().includes(searchLower))
                    );
                }
                return filtered;
            },
            cartTotalPrice() {
                return this.cart.reduce((total, item) => total + (item.precio_minimo * item.quantity), 0);
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
            handleImageError(event) {
                console.warn('Error cargando imagen, ocultando elemento:', event.target.src);
                event.target.style.display = 'none';
            },
            async fetchPerfumes() {
                this.isLoading = true;
                this.errorApi = null;
                try {
                    const response = await fetch(`${API_BASE_URL}/api/perfumes`);
                    if (!response.ok) {
                        throw new Error(`Error ${response.status}: No se pudieron cargar los perfumes`);
                    }
                    const perfumesData = await response.json();
                    // Las imágenes están en GitHub Pages, no en el backend
                    const imageBaseUrl = AppConfig.isDevelopment 
                        ? './' 
                        : 'https://itsluisit0.github.io/Perfumeria/';
                    
                    this.perfumes = perfumesData.map(p => ({
                        ...p,
                        imagen_url: `${imageBaseUrl}${p.imagen_url}`
                    }));
                    this.showToast('success', 'Catálogo cargado correctamente');
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
                    this.reviews = await response.json();
                } catch (error) {
                    console.error("Error al obtener reseñas:", error);
                    this.reviews = [];
                }
            },
            saveCartToStorage() {
                localStorage.setItem('perfumeriaCart', JSON.stringify(this.cart));
            },
            loadCartFromStorage() {
                const savedCart = localStorage.getItem('perfumeriaCart');
                if (savedCart) {
                    this.cart = JSON.parse(savedCart);
                }
            },
            toggleMobileMenu() {
                this.mobileMenuOpen = !this.mobileMenuOpen;
            },
            scrollToProducts() {
                document.getElementById('main-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
            },
            showPerfumeDetail(perfume) {
                this.lastFocusedElement = document.activeElement;
                this.selectedPerfume = perfume;
                this.modalQuantity = 1;
                this.newReview = { usuario: '', comentario: '', calificacion: 0 };
                this.currentRating = 0;
                this.fetchReviews(perfume.id_perfume);
                
                this.$nextTick(() => {
                    const modalElement = document.getElementById('perfumeDetailModal');
                    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
                    modal.show();
                });
            },
            closeModal() {
                const modal = bootstrap.Modal.getInstance(document.getElementById('perfumeDetailModal'));
                if (modal) {
                    modal.hide();
                }
                this.selectedPerfume = null;
            },
            addToCart(perfume, quantity, event) {
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

                const existingItem = this.cart.find(item => item.id_perfume === perfume.id_perfume);
                if (existingItem) {
                    existingItem.quantity = Math.min(existingItem.quantity + quantity, 10);
                } else {
                    this.cart.push({ ...perfume, quantity });
                }
                this.showToast('success', `${perfume.nombre} añadido al carrito`);

                const cartButton = document.querySelector('.cart-button');
                if (cartButton) {
                    cartButton.classList.add('jiggle');
                    setTimeout(() => {
                        cartButton.classList.remove('jiggle');
                    }, 500);
                }
            },
            removeFromCart(perfumeId) {
                const index = this.cart.findIndex(item => item.id_perfume === perfumeId);
                if (index !== -1) {
                    this.cart.splice(index, 1);
                    this.showToast('danger', 'Producto eliminado del carrito');
                }
            },
            updateCartQuantity(perfumeId, newQuantity) {
                const item = this.cart.find(item => item.id_perfume === perfumeId);
                if (item) {
                    if (newQuantity > 0) {
                        item.quantity = Math.min(newQuantity, 10);
                    } else {
                        this.removeFromCart(perfumeId);
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
            },
            onSearchInput() {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {}, 300);
            },
            clearSearch() {
                this.searchTerm = '';
            },
            async submitReview() {
                if (!this.selectedPerfume) {
                    console.error('No hay perfume seleccionado');
                    this.showToast('error', 'No hay perfume seleccionado');
                    return;
                }

                // Validaciones
                if (!this.newReview.usuario || this.newReview.usuario.trim().length < 2) {
                    this.showToast('warning', 'El nombre debe tener al menos 2 caracteres');
                    return;
                }

                if (!this.newReview.comentario || this.newReview.comentario.trim().length < 10) {
                    this.showToast('warning', 'El comentario debe tener al menos 10 caracteres');
                    return;
                }

                if (this.newReview.comentario.trim().length > 500) {
                    this.showToast('warning', 'El comentario no puede exceder 500 caracteres');
                    return;
                }

                if (!this.newReview.calificacion || this.newReview.calificacion === 0) {
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
                    const response = await fetch(`${API_BASE_URL}/api/perfumes/${this.selectedPerfume.id_perfume}/reviews`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(reviewData)
                    });

                    const responseData = await response.json();

                    if (!response.ok) {
                        // Mostrar errores específicos del servidor
                        if (responseData.errors && Array.isArray(responseData.errors)) {
                            responseData.errors.forEach(error => {
                                this.showToast('warning', error);
                            });
                        } else if (responseData.message) {
                            this.showToast('danger', responseData.message);
                        } else {
                            throw new Error(`Error ${response.status}`);
                        }
                        return;
                    }

                    this.showToast('success', '¡Reseña enviada con éxito!');
                    this.newReview = {
                        usuario: '',
                        comentario: '',
                        calificacion: 0
                    };
                    this.currentRating = 0;
                    await this.fetchReviews(this.selectedPerfume.id_perfume);
                } catch (error) {
                    console.error("Error al enviar reseña:", error);
                    this.showToast('danger', `Error: ${error.message}`);
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
                    this.showToast('info', `${perfume.nombre} eliminado de favoritos`);
                } else {
                    this.favoriteIds.push(perfume.id_perfume);
                    this.showToast('success', `${perfume.nombre} añadido a favoritos`);
                }
            },
            loadFavorites() {
                const favorites = localStorage.getItem('perfumeriaFavorites');
                if (favorites) {
                    this.favoriteIds = JSON.parse(favorites);
                }
            },
            saveFavorites() {
                localStorage.setItem('perfumeriaFavorites', JSON.stringify(this.favoriteIds));
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
               
                const whatsappUrl = `https://wa.me/522311347021?text=${encodeURIComponent(message)}`;
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
            getToastIcon(type) {
                const icons = { success: 'bi-check-circle-fill', danger: 'bi-x-circle-fill', warning: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' };
                return icons[type] || icons.info;
            },
            toggleTheme() {
                this.isDarkMode = !this.isDarkMode;
                this.applyTheme();
                this.saveThemePreference();
                const themeName = this.isDarkMode ? 'oscuro' : 'claro';
                this.showToast('info', `Modo ${themeName} activado`);
            },
            applyTheme() {
                if (this.isDarkMode) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                    document.documentElement.removeAttribute('data-theme');
                }
            },
            loadThemePreference() {
                const savedTheme = localStorage.getItem('perfumeriaTheme');
                if (savedTheme === 'dark') {
                    this.isDarkMode = true;
                    this.applyTheme();
                } else if (savedTheme === null) {
                    // Si no hay preferencia guardada, detectar preferencia del sistema
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) {
                        this.isDarkMode = true;
                        this.applyTheme();
                    }
                }
            },
            saveThemePreference() {
                localStorage.setItem('perfumeriaTheme', this.isDarkMode ? 'dark' : 'light');
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
            this.loadThemePreference(); // Cargar tema antes que todo
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
        }
    });
});