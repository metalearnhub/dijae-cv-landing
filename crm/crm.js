/* Dijae CRM — contacts, custom fields, tags, dashboard. Data: Supabase edge function "crm" (project qbubwemdvwflxvxwesrl).
   Contacts are the same records the newsletter sends to (table nl_subscribers). */
(function () {
'use strict';
var API = 'https://qbubwemdvwflxvxwesrl.supabase.co/functions/v1/crm';
var TOK = ''; try { TOK = localStorage.getItem('crm_token') || ''; } catch (e) {}
var FIELDS = [], STATS = null, PIPES = [], PIPE = null, DEALS = [];
try { PIPE = +localStorage.getItem('crm_pipe') || null; } catch (e) {}
var L = { q: '', status: '', tag: '', sort: 'created_at', page: 0, size: 50, rows: [], total: 0, sel: {} };
var STD = [['email', 'Email'], ['first_name', 'First name'], ['last_name', 'Last name'], ['phone', 'Phone'], ['company', 'Company'], ['tags', 'Tags']];

function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function fmtD(s) { if (!s) return ''; var d = new Date(s); return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }); }
function fmtDT(s) { if (!s) return ''; var d = new Date(s); return d.toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }
function num(n) { return (n || 0).toLocaleString('en-US'); }
var tt; function toast(m) { var t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2600); }

function api(action, body, ep) {
  body = Object.assign({ action: action }, body || {});
  return fetch(ep || API, { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + TOK }, body: JSON.stringify(body) })
    .then(function (r) { return r.json().then(function (d) { return { s: r.status, d: d }; }); })
    .then(function (x) {
      if (x.s === 401 && action !== 'verify') { TOK = ''; try { localStorage.removeItem('crm_token'); } catch (e) {} login(); throw new Error('Signed out'); }
      if (x.s >= 400) throw new Error(x.d && x.d.error || ('Error ' + x.s));
      return x.d;
    });
}

/* ---------------- login ---------------- */
function login(sent) {
  $('#app').innerHTML = '<div class="login"><form id="lf" autocomplete="off"><h1>DIJAE · <span>CRM</span></h1>' +
    (sent ? '<p class="note">We emailed a 6-digit code to ' + esc(sent) + '. It expires in 10 minutes.</p><input class="in code" id="code" inputmode="numeric" maxlength="6" placeholder="••••••" autofocus><div class="err" id="le"></div><button class="btn pri" type="submit">Sign in</button><button class="btn" type="button" id="again">Send a new code</button>'
      : '<p class="note">Private. A sign-in code goes to your Gmail.</p><div class="err" id="le"></div><button class="btn pri" type="submit" id="send">Email me a code</button>') +
    '</form></div>';
  var f = $('#lf');
  if (!sent) {
    f.onsubmit = function (e) { e.preventDefault(); var b = $('#send'); b.disabled = true; b.textContent = 'Sending…';
      api('request_code').then(function (d) { login(d.to); }).catch(function (er) { b.disabled = false; b.textContent = 'Email me a code'; $('#le').textContent = er.message; }); };
  } else {
    $('#again').onclick = function () { login(); };
    f.onsubmit = function (e) { e.preventDefault(); var c = $('#code').value.replace(/\D/g, ''); if (c.length < 6) { $('#le').textContent = 'Enter all 6 digits.'; return; }
      api('verify', { code: c }).then(function (d) { TOK = d.token; try { localStorage.setItem('crm_token', TOK); } catch (e) {} boot(); }).catch(function (er) { $('#le').textContent = er.message; }); };
  }
}

