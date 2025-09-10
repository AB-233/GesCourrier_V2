// Configuration des URLs API
const API_CONFIG = {
  // URL de développement (localhost)
  development: 'http://localhost:4000',
  
  // URL de production (à modifier selon votre déploiement)
  production: 'https://gescourrier-v2-1.onrender.com',
  
  // URL actuelle basée sur l'environnement
  get current() {
    return import.meta.env.PROD ? this.production : this.development;
  }
};

export default API_CONFIG;

