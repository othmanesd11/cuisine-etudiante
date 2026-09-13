/* ==========================================================================
   CUISINE ÉTUDIANT — Scripts principaux (navigation, tracking, formulaires)
   ========================================================================== */

(function () {
  "use strict";

  /* ----------------------------------------------------------------
   * Accès rapide à la configuration centrale (js/config.js)
   * ---------------------------------------------------------------- */
  var CFG = window.CUISINE_ETUDIANT_CONFIG || {};

  /* ----------------------------------------------------------------
   * 1. FONDATION GOOGLE ANALYTICS 4 + SEARCH CONSOLE
   * ----------------------------------------------------------------
   * Si GA4_MEASUREMENT_ID est renseigné dans config.js, on injecte
   * le tag du gestionnaire de balises et le script GA4. Sinon rien
   * n'est chargé : pas de traceur sur le site en attente de clé.
   * ---------------------------------------------------------------- */
  function initAnalytics() {
    // --- Gestionnaire de balises Google (GTM) ---
    if (CFG.GA4_MEASUREMENT_ID) {
      (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
        var f = d.getElementsByTagName(s)[0];
        var j = d.createElement(s);
        var dl = l !== "dataLayer" ? "&l=" + l : "";
        j.async = true;
        j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, "script", "dataLayer", CFG.GA4_MEASUREMENT_ID);
    }

    // --- Vérification Google Search Console (meta tag) ---
    var codeGSC = CFG.GSC_VERIFICATION_CODE;
    if (codeGSC) {
      var meta = document.createElement("meta");
      meta.name = "google-site-verification";
      meta.content = codeGSC;
      document.head.appendChild(meta);
    }
  }

  /* ----------------------------------------------------------------
   * 2. SUIVI D'ÉVÉNEMENTS PERSONNALISÉ
   * ----------------------------------------------------------------
   * Fonction unique utilisée partout sur le site. Chaque événement :
   *   - est poussé dans dataLayer si GA4 est configuré ;
   *   - est journalisé en console pour tes tests pendant le dev.
   *
   * Événements en place :
   *   clic_recette           -> ouverture d'une fiche recette
   *   inscription_newsletter -> inscription au « Menu de la Semaine »
   *   telechargement_pdf     -> bouton « Télécharger la recette (PDF) »
   * ---------------------------------------------------------------- */
  function trackEvent(nom, donnees) {
    var payload = Object.assign({ event: nom }, donnees || {});
    if (CFG.GA4_MEASUREMENT_ID && window.dataLayer) {
      window.dataLayer.push(payload);
    }
    // Journal optionnel pour vérifier en local (retire-moi en production)
    if (window.console && window.console.info) {
      window.console.info("[Cuisine Étudiant] Événement :", payload);
    }
  }
  window.CUISINE_TRACK = trackEvent; // exposé pour les pages recette

  /* ----------------------------------------------------------------
   * 3. NAVIGATION MOBILE (menu burger)
   * ---------------------------------------------------------------- */
  function initNavigation() {
    var toggle = document.getElementById("nav-toggle");
    var liens = document.getElementById("nav-liens");
    if (!toggle || !liens) return;

    toggle.addEventListener("click", function () {
      var ouvert = liens.classList.toggle("ouvert");
      toggle.setAttribute("aria-expanded", ouvert ? "true" : "false");
    });

    // Ferme le menu après un clic sur un lien (mobile)
    Array.prototype.forEach.call(liens.querySelectorAll("a"), function (lien) {
      lien.addEventListener("click", function () {
        liens.classList.remove("ouvert");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ----------------------------------------------------------------
   * 4. NEWSLETTER « Le Menu de la Semaine »
   * ----------------------------------------------------------------
   * Trois modes gérés (voir config.js) :
   *   local     -> stockage simple dans localStorage (aucun serveur)
   *   url       -> envoi POST JSON vers NEWSLETTER_ENDPOINT
   *   mailchimp -> envoi vers la fonction serverless /api/newsletter.js
   *                fournie avec le projet (clé d'API jamais exposée)
   * ---------------------------------------------------------------- */
  function initNewsletter() {
    var form = document.getElementById("news-form");
    if (!form) return;

    form.addEventListener("submit", function (evenement) {
      evenement.preventDefault();
      var champ = form.querySelector('input[type="email"]');
      var email = (champ && champ.value.trim()) || "";
      var message = document.getElementById("news-message");

      function repondre(texte, succès) {
        message.className = "msg-form " + (succès ? "succes" : "erreur");
        message.textContent = texte;
        message.style.display = "block";
      }

      // Validation simple d'adresse email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        repondre("Hmm, cette adresse n'a pas l'air valide. Vérifie-la avant de valider ✍️", false);
        return;
      }

      // Envoi de l'événement GA4 indépendamment de la réussite réseau
      trackEvent("inscription_newsletter", { email: email, page: location.pathname });

      var mode = CFG.NEWSLETTER_MODE || "local";

      if (mode === "local") {
        // Stockage simple dans le navigateur (aucun serveur requis)
        try {
          var existants = JSON.parse(localStorage.getItem("ce_newsletter") || "[]");
          if (existants.indexOf(email) === -1) existants.push(email);
          localStorage.setItem("ce_newsletter", JSON.stringify(existants));
          repondre("✅ C'est noté ! Tu recevras le menu dimanche prochain.", true);
          form.reset();
        } catch (erreur) {
          repondre("Oups, une erreur est survenue. Réessaie dans un instant.", false);
        }
        return;
      }

      // Modes nécessitant un serveur (url ou mailchimp)
      var cible = CFG.NEWSLETTER_ENDPOINT;
      var corps = { email: email };

      if (mode === "mailchimp") {
        // Appelle la fonction serverless fournie (ne jamais utiliser la
        // clé d'API Mailchimp directement depuis le navigateur !)
        cible = "/api/newsletter";
        Object.assign(corps, { apiKey: CFG.MC_API_KEY, listId: CFG.MC_LIST_ID });
      }

      if (!cible) {
        repondre("⚠️ La newsletter n'est pas encore branchée. Configure NEWSLETTER_ENDPOINT dans js/config.js ou utilise le mode 'local'.", false);
        return;
      }

      fetch(cible, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(corps),
        mode: mode === "mailchimp" ? "same-origin" : "cors",
      })
        .then(function (r) { return r.json(); })
        .then(function (donnees) {
          repondre("✅ C'est noté ! Tu recevras le menu dimanche prochain.", true);
          form.reset();
        })
        .catch(function () {
          repondre("Oups, le serveur ne répond pas. Réessaie dans un instant.", false);
        });
    });
  }

  /* ----------------------------------------------------------------
   * 5. FORMULAIRE DE CONTACT
   * ---------------------------------------------------------------- */
  function initContact() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", function (evenement) {
      evenement.preventDefault();
      var nom = (form.querySelector('[name="nom"]').value || "").trim();
      var email = (form.querySelector('[name="email"]').value || "").trim();
      var message = (form.querySelector('[name="message"]').value || "").trim();
      var reponse = document.getElementById("contact-message");

      function repondre(texte, succès) {
        reponse.className = "msg-form " + (succès ? "succes" : "erreur");
        reponse.textContent = texte;
        reponse.style.display = "block";
      }

      if (!nom || !email || !message) {
        repondre("Tous les champs sont obligatoires pour me laisser un message 🙂", false);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        repondre("Cette adresse email n'a pas l'air valide.", false);
        return;
      }

      if (CFG.CONTACT_MODE === "endpoint" && CFG.CONTACT_ENDPOINT) {
        fetch(CFG.CONTACT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ nom: nom, email: email, message: message }),
        })
          .then(function () { repondre("✅ Merci pour ton message ! Je te réponds très vite.", true); form.reset(); })
          .catch(function () { repondre("Oups, envoi impossible pour l'instant. Réessaie plus tard.", false); });
      } else {
        // Repli sans serveur : ouvre le client mail du visiteur
        var sujet = encodeURIComponent("[Contact Cuisine Étudiant] " + nom);
        var corps = encodeURIComponent(message + "\n\n— " + nom + " (" + email + ")");
        window.location.href = "mailto:bonjour@cuisine-etudiant.vercel.app?subject=" + sujet + "&body=" + corps;
        repondre("📨 Ton client mail s'ouvre pour envoyer le message.", true);
      }
    });
  }

  /* ----------------------------------------------------------------
   * 6. LIENS « carte recette » -> événement clic_recette
   * ---------------------------------------------------------------- */
  function initClicRecette() {
    var cartes = document.querySelectorAll("[data-recette]");
    Array.prototype.forEach.call(cartes, function (carte) {
      carte.addEventListener("click", function () {
        trackEvent("clic_recette", { recette: carte.getAttribute("data-recette") });
      });
    });
  }

  /* ----------------------------------------------------------------
   * 7. Emplacements monétisation réservés (publicité / affiliation)
   * ----------------------------------------------------------------
   * Composants réutilisables, prêts à remplacer par du vrai contenu.
   * Par défaut ils affichent un simple cadre discret « à venir »,
   * MAIS uniquement si ENABLE_SLOTS vaut true dans config.js.
   * Met-le à false (défaut) pour n'avoir aucun rendu visible.
   * ---------------------------------------------------------------- */
  var ENABLE_SLOTS = false; // passe à true pour prévisualiser les zones

  function renderSlots() {
    var emplacements = document.querySelectorAll("[data-slot]");
    Array.prototype.forEach.call(emplacements, function (zone) {
      var position = zone.getAttribute("data-slot");
      var type = zone.getAttribute("data-type") || "ad";
      var libelle =
        type === "affiliation"
          ? "AffiliateSlot — position « " + position + " » · futurs liens ustensiles (Amazon/partenaires)"
          : "AdSlot — position « " + position + " » · futur encart Google AdSense";

      if (ENABLE_SLOTS) {
        var cadre = document.createElement("div");
        cadre.className = "slot-bloc";
        cadre.setAttribute("aria-hidden", "true");
        cadre.title = libelle;
        cadre.textContent = "🗂️ Zone réservée · " + libelle;
        zone.appendChild(cadre);
      }
      // On conserve les données (data-slot) pour brancher plus tard
      // un réseau de pubs : rien d'autre à modifier côté HTML.
    });
  }

  /* ----------------------------------------------------------------
   * Initialisation au chargement du DOM
   * ---------------------------------------------------------------- */
  function demarrer() {
    initAnalytics();
    initNavigation();
    initNewsletter();
    initContact();
    initClicRecette();
    renderSlots();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", demarrer);
  } else {
    demarrer();
  }
})();