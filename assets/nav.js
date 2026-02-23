(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('header nav');
  if (!toggle || !nav) return;

  // Hamburger open/close
  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open', !expanded);
  });

  // Mobile dropdown toggles (tap to expand)
  var dropdownLinks = document.querySelectorAll('.has-dropdown > a');
  dropdownLinks.forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (window.innerWidth > 768) return;
      e.preventDefault();
      var li = a.parentElement;
      li.classList.toggle('open');
    });
  });

  // Two-tone wordmark: split "SpecFits" into Spec + Fits spans
  var brandLink = document.querySelector('.brand a');
  if (brandLink) {
    var child = Array.from(brandLink.childNodes).find(function (n) {
      return n.nodeType === 3 && /SpecFits/i.test(n.textContent);
    });
    if (child) {
      var wrap = document.createElement('span');
      wrap.innerHTML = '<span class="brand-spec">Spec</span><span class="brand-accent">Fits</span>';
      brandLink.replaceChild(wrap, child);
    }
  }

  // Close nav when clicking outside header
  document.addEventListener('click', function (e) {
    if (!e.target.closest('header')) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close nav on resize back to desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.querySelectorAll('.has-dropdown').forEach(function (li) {
        li.classList.remove('open');
      });
    }
  });
})();
