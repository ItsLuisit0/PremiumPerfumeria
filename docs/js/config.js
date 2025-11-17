const AppConfig = {
    isDevelopment: window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.port === '5500' ||
                   window.location.port === '5501' ||
                   window.location.hostname === '',
    
    development: {
        apiUrl: 'http://localhost:3000'
    },
    
    production: {
        apiUrl: 'https://perfumeriapremium-production.up.railway.app'
    },
    
    getApiUrl() {
        return this.isDevelopment ? this.development.apiUrl : this.production.apiUrl;
    },
    
    whatsapp: {
        number: '5212311508956',
        formattedNumber: '231-150-8956',
        displayNumber: '+52 231 150 8956'
    },
    
    social: {
        facebook: 'https://www.facebook.com/people/Premium-Perfumer%C3%ADa/61578055706575/',
        instagram: 'https://www.instagram.com',
        whatsapp: 'https://wa.me/5212311508956'
    },
    
    app: {
        name: 'Perfumería Premium',
        description: 'Réplicas premium de las mejores fragancias del mundo',
        version: '1.0.0'
    }
};

