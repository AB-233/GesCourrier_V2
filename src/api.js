export const API_BASE_URL = "https://gescourrier-v2.onrender.com/api";

// Exemple d'utilisation :
export async function getOutgoingMails() {
  const res = await fetch(`${API_BASE_URL}/outgoing-mails`);
  return await res.json();
}