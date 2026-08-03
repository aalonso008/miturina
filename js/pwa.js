(function () {
  var deferredPrompt = null;
  var banner = document.getElementById('installBanner');
  var installBtn = document.getElementById('installBtn');
  var installClose = document.getElementById('installClose');
  var installHint = document.getElementById('installHint');

  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  var isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  function hideBanner() {
    if (banner) banner.classList.remove('show');
  }

  function showBanner() {
    if (banner && !isStandalone) banner.classList.add('show');
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').then(function () {
        if (isIOS) setTimeout(showBanner, 1500);
      }).catch(function (err) {
        console.error('Service worker error:', err);
      });
    });
  }

  if (isStandalone) {
    hideBanner();
    return;
  }

  if (isIOS) {
    if (installBtn) installBtn.style.display = 'none';
    if (installHint) {
      installHint.textContent = 'Safari → Compartir → Agregar a pantalla de inicio';
    }
  }

  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    deferredPrompt = event;
    if (installHint) installHint.textContent = 'Acceso directo en tu pantalla de inicio, modo app';
    if (installBtn) installBtn.style.display = '';
    showBanner();
  });

  if (installBtn) {
    installBtn.addEventListener('click', function () {
      if (!deferredPrompt) {
        alert('Usá el menú del navegador (⋮) → "Instalar app" o "Agregar a pantalla de inicio"');
        return;
      }
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () {
        deferredPrompt = null;
        hideBanner();
      });
    });
  }

  if (installClose) {
    installClose.addEventListener('click', hideBanner);
  }

  window.addEventListener('appinstalled', hideBanner);
})();