/* ---------------- shell + routing ---------------- */
var NAV = [['dashboard', 'Dashboard', '▦'], ['apps', 'Apps', '◫'], ['contacts', 'Contacts', '☺'], ['fields', 'Fields', '≡'], ['pipelines', 'Pipelines', '▤'], ['sequences', 'Sequences', '↻']];
function shell() {
  $('#app').innerHTML = '<div class="shell"><aside class="side"><div class="brand">DIJAE · <span>CRM</span></div>' +
    NAV.map(function (n) { return '<a class="nav" href="#/' + n[0] + '" data-r="' + n[0] + '"><span aria-hidden="true">' + n[2] + '</span>' + n[1] + (n[0] === 'sequences' ? '<small>next</small>' : '') + '</a>'; }).join('') +
    '<div class="foot">Signed in<br><button id="so">Sign out</button></div></aside><main id="main"></main></div>';
  $('#so').onclick = function () { api('signout').catch(function () {}).then(function () { TOK = ''; try { localStorage.removeItem('crm_token'); } catch (e) {} login(); }); };
}
function route() {
  var r = (location.hash.replace(/^#\/?/, '') || 'dashboard').split('/')[0];
  $$('.nav').forEach(function (a) { a.classList.toggle('on', a.dataset.r === r); });
  var m = $('#main'); if (!m) return;
  if (r === 'contacts') return contacts();
  if (r === 'fields') return fieldsView();
  if (r === 'pipelines') return pipelines();
  if (r === 'apps') return appsView();
  if (r === 'sequences') return soon('Email sequences and flows', ['Steps like email → wait 2 days → email, started by a tag, a form or a pipeline stage', 'Per-step stats: sent, failed, unsubscribed', 'Takes over the welcome series and the weekly digest and story emails']);
  return dashboard();
}
function soon(t, items) {
  $('#main').innerHTML = '<div class="head"><h1>' + esc(t) + '</h1></div><div class="soon"><h2>Coming in the next build</h2><p class="note">This screen is planned and not built yet.</p><ul>' + items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></div>';
}

/* ---------------- dashboard ---------------- */
function dashboard() {
  var m = $('#main');
  m.innerHTML = '<div class="head"><h1>Dashboard</h1><button class="btn" id="rf">Refresh</button></div><div id="dash"><p class="note">Loading…</p></div>';
  $('#rf').onclick = dashboard;
  loadPipes().catch(function () {}).then(function () { return api('stats'); }).then(function (s) {
    STATS = s;
    var daily = s.daily || [], max = Math.max.apply(null, daily.map(function (d) { return d.n; }).concat([1]));
    var total = s.total || 0;
    var src = (s.sources || []), tags = (s.tags || []), bc = (s.broadcasts || []);
    var srcMax = Math.max.apply(null, src.map(function (x) { return x.n; }).concat([1]));
    $('#dash').innerHTML = '<div id="appstrip"></div>' +
      '<div class="kpis">' +
      kpi('Contacts', s.total, num(s.new7) + ' new this week') +
      kpi('Subscribed', s.subscribed, total ? Math.round(s.subscribed / total * 100) + '% of contacts' : '') +
      kpi('Leads', s.leads, 'Not on the newsletter') +
      kpi('Emails sent (30 days)', s.sent30, num(s.failed30) + ' failed · ' + num(s.unsubscribed) + ' unsubscribed total') +
      '</div>' + dealsDash(s.deals) +
      '<div class="dash2"><div class="card"><h2>New contacts, last 30 days</h2><div class="chart">' +
      daily.map(function (d) { return '<div class="b" style="height:' + Math.max(2, Math.round(d.n / max * 100)) + '%" title="' + esc(d.d) + ': ' + d.n + '"></div>'; }).join('') +
      '</div><div class="axis"><span>' + esc(daily[0] ? fmtD(daily[0].d) : '') + '</span><span>' + num(s.new30) + ' in 30 days</span><span>Today</span></div></div>' +
      '<div class="card"><h2>Top sources</h2><div class="rows">' + (src.length ? src.map(function (x) { return '<div class="r" style="display:block"><div style="display:flex;justify-content:space-between"><span>' + esc(x.source) + '</span><b>' + num(x.n) + '</b></div><div class="meter"><i style="width:' + Math.round(x.n / srcMax * 100) + '%"></i></div></div>'; }).join('') : '<p class="note">No contacts yet.</p>') + '</div></div></div>' +
      '<div class="dash2"><div class="card"><h2>Recent newsletter sends</h2>' + (bc.length ? '<div class="rows">' + bc.map(function (b) { return '<div class="r"><span><span class="pill">' + esc(b.kind) + '</span>' + esc(b.subject) + '</span><span><b>' + num(b.sent) + '</b> sent' + (b.failed ? ' · ' + b.failed + ' failed' : '') + ' · ' + esc(b.status) + ' · ' + esc(fmtD(b.sent_at || b.send_at)) + '</span></div>'; }).join('') + '</div>' : '<p class="note">No newsletter sends yet. The Friday digest and Tuesday story emails will show here.</p>') + '</div>' +
      '<div class="card"><h2>Tags</h2>' + (tags.length ? tags.map(function (t) { return '<a class="pill" href="#/contacts" data-tag="' + esc(t.tag) + '">' + esc(t.tag) + ' · ' + num(t.n) + '</a>'; }).join('') : '<p class="note">No tags yet.</p>') + '</div></div>';
    appStrip();
    $$('#dash [data-tag]').forEach(function (a) { a.onclick = function () { L.tag = a.dataset.tag; L.page = 0; }; });
  }).catch(function (e) { $('#dash').innerHTML = '<p class="err">' + esc(e.message) + '</p>'; });
}
function kpi(l, n, s) { return '<div class="card kpi"><div class="l">' + esc(l) + '</div><div class="n">' + num(n) + '</div><div class="s">' + esc(s || '') + '</div></div>'; }

/* ---------------- contacts ---------------- */
function contacts() {
  var m = $('#main');
  m.innerHTML = '<div class="head"><h1>Contacts</h1><button class="btn" id="exp">Export CSV</button><button class="btn" id="imp">Import CSV</button><button class="btn pri" id="add">Add contact</button></div>' +
    '<div class="bar"><input class="in search" id="q" type="search" placeholder="Search name, email, company, phone" value="' + esc(L.q) + '">' +
    '<select class="in" id="fs"><option value="">All statuses</option>' + ['subscribed', 'lead', 'unsubscribed', 'bounced'].map(function (s) { return '<option' + (L.status === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>' +
    '<select class="in" id="ft"><option value="">All tags</option></select>' +
    '<select class="in" id="so2"><option value="created_at">Newest first</option><option value="updated_at">Recently updated</option><option value="first_name">Name A–Z</option><option value="email">Email A–Z</option></select></div>' +
    '<div id="bulk"></div><div id="list"><p class="note">Loading…</p></div>';
  $('#so2').value = L.sort;
  var qt; $('#q').oninput = function (e) { clearTimeout(qt); qt = setTimeout(function () { L.q = e.target.value; L.page = 0; load(); }, 300); };
  $('#fs').onchange = function (e) { L.status = e.target.value; L.page = 0; load(); };
  $('#ft').onchange = function (e) { L.tag = e.target.value; L.page = 0; load(); };
  $('#so2').onchange = function (e) { L.sort = e.target.value; L.page = 0; load(); };
  $('#add').onclick = function () { editContact(null); };
  $('#imp').onclick = importDlg;
  $('#exp').onclick = exportCsv;
  api('tags.list').then(function (d) { var s = $('#ft'); if (!s) return; s.innerHTML = '<option value="">All tags</option>' + (d.tags || []).map(function (t) { return '<option value="' + esc(t.tag) + '"' + (L.tag === t.tag ? ' selected' : '') + '>' + esc(t.tag) + ' (' + t.n + ')</option>'; }).join(''); }).catch(function () {});
  loadFields().then(load);
}
function loadFields() { return api('fields.list').then(function (d) { FIELDS = d.fields || []; }).catch(function () { FIELDS = []; }); }
function load() {
  api('contacts.list', { q: L.q, status: L.status, tag: L.tag, sort: L.sort, page: L.page, size: L.size }).then(function (d) {
    L.rows = d.rows || []; L.total = d.total || 0; L.sel = {}; drawList();
  }).catch(function (e) { $('#list').innerHTML = '<p class="err">' + esc(e.message) + '</p>'; });
}
function drawList() {
  var el = $('#list'); if (!el) return;
  if (!L.rows.length) { el.innerHTML = '<div class="card empty">' + (L.q || L.status || L.tag ? 'No contacts match.' : 'No contacts yet. Add one or import a CSV.') + '</div>'; drawBulk(); return; }
  el.innerHTML = '<div class="tblwrap"><table class="tbl"><thead><tr><th class="cb"><input type="checkbox" id="all" aria-label="Select all"></th><th>Contact</th><th class="hide-m">Company</th><th>Status</th><th class="hide-m">Tags</th><th class="hide-m">Source</th><th class="hide-m">Added</th></tr></thead><tbody>' +
    L.rows.map(function (c) {
      var name = [c.first_name, c.last_name].filter(Boolean).join(' ');
      return '<tr data-id="' + c.id + '"><td class="cb"><input type="checkbox" data-sel="' + c.id + '" aria-label="Select"></td><td class="who"><b>' + esc(name || c.email) + '</b>' + (name ? '<span>' + esc(c.email) + '</span>' : '') + '</td><td class="hide-m">' + esc(c.company || '') + '</td><td><span class="pill st-' + esc(c.status) + '">' + esc(c.status) + '</span></td><td class="hide-m">' + (c.tags || []).slice(0, 4).map(function (t) { return '<span class="pill">' + esc(t) + '</span>'; }).join('') + ((c.tags || []).length > 4 ? '<span class="pill">+' + (c.tags.length - 4) + '</span>' : '') + '</td><td class="hide-m">' + esc(c.source || '') + '</td><td class="hide-m">' + esc(fmtD(c.created_at)) + '</td></tr>';
    }).join('') + '</tbody></table></div>' +
    '<div class="pager"><span>' + num(L.page * L.size + 1) + '–' + num(L.page * L.size + L.rows.length) + ' of ' + num(L.total) + '</span><button class="btn sm" id="pv"' + (L.page ? '' : ' disabled') + '>Previous</button><button class="btn sm" id="nx"' + ((L.page + 1) * L.size < L.total ? '' : ' disabled') + '>Next</button></div>';
  $('#pv').onclick = function () { L.page--; load(); };
  $('#nx').onclick = function () { L.page++; load(); };
  $('#all').onchange = function (e) { L.rows.forEach(function (c) { if (e.target.checked) L.sel[c.id] = 1; else delete L.sel[c.id]; }); $$('[data-sel]').forEach(function (x) { x.checked = e.target.checked; }); drawBulk(); };
  $$('tbody tr').forEach(function (tr) {
    tr.onclick = function (e) {
      var cb = e.target.closest('[data-sel]');
      if (cb) { if (cb.checked) L.sel[cb.dataset.sel] = 1; else delete L.sel[cb.dataset.sel]; drawBulk(); return; }
      if (e.target.closest('.cb')) return;
      openContact(+tr.dataset.id);
    };
  });
  drawBulk();
}
function drawBulk() {
  var ids = Object.keys(L.sel), el = $('#bulk'); if (!el) return;
  if (!ids.length) { el.innerHTML = ''; return; }
  el.innerHTML = '<div class="bulk">' + ids.length + ' selected <input class="in" id="btag" placeholder="tag" style="width:140px"><button class="btn sm" data-op="tag_add">Add tag</button><button class="btn sm" data-op="tag_remove">Remove tag</button><button class="btn sm" data-op="lead">Mark as lead</button><button class="btn sm" data-op="unsubscribe">Unsubscribe</button><button class="btn sm danger" data-op="delete">Delete</button></div>';
  $$('#bulk [data-op]').forEach(function (b) {
    b.onclick = function () {
      var op = b.dataset.op, tag = $('#btag').value.trim();
      if ((op === 'tag_add' || op === 'tag_remove') && !tag) { toast('Type a tag first'); return; }
      if (op === 'delete') { confirmBox('Delete ' + ids.length + ' contact' + (ids.length > 1 ? 's' : '') + '?', 'This removes them and their email history permanently. It cannot be undone. To stop emails but keep the record, use Unsubscribe instead.', 'Delete permanently', function () { api('contacts.delete', { ids: ids }).then(function (d) { toast(d.deleted + ' deleted'); load(); }).catch(function (e) { toast(e.message); }); }); return; }
      api('contacts.bulk', { ids: ids, op: op, tag: tag }).then(function (d) { toast(d.updated + ' updated'); load(); }).catch(function (e) { toast(e.message); });
    };
  });
}

/* contact drawer */
function closeLayer() { $$('.scrim,.drawer,.modal').forEach(function (x) { x.remove(); }); }
function layer(html, cls) {
  closeLayer();
  var s = document.createElement('div'); s.className = 'scrim'; s.onclick = closeLayer; document.body.appendChild(s);
  var d = document.createElement('div'); d.className = cls; d.innerHTML = html; document.body.appendChild(d);
  $$('[data-close]', d).forEach(function (b) { b.onclick = closeLayer; });
  return d;
}
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLayer(); });
function confirmBox(title, msg, okLabel, fn) {
  var d = layer('<div class="dh" style="display:flex;padding:16px 20px;border-bottom:1px solid var(--line)"><h2 style="font-size:17px;margin-right:auto">' + esc(title) + '</h2><button class="x" data-close aria-label="Close">×</button></div><div class="db"><p>' + esc(msg) + '</p></div><div class="df" style="display:flex;gap:8px;justify-content:flex-end;padding:12px 20px;border-top:1px solid var(--line)"><button class="btn" data-close>Cancel</button><button class="btn pri" id="ok" style="background:var(--red);border-color:var(--red)">' + esc(okLabel) + '</button></div>', 'modal');
  $('#ok', d).onclick = function () { closeLayer(); fn(); };
}
function openContact(id) {
  var d = layer('<div class="dh"><h2>Loading…</h2><button class="x" data-close aria-label="Close">×</button></div><div class="db"></div>', 'drawer');
  Promise.all([api('contacts.get', { id: id }), FIELDS.length ? Promise.resolve() : loadFields()]).then(function (r) { drawContact(r[0], 'details'); }).catch(function (e) { $('.db', d).innerHTML = '<p class="err">' + esc(e.message) + '</p>'; });
}
function drawContact(data, tab) {
  var c = data.contact, d = $('.drawer'); if (!d) return;
  var name = [c.first_name, c.last_name].filter(Boolean).join(' ') || c.email;
  d.innerHTML = '<div class="dh"><h2>' + esc(name) + '</h2><span class="pill st-' + esc(c.status) + '">' + esc(c.status) + '</span><button class="x" data-close aria-label="Close">×</button></div>' +
    '<div class="db"><div class="tabs"><button data-t="details" class="' + (tab === 'details' ? 'on' : '') + '">Details</button><button data-t="activity" class="' + (tab === 'activity' ? 'on' : '') + '">Activity</button><button data-t="emails" class="' + (tab === 'emails' ? 'on' : '') + '">Emails (' + data.sends.length + ')</button><button data-t="deals" class="' + (tab === 'deals' ? 'on' : '') + '">Deals</button></div><div id="tb"></div></div>' +
    '<div class="df" id="df"></div>';
  $$('[data-close]', d).forEach(function (b) { b.onclick = closeLayer; });
  $$('.tabs button', d).forEach(function (b) { b.onclick = function () { drawContact(data, b.dataset.t); }; });
  var tb = $('#tb'), df = $('#df');
  if (tab === 'details') { tb.innerHTML = formHTML(c); wireForm(c); df.innerHTML = '<button class="btn danger" id="del" style="margin-right:auto">Delete</button><button class="btn" data-close>Close</button><button class="btn pri" id="sv">Save</button>'; $('[data-close]', df).onclick = closeLayer; $('#sv').onclick = function () { saveContact(c); }; $('#del').onclick = function () { confirmBox('Delete ' + c.email + '?', 'This removes the contact and their email history permanently. It cannot be undone. To stop emails but keep the record, set the status to unsubscribed.', 'Delete permanently', function () { api('contacts.delete', { ids: [c.id] }).then(function () { toast('Deleted'); load(); }).catch(function (e) { toast(e.message); }); }); }; }
  if (tab === 'activity') {
    tb.innerHTML = '<div style="display:flex;gap:8px"><input class="in" id="nt" placeholder="Add a note (call summary, next step…)"><button class="btn pri" id="an">Add</button></div><div class="tl" style="margin-top:8px">' +
      (data.activity.length ? data.activity.map(function (a) { return '<div class="e"><time>' + esc(fmtDT(a.at)) + '</time><div><span class="k">' + esc(a.kind) + '</span> · ' + esc(a.detail || '') + '</div></div>'; }).join('') : '<p class="note">No activity yet.</p>') +
      '<div class="e"><time>' + esc(fmtDT(c.created_at)) + '</time><div><span class="k">Joined</span> · source ' + esc(c.source || '—') + (c.consent_text ? ' · ' + esc(c.consent_text) : '') + '</div></div></div>';
    df.innerHTML = '<button class="btn" data-close>Close</button>'; $('[data-close]', df).onclick = closeLayer;
    $('#an').onclick = function () { var t = $('#nt').value.trim(); if (!t) return; api('contacts.note', { id: c.id, text: t }).then(function () { return api('contacts.get', { id: c.id }); }).then(function (x) { drawContact(x, 'activity'); toast('Note added'); }).catch(function (e) { toast(e.message); }); };
  }
  if (tab === 'deals') {
    tb.innerHTML = '<p class="note">Loading…</p>';
    df.innerHTML = '<button class="btn" data-close>Close</button><button class="btn pri" id="nd">New deal</button>'; $('[data-close]', df).onclick = closeLayer;
    $('#nd').onclick = function () { loadPipes().then(function () { dealDlg({ contact_id: c.id, contact: c, pipeline_id: (PIPES[0] || {}).id }); }); };
    Promise.all([api('deals.list', { contact_id: c.id }), loadPipes()]).then(function (r) {
      var ds = r[0].deals || [];
      tb.innerHTML = ds.length ? '<div class="tl">' + ds.map(function (d) { var p = pipeOf(d.pipeline_id), st = stageOf(p, d.stage); return '<div class="e" data-deal="' + d.id + '" style="cursor:pointer"><time>' + esc(p ? p.name : '') + '</time><div><b>' + esc(d.title) + '</b> · ' + money(d.value, d.currency) + ' <span class="pill ' + kindCls(st && st.kind) + '">' + esc(st ? st.name : d.stage) + '</span></div></div>'; }).join('') + '</div>' : '<p class="note">No deals with this contact yet.</p>';
      $$('[data-deal]', tb).forEach(function (e) { e.onclick = function () { dealDlg(ds.filter(function (x) { return x.id === +e.dataset.deal; })[0]); }; });
    }).catch(function (e) { tb.innerHTML = '<p class="err">' + esc(e.message) + '</p>'; });
  }
  if (tab === 'emails') {
    tb.innerHTML = '<div class="tl">' + (data.sends.length ? data.sends.map(function (s) { return '<div class="e"><time>' + esc(fmtDT(s.created_at)) + '</time><div><span class="pill ' + (s.status === 'sent' ? 'st-subscribed' : 'st-unsubscribed') + '">' + esc(s.status) + '</span> <b>' + esc(s.kind) + '</b> · ' + esc(s.subject || '') + (s.error ? '<div class="note">' + esc(s.error) + '</div>' : '') + '</div></div>'; }).join('') : '<p class="note">No emails sent to this contact yet.</p>') + '</div>';
    df.innerHTML = '<button class="btn" data-close>Close</button>'; $('[data-close]', df).onclick = closeLayer;
  }
}
function fieldInput(f, v) {
  var id = 'cf_' + f.key, val = esc(v || '');
  if (f.type === 'select') return '<select class="in" id="' + id + '"><option value=""></option>' + (f.options || []).map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>';
  if (f.type === 'textarea') return '<textarea class="in" id="' + id + '">' + val + '</textarea>';
  var t = { number: 'number', date: 'date', url: 'url' }[f.type] || 'text';
  return '<input class="in" id="' + id + '" type="' + t + '" value="' + val + '">';
}
function formHTML(c) {
  c = c || { status: 'lead', tags: [], fields: {} };
  return '<div class="grid2"><div><label class="lb" for="f_first">First name</label><input class="in" id="f_first" value="' + esc(c.first_name || '') + '"></div><div><label class="lb" for="f_last">Last name</label><input class="in" id="f_last" value="' + esc(c.last_name || '') + '"></div></div>' +
    '<div><label class="lb" for="f_email">Email</label><input class="in" id="f_email" type="email" value="' + esc(c.email || '') + '"></div>' +
    '<div class="grid2"><div><label class="lb" for="f_phone">Phone</label><input class="in" id="f_phone" value="' + esc(c.phone || '') + '"></div><div><label class="lb" for="f_co">Company</label><input class="in" id="f_co" value="' + esc(c.company || '') + '"></div></div>' +
    '<div class="grid2"><div><label class="lb" for="f_status">Status</label><select class="in" id="f_status">' + ['lead', 'subscribed', 'unsubscribed', 'bounced'].map(function (s) { return '<option' + (c.status === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></div><div><label class="lb" for="f_tags">Tags (comma separated)</label><input class="in" id="f_tags" value="' + esc((c.tags || []).join(', ')) + '"></div></div>' +
    '<label class="check" id="consentRow" hidden><input type="checkbox" id="f_consent"><span>This person opted in to receive my emails. (Required to mark someone as subscribed.)</span></label>' +
    (FIELDS.length ? '<div class="grid2">' + FIELDS.map(function (f) { return '<div' + (f.type === 'textarea' ? ' style="grid-column:1/-1"' : '') + '><label class="lb" for="cf_' + esc(f.key) + '">' + esc(f.label) + '</label>' + fieldInput(f, (c.fields || {})[f.key]) + '</div>'; }).join('') + '</div>' : '<p class="note">Add your own fields (budget, industry, timezone…) under <a href="#/fields" data-close>Fields</a>.</p>') +
    '<div><label class="lb" for="f_notes">Notes</label><textarea class="in" id="f_notes">' + esc(c.notes || '') + '</textarea></div>' +
    '<div class="err" id="fe"></div>';
}
function wireForm(c) {
  var wasSub = c && c.status === 'subscribed';
  var sync = function () { $('#consentRow').hidden = !($('#f_status').value === 'subscribed' && !wasSub); };
  $('#f_status').onchange = sync; sync();
  $$('a[data-close]').forEach(function (a) { a.onclick = closeLayer; });
}
function readForm(c) {
  var fields = {}; FIELDS.forEach(function (f) { var el = $('#cf_' + f.key); if (el && el.value !== '') fields[f.key] = el.value; });
  var keep = (c && c.fields) || {}; Object.keys(keep).forEach(function (k) { if (!FIELDS.some(function (f) { return f.key === k; })) fields[k] = keep[k]; });
  return { id: c && c.id, email: $('#f_email').value, first_name: $('#f_first').value, last_name: $('#f_last').value, phone: $('#f_phone').value, company: $('#f_co').value, status: $('#f_status').value, tags: $('#f_tags').value, notes: $('#f_notes').value, fields: fields, consent: $('#f_consent').checked };
}
function saveContact(c) {
  var body = readForm(c);
  api('contacts.save', { contact: body }).then(function (d) { toast(c ? 'Saved' : 'Contact added'); if (location.hash.indexOf('contacts') >= 0) load(); return api('contacts.get', { id: d.contact.id }); })
    .then(function (x) { if ($('.drawer')) drawContact(x, 'details'); })
    .catch(function (e) { var fe = $('#fe'); if (fe) fe.textContent = e.message; else toast(e.message); });
}
function editContact() {
  var d = layer('<div class="dh"><h2>Add contact</h2><button class="x" data-close aria-label="Close">×</button></div><div class="db"></div><div class="df"><button class="btn" data-close>Cancel</button><button class="btn pri" id="sv">Add contact</button></div>', 'drawer');
  (FIELDS.length ? Promise.resolve() : loadFields()).then(function () {
    $('.db', d).innerHTML = formHTML(null); wireForm(null);
    $$('[data-close]', d).forEach(function (b) { b.onclick = closeLayer; });
    $('#sv').onclick = function () { saveContact(null); };
  });
}

/* CSV */
function parseCSV(text) {
  var rows = [], row = [], f = '', q = false, i = 0, c;
  text = text.replace(/^﻿/, '');
  var sep = (text.split('\n')[0].match(/;/g) || []).length > (text.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
  for (; i < text.length; i++) {
    c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === sep) { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); f = ''; if (row.some(function (x) { return x.trim() !== ''; })) rows.push(row); row = []; }
    else f += c;
  }
  row.push(f); if (row.some(function (x) { return x.trim() !== ''; })) rows.push(row);
  return rows;
}
function guess(h) {
  var k = h.toLowerCase().replace(/[^a-z]/g, '');
  if (/^(email|emailaddress|mail|eemail)$/.test(k)) return 'email';
  if (/^(firstname|first|fname|givenname|name|fullname)$/.test(k)) return 'first_name';
  if (/^(lastname|last|lname|surname|familyname)$/.test(k)) return 'last_name';
  if (/(phone|mobile|cell|contactnumber|whatsapp)/.test(k)) return 'phone';
  if (/(company|business|organization|organisation|brand)/.test(k)) return 'company';
  if (/^(tags|tag|labels|segments?)$/.test(k)) return 'tags';
  var f = FIELDS.filter(function (x) { return x.key.replace(/_/g, '') === k || x.label.toLowerCase().replace(/[^a-z]/g, '') === k; })[0];
  return f ? 'f:' + f.key : '';
}
function importDlg() {
  var d = layer('<div class="dh" style="display:flex;padding:16px 20px;border-bottom:1px solid var(--line)"><h2 style="font-size:17px;margin-right:auto">Import contacts from CSV</h2><button class="x" data-close aria-label="Close">×</button></div><div class="db" id="ib"><p class="note">Pick a CSV file with a header row. You map the columns on the next step. Up to 5,000 rows per import.</p><input type="file" accept=".csv,text/csv" id="file" class="in"></div>', 'modal');
  (FIELDS.length ? Promise.resolve() : loadFields()).then(function () {
    $('#file', d).onchange = function (e) {
      var file = e.target.files[0]; if (!file) return;
      var r = new FileReader(); r.onload = function () { mapStep(parseCSV(String(r.result)), file.name); }; r.readAsText(file);
    };
  });
}
function mapStep(rows, fname) {
  var ib = $('#ib'); if (!ib) return;
  if (rows.length < 2) { ib.innerHTML = '<p class="err">The file has no data rows.</p>'; return; }
  var head = rows[0], data = rows.slice(1, 5001);
  var opts = '<option value="">Ignore</option>' + STD.map(function (s) { return '<option value="' + s[0] + '">' + s[1] + '</option>'; }).join('') + FIELDS.map(function (f) { return '<option value="f:' + esc(f.key) + '">Field: ' + esc(f.label) + '</option>'; }).join('');
  ib.innerHTML = '<p class="note"><b>' + esc(fname) + '</b> · ' + num(data.length) + ' rows' + (rows.length - 1 > 5000 ? ' (only the first 5,000 will be imported; split the file for the rest)' : '') + '</p>' +
    '<div class="map"><div class="h">Column</div><div class="h ex">Example</div><div class="h">Import as</div>' +
    head.map(function (h, i) { return '<div><code>' + esc(h || '(blank)') + '</code></div><div class="ex"><code>' + esc((data[0] || [])[i] || '') + '</code></div><div><select class="in" data-col="' + i + '">' + opts + '</select></div>'; }).join('') + '</div>' +
    '<div class="grid2"><div><label class="lb" for="itags">Add these tags to everyone (optional)</label><input class="in" id="itags" placeholder="e.g. old-list, 2026-import"></div><div><label class="lb" for="isrc">Source label</label><input class="in" id="isrc" value="import"></div></div>' +
    '<label class="check"><input type="checkbox" id="iopt"><span><b>Everyone in this file opted in to my emails.</b> They are added as <i>subscribed</i> and will receive the newsletter. Leave unticked to add them as <i>leads</i> (no emails).</span></label>' +
    '<div class="warn">Existing contacts are updated (name, phone, company, tags, fields) but their status never changes, so people who unsubscribed stay unsubscribed. Imported contacts do not get the welcome email.</div>' +
    '<div class="err" id="ie"></div><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" data-close>Cancel</button><button class="btn pri" id="go">Import ' + num(Math.min(data.length, 5000)) + ' rows</button></div>';
  $$('[data-col]').forEach(function (s) { s.value = guess(head[+s.dataset.col] || ''); });
  $$('[data-close]', ib).forEach(function (b) { b.onclick = closeLayer; });
  $('#go').onclick = function () {
    var map = {}; $$('[data-col]').forEach(function (s) { if (s.value) map[s.dataset.col] = s.value; });
    if (!Object.keys(map).some(function (k) { return map[k] === 'email'; })) { $('#ie').textContent = 'Map one column to Email.'; return; }
    var out = data.map(function (r) { var o = { fields: {} }; Object.keys(map).forEach(function (i) { var t = map[i], v = (r[i] || '').trim(); if (!v) return; if (t.indexOf('f:') === 0) o.fields[t.slice(2)] = v; else if (t === 'first_name' && /\s/.test(v) && !Object.keys(map).some(function (k) { return map[k] === 'last_name'; })) { var p = v.split(/\s+/); o.first_name = p.shift(); o.last_name = p.join(' '); } else o[t] = v; }); return o; });
    var b = $('#go'); b.disabled = true; b.textContent = 'Importing…';
    api('contacts.import', { rows: out, opted_in: $('#iopt').checked, tags: $('#itags').value, source: $('#isrc').value }).then(function (d) {
      closeLayer(); toast(num(d.created) + ' added · ' + num(d.updated) + ' updated · ' + num(d.skipped) + ' skipped'); L.page = 0; load();
    }).catch(function (e) { b.disabled = false; b.textContent = 'Import'; $('#ie').textContent = e.message; });
  };
}
function csvCell(v) { v = v == null ? '' : (Array.isArray(v) ? v.join(', ') : String(v)); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
function exportCsv() {
  toast('Preparing export…');
  Promise.all([api('contacts.export'), loadFields()]).then(function (r) {
    var rows = r[0].rows || [];
    var cols = ['email', 'first_name', 'last_name', 'phone', 'company', 'status', 'tags', 'source', 'created_at', 'consent_at'];
    var fk = FIELDS.map(function (f) { return f.key; });
    var lines = [cols.concat(fk).join(',')].concat(rows.map(function (c) { return cols.map(function (k) { return csvCell(c[k]); }).concat(fk.map(function (k) { return csvCell((c.fields || {})[k]); })).join(','); }));
    var blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'contacts-' + new Date().toISOString().slice(0, 10) + '.csv'; document.body.appendChild(a); a.click(); a.remove();
  }).catch(function (e) { toast(e.message); });
}

/* ---------------- fields ---------------- */
function fieldsView() {
  $('#main').innerHTML = '<div class="head"><h1>Fields</h1><button class="btn pri" id="nf">New field</button></div><p class="note" style="margin-bottom:14px">Custom fields appear on every contact and in CSV import and export. Standard fields (name, email, phone, company, tags, status) are built in.</p><div id="fl"><p class="note">Loading…</p></div>';
  $('#nf').onclick = function () { fieldDlg(null); };
  loadFields().then(function () {
    $('#fl').innerHTML = FIELDS.length ? '<div class="tblwrap"><table class="tbl"><thead><tr><th>Label</th><th>Key</th><th>Type</th><th class="hide-m">Options</th><th></th></tr></thead><tbody>' +
      FIELDS.map(function (f) { return '<tr data-k="' + esc(f.key) + '"><td><b>' + esc(f.label) + '</b></td><td><code>' + esc(f.key) + '</code></td><td>' + esc(f.type) + '</td><td class="hide-m">' + esc((f.options || []).join(', ')) + '</td><td style="text-align:right"><button class="btn sm danger" data-del="' + esc(f.key) + '">Delete</button></td></tr>'; }).join('') + '</tbody></table></div>'
      : '<div class="card empty">No custom fields yet. Examples: Industry (dropdown), Monthly budget (number), Timezone (text), Website (link).</div>';
    $$('#fl tbody tr').forEach(function (tr) { tr.onclick = function (e) { var del = e.target.closest('[data-del]'); var f = FIELDS.filter(function (x) { return x.key === tr.dataset.k; })[0]; if (del) { confirmBox('Delete the field "' + f.label + '"?', 'The field disappears from forms and exports. Values already saved on contacts stay in the database.', 'Delete field', function () { api('fields.delete', { key: f.key }).then(fieldsView); }); return; } fieldDlg(f); }; });
  });
}
function fieldDlg(f) {
  var d = layer('<div class="dh" style="display:flex;padding:16px 20px;border-bottom:1px solid var(--line)"><h2 style="font-size:17px;margin-right:auto">' + (f ? 'Edit field' : 'New field') + '</h2><button class="x" data-close aria-label="Close">×</button></div><div class="db">' +
    '<div><label class="lb" for="fl_l">Label</label><input class="in" id="fl_l" value="' + esc(f ? f.label : '') + '" placeholder="e.g. Industry"></div>' +
    '<div class="grid2"><div><label class="lb" for="fl_k">Key</label><input class="in" id="fl_k" value="' + esc(f ? f.key : '') + '"' + (f ? ' disabled' : '') + ' placeholder="industry"></div><div><label class="lb" for="fl_t">Type</label><select class="in" id="fl_t">' + [['text', 'Text'], ['number', 'Number'], ['date', 'Date'], ['select', 'Dropdown'], ['url', 'Link'], ['textarea', 'Long text']].map(function (t) { return '<option value="' + t[0] + '"' + (f && f.type === t[0] ? ' selected' : '') + '>' + t[1] + '</option>'; }).join('') + '</select></div></div>' +
    '<div id="fl_ow"><label class="lb" for="fl_o">Dropdown options (comma separated)</label><input class="in" id="fl_o" value="' + esc(f ? (f.options || []).join(', ') : '') + '"></div>' +
    '<div class="err" id="fle"></div><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" data-close>Cancel</button><button class="btn pri" id="fls">Save field</button></div></div>', 'modal');
  var syncO = function () { $('#fl_ow').hidden = $('#fl_t').value !== 'select'; }; $('#fl_t').onchange = syncO; syncO();
  if (!f) $('#fl_l').oninput = function (e) { $('#fl_k').value = e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').replace(/^[^a-z]+/, '').slice(0, 40); };
  $('#fls').onclick = function () {
    api('fields.save', { field: { key: $('#fl_k').value, label: $('#fl_l').value, type: $('#fl_t').value, options: $('#fl_o').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean), position: f ? f.position : FIELDS.length } })
      .then(function () { closeLayer(); toast('Field saved'); fieldsView(); }).catch(function (e) { $('#fle').textContent = e.message; });
  };
}

/* ---------------- pipelines & deals ---------------- */
function money(v, cur) { v = Number(v) || 0; var c = cur || 'PHP'; try { return v.toLocaleString('en-PH', { style: 'currency', currency: c, maximumFractionDigits: 0 }); } catch (e) { return c + ' ' + num(Math.round(v)); } }
function kindCls(k) { return k === 'won' ? 'st-subscribed' : k === 'lost' ? 'st-unsubscribed' : 'st-lead'; }
function pipeOf(id) { return PIPES.filter(function (p) { return p.id === id; })[0]; }
function stageOf(p, id) { return p ? (p.stages || []).filter(function (s) { return s.id === id; })[0] : null; }
function loadPipes() { return api('pipelines.list').then(function (d) { PIPES = d.pipelines || []; if (!pipeOf(PIPE) && PIPES[0]) PIPE = PIPES[0].id; }); }
function today() { var d = new Date(Date.now() + 8 * 3600e3); return d.toISOString().slice(0, 10); }
function dealsDash(d) {
  if (!d) return '';
  var by = d.by_stage || [], max = Math.max.apply(null, by.map(function (x) { return +x.value || 0; }).concat([1]));
  return '<div class="kpis">' + kpi('Open deals', d.open, money(d.open_value) + ' in the pipeline') + kpi('Won (30 days)', d.won30, money(d.won30_value)) + kpi('Lost (30 days)', d.lost30, d.won30 + d.lost30 ? Math.round(d.won30 / (d.won30 + d.lost30) * 100) + '% win rate' : 'No closed deals yet') + kpi('Follow-ups due', d.due, 'Next step date is today or earlier') + '</div>' +
    (by.length ? '<div class="card" style="margin-bottom:12px"><h2>Open pipeline by stage</h2><div class="rows">' + by.map(function (x) { return '<div class="r" style="display:block"><div style="display:flex;justify-content:space-between;gap:10px"><span>' + (PIPES.length > 1 || by.some(function (y) { return y.pipeline !== by[0].pipeline; }) ? esc(x.pipeline) + ' · ' : '') + esc(x.stage) + '</span><span><b>' + num(x.n) + '</b> · ' + money(x.value) + '</span></div><div class="meter"><i style="width:' + Math.round((+x.value || 0) / max * 100) + '%"></i></div></div>'; }).join('') + '</div></div>' : '');
}
function pipelines() {
  var m = $('#main');
  m.innerHTML = '<div class="head"><h1>Pipelines</h1><select class="in" id="pp" style="width:auto"></select><button class="btn" id="pe">Edit stages</button><button class="btn" id="pn">New pipeline</button><button class="btn pri" id="dn">New deal</button></div><div id="board"><p class="note">Loading…</p></div>';
  loadPipes().then(function () {
    var sel = $('#pp');
    sel.innerHTML = PIPES.map(function (p) { return '<option value="' + p.id + '"' + (p.id === PIPE ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('');
    sel.onchange = function () { PIPE = +sel.value; try { localStorage.setItem('crm_pipe', PIPE); } catch (e) {} loadBoard(); };
    $('#pe').onclick = function () { pipeDlg(pipeOf(PIPE)); };
    $('#pn').onclick = function () { pipeDlg(null); };
    $('#dn').onclick = function () { dealDlg({ pipeline_id: PIPE }); };
    loadBoard();
  }).catch(function (e) { $('#board').innerHTML = '<p class="err">' + esc(e.message) + '</p>'; });
}
function loadBoard() {
  if (!PIPE) { $('#board').innerHTML = '<div class="card empty">No pipeline yet. Click New pipeline.</div>'; return; }
  api('deals.list', { pipeline_id: PIPE }).then(function (d) { DEALS = d.deals || []; drawBoard(); }).catch(function (e) { $('#board').innerHTML = '<p class="err">' + esc(e.message) + '</p>'; });
}
function drawBoard() {
  var p = pipeOf(PIPE), el = $('#board'); if (!p || !el) return;
  var t = today();
  el.innerHTML = '<div class="board">' + p.stages.map(function (st) {
    var ds = DEALS.filter(function (d) { return d.stage === st.id; }).sort(function (a, b) { return a.position - b.position; });
    var sums = {}; ds.forEach(function (d) { var c = d.currency || 'PHP'; sums[c] = (sums[c] || 0) + (+d.value || 0); });
    var sumTxt = Object.keys(sums).length ? Object.keys(sums).map(function (c) { return money(sums[c], c); }).join(' + ') : money(0);
    return '<section class="col k-' + st.kind + '" data-stage="' + esc(st.id) + '"><header><b>' + esc(st.name) + '</b><span>' + ds.length + ' · ' + sumTxt + '</span></header><div class="cards">' +
      ds.map(function (d) {
        var who = d.contact ? ([d.contact.first_name, d.contact.last_name].filter(Boolean).join(' ') || d.contact.email) : '';
        var due = d.status === 'open' && d.next_date && d.next_date <= t;
        return '<article class="deal" draggable="true" data-id="' + d.id + '"><b>' + esc(d.title) + '</b>' + (who ? '<span class="who2">' + esc(who) + (d.contact && d.contact.company ? ' · ' + esc(d.contact.company) : '') + '</span>' : '') +
          '<div class="dm"><span>' + money(d.value, d.currency) + '</span>' + (d.next_date ? '<span class="' + (due ? 'due' : '') + '">' + (due ? '⚑ ' : '') + esc(fmtD(d.next_date)) + '</span>' : '') + '</div>' + (d.next_step ? '<span class="ns">' + esc(d.next_step) + '</span>' : '') + '</article>';
      }).join('') + '</div><button class="addd" data-add="' + esc(st.id) + '">+ Add deal</button></section>';
  }).join('') + '</div>';
  $$('.deal', el).forEach(function (c) {
    c.onclick = function () { dealDlg(DEALS.filter(function (d) { return d.id === +c.dataset.id; })[0]); };
    c.ondragstart = function (e) { e.dataTransfer.setData('text/plain', c.dataset.id); c.classList.add('drag'); };
    c.ondragend = function () { c.classList.remove('drag'); };
  });
  $$('.col', el).forEach(function (col) {
    col.ondragover = function (e) { e.preventDefault(); col.classList.add('over'); };
    col.ondragleave = function () { col.classList.remove('over'); };
    col.ondrop = function (e) {
      e.preventDefault(); col.classList.remove('over');
      var id = +e.dataTransfer.getData('text/plain'), d = DEALS.filter(function (x) { return x.id === id; })[0]; if (!d) return;
      var stage = col.dataset.stage, cards = $$('.deal', col).filter(function (c) { return +c.dataset.id !== id; });
      var after = null; cards.forEach(function (c) { var r = c.getBoundingClientRect(); if (e.clientY > r.top + r.height / 2) after = c; });
      var list = DEALS.filter(function (x) { return x.stage === stage && x.id !== id; }).sort(function (a, b) { return a.position - b.position; });
      var idx = after ? list.findIndex(function (x) { return x.id === +after.dataset.id; }) + 1 : 0;
      var prev = list[idx - 1], next = list[idx];
      var pos = prev && next ? (prev.position + next.position) / 2 : prev ? prev.position + 1 : next ? next.position - 1 : Date.now() / 1000;
      var st = stageOf(pipeOf(PIPE), stage);
      d.stage = stage; d.position = pos; d.status = st ? st.kind : d.status; drawBoard();
      api('deals.move', { id: id, stage: stage, position: pos }).then(function () { toast('Moved to ' + (st ? st.name : stage)); }).catch(function (er) { toast(er.message); loadBoard(); });
    };
  });
  $$('[data-add]', el).forEach(function (b) { b.onclick = function () { dealDlg({ pipeline_id: PIPE, stage: b.dataset.add }); }; });
}
function dealDlg(d) {
  d = d || {};
  var p = pipeOf(d.pipeline_id) || pipeOf(PIPE) || PIPES[0];
  if (!p) { toast('Create a pipeline first'); return; }
  var who = d.contact ? ([d.contact.first_name, d.contact.last_name].filter(Boolean).join(' ') || d.contact.email) : '';
  var dl = layer('<div class="dh"><h2>' + (d.id ? esc(d.title) : 'New deal') + '</h2><button class="x" data-close aria-label="Close">×</button></div><div class="db">' +
    '<div><label class="lb" for="d_t">Deal title</label><input class="in" id="d_t" value="' + esc(d.title || '') + '" placeholder="e.g. Chatbot build for a clinic"></div>' +
    '<div class="grid2"><div><label class="lb" for="d_v">Value</label><input class="in" id="d_v" type="number" min="0" step="1" value="' + esc(d.value || '') + '"></div><div><label class="lb" for="d_c">Currency</label><select class="in" id="d_c">' + ['PHP', 'USD', 'CAD', 'AUD', 'SGD', 'EUR', 'GBP'].map(function (c) { return '<option' + ((d.currency || 'PHP') === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></div></div>' +
    '<div class="grid2"><div><label class="lb" for="d_p">Pipeline</label><select class="in" id="d_p">' + PIPES.map(function (x) { return '<option value="' + x.id + '"' + (x.id === p.id ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('') + '</select></div><div><label class="lb" for="d_s">Stage</label><select class="in" id="d_s"></select></div></div>' +
    '<div><label class="lb" for="d_q">Contact</label><div class="picked" id="d_who"' + (d.contact_id ? '' : ' hidden') + '><span id="d_whot">' + esc(who) + '</span><button class="btn sm" id="d_clr" type="button">Change</button></div><div id="d_pick"' + (d.contact_id ? ' hidden' : '') + '><input class="in" id="d_q" placeholder="Search a contact by name, email or company"><div class="picklist" id="d_res"></div></div></div>' +
    '<div class="grid2"><div><label class="lb" for="d_nd">Next follow-up</label><input class="in" id="d_nd" type="date" value="' + esc(d.next_date || '') + '"></div><div><label class="lb" for="d_ns">Next step</label><input class="in" id="d_ns" value="' + esc(d.next_step || '') + '" placeholder="e.g. Send proposal"></div></div>' +
    '<div><label class="lb" for="d_n">Notes</label><textarea class="in" id="d_n">' + esc(d.notes || '') + '</textarea></div><div class="err" id="d_e"></div></div>' +
    '<div class="df">' + (d.id ? '<button class="btn danger" id="d_del" style="margin-right:auto">Delete</button>' : '') + '<button class="btn" data-close>Cancel</button><button class="btn pri" id="d_sv">' + (d.id ? 'Save' : 'Add deal') + '</button></div>', 'drawer');
  var contactId = d.contact_id || null;
  var fillStages = function () { var pp = pipeOf(+$('#d_p').value); $('#d_s').innerHTML = pp.stages.map(function (s) { return '<option value="' + esc(s.id) + '"' + (s.id === d.stage ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join(''); };
  $('#d_p').onchange = fillStages; fillStages();
  var qt; $('#d_q').oninput = function (e) { clearTimeout(qt); qt = setTimeout(function () { api('contacts.pick', { q: e.target.value }).then(function (r) { $('#d_res').innerHTML = r.rows.map(function (c) { return '<button type="button" data-c="' + c.id + '" data-n="' + esc([c.first_name, c.last_name].filter(Boolean).join(' ') || c.email) + '"><b>' + esc([c.first_name, c.last_name].filter(Boolean).join(' ') || c.email) + '</b> <span>' + esc(c.email) + (c.company ? ' · ' + esc(c.company) : '') + '</span></button>'; }).join('') || '<p class="note">No match. Add the contact first under Contacts.</p>'; $$('#d_res [data-c]').forEach(function (b) { b.onclick = function () { contactId = +b.dataset.c; $('#d_whot').textContent = b.dataset.n; $('#d_who').hidden = false; $('#d_pick').hidden = true; }; }); }); }, 250); };
  $('#d_clr').onclick = function () { contactId = null; $('#d_who').hidden = true; $('#d_pick').hidden = false; $('#d_q').focus(); };
  $$('[data-close]', dl).forEach(function (b) { b.onclick = closeLayer; });
  $('#d_sv').onclick = function () {
    var body = { id: d.id, title: $('#d_t').value, value: $('#d_v').value, currency: $('#d_c').value, pipeline_id: +$('#d_p').value, stage: $('#d_s').value, contact_id: contactId, next_date: $('#d_nd').value, next_step: $('#d_ns').value, notes: $('#d_n').value };
    api('deals.save', { deal: body }).then(function () { closeLayer(); toast(d.id ? 'Deal saved' : 'Deal added'); if (location.hash.indexOf('pipelines') >= 0) { PIPE = body.pipeline_id; pipelines(); } }).catch(function (e) { $('#d_e').textContent = e.message; });
  };
  if (d.id) $('#d_del').onclick = function () { confirmBox('Delete the deal "' + d.title + '"?', 'This removes the deal permanently. It cannot be undone. To keep a record, move it to Lost instead.', 'Delete deal', function () { api('deals.delete', { id: d.id }).then(function () { toast('Deal deleted'); if (location.hash.indexOf('pipelines') >= 0) loadBoard(); }).catch(function (e) { toast(e.message); }); }); };
}
function pipeDlg(p) {
  var stages = p ? p.stages.map(function (s) { return Object.assign({}, s); }) : [{ id: 'lead', name: 'New lead', kind: 'open' }, { id: 'won', name: 'Won', kind: 'won' }, { id: 'lost', name: 'Lost', kind: 'lost' }];
  var dl = layer('<div class="dh" style="display:flex;padding:16px 20px;border-bottom:1px solid var(--line)"><h2 style="font-size:17px;margin-right:auto">' + (p ? 'Edit pipeline' : 'New pipeline') + '</h2><button class="x" data-close aria-label="Close">×</button></div><div class="db"><div><label class="lb" for="p_n">Pipeline name</label><input class="in" id="p_n" value="' + esc(p ? p.name : '') + '" placeholder="e.g. Done-for-you builds"></div><div><label class="lb">Stages, in order</label><div id="p_st"></div><button class="btn sm" id="p_add" type="button" style="margin-top:8px">+ Add stage</button></div><p class="note">Won and Lost stages close the deal and count toward win rate. You can only remove a stage once it has no deals.</p><div class="err" id="p_e"></div><div style="display:flex;gap:8px;justify-content:flex-end">' + (p ? '<button class="btn danger" id="p_del" style="margin-right:auto">Delete pipeline</button>' : '') + '<button class="btn" data-close>Cancel</button><button class="btn pri" id="p_sv">Save</button></div></div>', 'modal');
  var draw = function () {
    $('#p_st').innerHTML = stages.map(function (s, i) { return '<div class="strow"><input class="in" data-i="' + i + '" value="' + esc(s.name) + '"><select class="in" data-k="' + i + '" style="width:110px"><option value="open"' + (s.kind === 'open' ? ' selected' : '') + '>Open</option><option value="won"' + (s.kind === 'won' ? ' selected' : '') + '>Won</option><option value="lost"' + (s.kind === 'lost' ? ' selected' : '') + '>Lost</option></select><button class="btn sm" data-up="' + i + '" type="button" aria-label="Move up">↑</button><button class="btn sm danger" data-rm="' + i + '" type="button" aria-label="Remove">×</button></div>'; }).join('');
    $$('#p_st [data-i]').forEach(function (x) { x.oninput = function () { stages[+x.dataset.i].name = x.value; }; });
    $$('#p_st [data-k]').forEach(function (x) { x.onchange = function () { stages[+x.dataset.k].kind = x.value; }; });
    $$('#p_st [data-up]').forEach(function (x) { x.onclick = function () { var i = +x.dataset.up; if (i > 0) { var t = stages[i - 1]; stages[i - 1] = stages[i]; stages[i] = t; draw(); } }; });
    $$('#p_st [data-rm]').forEach(function (x) { x.onclick = function () { stages.splice(+x.dataset.rm, 1); draw(); }; });
  };
  draw();
  $('#p_add').onclick = function () { var won = stages.findIndex(function (s) { return s.kind !== 'open'; }); var ns = { id: '', name: 'New stage', kind: 'open' }; if (won < 0) stages.push(ns); else stages.splice(won, 0, ns); draw(); };
  $$('[data-close]', dl).forEach(function (b) { b.onclick = closeLayer; });
  $('#p_sv').onclick = function () { api('pipelines.save', { pipeline: { id: p && p.id, name: $('#p_n').value, stages: stages, position: p ? p.position : PIPES.length } }).then(function (r) { PIPE = r.id; try { localStorage.setItem('crm_pipe', PIPE); } catch (e) {} closeLayer(); toast('Pipeline saved'); pipelines(); }).catch(function (e) { $('#p_e').textContent = e.message; }); };
  if (p) $('#p_del').onclick = function () { api('pipelines.delete', { id: p.id }).then(function () { PIPE = null; closeLayer(); toast('Pipeline deleted'); pipelines(); }).catch(function (e) { $('#p_e').textContent = e.message; }); };
}

/* ---------------- apps gallery ---------------- */
var APPS_API = 'https://qbubwemdvwflxvxwesrl.supabase.co/functions/v1/crm-apps';
var APPS = [], ASTATS = {}, AF = { q: '', status: '', platform: '' };
var STATUS_TXT = { live: 'Live', private: 'Private', 'in progress': 'In progress', paused: 'Paused', archived: 'Archived', lost: 'Lost', unchecked: 'To check' };
function loadApps() { return api('apps.list', {}, APPS_API).then(function (d) { APPS = d.apps || []; ASTATS = d.stats || {}; }); }
function initials(n) { return String(n || '?').replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); }
function hue(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return h; }
function thumbHTML(a) {
  if (a.thumb) return '<img src="' + esc(a.thumb) + '" alt="" loading="lazy">';
  return '<div class="mono" style="--h:' + hue(a.slug) + '"><span>' + esc(initials(a.name)) + '</span><small>' + esc(a.platform || '') + '</small></div>';
}
function spark(arr) {
  arr = arr || []; var max = Math.max.apply(null, arr.concat([1]));
  return '<span class="spark">' + arr.map(function (n) { return '<i style="height:' + Math.max(8, Math.round(n / max * 100)) + '%"' + (n ? '' : ' class="z"') + '></i>'; }).join('') + '</span>';
}
function appCard(a) {
  var st = ASTATS[a.slug] || {};
  return '<article class="app" data-app="' + esc(a.slug) + '"><div class="thumb">' + thumbHTML(a) + '<span class="pill st-app st-' + esc(a.status.replace(' ', '-')) + '">' + esc(STATUS_TXT[a.status] || a.status) + '</span></div>' +
    '<div class="ab"><b>' + esc(a.name) + '</b><span class="as">' + esc(a.summary || '') + '</span>' +
    '<div class="am">' + (a.tracked ? '<span><b>' + num(st.d7) + '</b> visits · 7d</span>' + spark(st.daily) : '<span class="note">' + esc(a.platform || '') + '</span>') + '</div></div></article>';
}
function appStrip() {
  var el = $('#appstrip'); if (!el) return;
  loadApps().then(function () {
    var top = APPS.filter(function (a) { return ['live', 'private'].indexOf(a.status) >= 0 && a.url; }).sort(function (a, b) { return ((ASTATS[b.slug] || {}).d7 || 0) - ((ASTATS[a.slug] || {}).d7 || 0) || a.position - b.position; }).slice(0, 6);
    var tracked = APPS.filter(function (a) { return a.tracked; }), v7 = tracked.reduce(function (t, a) { return t + ((ASTATS[a.slug] || {}).d7 || 0); }, 0), today = tracked.reduce(function (t, a) { return t + ((ASTATS[a.slug] || {}).today || 0); }, 0);
    el.innerHTML = '<div class="card" style="margin-bottom:12px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><h2 style="margin:0">Your apps</h2><span class="note">' + APPS.length + ' apps · ' + num(today) + ' visits today · ' + num(v7) + ' in 7 days</span><a href="#/apps" class="btn sm" style="margin-left:auto;text-decoration:none">See all</a></div><div class="apps mini">' + top.map(appCard).join('') + '</div></div>';
    $$('#appstrip [data-app]').forEach(function (c) { c.onclick = function () { appDrawer(c.dataset.app); }; });
  }).catch(function () { el.innerHTML = ''; });
}
function appsView() {
  var m = $('#main');
  m.innerHTML = '<div class="head"><h1>Apps</h1><button class="btn pri" id="na">Add app</button></div>' +
    '<div class="bar"><input class="in search" id="aq" type="search" placeholder="Search apps" value="' + esc(AF.q) + '">' +
    '<select class="in" id="as"><option value="">All statuses</option>' + Object.keys(STATUS_TXT).map(function (k) { return '<option value="' + k + '"' + (AF.status === k ? ' selected' : '') + '>' + STATUS_TXT[k] + '</option>'; }).join('') + '</select>' +
    '<select class="in" id="ap"><option value="">All platforms</option></select></div><div id="akpi"></div><div id="agrid"><p class="note">Loading…</p></div>';
  $('#na').onclick = function () { appEdit(null); };
  $('#aq').oninput = function (e) { AF.q = e.target.value; drawApps(); };
  $('#as').onchange = function (e) { AF.status = e.target.value; drawApps(); };
  $('#ap').onchange = function (e) { AF.platform = e.target.value; drawApps(); };
  loadApps().then(function () {
    var plats = {}; APPS.forEach(function (a) { (a.platform || '').split(/\s*\+\s*/).forEach(function (p) { if (p) plats[p] = 1; }); });
    $('#ap').innerHTML = '<option value="">All platforms</option>' + Object.keys(plats).sort().map(function (p) { return '<option' + (AF.platform === p ? ' selected' : '') + '>' + esc(p) + '</option>'; }).join('');
    drawApps();
  }).catch(function (e) { $('#agrid').innerHTML = '<p class="err">' + esc(e.message) + '</p>'; });
}
function drawApps() {
  var q = AF.q.toLowerCase();
  var list = APPS.filter(function (a) {
    if (AF.status && a.status !== AF.status) return false;
    if (AF.platform && (a.platform || '').indexOf(AF.platform) < 0) return false;
    return !q || (a.name + ' ' + (a.summary || '') + ' ' + (a.functions || []).join(' ') + ' ' + a.platform + ' ' + a.category).toLowerCase().indexOf(q) >= 0;
  });
  var tracked = APPS.filter(function (a) { return a.tracked; });
  var sum = function (k) { return tracked.reduce(function (t, a) { return t + ((ASTATS[a.slug] || {})[k] || 0); }, 0); };
  $('#akpi').innerHTML = '<div class="kpis">' + kpi('Apps', APPS.length, APPS.filter(function (a) { return a.status === 'live' || a.status === 'private'; }).length + ' live or private') + kpi('Visits today', sum('today'), tracked.length + ' apps tracked') + kpi('Visits, 7 days', sum('d7'), num(sum('u7')) + ' unique visitor-days') + kpi('Visits, 30 days', sum('d30'), 'Bots are skipped; your own visits count') + '</div>';
  var groups = [['Live and private', ['live', 'private']], ['In progress', ['in progress', 'unchecked']], ['Paused, archived or lost', ['paused', 'archived', 'lost']]];
  $('#agrid').innerHTML = list.length ? groups.map(function (g) {
    var xs = list.filter(function (a) { return g[1].indexOf(a.status) >= 0; });
    return xs.length ? '<h2 class="ah">' + g[0] + ' <span>' + xs.length + '</span></h2><div class="apps">' + xs.map(appCard).join('') + '</div>' : '';
  }).join('') : '<div class="card empty">No apps match.</div>';
  $$('#agrid [data-app]').forEach(function (c) { c.onclick = function () { appDrawer(c.dataset.app); }; });
}
function appDrawer(slug) {
  var a = APPS.filter(function (x) { return x.slug === slug; })[0]; if (!a) return;
  var st = ASTATS[slug] || {};
  var links = [[a.url, 'Open app'], [a.admin_url, 'Admin'], [a.repo ? 'https://github.com/' + a.repo.split(' ')[0] : null, 'GitHub']].filter(function (l) { return l[0]; });
  var d = layer('<div class="dh"><h2>' + esc(a.name) + '</h2><span class="pill st-app st-' + esc(a.status.replace(' ', '-')) + '">' + esc(STATUS_TXT[a.status] || a.status) + '</span><button class="x" data-close aria-label="Close">×</button></div>' +
    '<div class="db"><div class="bigthumb">' + thumbHTML(a) + '</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' + links.map(function (l, i) { return '<a class="btn' + (i ? '' : ' pri') + '" href="' + esc(l[0]) + '" target="_blank" rel="noopener" style="text-decoration:none">' + l[1] + ' ↗</a>'; }).join('') + '</div>' +
    '<p>' + esc(a.summary || '') + '</p>' +
    ((a.functions || []).length ? '<div><label class="lb">What it does</label><ul class="fl">' + a.functions.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul></div>' : '') +
    '<div class="grid2 meta2"><div><label class="lb">Platform</label>' + esc(a.platform || '—') + '</div><div><label class="lb">Type</label>' + esc(a.category || '—') + '</div>' + (a.repo ? '<div><label class="lb">Repo</label>' + esc(a.repo) + '</div>' : '') + (a.url ? '<div><label class="lb">Address</label><span style="word-break:break-all">' + esc(a.url.replace(/^https?:\/\//, '')) + '</span></div>' : '') + '</div>' +
    (a.notes ? '<div class="warn" style="background:var(--grey-l);color:#333">' + esc(a.notes) + '</div>' : '') +
    '<div><label class="lb">Visits</label>' + (a.tracked ? '<div class="kpis k3">' + kpi('Today', st.today, '') + kpi('7 days', st.d7, num(st.u7) + ' unique') + kpi('30 days', st.d30, st.last ? 'Last ' + fmtDT(st.last) : 'No visits yet') + '</div><div id="adet"><p class="note">Loading…</p></div>' : '<p class="note">Not tracked. Visit counting works on apps I host on Vercel; turn it on in Edit after the tracking snippet is added to the app.</p>') + '</div></div>' +
    '<div class="df"><button class="btn danger" id="adel" style="margin-right:auto">Remove</button><button class="btn" data-close>Close</button><button class="btn pri" id="aed">Edit</button></div>', 'drawer');
  $$('[data-close]', d).forEach(function (b) { b.onclick = closeLayer; });
  $('#aed').onclick = function () { appEdit(a); };
  $('#adel').onclick = function () { confirmBox('Remove ' + a.name + ' from the gallery?', 'This only removes the card and its settings here. The app itself and its visit history stay untouched.', 'Remove card', function () { api('apps.delete', { id: a.id }, APPS_API).then(function () { toast('Removed'); if (location.hash.indexOf('apps') >= 0) appsView(); else dashboard(); }).catch(function (e) { toast(e.message); }); }); };
  if (a.tracked) api('apps.get', { slug: slug }, APPS_API).then(function (x) {
    var daily = x.daily || [], max = Math.max.apply(null, daily.map(function (r) { return r.n; }).concat([1]));
    $('#adet').innerHTML = '<div class="chart" style="height:110px">' + daily.map(function (r) { return '<div class="b" style="height:' + Math.max(2, Math.round(r.n / max * 100)) + '%" title="' + esc(r.d) + ': ' + r.n + ' visits, ' + r.u + ' unique"></div>'; }).join('') + '</div><div class="axis"><span>30 days ago</span><span>Today</span></div>' +
      '<div class="grid2" style="margin-top:14px"><div><label class="lb">Top pages (30 days)</label><div class="rows">' + ((x.pages || []).map(function (r) { return '<div class="r"><span style="word-break:break-all">' + esc(r.path) + '</span><b>' + num(r.n) + '</b></div>'; }).join('') || '<p class="note">None yet.</p>') + '</div></div>' +
      '<div><label class="lb">Where visitors came from</label><div class="rows">' + ((x.refs || []).map(function (r) { return '<div class="r"><span>' + esc(r.ref) + '</span><b>' + num(r.n) + '</b></div>'; }).join('') || '<p class="note">None yet.</p>') + '</div></div></div>';
  }).catch(function (e) { $('#adet').innerHTML = '<p class="err">' + esc(e.message) + '</p>'; });
}
function appEdit(a) {
  var n = !a; a = a || { status: 'live', category: 'Web app', platform: 'Vercel', functions: [], position: 100 };
  var d = layer('<div class="dh"><h2>' + (n ? 'Add app' : 'Edit ' + esc(a.name)) + '</h2><button class="x" data-close aria-label="Close">×</button></div><div class="db">' +
    '<div class="grid2"><div><label class="lb" for="e_n">Name</label><input class="in" id="e_n" value="' + esc(a.name || '') + '"></div><div><label class="lb" for="e_s">Status</label><select class="in" id="e_s">' + Object.keys(STATUS_TXT).map(function (k) { return '<option value="' + k + '"' + (a.status === k ? ' selected' : '') + '>' + STATUS_TXT[k] + '</option>'; }).join('') + '</select></div></div>' +
    '<div><label class="lb" for="e_sum">One-line summary</label><input class="in" id="e_sum" value="' + esc(a.summary || '') + '"></div>' +
    '<div><label class="lb" for="e_f">What it does (one per line)</label><textarea class="in" id="e_f">' + esc((a.functions || []).join('\n')) + '</textarea></div>' +
    '<div class="grid2"><div><label class="lb" for="e_c">Type</label><input class="in" id="e_c" value="' + esc(a.category || '') + '" placeholder="Web app, Website, Automation…"></div><div><label class="lb" for="e_p">Platform</label><input class="in" id="e_p" value="' + esc(a.platform || '') + '" placeholder="Vercel + Supabase"></div></div>' +
    '<div><label class="lb" for="e_u">App address</label><input class="in" id="e_u" type="url" value="' + esc(a.url || '') + '" placeholder="https://…"></div>' +
    '<div class="grid2"><div><label class="lb" for="e_a">Admin link</label><input class="in" id="e_a" type="url" value="' + esc(a.admin_url || '') + '"></div><div><label class="lb" for="e_r">GitHub repo</label><input class="in" id="e_r" value="' + esc(a.repo || '') + '" placeholder="metalearnhub/…"></div></div>' +
    '<div class="grid2"><div><label class="lb" for="e_t">Thumbnail image link</label><input class="in" id="e_t" value="' + esc(a.thumb || '') + '" placeholder="https://… (square works best)"></div><div><label class="lb" for="e_o">Order</label><input class="in" id="e_o" type="number" value="' + esc(a.position) + '"></div></div>' +
    '<label class="check"><input type="checkbox" id="e_tr"' + (a.tracked ? ' checked' : '') + '><span>Count visits for this app. The app needs the tracking snippet with the name <code>' + esc(a.slug || 'its-slug') + '</code>.</span></label>' +
    '<div><label class="lb" for="e_no">Notes</label><textarea class="in" id="e_no">' + esc(a.notes || '') + '</textarea></div><div class="err" id="e_e"></div></div>' +
    '<div class="df"><button class="btn" data-close>Cancel</button><button class="btn pri" id="e_sv">Save</button></div>', 'drawer');
  $$('[data-close]', d).forEach(function (b) { b.onclick = closeLayer; });
  $('#e_sv').onclick = function () {
    var body = { id: a.id, slug: a.slug, name: $('#e_n').value, status: $('#e_s').value, summary: $('#e_sum').value, functions: $('#e_f').value.split('\n'), category: $('#e_c').value, platform: $('#e_p').value, url: $('#e_u').value, admin_url: $('#e_a').value, repo: $('#e_r').value, thumb: $('#e_t').value, position: $('#e_o').value, tracked: $('#e_tr').checked, notes: $('#e_no').value };
    api('apps.save', { app: body }, APPS_API).then(function () { closeLayer(); toast('Saved'); if (location.hash.indexOf('apps') >= 0) appsView(); else dashboard(); }).catch(function (e) { $('#e_e').textContent = e.message; });
  };
}

/* ---------------- boot ---------------- */
function boot() {
  if (!TOK) return login();
  shell(); route();
}
window.addEventListener('hashchange', function () { closeLayer(); if (TOK) route(); });
boot();
})();
