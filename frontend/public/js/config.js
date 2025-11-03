// ==============================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ==============================================

const AppConfig = {
    // Detectar automáticamente el entorno
    isDevelopment: window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '',
    
    // URLs del API
    development: {
        apiUrl: 'http://localhost:3000'
    },
    
    production: {
        // ✅ Backend desplegado en Railway
        apiUrl: 'https://perfumeria-production.up.railway.app'
    },
    
    // Obtener la URL del API según el entorno
    getApiUrl() {
        return this.isDevelopment ? this.development.apiUrl : this.production.apiUrl;
    },
    
    // Información de contacto
    whatsapp: {
        number: '5212311877967',
        formattedNumber: '231-187-7967'
    },
    
    // Redes sociales
    social: {
        facebook: 'https://www.facebook.com/',
        whatsapp: 'https://wa.me/5212311877967'
    }
};

// Advertencia en consola si no se ha configurado la URL de producción
if (!AppConfig.isDevelopment && AppConfig.production.apiUrl === 'https://tu-servidor-backend.com') {
    console.warn('⚠️ ATENCIÓN: La URL del backend no ha sido configurada para producción.');
    console.warn('📝 Edita el archivo: frontend/public/js/config.js');
    console.warn('🔧 Y cambia la URL en: production.apiUrl');
}

// Log de información (solo en desarrollo)
if (AppConfig.isDevelopment) {
    console.log('🔧 Modo: DESARROLLO');
    console.log('🌐 API URL:', AppConfig.getApiUrl());
} else {
    console.log('🚀 Modo: PRODUCCIÓN');
    console.log('🌐 API URL:', AppConfig.getApiUrl());
}

