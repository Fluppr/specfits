/**
 * SpecFits — Cookie Consent + Google Consent Mode v2
 */
(function () {
  'use strict';

  var KEY = 'fs_cookie_consent';

  /* ── Consent Mode v2 defaults ── */
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('consent', 'default', {
    ad_storage:         'denied',
    ad_user_data:       'denied',
    ad_personalization: 'denied',
    analytics_storage:  'denied',
    wait_for_update:    500
  });

  function grant() {
    gtag('consent', 'update', {
      ad_storage:         'granted',
      ad_user_data:       'granted',
      ad_personalization: 'granted',
      analytics_storage:  'granted'
    });
  }

  /* Restore prior choice */
  if (localStorage.getItem(KEY) === 'accepted') grant();

  function hideBanner() {
    var el = document.getElementById('fs-cb');
    if (el) el.classList.add('fs-cb-hidden');
  }

  function showBanner() {
    var el = document.getElementById('fs-cb');
    if (el) el.classList.remove('fs-cb-hidden');
  }

  /* Hide on page load if already decided */
  function init() {
    if (localStorage.getItem(KEY)) hideBanner();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Global handlers called directly by onclick attributes on buttons */
  window.fsCookieAccept = function () {
    localStorage.setItem(KEY, 'accepted');
    grant();
    hideBanner();
  };

  window.fsCookieDecline = function () {
    localStorage.setItem(KEY, 'declined');
    hideBanner();
  };

  /* "Cookie Preferences" links */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t) return;
    if (t.dataset.action === 'cookie-prefs' ||
        t.id === 'open-cookie-prefs' ||
        t.classList.contains('open-cookie-prefs')) {
      e.preventDefault();
      localStorage.removeItem(KEY);
      showBanner();
    }
  });

})();