// 1. GESTION DU CLIC SUR L'ENGRENAGE (OUVRIR LES OPTIONS)
document.getElementById('open-options').addEventListener('click', () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage(); // Méthode recommandée par Chrome
  } else {
    window.open(chrome.runtime.getURL('options.html')); // Secours
  }
});

// 2. GESTION DU CLIC SUR LE BOUTON BLEU (DÉTECTION + OUVERTURE VS CODE)
document.getElementById('open-test').addEventListener('click', () => {

  // ÉTAPE CHRONO : On va chercher les réglages de l'utilisateur dans la mémoire de Chrome
  chrome.storage.local.get(['siteDomaine', 'siteChemin'], (reglages) => {
    
    // Sécurité : Si l'utilisateur n'a encore rien configuré, on stoppe et on le prévient
    if (!reglages.siteDomaine || !reglages.siteChemin) {
      document.getElementById('affichage-links').innerText = "⚠️ Configuration manquante. Cliquez sur ⚙️ pour configurer vos dossiers.";
      return;
    }

    // Si on a les réglages, on récupère l'onglet actif du navigateur
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      let tabActif = tabs[0];
      
      // On injecte le script d'extraction dans la page web de l'onglet
      chrome.scripting.executeScript({
        target: { tabId: tabActif.id },
        func: (domaineRecherche) => {
          const balisesCSS = document.querySelectorAll('link[rel="stylesheet"]');
          const listLinks = [];

          // On nettoie un peu le domaine pour être sûr que l'extraction fonctionne (on vire le https:// pour le .includes)
          let domaineNettoye = domaineRecherche.replace('https://', '').replace('/', '');

          balisesCSS.forEach(link => {
            if (link.href.includes(domaineNettoye)) {
              listLinks.push(link.href);
            }
          });

          return listLinks; // On renvoie le tableau à l'extension
        },
        args: [reglages.siteDomaine] // On envoie le domaine configuré dans la fonction de l'onglet
      },
      (results) => {
        // CODE DE L'EXTENSION (Retour des résultats)
        if (results && results[0]) {
          let linksCSS = results[0].result;

          // Ta fonction magique devenue 100% dynamique grâce à la mémoire !
          function localPath(link) {
            // 1. On remplace dynamiquement le domaine trouvé par le chemin du Mac de l'utilisateur (+ dossier public)
            let cleanPath = link.replace(reglages.siteDomaine, reglages.siteChemin + '/public/');
            
            // 2. On nettoie toujours le hash de production (ex: app.e367814a.css devient app.css)
            cleanPath = cleanPath.replace(/app\.[a-z0-9]+\.css/, 'app.css');
            
            return cleanPath;
          }

          if (linksCSS && linksCSS.length > 0) {
            // 1. On génère l'URL propre pour VS Code
            let urlVsCode = `vscode://file${localPath(linksCSS[0])}`;

            // 2. Action ! On ouvre automatiquement le fichier dans VS Code
            chrome.tabs.create({ url: urlVsCode });

            // 3. On met à jour l'affichage du popup pour vérification
            document.getElementById('affichage-links').innerText = "Lien généré : " + urlVsCode;
          } else {
            document.getElementById('affichage-links').innerText = "Aucun CSS local correspondant trouvé sur ce site.";
          }
        }
      });

    });
  });
});