/* Dijae CRM — contacts, custom fields, tags, dashboard. Data: Supabase edge function "crm" (project qbubwemdvwflxvxwesrl).
   Contacts are the same records the newsletter sends to (table nl_subscribers). */
(function () {
'use strict';
var API = 'https://qbubwemdvwflxvxwesrl.supabase.co/functions/v1/crm';
var TOK = ''; try { TOK = localStorage.getItem('crm_token') || ''; } catch (e) {}
var FIELDS = [], STATS = null;
var L = { q: '', status: '', tag: '', sort: 'created_at', page: 0, size: 50, rows: [], total: 0, sel: {} };
var STD = [['email', 'Email'], ['first_name', 'First name'], ['last_name', 'Last name'], ['phone', 'Phone'], ['company', 'Company'], ['tags', 'Tags']];

function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function fmtD(s) { if (!s) return ''; var d = new Date(s); return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }); }
function fmtDT(s) { if (!s) return ''; var d = new Date(s); return d.toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }
function num(n) { return (n || 0).toLocaleString('en-US'); }
var tt; function toast(m) { var t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2600); }

function api(action, body) {
  body = Object.assign({ action: action }, body || {});
  return fetch(API, { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + TOK }, body: JSON.stringify(body) })
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
var NAV = [['dashboard', 'Dashboard', '▦'], ['contacts', 'Contacts', '☺'], ['fields', 'Fields', '≡'], ['pipelines', 'Pipelines', '▤'], ['sequences', 'Sequences', '↻']];
function shell() {
  $('#app').innerHTML = '<div class="shell"><aside class="side"><div class="brand">DIJAE · <span>CRM</span></div>' +
    NAV.map(function (n) { return '<a class="nav" href="#/' + n[0] + '" data-r="' + n[0] + '"><span aria-hidden="true">' + n[2] + '</span>' + n[1] + (n[0] === 'pipelines' || n[0] === 'sequences' ? '<small>next</small>' : '') + '</a>'; }).join('') +
    '<div class="foot">Signed in<br><button id="so">Sign out</button></div></aside><main id="main"></main></div>';
  $('#so').onclick = function () { api('signout').catch(function () {}).then(function () { TOK = ''; try { localStorage.removeItem('crm_token'); } catch (e) {} login(); }); };
}
function route() {
  var r = (location.hash.replace(/^#\/?/, '') || 'dashboard').split('/')[0];
  $$('.nav').forEach(function (a) { a.classList.toggle('on', a.dataset.r === r); });
  var m = $('#main'); if (!m) return;
  if (r === 'contacts') return contacts();
  if (r === 'fields') return fieldsView();
  if (r === 'pipelines') return soon('Pipelines', ['Boards with your own stages (for example Lead → Call booked → Proposal → Won / Lost)', 'Deals linked to contacts, with value, owner and next follow-up date', 'Drag and drop between stages; pipeline value and win rate on the dashboard']);
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
  api('stats').then(function (s) {
    STATS = s;
    var daily = s.daily || [], max = Math.max.apply(null, daily.map(function (d) { return d.n; }).concat([1]));
    var total = s.total || 0;
    var src = (s.sources || []), tags = (s.tags || []), bc = (s.broadcasts || []);
    var srcMax = Math.max.apply(null, src.map(function (x) { return x.n; }).concat([1]));
    $('#dash').innerHTML =
      '<div class="kpis">' +
      kpi('Contacts', s.total, num(s.new7) + ' new this week') +
      kpi('Subscribed', s.subscribed, total ? Math.round(s.subscribed / total * 100) + '% of contacts' : '') +
      kpi('Leads', s.leads, 'Not on the newsletter') +
      kpi('Emails sent (30 days)', s.sent30, num(s.failed30) + ' failed · ' + num(s.unsubscribed) + ' unsubscribed total') +
      '</div>' +
      '<div class="dash2"><div class="card"><h2>New contacts, last 30 days</h2><div class="chart">' +
      daily.map(function (d) { return '<div class="b" style="height:' + Math.max(2, Math.round(d.n / max * 100)) + '%" title="' + esc(d.d) + ': ' + d.n + '"></div>'; }).join('') +
      '</div><div class="axis"><span>' + esc(daily[0] ? fmtD(daily[0].d) : '') + '</span><span>' + num(s.new30) + ' in 30 days</span><span>Today</span></div></div>' +
      '<div class="card"><h2>Top sources</h2><div class="rows">' + (src.length ? src.map(function (x) { return '<div class="r" style="display:block"><div style="display:flex;justify-content:space-between"><span>' + esc(x.source) + '</span><b>' + num(x.n) + '</b></div><div class="meter"><i style="width:' + Math.round(x.n / srcMax * 100) + '%"></i></div></div>'; }).join('') : '<p class="note">No contacts yet.</p>') + '</div></div></div>' +
      '<div class="dash2"><div class="card"><h2>Recent newsletter sends</h2>' + (bc.length ? '<div class="rows">' + bc.map(function (b) { return '<div class="r"><span><span class="pill">' + esc(b.kind) + '</span>' + esc(b.subject) + '</span><span><b>' + num(b.sent) + '</b> sent' + (b.failed ? ' · ' + b.failed + ' failed' : '') + ' · ' + esc(b.status) + ' · ' + esc(fmtD(b.sent_at || b.send_at)) + '</span></div>'; }).join('') + '</div>' : '<p class="note">No newsletter sends yet. The Friday digest and Tuesday story emails will show here.</p>') + '</div>' +
      '<div class="card"><h2>Tags</h2>' + (tags.length ? tags.map(function (t) { return '<a class="pill" href="#/contacts" data-tag="' + esc(t.tag) + '">' + esc(t.tag) + ' · ' + num(t.n) + '</a>'; }).join('') : '<p class="note">No tags yet.</p>') + '</div></div>';
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
    '<div class="db"><div class="tabs"><button data-t="details" class="' + (tab === 'details' ? 'on' : '') + '">Details</button><button data-t="activity" class="' + (tab === 'activity' ? 'on' : '') + '">Activity</button><button data-t="emails" class="' + (tab === 'emails' ? 'on' : '') + '">Emails (' + data.sends.length + ')</button></div><div id="tb"></div></div>' +
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

/* ---------------- boot ---------------- */
function boot() {
  if (!TOK) return login();
  shell(); route();
}
window.addEventListener('hashchange', function () { closeLayer(); if (TOK) route(); });
boot();
})();
