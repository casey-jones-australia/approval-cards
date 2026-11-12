/* approval-cards renderer v2.5. Master copy lives in the approval-cards skill (assets/card.js); the public repo only mirrors it. */
(function () {
  var CSS = '.ac{font-size:14px;line-height:1.6;color:var(--text-primary)}'
    + '.ac [hidden]{display:none !important}'
    + '.ac .sec{font-size:12px;font-weight:500;color:var(--text-secondary);letter-spacing:.02em;margin:18px 0 2px}'
    + '.ac .ask{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-top:0.5px solid var(--border)}'
    + '.ac .ask:first-child{border-top:none}'
    + '.ac .ask>i{font-size:18px;margin-top:1px;flex:none}'
    + '.ac .grow{flex:1;min-width:0}'
    + '.ac .chip{font-size:12px;padding:2px 10px;border-radius:999px;white-space:nowrap;flex:none}'
    + '.ac .row{display:grid;grid-template-columns:22px 32px minmax(0,1fr);gap:10px;padding:12px 0;border-top:0.5px solid var(--border);align-items:start}'
    + '.ac .row.first{border-top:none}'
    + '.ac .row.has-open{grid-template-columns:22px 32px minmax(0,1fr) auto}'
    + '.ac a.open{display:inline-flex;align-items:center;gap:6px;font-size:13px;padding:4px 10px;border:0.5px solid var(--border-strong);border-radius:var(--radius);color:var(--text-primary);white-space:nowrap;text-decoration:none;align-self:start}'
    + '.ac a.open:hover{background:var(--surface-1);text-decoration:none}'
    + '.ac a.open i{font-size:15px;color:var(--text-secondary)}'
    + '@media (max-width:520px){.ac .row.has-open{grid-template-columns:22px 32px minmax(0,1fr)}.ac .row.has-open a.open{grid-column:3;justify-self:start}}'
    + '.ac .panel{border:0.5px solid var(--border-strong);border-radius:10px;padding:2px 14px 4px;margin-top:14px}'
    + '.ac .ph{display:flex;align-items:center;gap:8px;padding:10px 0 8px;border-bottom:0.5px solid var(--border);font-size:14px;font-weight:500}'
    + '.ac .ph .cnt{font-size:12px;font-weight:400;color:var(--text-secondary)}'
    + '.ac .ic{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:17px}'
    + '.ac .tt{font-weight:500;font-size:14px}'
    + '.ac .dt{font-size:13px;color:var(--text-secondary)}'
    + '.ac .said{font-size:13px;color:var(--text-secondary);font-style:italic;margin-top:4px}'
    + '.ac .pv{margin-top:8px;padding:10px 12px;border-radius:8px;background:var(--surface-1);font-size:13px;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}'
    + '.ac .pv.mono{font-family:var(--font-mono);font-size:12px}'
    + '.ac .lk{font-size:12px;color:var(--text-accent);cursor:pointer;margin-right:14px;user-select:none}'
    + '.ac .lk:hover{text-decoration:underline}'
    + '.ac a{color:var(--text-accent);text-decoration:none}.ac a:hover{text-decoration:underline}'
    + '.ac .pill{font-size:11px;padding:1px 8px;border-radius:999px;margin-left:8px;font-weight:400;vertical-align:1px}'
    + '.ac .sug{font-size:11px;padding:1px 8px;border-radius:999px;background:var(--surface-1);color:var(--text-secondary);margin-left:8px;font-weight:400}';

  var TYPE = {
    email: ['mail', 'blue', 'Email'], forward: ['arrow-forward-up', 'blue', 'ClickUp'],
    task: ['subtask', 'orange', 'ClickUp'], subtask: ['subtask', 'orange', 'ClickUp'], update: ['pencil', 'yellow', 'ClickUp'],
    comment: ['message', 'violet', 'ClickUp'], close: ['circle-check', 'aqua', 'ClickUp'], time: ['clock', 'aqua', 'ClickUp'],
    status: ['flag', 'aqua', 'ClickUp'], site: ['world', 'green', 'Work done'], ad: ['speakerphone', 'green', 'Work done'],
    live: ['world', 'success', 'Work done'], preview: ['eye', 'yellow', 'Work done'], asset: ['photo', 'green', 'Work done'],
    agreement: ['file-certificate', 'green', 'Work done'], campaign: ['send', 'green', 'Work done'],
    discard: ['trash', 'red', 'Email'], archive: ['archive', 'blue', 'Email'], d1: ['database', 'magenta', 'Records'], invoice: ['receipt', 'yellow', 'Billing'],
    choice: ['help-circle', 'violet', 'Decide']
  };
  var ASK = {
    done: ['circle-check', 'success', 'Done'], live: ['circle-check', 'success', 'Done, live'],
    preview: ['eye', 'warning', 'Ready to go live'], team: ['arrow-forward-up', 'accent', 'To the team'], reply: ['mail', 'accent', 'Answered'],
    invoice: ['receipt', 'warning', 'Invoice attached'], decide: ['help-circle', 'warning', 'You decide'],
    later: ['clock', 'warning', 'Tracked'], none: ['minus', 'neutral', 'No action']
  };

  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') e.textContent = attrs[k];
      else if (k === 'style') e.style.cssText = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function tone(t, part) {
    if (t === 'success' || t === 'accent' || t === 'warning') return 'var(--' + (part === 'bg' ? 'bg' : 'text') + '-' + t + ')';
    if (t === 'neutral') return part === 'bg' ? 'var(--surface-1)' : 'var(--text-secondary)';
    return 'var(--' + (part === 'bg' ? 'bg-tint-' : 'text-tint-') + t + ')';
  }
  function icon(name, extra) { return el('i', { 'class': 'ti ti-' + name, 'aria-hidden': 'true', style: extra || '' }); }
  function toggle(label, body, mono) {
    var box = el('div', { 'class': 'pv' + (mono ? ' mono' : ''), text: body });
    box.hidden = true;
    var b = el('span', { role: 'button', tabindex: '0', 'class': 'lk', text: 'Show ' + label });
    function flip() { box.hidden = !box.hidden; b.textContent = (box.hidden ? 'Show ' : 'Hide ') + label; }
    b.addEventListener('click', flip);
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
    return [b, box];
  }

  window.renderCard = function (root, cfg) {
    if (!document.getElementById('ac-css')) document.head.appendChild(el('style', { id: 'ac-css', text: CSS }));
    root.className = 'ac'; root.textContent = '';
    var ticks = [], picks = [], n = 0;
    var outer = el('div', { style: 'background:var(--surface-1);border-radius:12px;padding:12px' });
    var card = el('div', { style: 'background:var(--surface-2);border:0.5px solid var(--border);border-radius:12px;padding:1.1rem 1.25rem' });
    outer.appendChild(card); root.appendChild(outer);

    var all = el('input', { type: 'checkbox', style: 'vertical-align:-2px;margin-right:4px', 'aria-label': 'Tick all' });
    var name = cfg.name || cfg.title || '';
    var headKids = [];
    if (cfg.name) headKids.push(el('div', { style: 'width:40px;height:40px;border-radius:50%;background:var(--bg-accent);color:var(--text-accent);display:flex;align-items:center;justify-content:center;font-weight:500;flex:none', text: (cfg.initial || name.charAt(0) || '?').toUpperCase() }));
    headKids.push(el('div', { 'class': 'grow' }, [
      el('div', { style: 'font-size:16px;font-weight:500', text: name }),
      cfg.sub ? el('div', { 'class': 'dt', text: cfg.sub }) : null]));
    headKids.push(el('label', { 'class': 'dt', style: 'white-space:nowrap' }, [all, 'All']));
    card.appendChild(el('div', { style: 'display:flex;align-items:center;gap:12px' }, headKids));

    if (cfg.asks && cfg.asks.length) {
      card.appendChild(el('div', { 'class': 'sec', text: cfg.asksLabel || 'What they asked' }));
      var box = el('div');
      cfg.asks.forEach(function (a) {
        var s = ASK[a.status] || ASK.reply;
        box.appendChild(el('div', { 'class': 'ask' }, [
          icon(s[0], 'color:' + tone(s[1], 'text')),
          el('div', { 'class': 'grow', text: a.text }),
          el('span', { 'class': 'chip', style: 'background:' + tone(s[1], 'bg') + ';color:' + tone(s[1], 'text'), text: a.chip || s[2] })]));
      });
      card.appendChild(box);
    }

    if (cfg.check) {
      var ch = typeof cfg.check === 'string' ? { text: cfg.check } : cfg.check;
      card.appendChild(el('div', { style: 'margin-top:14px;padding:10px 12px;border-radius:8px;background:var(--bg-warning);display:flex;gap:10px;align-items:flex-start' }, [
        icon('alert-circle', 'font-size:18px;color:var(--text-warning);margin-top:1px'),
        el('div', null, [el('div', { style: 'font-size:13px;font-weight:500;color:var(--text-warning)', text: ch.title || 'Check before approving' }),
          el('div', { style: 'font-size:14px;color:var(--text-primary)', text: ch.text })])]));
    }

    if (cfg.found) {
      var fd = Array.isArray(cfg.found) ? { lines: cfg.found } : cfg.found;
      card.appendChild(el('div', { 'class': 'sec', text: fd.label || 'What I found' }));
      var fb = el('div');
      (fd.lines || []).forEach(function (l) {
        fb.appendChild(el('div', { 'class': 'ask' }, [icon('point', 'color:var(--text-secondary)'), el('div', { 'class': 'grow', text: l })]));
      });
      card.appendChild(fb);
      if (fd.full) { var ft = toggle(fd.fullLabel || 'full findings', fd.full); card.appendChild(ft[1]); card.appendChild(el('div', { style: 'margin-top:6px' }, [ft[0]])); }
    }

    var SECICON = { 'Work done': ['tool', 'green'], Email: ['mail', 'blue'], ClickUp: ['subtask', 'orange'], Billing: ['receipt', 'yellow'], Website: ['world', 'green'], Ads: ['speakerphone', 'green'], Records: ['database', 'magenta'], Decide: ['help-circle', 'violet'] };
    var ORDER = ['Work done', 'Email', 'ClickUp', 'Billing', 'Records', 'Decide'];
    function secOf(r) { return r.section || (TYPE[r.type] || [0, 0, 'Other'])[2]; }
    function rank(s) { var i = ORDER.indexOf(s); return i < 0 ? ORDER.length : i; }
    var rows = (cfg.rows || []).map(function (r, i) { return { r: r, i: i }; })
      .sort(function (a, b) { return rank(secOf(a.r)) - rank(secOf(b.r)) || a.i - b.i; }).map(function (x) { return x.r; });
    var lastSec = null, panel = null, cnt = null, count = 0;
    rows.forEach(function (r) {
      var t = TYPE[r.type] || ['point', 'blue', 'Other'];
      var sec = secOf(r), first = false;
      if (sec !== lastSec) {
        var si = SECICON[sec] || [t[0], t[1]];
        cnt = el('span', { 'class': 'cnt' }); count = 0;
        panel = el('div', { 'class': 'panel' }, [el('div', { 'class': 'ph' }, [icon(si[0], 'font-size:17px;color:' + tone(si[1], 'text')), el('span', { text: sec }), cnt])]);
        card.appendChild(panel); lastSec = sec; first = true;
      }
      count += 1; cnt.textContent = count === 1 ? '' : count + ' items';
      var live = r.type === 'live' || r.live;
      var row = el('div', { 'class': 'row' + (first ? ' first' : '') + (r.open && r.open.url ? ' has-open' : '') });
      if (live) row.appendChild(el('span'));
      else {
        n += 1;
        var tk = el('input', { type: 'checkbox', 'aria-label': 'Include ' + n });
        tk.checked = !r.suggested; tk.dataset.n = String(n); ticks.push(tk); row.appendChild(tk);
      }
      row.appendChild(el('div', { 'class': 'ic', style: 'background:' + tone(t[1], 'bg') + ';color:' + tone(t[1], 'text') }, [icon(r.icon || t[0])]));
      var body = el('div', { style: 'min-width:0' });
      var title = el('div', { 'class': 'tt', text: r.title || '' });
      if (r.suggested) title.appendChild(el('span', { 'class': 'sug', text: 'Suggested' }));
      if (live) title.appendChild(el('span', { 'class': 'pill', style: 'background:var(--bg-success);color:var(--text-success)', text: 'Live' }));
      if (r.type === 'preview') title.appendChild(el('span', { 'class': 'pill', style: 'background:var(--bg-warning);color:var(--text-warning)', text: r.pill || 'Preview, goes live on approval' }));
      body.appendChild(title);
      if (r.details || r.link) {
        var d = el('div', { 'class': 'dt' });
        if (r.link) { d.appendChild(el('a', { href: r.link.url, target: '_blank', rel: 'noopener', text: r.link.text || r.link.url })); if (r.details) d.appendChild(document.createTextNode(' · ')); }
        if (r.details) d.appendChild(document.createTextNode(r.details));
        body.appendChild(d);
      }
      if (r.said) body.appendChild(el('div', { 'class': 'said', text: '"' + r.said + '"' }));
      (r.options || []).forEach(function (o) {
        var sel = el('select', { 'aria-label': o.label, style: 'width:auto !important;min-width:0 !important;height:28px !important;min-height:0 !important;font-size:13px !important;padding:0 24px 0 8px !important' },
          o.choices.map(function (c) { return el('option', { value: c, text: c }); }));
        if (o.value) sel.value = o.value;
        sel.dataset.n = String(n); sel.dataset.k = o.key || o.label.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        picks.push(sel);
        body.appendChild(el('div', { style: 'display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap' }, [el('span', { 'class': 'dt', text: o.label }), sel]));
      });
      if (r.preview) body.appendChild(el('div', { 'class': 'pv', text: r.preview }));
      var links = el('div', { style: 'margin-top:6px' }), boxes = [];
      if (r.rest) { var x = toggle(r.restLabel || 'rest of email', r.rest); links.appendChild(x[0]); boxes.push(x[1]); }
      if (r.full) { var y = toggle(r.fullLabel || (r.type === 'email' || r.type === 'forward' ? 'full email' : r.type === 'invoice' ? 'invoice' : 'task'), r.full, r.type === 'invoice'); links.appendChild(y[0]); boxes.push(y[1]); }
      if (r.original) { var z = toggle(r.originalLabel || 'their email', r.original, true); links.appendChild(z[0]); boxes.push(z[1]); }
      boxes.forEach(function (b) { body.appendChild(b); });
      if (links.childNodes.length) body.appendChild(links);
      row.appendChild(body);
      if (r.open && r.open.url) row.appendChild(el('a', { 'class': 'open', href: r.open.url, target: '_blank', rel: 'noopener' }, [icon(r.open.icon || 'external-link'), r.open.text || 'Open']));
      panel.appendChild(row);
    });

    if (cfg.note) card.appendChild(el('div', { 'class': 'dt', style: 'margin-top:10px', text: cfg.note }));
    var notes = el('textarea', { placeholder: cfg.notesPlaceholder || 'Notes or changes (optional), e.g. make the email shorter', 'aria-label': 'Notes or changes', style: 'width:100%;margin-top:12px;min-height:44px;font-size:13px' });
    card.appendChild(notes);
    var msg = el('span', { style: 'font-size:13px;color:var(--text-danger)' });
    var btns = el('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' });
    card.appendChild(el('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;border-top:0.5px solid var(--border);padding-top:12px;margin-top:10px' }, [btns, msg]));
    var unit = cfg.unit || 'change';
    var go = el('button', { style: 'background:var(--fill-accent);color:var(--on-accent);border-color:transparent', text: 'Approve ↗' });
    btns.appendChild(go);
    (cfg.say || [{ label: 'Decline', prompt: 'Decline ' + (cfg.id || 'this card') }]).forEach(function (s) {
      var b = el('button', { text: s.label + ' ↗' });
      b.addEventListener('click', function () { send(s.prompt + (notes.value.trim() ? ' · notes: ' + notes.value.trim() : ''), b); });
      btns.appendChild(b);
    });

    function upd() {
      var c = ticks.filter(function (t) { return t.checked; }).length;
      all.checked = ticks.length > 0 && c === ticks.length; all.indeterminate = c > 0 && c < ticks.length;
      go.textContent = c ? 'Approve ' + c + ' ' + unit + (c > 1 ? 's' : '') + ' ↗' : 'Approve ↗';
      msg.textContent = '';
    }
    all.addEventListener('change', function () { ticks.forEach(function (t) { t.checked = all.checked; }); upd(); });
    ticks.forEach(function (t) { t.addEventListener('change', upd); });
    function send(text, b) {
      outer.style.opacity = '0.55';
      card.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
      b.textContent = 'Sent';
      if (typeof sendPrompt === 'function') sendPrompt(text);
    }
    go.addEventListener('click', function () {
      var on = ticks.filter(function (t) { return t.checked; }).map(function (t) { return t.dataset.n; });
      var nt = notes.value.trim();
      if (ticks.length && !on.length && !nt) { msg.textContent = 'Tick at least one ' + unit + ' or add a note'; return; }
      var head = on.length ? (cfg.prefix || 'Approve changes') + ' ' + on.join(', ') : 'Redraft' + (cfg.id ? ' ' + cfg.id : '');
      var parts = [head];
      picks.forEach(function (s) { if (on.indexOf(s.dataset.n) >= 0) parts.push(s.dataset.k + ' ' + s.dataset.n + ' = ' + s.value); });
      if (nt) parts.push('notes: ' + nt);
      send(parts.join(' · '), go);
    });
    upd();
  };
})();
