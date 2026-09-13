/* ==========================================================================
   CUISINE ÉTUDIANT — Fichier de configuration central
   --------------------------------------------------------------------------
   Toutes les variables « vides » sont prêtes à recevoir vos codes réels.
   Rien n'affiche de publicité tant que vous n'avez rien configuré ici.
   ========================================================================== */

window.CUISINE_ETUDIANT_CONFIG = {
  /* ------------------------------------------------------------------
   * 1. GOOGLE ANALYTICS 4  (optionnel)
   * ------------------------------------------------------------------
   * Renseigne ton identifiant de mesure GA4 (format : G-XXXXXXXXXX).
   * Tant qu'il est vide (''), le script de suivi ne se charge pas.
   * Une fois rempli, les événements clic_recette, inscription_newsletter
   * et telechargement_pdf seront envoyés automatiquement (voir main.js).
   * ------------------------------------------------------------------ */
  GA4_MEASUREMENT_ID: "",

  /* ------------------------------------------------------------------
   * 2. GOOGLE SEARCH CONSOLE  (optionnel)
   * ------------------------------------------------------------------
   * Colle ici le code de vérification fourni par Search Console
   * (la partie alphanumérique du meta tag), par exemple "abc123XYZ".
   * ------------------------------------------------------------------ */
  GSC_VERIFICATION_CODE: "",

  /* ------------------------------------------------------------------
   * 3. NEWSLETTER « Le Menu de la Semaine »
   * ------------------------------------------------------------------
   * Choisis ton mode de stockage des emails :
   *
   *  - "local"  : stockage simple, local, dans le navigateur (démo).
   *               Aucune requête réseau. Les emails sont perdus si on
   *               change de navigateur ou qu'on vide le cache.
   *
   *  - "mailchimp" : envoi vers Mailchimp. Renseigne ci-dessous la clé
   *               d'API (MC_API_KEY) et l'identifiant du public
   *               (MC_LIST_ID). Utilise la fonction serverless
   *               /api/newsletter.js fournie dans le projet (Vercel),
   *               afin de ne JAMAIS exposer ta clé côté navigateur.
   *
   *  - "url"     : envoi du formulaire vers n'importe quel endpoint
   *               compatible POST JSON (ex. Formspree, ton back-end).
   *               NEWSLETTER_ENDPOINT contient l'URL cible.
   * ------------------------------------------------------------------ */
  NEWSLETTER_MODE: "local",
  NEWSLETTER_ENDPOINT: "",        // ex. "https://formspree.io/f/xxxxxxxx"
  MC_API_KEY: "",                 // ex. "ab12cd34-us12" (utilisée côté serveur uniquement)
  MC_LIST_ID: "",                 // ex. "1a2b3c4d5e"

  /* ------------------------------------------------------------------
   * 4. FORMULAIRE DE CONTACT
   * ------------------------------------------------------------------
   *  - "mailto" : ouvre le client mail de ton visiteur (stockage nul).
   *  - "endpoint" : envoie le formulaire en POST JSON vers
   *               CONTACT_ENDPOINT (ex. Formspree).
   * ------------------------------------------------------------------ */
  CONTACT_MODE: "endpoint",
  CONTACT_ENDPOINT: "",           // ex. "https://formspree.io/f/xxxxxxxx"
};