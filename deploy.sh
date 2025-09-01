#!/bin/bash

echo "🚀 Déploiement de l'application Gescourrier..."

# 1. Construire l'application frontend
echo "📦 Construction de l'application frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la construction"
    exit 1
fi

echo "✅ Application frontend construite avec succès"

# 2. Vérifier que le dossier dist existe
if [ ! -d "dist" ]; then
    echo "❌ Dossier dist introuvable"
    exit 1
fi

# 3. Déployer sur Vercel (optionnel)
echo "🌐 Déploiement sur Vercel..."
vercel --prod

echo "🎉 Déploiement terminé !"
echo "📱 Votre application est maintenant en ligne"

