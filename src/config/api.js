// Configuration des URLs API
const API_CONFIG = {
  // URL de développement (localhost)
  development: 'http://localhost:4000',
  
  // URL de production (à modifier selon votre déploiement)
 // production: 'https://gescourrier-v2.onrender.com',
  
  // URL actuelle basée sur l'environnement
  get current() {
   return import.meta.env.PROD ? this.production : this.development;
 }
};

//export const API_BASE_URL = "https://api.render.com/deploy/srv-d30stdemcj7s73cg77vg?key=MrXzhlnQocI"; // Mets ici l'URL Render réelle

// Exemple d'utilisation :
//export async function getOutgoingMails() {
  //const res = await fetch(`${API_BASE_URL}/outgoing-mails`);
//  return await res.json();
}

// ... autres appels API ...


export default API_CONFIG;

