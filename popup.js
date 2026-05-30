document.getElementById('open-test').addEventListener('click', () => {

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let tabActif = tabs[0];

    // On injecte un script dans l'onglet actif
    chrome.scripting.executeScript({
      target: { tabId: tabActif.id },
      func: () => {
        // CE CODE S'EXÉCUTE DIRECTEMENT DANS TON SITE SYMFONY
        const balisesCSS = document.querySelectorAll('link[rel="stylesheet"]');
        const listLinks = [];

        balisesCSS.forEach(link => {
          // On vérifie si l'URL contient le nom de ton site
          if (link.href.includes('lebonheurdespetitsguerriers.fr')) {
            listLinks.push(link.href);
            //console.log("🎯 CSS local conservé : " + link.href);
          }
        });

        return listLinks; // On retourne la liste des fichiers CSS trouvés
      }
    },
      (results) => {
        // CE CODE REVIENT DANS L'EXTENSION AVEC LE RÉSULTAT
        if (results && results[0]) {
          let linksCSS = results[0].result;


          let urlInternet = linksCSS.find(link => link.startsWith('http') && !link.includes('lebonheurdespetitsguerriers.fr'));
          if (urlInternet) {
            console.warn("⚠️ Fichier CSS externe trouvé : " + urlInternet);
          }

          function localPath(link) {
            return link.replace('https://lebonheurdespetitsguerriers.fr', '/Users/julienchassin/Documents/LBPG');
          }

          let urlVsCode = `backticks${localPath(linksCSS[0])}`;
          console.log("🔗 URL pour VS Code : " + urlVsCode);

          // On affiche le premier lien CSS local trouvé dans ton élément HTML
          document.getElementById('affichage-links').innerText = "Fichier local : " + linksCSS[0];
        }
      });

  });
});