/* approval-cards renderer v1. Master copy lives in the approval-cards skill (assets/card.js); the public repo only mirrors it. */
(function () {
  var CSS = '.ac .r{display:grid;grid-template-columns:20px 18px minmax(0,1fr);gap:10px;padding:11px 0;align-items:start}'
    + '.ac .r+.r,.ac .grp{border-top:0.5px solid var(--border)}'
    + '.ac .n{font-size:12px;color:var(--text-muted);padding-top:2px;text-align:center}'
    + '.ac .b{display:inline-block;font-size:11px;padding:2px 8px;border-radius:var(--radius);margin-right:8px;vertical-align:1px}'
    + '.ac .t{font-size:14px;font-weight:500;color:var(--text-primary)}'
    + '.ac .m{font-size:13px;color:var(--text-secondary);line-height:1.5}'
    + '.ac .top{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}'
    + '.ac .acts{display:flex;gap:14px;margin-top:4px;font-size:12px;line-height:1.6;flex-wrap:wrap}'
    + '.ac .lk{cursor:pointer;color:var(--text-accent);user-select:none}.ac .lk.q{color:var(--text-secondary)}.ac .lk:hover{text-decoration:underline}'
    + '.ac .full{margin-top:8px;padding:10px 12px;background:var(--surface-1);border-radius:var(--radius);font-size:13px;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}'
    + '.ac .mono{font-family:var(--font-mono);font-size:12px}'
    + '.ac .said{margin-top:4px;font-size:13px;line-height:1.5;color:var(--text-secondary);font-style:italic}'
    + '.ac .ctx{padding:10px 0;border-top:0.5px solid var(--border)}'
    + '.ac .cl{font-size:12px;color:var(--text-muted);margin:0 0 4px}'
    + '.ac a.tl{color:var(--text-primary);text-decoration:none}.ac a.tl:hover{text-decoration:underline}'
    + '.ac .in{height:26px !important;min-height:0 !important;font-size:12px !important;padding:0 8px !important;flex:none;width:auto !important;min-width:0 !important}'
    + '.ac [hidden]{display:none !important}'
    + '.ac .note{margin-top:6px;width:100% !important;height:30px !important;min-height:0 !important;font-size:13px !important}'
    + '.ac .err{font-size:13px;color:var(--text-danger)}';

  var BADGE = {
    email: ['Email', 'blue'], forward: ['Forward', 'blue'], comment: ['Comment', 'violet'],
    close: ['Close', 'aqua'], time: ['Time', 'aqua'], status: ['Status', null],
    update: ['Update', 'yellow'], task: ['New task', 'orange'], subtask: ['Subtask', 'orange'],
    site: ['Site change', 'green'], ad: ['Ad change', 'green'], d1: ['D1', 'magenta'],
    invoice: ['Invoice', 'yellow'], live: ['Live, check it', 'success'], choice: ['Decide', null]
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
  function badge(type, label) {
    var b = BADGE[type] || [label || type, null];
    var hue = b[1], bg, fg;
    if (hue === 'success') { bg = 'var(--bg-success)'; fg = 'var(--text-success)'; }
    else if (hue) { bg = 'var(--bg-tint-' + hue + ')'; fg = 'var(--text-tint-' + hue + ')'; }
    else { bg = 'var(--bg-neutral, var(--surface-1))'; fg = 'var(--text-secondary)'; }
    return el('span', { 'class': 'b', style: 'background:' + bg + ';color:' + fg, text: label || b[0] });
  }
  function link(l) {
    if (!l) return null;
    var a = el('a', { 'class': 'tl', href: l.url, target: '_blank', rel: 'noopener', text: l.text || l.url });
    return a;
  }
  function toggle(label, body, mono, open) {
    var box = el('div', { 'class': 'full' + (mono ? ' mono' : ''), text: body });
    box.hidden = !open;
    var b = el('span', { role: 'button', tabindex: '0', 'class': 'lk', text: (open ? 'Hide ' : 'Show ') + label });
    act(b, function () { box.hidden = !box.hidden; b.textContent = (box.hidden ? 'Show ' : 'Hide ') + label; });
    return [b, box];
  }
  function act(e, fn) {
    e.addEventListener('click', fn);
    e.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); fn(); } });
  }

  window.renderCard = function (root, cfg) {
    if (!document.getElementById('ac-css')) document.head.appendChild(el('style', { id: 'ac-css', text: CSS }));
    root.className = 'ac';
    root.textContent = '';
    var n = 0, ticks = [], notes = {}, inputs = [];
    var outer = el('div', { style: 'background:var(--surface-1);border-radius:12px;padding:12px' });
    var card = el('div', { style: 'background:var(--surface-2);border:0.5px solid var(--border);border-radius:12px;padding:1rem 1.25rem' });
    outer.appendChild(card); root.appendChild(outer);

    var all = el('input', { type: 'checkbox', style: 'vertical-align:-2px;margin-right:4px', 'aria-label': 'Tick all' });
    var head = el('div', null, [el('p', { style: 'margin:0;font-size:16px;font-weight:500', text: cfg.title || '' })]);
    if (cfg.done) head.appendChild(el('p', { style: 'margin:2px 0 0;font-size:13px;color:var(--text-secondary)' }, [
      el('i', { 'class': 'ti ti-circle-check', style: 'font-size:15px;vertical-align:-2px;margin-right:4px;color:var(--text-success)', 'aria-hidden': 'true' }), cfg.done]));
    if (cfg.sub) head.appendChild(el('p', { 'class': 'm', style: 'margin:2px 0 0', text: cfg.sub }));
    card.appendChild(el('div', { 'class': 'top', style: 'margin-bottom:6px' }, [head,
      el('label', { style: 'font-size:12px;color:var(--text-secondary)' }, [all, 'All'])]));

    (cfg.ctx || []).forEach(function (c) {
      var box = el('div', { 'class': 'ctx' }, [el('p', { 'class': 'cl', text: c.label || '' })]);
      (c.lines || []).forEach(function (l) { box.appendChild(el('div', { 'class': 'm', text: '· ' + l })); });
      if (c.full) { var t = toggle(c.fullLabel || 'full text', c.full, true); box.appendChild(el('div', { 'class': 'acts' }, [t[0]])); box.appendChild(t[1]); }
      card.appendChild(box);
    });
    if (cfg.check) card.appendChild(el('div', { 'class': 'ctx' }, [el('div', {
      style: 'background:var(--bg-warning);color:var(--text-warning);border-radius:var(--radius);padding:8px 12px;font-size:13px;line-height:1.5'
    }, [el('i', { 'class': 'ti ti-alert-triangle', style: 'font-size:15px;vertical-align:-2px;margin-right:6px', 'aria-hidden': 'true' }), cfg.check])]));

    function row(r, parent, first) {
      var live = r.type === 'live' || r.live;
      var wrap = el('div', { 'class': 'r' + (first ? ' grp' : '') });
      var num = '';
      if (live) { wrap.appendChild(el('span')); }
      else {
        n += 1; num = String(n);
        var tk = el('input', { type: 'checkbox', 'aria-label': 'Include ' + num });
        tk.checked = !r.suggested; tk.dataset.n = num; ticks.push(tk); wrap.appendChild(tk);
      }
      wrap.appendChild(el('div', { 'class': 'n', text: num }));
      var body = el('div');
      var line = el('div', null, [badge(r.type, r.badge)]);
      (r.badges || []).forEach(function (t) { line.appendChild(badge(t)); });
      line.appendChild(el('span', { 'class': 't', text: r.title || '' }));
      if (r.suggested) line.appendChild(el('span', { 'class': 'b', style: 'background:var(--surface-1);color:var(--text-secondary);margin-left:8px', text: 'Suggested' }));
      body.appendChild(line);
      if (r.said) body.appendChild(el('div', { 'class': 'said', text: '"' + r.said + '"' }));
      if (r.details || r.link) {
        var d = el('div', { 'class': 'm', style: 'margin-top:3px' });
        if (r.details) d.appendChild(document.createTextNode(r.details));
        if (r.link) { if (r.details) d.appendChild(document.createTextNode(' · ')); d.appendChild(link(r.link)); }
        body.appendChild(d);
      }
      if (r.type === 'close' || r.type === 'time') {
        var tm = el('input', { type: 'text', 'class': 'in', value: r.time || '1m', 'aria-label': 'Duration for ' + num, style: 'width:64px !important' });
        var bl = el('select', { 'class': 'in', 'aria-label': 'Billable for ' + num, style: 'padding:0 22px 0 8px !important' },
          [el('option', { value: 'yes', text: 'Billable' }), el('option', { value: 'no', text: 'Non-billable' })]);
        bl.value = r.billable === 'yes' ? 'yes' : 'no';
        var er = el('div', { 'class': 'err' });
        body.appendChild(el('div', { style: 'display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:4px' },
          [el('span', { 'class': 'm', text: 'Log' }), tm, bl, el('span', { 'class': 'm', text: r.type === 'close' ? 'then mark Complete' : '' })]));
        body.appendChild(er);
        tm.addEventListener('input', function () { er.textContent = ''; });
        inputs.push({ n: num, tm: tm, bl: bl, er: er });
      }
      if (r.open) body.appendChild(el('div', { 'class': 'full', text: r.open }));
      var acts = el('div', { 'class': 'acts' }), boxes = [];
      if (r.original) { var o = toggle('original email', r.original, true); acts.appendChild(o[0]); boxes.push(o[1]); }
      if (r.full) { var f = toggle(r.fullLabel || (r.type === 'email' || r.type === 'forward' ? 'full email' : r.type === 'invoice' ? 'invoice' : 'full description'), r.full, r.type === 'email' || r.type === 'forward' || r.type === 'invoice'); acts.appendChild(f[0]); boxes.push(f[1]); }
      if (!live) {
        var note = el('input', { type: 'text', 'class': 'note', placeholder: 'What to change' });
        note.hidden = true; notes[num] = note;
        var chg = el('span', { role: 'button', tabindex: '0', 'class': 'lk q', text: 'Change' });
        act(chg, function () { note.hidden = !note.hidden; chg.textContent = note.hidden ? 'Change' : 'Cancel change'; if (note.hidden) note.value = ''; else note.focus(); upd(); });
        note.addEventListener('input', upd);
        acts.appendChild(chg);
        boxes.push(note);
      }
      if (acts.childNodes.length) body.appendChild(acts);
      boxes.forEach(function (b) { body.appendChild(b); });
      wrap.appendChild(body);
      parent.appendChild(wrap);
    }

    (cfg.rows || []).forEach(function (r) {
      if (r.group) {
        var g = el('div', { 'class': 'grp', style: 'padding-top:11px' });
        var hp = el('p', { style: 'margin:0 0 2px;font-size:14px;font-weight:500' },
          [el('i', { 'class': 'ti ti-subtask', style: 'font-size:16px;vertical-align:-2px;margin-right:6px;color:var(--text-secondary)', 'aria-hidden': 'true' }),
            r.url ? link({ text: r.group, url: r.url }) : r.group]);
        g.appendChild(hp);
        var inner = el('div', { style: 'padding-left:28px' });
        (r.rows || []).forEach(function (x) { row(x, inner, false); });
        g.appendChild(inner); card.appendChild(g);
      } else row(r, card, true);
    });

    if (cfg.note) card.appendChild(el('p', { 'class': 'm', style: 'margin:8px 0 0', text: cfg.note }));
    var msg = el('span', { style: 'font-size:13px;color:var(--text-danger)' });
    var btns = el('div', { style: 'display:flex;gap:8px;align-items:center;flex-wrap:wrap' });
    var bar = el('div', { 'class': 'top', style: 'border-top:0.5px solid var(--border);padding-top:12px;margin-top:8px' }, [btns, msg]);
    card.appendChild(bar);
    var label = cfg.approve || 'Approve', unit = cfg.unit || 'change';
    var main = el('button', { style: 'background:var(--fill-accent);color:var(--on-accent);border-color:transparent', text: label + ' ↗' });
    btns.appendChild(main);
    (cfg.say || [{ label: 'Request edits', prompt: 'I want to edit ' + (cfg.id || 'these changes') }]).forEach(function (s) {
      var b = el('button', { text: s.label + ' ↗' });
      b.addEventListener('click', function () { send(s.prompt, b); });
      btns.appendChild(b);
    });

    function noted(k) { var i = notes[k]; return i && !i.hidden && i.value.trim(); }
    function upd() {
      var c = ticks.filter(function (t) { return t.checked; }).length;
      all.checked = ticks.length > 0 && c === ticks.length; all.indeterminate = c > 0 && c < ticks.length;
      var a = ticks.filter(function (t) { return t.checked && !noted(t.dataset.n); }).length;
      main.textContent = a ? label + ' ' + a + ' ' + unit + (a > 1 ? 's' : '') + ' ↗' : 'Send changes ↗';
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
    var re = /^\s*(\d+\s*h)?\s*(\d+\s*m)?\s*$/i;
    main.addEventListener('click', function () {
      var on = ticks.filter(function (t) { return t.checked; }).map(function (t) { return t.dataset.n; });
      if (ticks.length && !on.length) { msg.textContent = 'Tick at least one ' + unit + ' first'; return; }
      var chg = on.filter(noted), app = on.filter(function (k) { return chg.indexOf(k) < 0; }), parts = [], bad = false;
      inputs.forEach(function (x) {
        if (app.indexOf(x.n) < 0) return;
        var v = x.tm.value.trim();
        if (!v || !re.test(v) || !/\d/.test(v)) { x.er.textContent = 'Use a duration like 15m, 1h or 1h 30m'; bad = true; return; }
        parts.push('time ' + x.n + ' = ' + v.replace(/\s+/g, ' '));
        parts.push('billable ' + x.n + ' = ' + x.bl.value);
      });
      if (bad) return;
      chg.forEach(function (k) { parts.push('change ' + k + ': ' + noted(k)); });
      var pre = cfg.prefix || 'Approve changes';
      var headTxt = app.length ? pre + ' ' + app.join(', ') : 'Redraft' + (cfg.id ? ' ' + cfg.id : '');
      send([headTxt].concat(parts).join(' · '), main);
    });
    upd();
  };
})();
