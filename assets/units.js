(function () {
  var PREF_KEY = 'specfits-units';
  var isImperial = localStorage.getItem(PREF_KEY) === 'imperial';

  /* ── Conversion ────────────────────────────────────────────── */
  function mmToIn(mm) {
    var val = mm / 25.4;
    // Use more decimal places for small values to stay meaningful
    return val < 0.5 ? val.toFixed(3) : val < 5 ? val.toFixed(2) : val.toFixed(2);
  }

  /* ── Regex: matches "14.5 mm", "14.5 × 50.5 mm", "14.5×17.5×48.5 mm" ── */
  // Captures the full numeric/separator portion before " mm"
  var MM_RE = /(\d+(?:\.\d+)?(?:\s*[×x]\s*\d+(?:\.\d+)?)*)(\s*mm)/g;

  function parseAndConvert(dimStr) {
    var parts = dimStr.split(/\s*[×x]\s*/).map(function (v) { return parseFloat(v.trim()); });
    var inParts = parts.map(mmToIn);
    return {
      metric: parts.join(' × ') + ' mm',
      imperial: inParts.join(' × ') + ' in'
    };
  }

  /* ── Process a single text node ────────────────────────────── */
  function processText(node) {
    var text = node.nodeValue;
    MM_RE.lastIndex = 0;
    if (!MM_RE.test(text)) return;
    MM_RE.lastIndex = 0;

    var frag = document.createDocumentFragment();
    var last = 0;
    var m;

    while ((m = MM_RE.exec(text)) !== null) {
      if (m.index > last) {
        frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      }

      var conv = parseAndConvert(m[1]);
      var span = document.createElement('span');
      span.className = 'unit-conv';
      span.dataset.metric = conv.metric;
      span.dataset.imperial = conv.imperial;
      span.textContent = isImperial ? conv.imperial : conv.metric;
      frag.appendChild(span);
      last = m.index + m[0].length;
    }

    if (last < text.length) {
      frag.appendChild(document.createTextNode(text.slice(last)));
    }

    node.parentNode.replaceChild(frag, node);
  }

  /* ── Walk DOM collecting text nodes first, then process ──── */
  function walkAndTag(root) {
    var walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (n) {
          var tag = n.parentNode && n.parentNode.nodeName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA') {
            return NodeFilter.FILTER_REJECT;
          }
          // Quick pre-filter before regex
          return (/mm/.test(n.nodeValue) && /\d/.test(n.nodeValue))
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP;
        }
      }
    );
    var nodes = [];
    var n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(processText);
  }

  /* ── Flip all tagged spans ──────────────────────────────────── */
  function applyUnits() {
    document.querySelectorAll('.unit-conv').forEach(function (el) {
      el.textContent = isImperial ? el.dataset.imperial : el.dataset.metric;
    });
  }

  /* ── Build toggle pill ──────────────────────────────────────── */
  function buildToggle() {
    var btn = document.createElement('button');
    btn.className = 'units-toggle';
    btn.id = 'units-toggle';
    btn.innerHTML =
      '<span class="units-opt" data-val="metric">mm</span>' +
      '<span class="units-sep">/</span>' +
      '<span class="units-opt" data-val="imperial">in</span>';
    markActive(btn);

    btn.addEventListener('click', function () {
      isImperial = !isImperial;
      localStorage.setItem(PREF_KEY, isImperial ? 'imperial' : 'metric');
      markActive(btn);
      applyUnits();
    });
    return btn;
  }

  function markActive(btn) {
    btn.querySelectorAll('.units-opt').forEach(function (span) {
      span.classList.toggle('active', span.dataset.val === (isImperial ? 'imperial' : 'metric'));
    });
    btn.setAttribute('aria-label',
      isImperial ? 'Switch to metric (mm)' : 'Switch to imperial (in)');
  }

  /* ── Init ───────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    // Inject toggle into header container before the hamburger
    var container = document.querySelector('header .container');
    var toggle = document.querySelector('.nav-toggle');
    if (container) {
      var btn = buildToggle();
      if (toggle) {
        container.insertBefore(btn, toggle);
      } else {
        container.appendChild(btn);
      }
    }

    walkAndTag(document.body);
    // If imperial preference already set, flip values
    if (isImperial) applyUnits();
  });
})();
