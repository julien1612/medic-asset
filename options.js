// Au chargement de la page, on récupère les réglages déjà sauvés (si existants) pour pré-remplir le formulaire
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['siteDomaine', 'siteChemin'], (data) => {
    if (data.siteDomaine) document.getElementById('domaine').value = data.siteDomaine;
    if (data.siteChemin) document.getElementById('chemin').value = data.siteChemin;
  });
});

// Événement de sauvegarde du formulaire
document.getElementById('options-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const domaineInput = document.getElementById('domaine').value.trim();
  const cheminInput = document.getElementById('chemin').value.trim();

  // On s'assure que le domaine se termine bien par un slash pour que le .replace() fonctionne à coup sûr
  const domaineFormate = domaineInput.endsWith('/') ? domaineInput : domaineInput + '/';

  // Sauvegarde dans le stockage local de l'extension Chrome
  chrome.storage.local.set({
    siteDomaine: domaineFormate,
    siteChemin: cheminInput
  }, () => {
    // Petit effet visuel de succès
    const status = document.getElementById('status');
    status.innerText = "Réglages enregistrés avec succès ! ✅";
    setTimeout(() => { status.innerText = ""; }, 3000);
  });
});