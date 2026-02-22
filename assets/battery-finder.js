(function () {
  'use strict';

  var data = [];
  var input = document.getElementById('bf-input');
  var results = document.getElementById('bf-results');
  var hint = document.getElementById('bf-hint');

  if (!input || !results) return;

  fetch('../data/battery-finder.json')
    .then(function (r) { return r.json(); })
    .then(function (d) { data = d; })
    .catch(function () {
      results.innerHTML = '<p class="notice">Could not load data. Check the reference pages directly.</p>';
    });

  function normalize(s) {
    return s.toLowerCase().replace(/[\s\-_]/g, '');
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function search(query) {
    if (!query) return [];
    var q = normalize(query);
    return data.filter(function (b) {
      if (normalize(b.code).indexOf(q) !== -1) return true;
      return b.aliases.some(function (a) { return normalize(a).indexOf(q) !== -1; });
    });
  }

  function renderCard(b) {
    var eqHtml = b.equivalents.length
      ? '<p><strong>Also sold as:</strong> ' + b.equivalents.map(escHtml).join(', ') + '</p>'
      : '';
    return '<div class="answer-box">' +
      '<h2 style="margin-top:0">' + escHtml(b.code) + '</h2>' +
      '<table><tr><th>Voltage</th><td>' + escHtml(b.voltage) + '</td></tr>' +
      '<tr><th>Chemistry</th><td>' + escHtml(b.chemistry) + '</td></tr>' +
      '<tr><th>Dimensions</th><td>' + escHtml(b.dimensions) + '</td></tr>' +
      '<tr><th>Capacity</th><td>' + escHtml(b.capacity) + '</td></tr>' +
      '<tr><th>Other codes</th><td>' + b.aliases.slice(0, 6).map(escHtml).join(', ') + '</td></tr>' +
      '</table>' +
      '<p style="margin-top:0.75rem">' + escHtml(b.notes) + '</p>' +
      eqHtml +
      '<p><a href="' + escHtml(b.url) + '">Full reference &rarr;</a></p>' +
      '</div>';
  }

  function update() {
    var q = input.value.trim();
    if (!q) {
      results.innerHTML = '';
      hint.hidden = false;
      return;
    }
    hint.hidden = true;
    var matches = search(q);
    if (!matches.length) {
      results.innerHTML = '<p>No match for <strong>' + escHtml(q) + '</strong>. Check the code on the battery itself \u2014 it is printed on the label or embossed on the metal.</p>';
      return;
    }
    results.innerHTML = matches.map(renderCard).join('');
  }

  input.addEventListener('input', update);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') update();
  });
})();