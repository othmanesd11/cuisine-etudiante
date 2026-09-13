# 🍳 Cuisine Étudiant

> Le blog de recettes étudiantes économiques au Maroc — **tout pour moins de 100 DH par semaine**.

Site statique responsive (HTML/CSS/JS) prêt à être déployé sur **Vercel**. Design vert foncé / jaune / rouge, ton « tu », prix en Dirhams (DH).

## 📄 Structure

```
├── index.html                      # Accueil (hero + badge 100 DH + 4 recettes + newsletter + plan hebdo)
├── a-propos.html                   # À propos
├── blog.html                       # Tous les articles
├── categories.html                 # Catégories
├── contact.html                    # Formulaire de contact
├── politique-de-confidentialite.html  # Page légale (RGPD)
├── recettes/
│   ├── pates-cremeuses-tomate-basilic.html   # 25 DH/personne
│   ├── bowl-couscous-pois-chiches.html       # 20 DH/personne
│   ├── omelette-vide-frigo.html              # 17 DH/personne
│   └── pancakes-banane-avoine.html           # 13 DH/personne
├── css/style.css                   # Design system (palette vert/jaune/rouge)
├── js/
│   ├── config.js                   # ✅ CONFIGURATION CENTRALE (GA4, GSC, newsletter, contact)
│   ├── main.js                     # Navigation, formulaires, tracking, emplacements pubs
│   └── recette.js                  # Génération PDF + partage social
├── api/newsletter.js               # Fonction serverless Vercel (inscription Mailchimp)
├── sitemap.xml                     # Plan du site (⚠️ à personnaliser)
├── robots.txt                      # ⚠️ à personnaliser
├── vercel.json                     # Config Vercel (URL propres + en-têtes sécurité)
└── .env.example                    # Modèle des variables d'environnement
```

## 🚀 Déployer sur Vercel

1. Pousse ce dossier sur GitHub.
2. Sur [vercel.com](https://vercel.com), clique **New Project** puis importe le dépôt.
   - Vercel détecte automatiquement un projet statique ; le seul répertoire
     `/api` est traité comme fonctions serverless — aucun framework requis.
3. Ajoute les variables d'environnement (facultatives) :
   `GA4_MEASUREMENT_ID`, `GSC_VERIFICATION_CODE`, `MC_API_KEY`, `MC_LIST_ID`.
4. Clique **Deploy**. C'est en ligne ! 🎉

## 🎛️ À configurer pour lancer le site

Tout se règle dans **`js/config.js`** puis dans **`sitemap.xml` / `robots.txt`** :

| Fichier                | Réglages |
|------------------------|----------|
| `js/config.js`         | `GA4_MEASUREMENT_ID`, `GSC_VERIFICATION_CODE`, mode newsletter (`local` / `mailchimp` / `url`), endpoint contact |
| `sitemap.xml`          | Remplace `cuisine-etudiant.vercel.app` par ton domaine réel |
| `robots.txt`           | Idem (domaine du sitemap) |

> 💡 La newsletter fonctionne **directement** en mode `local` (email enregistré dans
> le navigateur). Pour la version serveur (email dans une vraie liste), choisis le
> mode `mailchimp` : la clé d'API est lue via les variables d'environnement Vercel
> dans `api/newsletter.js` — jamais exposée côté client.

## ✨ Fonctionnalités

- **Budget hebdomadaire** : badge « Tout le programme pour moins de 100 DH/semaine » dans le hero.
- **Newsletter** « Le Menu de la Semaine » entre « Les recettes du moment » et « 5 dîners. ».
- **PDF par recette** : bouton « 📥 Télécharger la recette (PDF) » (jsPDF + html2canvas, avec repli impression).
- **SEO** : title/meta optimisés, données structurées `schema.org/Recipe` (coût en MAD), sitemap.xml, robots.txt.
- **Tracking** : événements `clic_recette`, `inscription_newsletter`, `telechargement_pdf` (GA4, activés si l'ID est renseigné).
- **Pages légales + contact** : Politique de confidentialité (RGPD) et formulaire de contact.
- **Emplacements monétisation réservés** : `<div data-slot="recette-fin" data-type="affiliation">` et `<div data-slot="article-milieu" data-type="ad">`, rendus par `main.js` (§7) quand `ENABLE_SLOTS = true`.
- **Partage social** : copier le lien, WhatsApp, Instagram — sous chaque recette.
- **Localisation Maroc** : « Fait avec ❤️ au Maroc · Prix en Dirhams (DH) · Cuisine Étudiant » dans le footer.

## 🛡️ Avertissements avant production

- Les **photos** viennent d'Unsplash (URL directes) : remplace-les par tes propres images pour la performance et l'originalité.
- Les liens WhatsApp / Instagram de la page contact sont des exemples à remplacer par tes comptes réels.
- Renseigne ton **GA4**, ton **Search Console** et (si souhaité) tes **clés Mailchimp** avant le lancement.