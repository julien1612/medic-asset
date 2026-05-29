document.getElementById('open-test').addEventListener('click', () => {
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let tabActif = tabs[0];
    
    // On injecte un script dans l'onglet actif
    chrome.scripting.executeScript({
      target: { tabId: tabActif.id },
      func: () => {
        // CE CODE S'EXÉCUTE DIRECTEMENT DANS TON SITE SYMFONY
        // On récupère toutes les balises <link rel="stylesheet">
        const balisesCSS = document.querySelectorAll('link[rel="stylesheet"]');
        
        // On renvoie le nombre de fichiers trouvés à l'extension
        return balisesCSS.length;
      }
    }, (results) => {
      // CE CODE REVIENT DANS L'EXTENSION AVEC LE RÉSULTAT
      if (results && results[0]) {
        let nombreCSS = results[0].result;

        document.getElementById('affichage-url').innerText = "Nombre de fichiers CSS : " + nombreCSS;
        // À TOI DE JOUER ICI : 
        // Écris la ligne de code pour afficher ce nombre dans ton élément "affichage-url"
        // Indice : Tu l'as fait juste à l'étape d'avant avec innerText !
      }
    });

  });
});