document.getElementById('open-test').addEventListener('click', () => {
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let tabActif = tabs[0];
    
    // On injecte un script dans l'onglet actif
    chrome.scripting.executeScript({
      target: { tabId: tabActif.id },
      func: () => {
        const balisesCSS = document.querySelectorAll('link[rel="stylesheet"]');
        const listLinks = [];

        balisesCSS.forEach(link => {
          if (link.href.includes('lebonheurdespetitsguerriers.fr')) {
            listLinks.push(link.href);
          }
        });

        return listLinks; // On renvoie le tableau à l'extension
      }
    },
    (results) => {
      // CODE DE L'EXTENSION
      if (results && results[0]) {
        let linksCSS = results[0].result;

        function localPath(link) {
          // 1. On remplace le domaine internet par ton dossier public sur le Mac
          let cleanPath = link.replace('https://lebonheurdespetitsguerriers.fr/', '/Users/julienchassin/Documents/LBPG/public/');
          
          // 2. On nettoie le hash de production (ex: app.e367814a.css devient app.css)
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
          document.getElementById('affichage-links').innerText = "Aucun CSS local trouvé.";
        }
      }
    });

  });
});