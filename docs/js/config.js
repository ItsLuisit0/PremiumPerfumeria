// ==============================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ==============================================

const AppConfig = {
    // Detectar automáticamente el entorno
    isDevelopment: window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.port === '5500' ||
                   window.location.port === '5501' ||
                   window.location.hostname === '',
    
    // URLs del API
    development: {
        apiUrl: 'http://localhost:3000'
    },
    
    production: {
        // ✅ Backend desplegado en Railway
        apiUrl: 'https://perfumeriapremium-production.up.railway.app'
    },
    
    // Obtener la URL del API según el entorno
    getApiUrl() {
        const apiUrl = this.isDevelopment ? this.development.apiUrl : this.production.apiUrl;
        console.log(`🌐 Entorno: ${this.isDevelopment ? 'Desarrollo' : 'Producción'}`);
        console.log(`🔗 API URL: ${apiUrl}`);
        return apiUrl;
    },
    
    // Información de contacto
    whatsapp: {
        // Número sin espacios ni guiones para enlaces
        number: '5212311508956',
        // Número formateado para mostrar
        formattedNumber: '231-150-8956',
        displayNumber: '+52 231 150 8956'
    },
    
    // Redes sociales
    social: {
        facebook: 'https://www.facebook.com/people/Premium-Perfumer%C3%ADa/61578055706575/',
        instagram: 'https://www.instagram.com',
        whatsapp: 'https://wa.me/5212311508956'
    },
    
    // Configuración de la aplicación
    app: {
        name: 'Perfumería Premium',
        description: 'Réplicas premium de las mejores fragancias del mundo',
        version: '1.0.0'
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

