/* ==========================================================================
   CUISINE ÉTUDIANT — Script des pages recette
   (téléchargement PDF, partage social)
   ========================================================================== */

(function () {
  "use strict";

  var CFG = window.CUISINE_ETUDIANT_CONFIG || {};

  /* ----------------------------------------------------------------
   * 1. TÉLÉCHARGEMENT PDF D'UNE RECETTE
   * ----------------------------------------------------------------
   * Utilise jsPDF + html2canvas (chargés depuis un CDN en bas de page).
   * Principe : on copie la fiche recette dans un bloc caché et propre,
   * puis on le photographie (html2canvas) et on l'enregistre en PDF.
   * Si les bibliothèques CDN sont indisponibles, on bascule sur
   * l'impression navigateur (qui permet aussi « Enregistrer en PDF »).
   * ---------------------------------------------------------------- */

  // Source du bloc de la fiche recette (copie fidèle de la page)
  var sourceRecette = document.getElementById("fiche-recette");

  function genererPDF() {
    var bouton = document.getElementById("btn-pdf");
    if (!sourceRecette) return;

    // Événement GA4 : telechargement_pdf
    if (window.CUISINE_TRACK) {
      window.CUISINE_TRACK("telechargement_pdf", {
        recette: document.title,
        prix_mad: sourceRecette.getAttribute("data-prix") || "",
      });
    }

    var jsPDFDispo = window.jspdf && window.jspdf.jsPDF;
    var html2canvasDispo = window.html2canvas;

    if (jsPDFDispo && html2canvasDispo && !sourceRecette.classList.contains("pdf-rendu")) {
      if (bouton) {
        bouton.disabled = true;
        bouton.textContent = "⏳ Génération du PDF…";
      }

      // Marqueur pour indenter la version « à imprimer » en cours de cré
      sourceRecette.classList.add("pdf-rendu");

      html2canvas(sourceRecette, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false, // retire les logs html2canvas de la console
      }).then(function (canvas) {
        var PDF = window.jspdf.jsPDF;
        var pagePDF = new PDF({ orientation: "portrait", unit: "px", format: "a4" });
        var largeurPage = pagePDF.internal.pageSize.getWidth();
        var image = canvas.toDataURL("image/jpeg", 0.95);

        // Ajustement de l'image pour tenir sur la page sans débordement
        var ratio = canvas.height / canvas.width;
        var hauteurImage = largeurPage * ratio;
        pagePDF.addImage(image, "JPEG", 0, 0, largeurPage, hauteurImage);

        var nomFichier = (document.title.replace(/[^\w\sàâäéèêëîïôöùûüç-]/gi, "").trim().replace(/\s+/g, "-").toLowerCase()) + ".pdf";
        pagePDF.save(nomFichier);

        sourceRecette.classList.remove("pdf-rendu");
        if (bouton) {
          bouton.disabled = false;
          bouton.textContent = "📥 Télécharger la recette (PDF)";
        }
      }).catch(function () {
        // Si la capture échoue : repli sur l'impression navigateur
        sourceRecette.classList.remove("pdf-rendu");
        if (bouton) {
          bouton.disabled = false;
          bouton.textContent = "📥 Télécharger la recette (PDF)";
        }
        window.print();
      });
    } else {
      // Repli simple et fiable : l'utilisateur choisit « Enregistrer en PDF »
      window.print();
    }
  }

  /* ----------------------------------------------------------------
   * 2. PARTAGE SOCIAL (WhatsApp, Instagram, copier le lien)
   * ---------------------------------------------------------------- */
  var urlPage = window.location.href;
  var textePartage = "Cette recette à moins de 30 DH vaut le détour 😋 " + document.title + " " + urlPage;

  function initPartage() {
    var btnCopier = document.getElementById("partage-copier");
    var btnWhatsApp = document.getElementById("partage-whatsapp");
    var btnInstagram = document.getElementById("partage-instagram");
    var retour = document.getElementById("partage-message");

    // --- Copier le lien ---
    if (btnCopier) {
      btnCopier.addEventListener("click", function () {
        var fait = function () {
          if (retour) { retour.textContent = "✅ Lien copié ! Partage-le où tu veux."; retour.style.opacity = 1; }
          setTimeout(function () { if (retour) retour.style.opacity = 0; }, 2500);
          window.CUISINE_TRACK && window.CUISINE_TRACK("partage", { reseau: "copie_lien" });
        };
        // Clipboard API moderne, avec repli pour les anciens navigateurs
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(urlPage).then(fait);
        } else {
          var echec = document.createElement("textarea");
          echec.value = urlPage;
          document.body.appendChild(echec);
          echec.select();
          document.execCommand("copy");
          document.body.removeChild(echec);
          fait();
        }
      });
    }

    // --- WhatsApp (lien wa.me prêt à l'emploi) ---
    if (btnWhatsApp) {
      btnWhatsApp.href = "https://wa.me/?text=" + encodeURIComponent(textePartage);
      btnWhatsApp.target = "_blank";
      btnWhatsApp.rel = "noopener";
      btnWhatsApp.addEventListener("click", function () {
        window.CUISINE_TRACK && window.CUISINE_TRACK("partage", { reseau: "whatsapp" });
      });
    }

    // --- Instagram (pas d'API de partage direct : on ouvre le profil
    //     du site et on place le lien copié à disposition) ---
    if (btnInstagram) {
      btnInstagram.addEventListener("click", function (evenement) {
        evenement.preventDefault();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(urlPage).then(function () {
            if (retour) { retour.textContent = "📸 Lien copié pour ton DM Instagram !"; retour.style.opacity = 1; }
            setTimeout(function () { if (retour) retour.style.opacity = 0; }, 2500);
          });
        }
        window.open("https://www.instagram.com/", "_blank", "noopener");
        window.CUISINE_TRACK && window.CUISINE_TRACK("partage", { reseau: "instagram" });
      });
    }
  }

  /* ----------------------------------------------------------------
   * Initialisation
   * ---------------------------------------------------------------- */
  function demarrer() {
    var btnPDF = document.getElementById("btn-pdf");
    if (btnPDF) btnPDF.addEventListener("click", genererPDF);
    initPartage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", demarrer);
  } else {
    demarrer();
  }
})();