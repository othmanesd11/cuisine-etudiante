/* ==========================================================================
   CUISINE ÉTUDIANT — Fonction serverless Newsletter (Vercel)
   --------------------------------------------------------------------------
   Endpoint : POST /api/newsletter
   Serveur : Node.js (fonction Vercel dans le dossier /api)

   Rôle : si le mode « mailchimp » est choisi dans js/config.js, le navigateur
   envoie ici l'adresse email + la clé d'API et l'ID de liste. La clé d'API
   Mailchimp n'est DONC JAMAIS exposée dans le code du site : elle vit dans
   les variables d'environnement Vercel (voir .env.example).

   Variables d'environnement attendues (Vercel > Settings > Environment) :
     MC_API_KEY  -> ex. "ab12cd34ef56gh78ij9k-us12"
     MC_LIST_ID  -> ex. "1a2b3c4d5e"

   Documentation API Mailchimp :
   https://mailchimp.com/developer/marketing/api/lists/add-member-to-list/
   ========================================================================== */

module.exports = async function (request, response) {
  // Autoriser les requêtes depuis le site uniquement (CORS)
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    return response.status(200).end();
  }

  if (request.method !== "POST") {
    return response.status(405).json({ ok: false, erreur: "Méthode non autorisée." });
  }

  try {
    const corps = request.body || {};
    const email = (corps.email || "").toString().trim();

    // Validation basique
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return response.status(400).json({ ok: false, erreur: "Adresse email invalide." });
    }

    // Lecture des clés depuis l'environnement Vercel (jamais depuis le client)
    const cleApi = process.env.MC_API_KEY || corps.apiKey;
    const listeId = process.env.MC_LIST_ID || corps.listId;

    if (!cleApi || !listeId) {
      return response.status(500).json({
        ok: false,
        erreur: "La newsletter n'est pas configurée côté serveur (MC_API_KEY / MC_LIST_ID manquants).",
      });
    }

    // L'API Mailchimp se présente sous la forme « us12 » après le tiret
    const serveurPrefix = cleApi.split("-").pop();
    const url = `https://${serveurPrefix}.api.mailchimp.com/3.0/lists/${listeId}/members`;

    const reponseMailchimp = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`anystring:${cleApi}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
        tags: ["Copie de secours"],
      }),
    });

    const donnees = await reponseMailchimp.json().catch(() => ({}));

    // 200 : déjà abonné (status "subscribed" retourné) — on considère que c'est OK
    if (reponseMailchimp.status === 200 || reponseMailchimp.ok) {
      return response.status(200).json({ ok: true });
    }

    return response.status(reponseMailchimp.status || 500).json({
      ok: false,
      erreur: donnees.detail || "Échec de l'inscription Mailchimp.",
    });
  } catch (erreur) {
    return response.status(500).json({ ok: false, erreur: "Erreur interne du serveur." });
  }
};