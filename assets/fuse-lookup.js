(function () {
  'use strict';

  var data = [];
  var input = document.getElementById('fl-input');
  var results = document.getElementById('fl-results');
  var hint = document.getElementById('fl-hint');

  if (!input || !results) return;

  fetch('../data/fuse-lookup.json')
    .then(function (r) { return r.json(); })
    .then(function (d) { data = d; })
    .catch(function () {
      results.innerHTML = '<p class="notice">Could not load data. Use the reference table below.</p>';
    });

  function normalize(s) {
    return s.toLowerCase().replace(/[\s\-_.]/g, '');
  }

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function search(query) {
    if (!query) return [];
    var q = normalize(query);
    return data.filter(function (f) {
      if (normalize(f.code).indexOf(q) !== -1) return true;
      if (normalize(f.type).indexOf(q) !== -1) return true;
      if (normalize(f.color).indexOf(q) !== -1) return true;
      if (f.amps.toLowerCase().replace(/[\s]/g, '').indexOf(q) !== -1) return true;
      return f.aliases.some(function (a) { return normalize(a).indexOf(q) !== -1; });
    });
  }

  function colorSwatch(color) {
    var map = {
      'black': '#111111',
      'gray': '#9ca3af',
      'grey': '#9ca3af',
      'violet': '#7c3aed',
      'purple': '#7c3aed',
      'pink': '#f9a8d4',
      'tan': '#d4b896',
      'beige': '#d4b896',
      'brown': '#92400e',
      'red': '#dc2626',
      'blue': '#3b82f6',
      'yellow': '#facc15',
      'natural': '#f5f5f5',
      'clear': '#f5f5f5',
      'white': '#f5f5f5',
      'green': '#16a34a',
      'teal': '#0d9488',
      'aqua': '#0d9488',
      'orange': '#ea580c'
    };
    var lc = color.toLowerCase();
    var hex = null;
    Object.keys(map).forEach(function (k) {
      if (lc.indexOf(k) !== -1 && !hex) hex = map[k];
    });
    if (!hex) return '';
    var borderColor = (hex === '#f5f5f5' || hex === '#facc15') ? '#ccc' : 'rgba(0,0,0,.2)';
    return '<span style="display:inline-block;width:.85em;height:.85em;border-radius:2px;border:1px solid ' + borderColor + ';background:' + hex + ';vertical-align:middle;margin-right:.3em;"></span>';
  }

  function renderCard(f) {
    var aliasText = f.aliases.length ? f.aliases.map(escHtml).join(', ') : '—';
    return '<div class="answer-box">' +
      '<h2 style="margin-top:0">' + escHtml(f.code) + ' &mdash; ' + escHtml(f.amps) + '</h2>' +
      '<table>' +
        '<tr><th>Type</th><td>' + escHtml(f.type) + '</td></tr>' +
        '<tr><th>Color</th><td>' + colorSwatch(f.color) + escHtml(f.color) + '</td></tr>' +
        '<tr><th>Voltage rating</th><td>' + escHtml(f.voltage_rating) + '</td></tr>' +
        '<tr><th>Dimensions</th><td>' + escHtml(f.dimensions) + '</td></tr>' +
        '<tr><th>Also known as</th><td>' + aliasText + '</td></tr>' +
      '</table>' +
      '<p style="margin-top:0.75rem">' + escHtml(f.notes) + '</p>' +
      '</div>';
  }

  function update() {
    var q = input.value.trim();
    if (!q) {
      results.innerHTML = '';
      if (hint) hint.hidden = false;
      return;
    }
    if (hint) hint.hidden = true;
    var matches = search(q);
    if (!matches.length) {
      results.innerHTML = '<p class="notice">No fuses found matching &ldquo;' + escHtml(q) + '&rdquo;. Try the type (e.g., ATC, mini blade, maxi) or color (e.g., blue, red, green).</p>';
      return;
    }
    results.innerHTML = matches.map(renderCard).join('');
  }

  input.addEventListener('input', update);
  input.addEventListener('search', update);

  var form = input.closest('form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      update();
    });
  }
}());
