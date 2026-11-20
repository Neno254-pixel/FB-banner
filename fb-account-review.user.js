// ==UserScript==
// @name         FB Account Behaviour Review (Research Demo)
// @namespace    https://github.com/Neno254-pixel/FB-banner
// @version      1.0.0
// @description  Local-only demonstration of explainable suspicious-activity scoring using synthetic test records.
// @match        https://facebook.com/*
// @match        https://*.facebook.com/*
// @run-at       document-end
// @noframes
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  // SAFETY: This prototype evaluates synthetic records only. It does not read
  // Facebook profiles, scrape comments, call Facebook endpoints, report users,
  // or ban/unban accounts.

  const ROOT_ID = 'fb-review-research-demo';
  if (window.top !== window.self || document.getElementById(ROOT_ID)) return;

  const samples = [
    {
      id: 'TEST-001',
      label: 'Repeated-message test',
      observations: {
        repeatedMessages: 8,
        messagesInTenMinutes: 12,
        repeatedLinks: 0,
        independentlyVerifiedReports: 0
      }
    },
    {
      id: 'TEST-002',
      label: 'Repeated-link test',
      observations: {
        repeatedMessages: 1,
        messagesInTenMinutes: 4,
        repeatedLinks: 7,
        independentlyVerifiedReports: 0
      }
    },
    {
      id: 'TEST-003',
      label: 'Normal-activity control',
      observations: {
        repeatedMessages: 0,
        messagesInTenMinutes: 3,
        repeatedLinks: 0,
        independentlyVerifiedReports: 0
      }
    },
    {
      id: 'TEST-004',
      label: 'Combined-signal test',
      observations: {
        repeatedMessages: 6,
        messagesInTenMinutes: 15,
        repeatedLinks: 5,
        independentlyVerifiedReports: 1
      }
    }
  ];

  function scoreActivity(observations) {
    let score = 0;
    const reasons = [];
    const add = (points, reason) => {
      score += points;
      reasons.push(reason);
    };

    if (observations.repeatedMessages >= 5) {
      add(30, 'Several repeated messages in the test record (+30)');
    }
    if (observations.messagesInTenMinutes >= 10) {
      add(25, 'High message volume in the test window (+25)');
    }
    if (observations.repeatedLinks >= 5) {
      add(25, 'Several repeated links in the test record (+25)');
    }
    if (observations.independentlyVerifiedReports >= 2) {
      add(20, 'Multiple independently verified reports (+20)');
    }

    score = Math.min(score, 100);
    const level = score >= 60 ? 'High' : score >= 30 ? 'Review' : 'Low';
    return { score, level, reasons };
  }

  const style = document.createElement('style');
  style.textContent = `
    #${ROOT_ID} { position: fixed; z-index: 2147483000; right: 18px; bottom: 18px; font: 14px/1.45 Arial,sans-serif; color: #172033; }
    #${ROOT_ID} * { box-sizing: border-box; }
    #${ROOT_ID} button { cursor: pointer; border: 0; border-radius: 7px; padding: 9px 12px; font-weight: 600; }
    #fb-review-toggle { background: #1877f2; color: white; box-shadow: 0 2px 12px #0003; }
    #fb-review-panel { display: none; width: min(380px, calc(100vw - 32px)); max-height: 75vh; overflow: auto; margin-top: 9px; padding: 16px; border: 1px solid #d8deea; border-radius: 12px; background: #fff; box-shadow: 0 8px 32px #0003; }
    #fb-review-panel h2 { margin: 0 0 7px; font-size: 18px; }
    #fb-review-panel p { margin: 7px 0; }
    #fb-review-panel .muted { color: #596579; font-size: 12px; }
    #fb-review-panel .sample { width: 100%; margin-top: 8px; text-align: left; background: #f0f4fa; color: #172033; }
    #fb-review-panel .result { margin-top: 12px; padding: 12px; border: 1px solid #d8deea; border-radius: 9px; background: #f8fafc; }
    #fb-review-panel .score { font-size: 25px; font-weight: 700; }
    #fb-review-panel .actions { display: flex; gap: 8px; margin-top: 12px; }
    #fb-review-panel .secondary { background: #e8edf5; color: #172033; }
    #fb-review-panel ul { padding-left: 19px; margin: 8px 0; }
  `;
  document.head.appendChild(style);

  const root = document.createElement('section');
  root.id = ROOT_ID;
  root.innerHTML = `
    <button id="fb-review-toggle" type="button" aria-expanded="false">Research review demo</button>
    <div id="fb-review-panel" role="dialog" aria-label="Account behaviour review research demo">
      <h2>Account Behaviour Review</h2>
      <p class="muted">Local research prototype · synthetic records only</p>
      <p>Select a test record to evaluate the explainable scoring rules.</p>
      <div id="fb-review-samples"></div>
      <div id="fb-review-result" class="result" aria-live="polite">No test record selected.</div>
      <div class="actions">
        <button id="fb-review-reset" class="secondary" type="button">Reset</button>
        <button id="fb-review-close" class="secondary" type="button">Close</button>
      </div>
      <p class="muted">A score is a research signal, not proof of wrongdoing. No Facebook account is inspected or actioned.</p>
    </div>
  `;
  // Inline positioning keeps the launcher visible even if Facebook's page CSS changes.
  root.style.cssText = 'position:fixed!important;right:18px!important;bottom:18px!important;z-index:2147483647!important;display:block!important;visibility:visible!important;opacity:1!important;font:14px/1.45 Arial,sans-serif!important;color:#172033!important;';
  const launcher = root.querySelector('#fb-review-toggle');
  launcher.style.cssText = 'display:block!important;visibility:visible!important;opacity:1!important;background:#1877f2!important;color:#fff!important;border:0!important;border-radius:8px!important;padding:12px 16px!important;font-weight:700!important;cursor:pointer!important;box-shadow:0 2px 12px #0005!important;';
  document.body.appendChild(root);

  const panel = root.querySelector('#fb-review-panel');
  const toggle = root.querySelector('#fb-review-toggle');
  const result = root.querySelector('#fb-review-result');
  const sampleContainer = root.querySelector('#fb-review-samples');

  function renderResult(record) {
    const evaluation = scoreActivity(record.observations);
    result.replaceChildren();

    const heading = document.createElement('strong');
    heading.textContent = record.id + ' · ' + record.label;
    const score = document.createElement('div');
    score.className = 'score';
    score.textContent = evaluation.score + '/100 · ' + evaluation.level;
    const explanation = document.createElement('p');
    explanation.textContent = 'Reasons from the synthetic test data:';
    const list = document.createElement('ul');

    if (evaluation.reasons.length) {
      evaluation.reasons.forEach(reason => {
        const item = document.createElement('li');
        item.textContent = reason;
        list.appendChild(item);
      });
    } else {
      const item = document.createElement('li');
      item.textContent = 'No configured risk signals were triggered.';
      list.appendChild(item);
    }

    result.append(heading, score, explanation, list);
  }

  samples.forEach(record => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'sample';
    button.textContent = record.id + ' — ' + record.label;
    button.addEventListener('click', () => renderResult(record));
    sampleContainer.appendChild(button);
  });

  toggle.addEventListener('click', () => {
    const open = panel.style.display !== 'block';
    panel.style.display = open ? 'block' : 'none';
    toggle.setAttribute('aria-expanded', String(open));
  });

  root.querySelector('#fb-review-close').addEventListener('click', () => {
    panel.style.display = 'none';
    toggle.setAttribute('aria-expanded', 'false');
  });

  root.querySelector('#fb-review-reset').addEventListener('click', () => {
    result.textContent = 'No test record selected.';
  });
})();