document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['siteDomaine', 'siteChemin'], (data) => {
    if (data.siteDomaine) document.getElementById('domaine').value = data.siteDomaine;
    if (data.siteChemin) document.getElementById('chemin').value = data.siteChemin;
  });
});

document.getElementById('options-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const domaineInput = document.getElementById('domaine').value.trim();
  const cheminInput = document.getElementById('chemin').value.trim();

  const domaineFormate = domaineInput.endsWith('/') ? domaineInput : domaineInput + '/';

  chrome.storage.local.set({
    siteDomaine: domaineFormate,
    siteChemin: cheminInput
  }, () => {
    const status = document.getElementById('status');
    status.innerText = "Réglages enregistrés avec succès ! ✅";
    setTimeout(() => { status.innerText = ""; }, 3000);
  });
});