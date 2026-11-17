/* FLARE — Android shell integration. No-op on the web. */
(function () {
  const Cap = window.Capacitor;
  if (!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) return;
  if (!Cap.Plugins || !Cap.Plugins.App) return;

  const AppPlugin = Cap.Plugins.App;

  if (AppPlugin.addListener) {
    AppPlugin.addListener('backButton', function () {
      const result = window.FLARE_NATIVE ? window.FLARE_NATIVE.back() : 'exit';
      if (result === 'exit' && AppPlugin.exitApp) AppPlugin.exitApp();
    });
  }
})();
