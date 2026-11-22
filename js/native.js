/* FLARE — Android shell integration. No-op on the web. */
(function () {
  const Cap = window.Capacitor;
  if (!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) return;

  const plugins = Cap.Plugins || {};
  const AppPlugin = plugins.App;

  if (AppPlugin && AppPlugin.addListener) {
    AppPlugin.addListener('backButton', function () {
      const result = window.FLARE_NATIVE ? window.FLARE_NATIVE.back() : 'exit';
      if (result === 'exit' && AppPlugin.exitApp) AppPlugin.exitApp();
    });
  }

  /* Tapping a daily reminder opens today's task (or Home if nothing is active). */
  const LocalNotifications = plugins.LocalNotifications;
  if (LocalNotifications && LocalNotifications.addListener) {
    LocalNotifications.addListener('localNotificationActionPerformed', function () {
      if (window.FLARE_NATIVE && window.FLARE_NATIVE.openToday) window.FLARE_NATIVE.openToday();
    }).catch(function () {
      /* Older Android shells may not expose the action event. */
    });
  }
})();
