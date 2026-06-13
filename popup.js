document.addEventListener('DOMContentLoaded', () => {

  const btnOptions = document.getElementById('open-options');
  const btnCss = document.getElementById('open-css');
  const btnJs = document.getElementById('open-js');
  const statusDiv = document.getElementById('affichage-links');

  if (btnOptions) {
    btnOptions.addEventListener('click', () => {
      window.open(chrome.runtime.getURL('options.html'));
    });
  }

  function ouvrirAssetDansVsCode(typeAsset) {
    chrome.storage.local.get(['siteDomaine', 'siteChemin'], (reglages) => {
      
      if (!reglages.siteDomaine || !reglages.siteChemin) {
        statusDiv.innerText = "⚠️ Configuration manquante. Cliquez sur ⚙️.";
        return;
      }

      let cheminMachine = reglages.siteChemin.trim();

      // ALERTES COMMERCIALES / UNIVERSELLES
      if (cheminMachine.startsWith('~')) {
        statusDiv.innerText = "⚠️ Erreur : N'utilisez pas '~'. Écrivez le chemin complet (ex: /Users/...)";
        return;
      }

      // Nettoyage générique du slash de fin pour Windows et Mac
      if (cheminMachine.endsWith('/') || cheminMachine.endsWith('\\')) { 
        cheminMachine = cheminMachine.slice(0, -1); 
      }

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        let tabActif = tabs[0];
        
        if (!tabActif) {
          statusDiv.innerText = "❌ Aucun onglet actif.";
          return;
        }

        chrome.scripting.executeScript({
          target: { tabId: tabActif.id },
          func: (domaineRecherche) => {
            let domaineNettoye = domaineRecherche.replace('https://', '').replace('http://', '').split(':')[0].split('/')[0];
            const toutesLesRessources = performance.getEntriesByType('resource');
            const listCSS = [];
            toutesLesRessources.forEach(ressource => {
              if (ressource.name.includes(domaineNettoye) && ressource.name.includes('.css')) {
                listCSS.push(ressource.name);
              }
            });
            return { css: listCSS };
          },
          args: [reglages.siteDomaine]
        },
        (results) => {
          let finalPath = "";

          if (results && results[0] && results[0].result && results[0].result.css.length > 0) {
            let urlCssNavigateur = results[0].result.css[0].split('?')[0];
            let urlCleanCss = urlCssNavigateur.replace(/app\.[a-z0-9]+\.css/, 'app.css');
            let indexBuild = urlCleanCss.indexOf('/build/');
            let relativePathCss = (indexBuild !== -1) ? '/public' + urlCleanCss.substring(indexBuild) : '/public' + urlCleanCss.substring(urlCleanCss.lastIndexOf('/'));
            
            finalPath = cheminMachine + relativePathCss;
            if (typeAsset === 'js') {
              finalPath = finalPath.replace('/app.css', '/app.js');
            }
          } else {
            // Secours standard universel
            finalPath = cheminMachine + (typeAsset === 'css' ? '/public/build/app.css' : '/public/build/app.js');
          }

          // Exécution de l'ouverture
          try {
            const targetLink = document.createElement('a');
            targetLink.href = `vscode://file${finalPath}`;
            document.body.appendChild(targetLink);
            targetLink.click();
            document.body.removeChild(targetLink);
            statusDiv.innerText = `🚀 ${typeAsset.toUpperCase()} ouvert avec succès !`;
          } catch (e) {
            statusDiv.innerText = "❌ Erreur lors de l'ouverture.";
          }
        });
      });
    });
  }

  if (btnCss) btnCss.addEventListener('click', () => ouvrirAssetDansVsCode('css'));
  if (btnJs) btnJs.addEventListener('click', () => ouvrirAssetDansVsCode('js'));
});