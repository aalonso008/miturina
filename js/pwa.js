(function () {
  var deferredPrompt = null;
  var banner = document.getElementById('installBanner');
  var installBtn = document.getElementById('installBtn');
  var installClose = document.getElementById('installClose');
  var installHint = document.getElementById('installHint');

  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  var isAndroid = /Android/i.test(navigator.userAgent);
  var isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  function appBase() {
    return new URL('./', window.location.href).href;
  }

  function hideBanner() {
    if (banner) banner.classList.remove('show');
  }

  function showBanner() {
    if (banner && !isStandalone) banner.classList.add('show');
  }

  function setHint(text) {
    if (installHint) installHint.textContent = text;
  }

  function setupMobileInstructions() {
    if (isIOS) {
      if (installBtn) installBtn.style.display = 'none';
      setHint('Safari → Compartir (↑) → Agregar a pantalla de inicio');
      showBanner();
      return;
    }

    if (isAndroid) {
      setHint('Menú (⋮) → Instalar app o Agregar a pantalla de inicio');
      showBanner();
    }
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      var swUrl = new URL('sw.js', appBase()).href;
      navigator.serviceWorker
        .register(swUrl, { scope: appBase() })
        .then(function () {
          if (!isStandalone && (isIOS || isAndroid)) {
            setTimeout(setupMobileInstructions, 800);
          }
        })
        .catch(function (err) {
          console.error('Service worker error:', err);
          setupMobileInstructions();
        });
    });
  } else {
    setupMobileInstructions();
  }

  if (isStandalone) {
    hideBanner();
    return;
  }

  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    deferredPrompt = event;
    if (installBtn) installBtn.style.display = '';
    setHint('Acceso directo en tu pantalla de inicio, modo app');
    showBanner();
  });

  if (installBtn) {
    installBtn.addEventListener('click', function () {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function () {
          deferredPrompt = null;
          hideBanner();
        });
        return;
      }

      if (isIOS) {
        setHint('Safari → Compartir (↑) → Agregar a pantalla de inicio');
        showBanner();
        return;
      }

      setHint('Usá el menú del navegador (⋮) → Instalar app');
      showBanner();
    });
  }

  if (installClose) {
    installClose.addEventListener('click', hideBanner);
  }

  window.addEventListener('appinstalled', hideBanner);
})();
