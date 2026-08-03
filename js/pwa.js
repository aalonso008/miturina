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
        'Tocá los 3 puntos o "Abrir en navegador".',
        'Elegí Chrome (Android) o Safari (iPhone).',
        'Desde ahí instalá la app.'
      ];
    }
    if (isIOSChrome || isIOSFirefox) {
      return [
        'En iPhone, la instalación solo funciona con Safari.',
        'Copiá la URL o tocá Compartir → Abrir en Safari.',
        'En Safari: Compartir (↑) → Agregar a pantalla de inicio.',
        'Confirmá con Agregar.'
      ];
    }
    if (isIOS) {
      return [
        'Usá Safari (no Chrome).',
        'Tocá Compartir (↑) abajo en el centro.',
        'Elegí "Agregar a pantalla de inicio".',
        'Tocá Agregar.'
      ];
    }
    if (isAndroid) {
      return [
        'Usá Google Chrome con cuenta de Google activa.',
        'Menú (⋮) → "Instalar app".',
        'Esperá 1-2 minutos: Chrome genera la app en segundo plano.',
        'Si falla: actualizá Google Play Services y probá con WiFi.'
      ];
    }
    return [
      'En Chrome o Edge, buscá el ícono de instalar en la barra de direcciones.',
      'O usá el menú del navegador → Instalar app.'
    ];
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

    if (isIOSChrome || isIOSFirefox || isInAppBrowser) {
      if (installBtn) installBtn.textContent = 'Cómo instalar';
      setHint('Abrí en Safari o Chrome para instalar');
      showBanner();
      return;
    }

    if (isIOS) {
      if (installBtn) installBtn.style.display = 'none';
      setHint('Safari → Compartir → Agregar a pantalla de inicio');
      showBanner();
      return;
    }

    if (isAndroid) {
      setHint('Esperá unos segundos y usá Menú → Instalar app');
      showBanner();
    }
  }

  function tryInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (result) {
        if (result.outcome !== 'accepted') {
          setHint('Instalación cancelada. Probá desde Menú → Instalar app.');
          showBanner();
        }
        deferredPrompt = null;
      }).catch(function () {
        setHint('No se pudo instalar. Revisá los pasos en Ayuda.');
        renderInstallSteps();
        showInstallModal();
      });
      return;
    }
    renderInstallSteps();
    showInstallModal();
    showBanner();
  }

  if (!isStandalone) {
    setTimeout(setupMobileInstructions, 1200);
  }

  if (isStandalone) {
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
