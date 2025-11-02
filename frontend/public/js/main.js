document.addEventListener('DOMContentLoaded', () => {
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
            lastFocusedElement: null, // Para accesibilidad del modal
            toast: {
                show: false,
                message: '',
                type: 'info'
            }
        },
        computed: {
            filteredPerfumes() {
                let filtered = this.perfumes;

                // Filtrar por público
                if (this.selectedPublico) {
                    filtered = filtered.filter(perfume => perfume.publico === this.selectedPublico);
                }

                // Filtrar por término de búsqueda
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
            }
        },
        methods: {
            // ===== MANEJO DE IMÁGENES =====
            handleImageError(event) {
                console.warn('Error cargando imagen, ocultando elemento:', event.target.src);
                event.target.style.display = 'none';
            },

            // ===== GESTIÓN DE DATOS =====
            async fetchPerfumes() {
                this.isLoading = true;
                this.errorApi = null;
                try {
                    const response = await fetch('http://localhost:3000/api/perfumes');
                    if (!response.ok) {
                        throw new Error(`Error ${response.status}: No se pudieron cargar los perfumes`);
                    }
                    const perfumesData = await response.json();

                    // El backend ahora debería enviar la URL completa y correcta.
                    // Simplemente agregamos el prefijo del servidor a la ruta relativa.
                    this.perfumes = perfumesData.map(p => ({
                        ...p,
                        imagen_url: `http://localhost:3000/${p.imagen_url}`
                    }));

                    this.showToast('success', 'Catálogo cargado correctamente');
                } catch (error) {
                    console.error("Error al obtener perfumes:", error);
                    if (error.message.includes('429')) {
                        this.errorApi = "Demasiadas solicitudes. Por favor, espera un momento y recarga la página.";
                    } else {
                        this.errorApi = "No se pudieron cargar los perfumes. Intente nuevamente más tarde.";
                    }
                    this.showToast('danger', 'Error al cargar el catálogo');
                } finally {
                    this.isLoading = false;
                }
            },

            async fetchReviews(perfumeId) {
                try {
                    const response = await fetch(`http://localhost:3000/api/perfumes/${perfumeId}/reviews`);
                    
                    if (!response.ok) {
                        throw new Error(`Error ${response.status} al cargar reseñas`);
                    }
                    
                    this.reviews = await response.json();
                } catch (error) {
                    console.error("Error al obtener reseñas:", error);
                    this.reviews = [];
                }
            },

            // ===== PERSISTENCIA DEL CARRITO =====
            saveCartToStorage() {
                try {
                    localStorage.setItem('perfumeriaCart', JSON.stringify(this.cart));
                } catch (error) {
                    console.warn('No se pudo guardar el carrito en localStorage:', error);
                }
            },

            loadCartFromStorage() {
                try {
                    const savedCart = localStorage.getItem('perfumeriaCart');
                    if (savedCart) {
                        this.cart = JSON.parse(savedCart);
                    }
                } catch (error) {
                    console.warn('No se pudo cargar el carrito desde localStorage:', error);
                    this.cart = [];
                }
            },

            // ===== INTERFAZ DE USUARIO =====
            toggleMobileMenu() {
                this.mobileMenuOpen = !this.mobileMenuOpen;
            },

            scrollToProducts() {
                const productsSection = document.getElementById('main-content');
                if (productsSection) {
                    productsSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            },

            showPerfumeDetail(perfume) {
                this.lastFocusedElement = document.activeElement; // Guardar foco para accesibilidad
                this.selectedPerfume = perfume;
                this.modalQuantity = 1;
                this.newReview = {
                    usuario: '',
                    comentario: '',
                    calificacion: 0
                };
                this.currentRating = 0;
                
                this.fetchReviews(perfume.id_perfume);
                
                const modalElement = document.getElementById('perfumeDetailModal');
                if (modalElement) {
                    let modal = bootstrap.Modal.getInstance(modalElement);
                    if (!modal) {
                        modal = new bootstrap.Modal(modalElement);
                    }
                    modal.show();
                }
            },

            closeModal() {
                const modalElement = document.getElementById('perfumeDetailModal');
                if (modalElement) {
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) {
                        modal.hide();
                    }
                }
                this.selectedPerfume = null;
            },

            // ===== CARRITO DE COMPRAS =====
            addToCart(perfume, quantity) {
                if (!perfume || quantity <= 0) {
                    this.showToast('warning', 'Cantidad inválida');
                    return;
                }

                const existingItemIndex = this.cart.findIndex(item => item.id_perfume === perfume.id_perfume);
                const finalQuantity = Math.min(quantity, 10);

                if (existingItemIndex !== -1) {
                    const newQuantity = this.cart[existingItemIndex].quantity + finalQuantity;
                    
                    if (newQuantity > 10) {
                        this.showToast('warning', `Máximo 10 unidades permitidas por producto`);
                        this.cart[existingItemIndex].quantity = 10;
                    } else {
                        this.cart[existingItemIndex].quantity = newQuantity;
                        this.showToast('success', `${finalQuantity} ${finalQuantity === 1 ? 'unidad' : 'unidades'} de ${perfume.nombre} añadidas al carrito`);
                    }
                } else {
                    this.cart.push({
                        ...perfume,
                        quantity: finalQuantity
                    });
                    this.showToast('success', `${perfume.nombre} añadido al carrito`);
                }

                this.saveCartToStorage();
            },

            removeFromCart(perfumeId) {
                const index = this.cart.findIndex(item => item.id_perfume === perfumeId);
                if (index !== -1) {
                    const removedPerfume = this.cart[index];
                    this.cart.splice(index, 1);
                    this.showToast('danger', `${removedPerfume.nombre} eliminado del carrito`);
                    this.saveCartToStorage();
                }
            },

            updateCartQuantity(perfumeId, newQuantity) {
                if (newQuantity <= 0) {
                    this.removeFromCart(perfumeId);
                    return;
                }

                const item = this.cart.find(item => item.id_perfume === perfumeId);
                if (item) {
                    item.quantity = Math.min(newQuantity, 10);
                    this.saveCartToStorage();
                }
            },

            clearCart() {
                if (this.cart.length > 0) {
                    this.cart = [];
                    this.saveCartToStorage();
                    this.showToast('info', 'Carrito vaciado correctamente');
                }
            },

            // ===== GESTIÓN DE CANTIDADES =====
            increaseQuantity() {
                if (this.modalQuantity < 10) {
                    this.modalQuantity++;
                } else {
                    this.showToast('warning', 'Máximo 10 unidades por producto');
                }
            },

            decreaseQuantity() {
                if (this.modalQuantity > 1) {
                    this.modalQuantity--;
                }
            },

            // ===== FILTROS Y BÚSQUEDA =====
            filterPerfumes(publico) {
                this.selectedPublico = publico;
            },

            onSearchInput() {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.filterPerfumes(this.selectedPublico);
                }, 300);
            },

            clearSearch() {
                this.searchTerm = '';
                this.filterPerfumes(this.selectedPublico);
            },

            // ===== RESEÑAS =====
            async submitReview() {
                if (!this.selectedPerfume) return;

                if (this.newReview.usuario.trim().length < 2) {
                    this.showToast('warning', 'El nombre debe tener al menos 2 caracteres');
                    return;
                }

                if (this.newReview.comentario.trim().length < 10) {
                    this.showToast('warning', 'La reseña debe tener al menos 10 caracteres');
                    return;
                }

                if (this.newReview.comentario.trim().length > 500) {
                    this.showToast('warning', 'La reseña no puede exceder 500 caracteres');
                    return;
                }

                if (this.newReview.calificacion === 0) {
                    this.showToast('warning', 'Por favor selecciona una calificación');
                    return;
                }

                this.isSubmittingReview = true;

                const reviewData = {
                    usuario: this.sanitizeInput(this.newReview.usuario.trim()),
                    comentario: this.sanitizeInput(this.newReview.comentario.trim()),
                    calificacion: this.newReview.calificacion,
                    id_perfume: this.selectedPerfume.id_perfume
                };

                try {
                    const response = await fetch(`http://localhost:3000/api/perfumes/${this.selectedPerfume.id_perfume}/reviews`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(reviewData)
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Error ${response.status}: ${errorText}`);
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
                    this.showToast('danger', 'Error al enviar la reseña. Intenta nuevamente.');
                } finally {
                    this.isSubmittingReview = false;
                }
            },

            setRating(rating) {
                this.newReview.calificacion = rating;
            },

            // ===== FAVORITOS =====
            isFavorite(perfume) {
                const favorites = this.getFavorites();
                return favorites.some(fav => fav.id_perfume === perfume.id_perfume);
            },

            toggleFavorite(perfume) {
                const favorites = this.getFavorites();
                const existingIndex = favorites.findIndex(fav => fav.id_perfume === perfume.id_perfume);

                if (existingIndex !== -1) {
                    favorites.splice(existingIndex, 1);
                    this.showToast('info', `${perfume.nombre} eliminado de favoritos`);
                } else {
                    const favoritePerfume = {
                        id_perfume: perfume.id_perfume,
                        nombre: perfume.nombre,
                        marca: perfume.marca,
                        imagen_url: perfume.imagen_url
                    };
                    favorites.push(favoritePerfume);
                    this.showToast('success', `${perfume.nombre} añadido a favoritos`);
                }

                this.saveFavorites(favorites);
            },

            getFavorites() {
                try {
                    return JSON.parse(localStorage.getItem('perfumeriaFavorites')) || [];
                } catch {
                    return [];
                }
            },

            saveFavorites(favorites) {
                try {
                    localStorage.setItem('perfumeriaFavorites', JSON.stringify(favorites));
                } catch (error) {
                    console.warn('No se pudieron guardar los favoritos');
                }
            },

            // ===== CHECKOUT =====
            checkoutWhatsapp() {
                if (this.cart.length === 0) {
                    this.showToast('warning', 'Tu carrito está vacío');
                    return;
                }

                let message = "¡Hola! Me gustaría hacer un pedido de los siguientes perfumes:\n\n";
                
                this.cart.forEach((item, index) => {
                    message += `${index + 1}. ${item.nombre} (${item.marca}) - ${item.mililitros}ml\n`;
                    message += `   Cantidad: ${item.quantity}\n`;
                    message += `   Precio unitario: $${item.precio_minimo}\n`;
                    message += `   Subtotal: $${(item.precio_minimo * item.quantity).toFixed(2)}\n\n`;
                });
                
                message += `💰 *TOTAL: $${this.cartTotalPrice.toFixed(2)} MXN*\n\n`;
                message += `📦 *Información de envío:*\n`;
                message += `📍 Dirección: [Completar]\n`;
                message += `📞 Teléfono: [Completar]\n`;
                message += `💳 Método de pago: [Completar]`;

                const whatsappUrl = `https://wa.me/5212311877967?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
                this.showToast('success', 'Redirigiendo a WhatsApp para completar tu compra');
            },

            // ===== UTILIDADES =====
            sanitizeInput(input) {
                const div = document.createElement('div');
                div.textContent = input;
                return div.innerHTML;
            },

            showToast(type, message) {
                this.toast.type = type;
                this.toast.message = message;
                this.toast.show = true;

                setTimeout(() => {
                    this.toast.show = false;
                }, 4000);
            },

            formatPrice(price) {
                return new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN'
                }).format(price);
            },

            getToastIcon(type) {
                switch(type) {
                    case 'success': return 'bi-check-circle-fill';
                    case 'danger': return 'bi-x-circle-fill';
                    case 'warning': return 'bi-exclamation-triangle-fill';
                    case 'info': return 'bi-info-circle-fill';
                    default: return 'bi-info-circle-fill';
                }
            }
        },
        watch: {
            cart: {
                handler() {
                    this.saveCartToStorage();
                },
                deep: true
            },
            
            searchTerm() {
                this.onSearchInput();
            },

            perfumes: {
                handler() {
                    if (this.perfumes.length > 0) {
                        this.loadCartFromStorage();
                    }
                },
                deep: true
            }
        },
        mounted() {
            this.fetchPerfumes();
            
            const modalElement = document.getElementById('perfumeDetailModal');
            if (modalElement) {
                modalElement.addEventListener('hidden.bs.modal', () => {
                    this.selectedPerfume = null;
                    this.modalQuantity = 1;
                    if (this.lastFocusedElement) {
                        this.lastFocusedElement.focus(); // Devolver foco para accesibilidad
                    }
                });
            }
            
            const toastElement = document.getElementById('cartToast');
            if (toastElement) {
                this.toastInstance = new bootstrap.Toast(toastElement, {
                    autohide: true,
                    delay: 4000
                });
            }

            document.addEventListener('click', (event) => {
                if (this.mobileMenuOpen && !event.target.closest('.nav-actions')) {
                    this.mobileMenuOpen = false;
                }
            });
        }
    });
});