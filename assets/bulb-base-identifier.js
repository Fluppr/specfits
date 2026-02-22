/* Bulb Base Identifier — 3-step question flow
   Questions: 1) base type  2) pin style (pin only)  3) diameter class  4) region
   Matches against bulb-base-identifier.json decision tree. */

(function () {
  'use strict';

  const QUESTIONS = [
    {
      id: 'baseType',
      question: 'What kind of base does the bulb have?',
      options: [
        { value: 'screw',   label: 'Screw / threaded metal base (E-type)' },
        { value: 'pin',     label: 'Pin base — two separate pins (G-type)' },
        { value: 'bayonet', label: 'Bayonet cap — push in and twist (B-type)' }
      ]
    },
    {
      id: 'pinStyle',
      question: 'What do the pins look like?',
      onlyWhen: { baseType: 'pin' },
      options: [
        { value: 'wire',        label: 'Thin straight wires' },
        { value: 'loop',        label: 'Looped / folded wires (capsule shape)' },
        { value: 'twistlock',   label: 'Mushroom-tip pins — small spacing' },
        { value: 'twistlock24', label: 'Mushroom-tip pins — large spacing' }
      ]
    },
    {
      id: 'diameterClass',
      question: 'Approximately how wide is the base?',
      options: [
        { value: 'small',  label: 'Small — ~12–14 mm (about the width of a pencil eraser)' },
        { value: 'medium', label: 'Medium — ~22–27 mm (about the width of a coin)' },
        { value: 'large',  label: 'Large — ~39–40 mm (commercial / industrial)' }
      ]
    },
    {
      id: 'indoorOutdoor',
      question: 'Where is this bulb used?',
      options: [
        { value: 'indoor', label: 'Indoor or US standard mains (120V)' },
        { value: 'eu',     label: 'European fixtures (240V)' },
        { value: 'both',   label: 'Outdoor / low-voltage landscape or 12V system' }
      ]
    }
  ];

  let data = [];
  let answers = {};
  let currentStep = 0;
  let stepHistory = [];

  async function init() {
    const form = document.getElementById('bulb-identifier-form');
    const resultDiv = document.getElementById('bulb-identifier-result');
    const startBtn = document.getElementById('bulb-identifier-start');
    if (!form || !startBtn) return;

    try {
      const res = await fetch('../data/bulb-base-identifier.json');
      data = await res.json();
    } catch (e) {
      resultDiv.innerHTML = '<p class="notice">Tool unavailable — use the static table below instead.</p>';
      return;
    }

    startBtn.addEventListener('click', () => {
      answers = {};
      currentStep = 0;
      stepHistory = [];
      form.style.display = 'block';
      startBtn.style.display = 'none';
      resultDiv.innerHTML = '';
      renderStep();
    });
  }

  function getActiveQuestions() {
    return QUESTIONS.filter(q => {
      if (!q.onlyWhen) return true;
      const [key, val] = Object.entries(q.onlyWhen)[0];
      return answers[key] === val;
    });
  }

  function renderStep() {
    const form = document.getElementById('bulb-identifier-form');
    const questions = getActiveQuestions();

    if (currentStep >= questions.length) {
      showResult();
      return;
    }

    const q = questions[currentStep];
    let html = `<fieldset><legend>${escHtml(q.question)}</legend>`;
    q.options.forEach(opt => {
      html += `<label><input type="radio" name="q_${escHtml(q.id)}" value="${escHtml(opt.value)}"> ${escHtml(opt.label)}</label><br>`;
    });
    html += `</fieldset>`;
    if (currentStep > 0) {
      html += `<button type="button" id="bulb-id-back">← Back</button> `;
    }
    html += `<button type="button" id="bulb-id-next">Next →</button>`;
    form.innerHTML = html;

    document.getElementById('bulb-id-next').addEventListener('click', () => {
      const sel = form.querySelector(`input[name="q_${q.id}"]:checked`);
      if (!sel) { alert('Please select an option.'); return; }
      answers[q.id] = sel.value;
      stepHistory.push(currentStep);
      currentStep++;
      renderStep();
    });

    const backBtn = document.getElementById('bulb-id-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        currentStep = stepHistory.pop();
        const questions2 = getActiveQuestions();
        delete answers[questions2[currentStep].id];
        renderStep();
      });
    }
  }

  function showResult() {
    const form = document.getElementById('bulb-identifier-form');
    const resultDiv = document.getElementById('bulb-identifier-result');
    form.innerHTML = '';

    const match = data.find(entry => {
      return Object.entries(answers).every(([k, v]) => {
        if (entry[k] === undefined) return true; // field not required for this entry
        return entry[k] === v;
      });
    });

    if (match) {
      resultDiv.innerHTML = `
        <div class="answer-box">
          <strong>Best match: ${escHtml(match.result)}</strong> — ${escHtml(match.description)}<br>
          <p>${escHtml(match.detail)}</p>
          <a href="../bulb-bases/${escHtml(match.url)}">Read the full ${escHtml(match.result)} reference page →</a>
        </div>
        <p><button type="button" id="bulb-id-restart">Start over</button></p>`;
    } else {
      resultDiv.innerHTML = `
        <p class="notice">No exact match found for your selections. Try the <a href="../cheat-sheets/light-bulb-bases-quick-reference.html">cheat sheet</a> or the <a href="../identification-guides/how-to-measure-a-light-bulb-base.html">measurement guide</a>.</p>
        <p><button type="button" id="bulb-id-restart">Start over</button></p>`;
    }

    document.getElementById('bulb-id-restart').addEventListener('click', () => {
      answers = {};
      currentStep = 0;
      stepHistory = [];
      resultDiv.innerHTML = '';
      form.style.display = 'block';
      renderStep();
    });
  }

  function escHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
