(function () {
  var deferredPrompt = null;
  var banner = document.getElementById('installBanner');
  var installBtn = document.getElementById('installBtn');
  var installClose = document.getElementById('installClose');
  var installHint = document.getElementById('installHint');
  var installModal = document.getElementById('installModal');
  var headerInstallBtn = document.getElementById('headerInstallBtn');

  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  var isAndroid = /Android/i.test(navigator.userAgent);
  var isIOSChrome = isIOS && /CriOS/i.test(navigator.userAgent);
  var isIOSFirefox = isIOS && /FxiOS/i.test(navigator.userAgent);
  var isInAppBrowser = /Instagram|FBAN|FBAV|WhatsApp|Line\//i.test(navigator.userAgent);
  var isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  function appScope() {
    return new URL('./', location.href).pathname;
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

  function showInstallModal() {
    if (installModal) installModal.classList.add('show');
  }

  function hideInstallModal() {
    if (installModal) installModal.classList.remove('show');
  }

  function getInstallSteps() {
    if (isInAppBrowser) {
      return [
        'Estás en un navegador interno (Instagram, WhatsApp, etc.).',
        'Abrí la página en Chrome o Safari.',
        'Luego instalá desde el menú del navegador.'
      ];
    }
    if (isIOSChrome || isIOSFirefox) {
      return [
        'En iPhone usá Safari.',
        'Compartir (↑) → Agregar a pantalla de inicio.',
        'Confirmá con Agregar.'
      ];
    }
    if (isIOS) {
      return [
        'Safari → Compartir (↑) → Agregar a pantalla de inicio.',
        'Confirmá con Agregar.'
      ];
    }
    if (isAndroid) {
      return [
        'Usá Google Chrome con tu cuenta Google activa.',
        'Menú (⋮) → Instalar app.',
        'Esperá hasta 2 minutos sin cerrar Chrome.',
        'Si el ícono tiene logo de Chrome abajo, borrá el acceso directo e instalá de nuevo.'
      ];
    }
    return ['Chrome o Edge → Instalar app.'];
  }

  function renderInstallSteps() {
    var list = document.getElementById('installSteps');
    if (!list) return;
    list.innerHTML = getInstallSteps()
      .map(function (step) {
        return '<li>' + step + '</li>';
      })
      .join('');
  }

  function setupMobileInstructions() {
    if (isStandalone) return;
    if (isIOS) {
      if (installBtn) installBtn.style.display = 'none';
      setHint('Safari → Compartir → Agregar a pantalla de inicio');
    } else if (isAndroid) {
      setHint('Menú (⋮) → Instalar app');
    }
    showBanner();
  }

  function tryInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function () {
        deferredPrompt = null;
      });
      return;
    }
    renderInstallSteps();
    showInstallModal();
    showBanner();
  }

  if ('serviceWorker' in navigator) {
    var scope = appScope();
    navigator.serviceWorker.register(scope + 'sw.js', { scope: scope }).catch(function (err) {
      console.error('Service worker error:', err);
    });
  }

  if (!isStandalone) {
    setTimeout(setupMobileInstructions, 1000);
  } else {
    hideBanner();
    if (headerInstallBtn) headerInstallBtn.style.display = 'none';
    return;
  }

  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    deferredPrompt = event;
    if (installBtn) {
      installBtn.style.display = '';
      installBtn.textContent = 'Instalar';
    }
    setHint('Tocá Instalar para modo app sin barra de Chrome');
    showBanner();
  });

  if (installBtn) installBtn.addEventListener('click', tryInstall);
  if (headerInstallBtn) headerInstallBtn.addEventListener('click', tryInstall);
  if (installClose) installClose.addEventListener('click', hideBanner);

  var modalClose = document.getElementById('installModalClose');
  if (modalClose) modalClose.addEventListener('click', hideInstallModal);

  if (installModal) {
    installModal.addEventListener('click', function (e) {
      if (e.target === installModal) hideInstallModal();
    });
  }

  window.addEventListener('appinstalled', function () {
    hideBanner();
    hideInstallModal();
  });
})();
