const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const ADMIN_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>KOPPA — Back-office</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#f4f6fb;color:#1a1a2e;min-height:100vh}
.login{display:flex;align-items:center;justify-content:center;min-height:100vh}
.login-box{background:#fff;border-radius:16px;padding:40px;width:100%;max-width:360px;box-shadow:0 4px 24px rgba(0,51,160,.1);text-align:center}
.logo{font-size:28px;font-weight:900;color:#0033A0;letter-spacing:.05em;margin-bottom:6px}
.logo-sub{font-size:13px;color:#8a8a8a;margin-bottom:28px}
input[type=password]{width:100%;padding:13px 16px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:15px;margin-bottom:14px;outline:none}
input[type=password]:focus{border-color:#0033A0}
.btn{width:100%;background:#0033A0;color:#fff;border:none;padding:14px;border-radius:100px;font-size:15px;font-weight:700;cursor:pointer}
.btn:hover{background:#001f6b}
.err{color:#e24b4a;font-size:13px;margin-top:8px;min-height:20px}
#admin{display:none}
header{background:#0033A0;color:#fff;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
.header-logo{font-size:20px;font-weight:900;letter-spacing:.05em}
.header-sub{font-size:12px;opacity:.7;margin-top:2px}
.header-actions{display:flex;gap:10px;align-items:center}
.btn-sm{padding:8px 18px;border-radius:100px;font-size:13px;font-weight:700;cursor:pointer;border:none}
.btn-white{background:#fff;color:#0033A0}
.btn-outline-white{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.5);cursor:pointer}
main{padding:28px 32px;max-width:1200px;margin:0 auto}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:28px}
.stat-card{background:#fff;border-radius:12px;padding:20px 24px;box-shadow:0 2px 8px rgba(0,0,0,.05)}
.stat-label{font-size:11px;color:#8a8a8a;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px}
.stat-val{font-size:26px;font-weight:900;color:#0033A0}
.stat-sub{font-size:11px;color:#8a8a8a;margin-top:4px}
.clubs-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
.club-tab{padding:8px 18px;border-radius:100px;font-size:13px;font-weight:700;cursor:pointer;border:1.5px solid #e0e0e0;background:#fff;transition:.15s}
.club-tab.active{background:#0033A0;color:#fff;border-color:#0033A0}
.section-header{display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap}
.section-title{font-size:15px;font-weight:800;color:#1a1a2e}
.count-badge{background:#0033A0;color:#fff;border-radius:100px;padding:2px 10px;font-size:12px}
.export-btn{margin-left:auto;background:#f0f4ff;color:#0033A0;border:none;padding:7px 16px;border-radius:100px;font-size:12px;font-weight:700;cursor:pointer}
.export-btn:hover{background:#0033A0;color:#fff}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.05)}
th{background:#f7f8fb;padding:12px 16px;text-align:left;font-size:11px;font-weight:700;color:#8a8a8a;text-transform:uppercase;letter-spacing:.04em}
td{padding:13px 16px;font-size:14px;border-top:1px solid #f0f0f0}
tr:hover td{background:#fafbff}
.badge{display:inline-block;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700;background:#e8f9f0;color:#1a7a4a}
.empty{text-align:center;padding:48px;color:#8a8a8a;font-size:14px}
@media(max-width:600px){main{padding:16px} th,td{padding:9px 10px;font-size:13px}}
</style>
</head>
<body>

<div class="login" id="loginView">
  <div class="login-box">
    <div class="logo">KOPPA.</div>
    <div class="logo-sub">Back-office commandes</div>
    <input type="password" id="pwdInput" placeholder="Mot de passe" onkeydown="if(event.key==='Enter')login()">
    <button class="btn" onclick="login()">Accéder →</button>
    <div class="err" id="loginErr"></div>
  </div>
</div>

<div id="admin">
  <header>
    <div>
      <div class="header-logo">KOPPA. Back-office</div>
      <div class="header-sub" id="lastRefresh"></div>
    </div>
    <div class="header-actions">
      <button class="btn-sm btn-outline-white" onclick="exportCSV('all')">⬇ Export tout</button>
      <button class="btn-sm btn-white" onclick="reload()">↻ Actualiser</button>
    </div>
  </header>
  <main>
    <div class="stats">
      <div class="stat-card"><div class="stat-label">Commandes</div><div class="stat-val" id="statTotal">—</div></div>
      <div class="stat-card"><div class="stat-label">Revenu total</div><div class="stat-val" id="statRevenu">—</div></div>
      <div class="stat-card"><div class="stat-label">Clubs actifs</div><div class="stat-val" id="statClubs">—</div></div>
      <div class="stat-card"><div class="stat-label">Dernière commande</div><div class="stat-val" id="statLast" style="font-size:18px">—</div></div>
    </div>
    <div class="clubs-tabs" id="clubsTabs"></div>
    <div class="section-header">
      <span class="section-title" id="tableTitle">Toutes les commandes</span>
      <span class="count-badge" id="tableCount">0</span>
      <button class="export-btn" onclick="exportCSV(activeClub)">⬇ CSV ce club</button>
    </div>
    <table>
      <thead><tr><th>Date</th><th>Prénom</th><th>Nom</th><th>Email</th><th>Club</th><th>Articles</th><th>Total</th><th>Statut</th></tr></thead>
      <tbody id="ordersBody"></tbody>
    </table>
  </main>
</div>

<script>
let allOrders = [];
let activeClub = 'all';
let pwd = '';

async function login() {
  pwd = document.getElementById('pwdInput').value;
  document.getElementById('loginErr').textContent = '';
  try {
    const res = await fetch('/.netlify/functions/get-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd })
    });
    if (res.status === 401) { document.getElementById('loginErr').textContent = 'Mot de passe incorrect'; return; }
    const data = await res.json();
    if (data.error) { document.getElementById('loginErr').textContent = data.error; return; }
    allOrders = data.orders;
    document.getElementById('loginView').style.display = 'none';
    document.getElementById('admin').style.display = 'block';
    document.getElementById('lastRefresh').textContent = 'Actualisé le ' + new Date().toLocaleString('fr-FR');
    render();
  } catch(e) { document.getElementById('loginErr').textContent = 'Erreur réseau'; }
}

async function reload() {
  const res = await fetch('/.netlify/functions/get-orders', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({password:pwd}) });
  const data = await res.json();
  allOrders = data.orders;
  document.getElementById('lastRefresh').textContent = 'Actualisé le ' + new Date().toLocaleString('fr-FR');
  render();
}

function render() {
  const filtered = activeClub === 'all' ? allOrders : allOrders.filter(o => o.club_id === activeClub);
  const clubs = {};
  allOrders.forEach(o => { clubs[o.club_id] = o.club_name; });

  document.getElementById('statTotal').textContent = allOrders.length;
  const rev = allOrders.reduce((s,o) => s + parseFloat(o.total||0), 0);
  document.getElementById('statRevenu').textContent = rev.toFixed(2).replace('.',',') + '€';
  document.getElementById('statClubs').textContent = Object.keys(clubs).length;
  const last = [...allOrders].sort((a,b) => b.timestamp - a.timestamp)[0];
  document.getElementById('statLast').textContent = last ? last.date : '—';

  const tabs = document.getElementById('clubsTabs');
  tabs.innerHTML = '<button class="club-tab ' + (activeClub==='all'?'active':'') + '" onclick="setClub(\'all\')">Tous (' + allOrders.length + ')</button>' +
    Object.entries(clubs).map(([id,name]) => {
      const cnt = allOrders.filter(o => o.club_id === id).length;
      return '<button class="club-tab ' + (activeClub===id?'active':'') + '" onclick="setClub(\'' + id + '\')">' + name + ' (' + cnt + ')</button>';
    }).join('');

  document.getElementById('tableTitle').textContent = activeClub === 'all' ? 'Toutes les commandes' : (clubs[activeClub]||activeClub);
  document.getElementById('tableCount').textContent = filtered.length;

  const tbody = document.getElementById('ordersBody');
  if (!filtered.length) { tbody.innerHTML = '<tr><td colspan="8" class="empty">Aucune commande pour ce club</td></tr>'; return; }
  tbody.innerHTML = [...filtered].sort((a,b) => b.timestamp - a.timestamp).map(o =>
    '<tr><td>' + o.date + '</td><td>' + o.prenom + '</td><td><strong>' + o.nom + '</strong></td><td><a href="mailto:' + o.email + '" style="color:#0033A0">' + o.email + '</a></td><td>' + o.club_name + '</td><td style="color:#555;font-size:13px">' + o.items + '</td><td><strong>' + o.total + '€</strong></td><td><span class="badge">✓ Payé</span></td></tr>'
  ).join('');
}

function setClub(id) { activeClub = id; render(); }

function exportCSV(clubFilter) {
  const data = clubFilter === 'all' ? allOrders : allOrders.filter(o => o.club_id === clubFilter);
  const rows = [['Date','Prénom','Nom','Email','Club','Articles','Total']].concat(
    data.sort((a,b) => b.timestamp - a.timestamp).map(o => [o.date, o.prenom, o.nom, o.email, o.club_name, '"'+o.items+'"', o.total+'€'])
  ).map(r => r.join(',')).join('\\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows);
  a.download = 'koppa-commandes-' + (clubFilter==='all'?'toutes':clubFilter) + '.csv';
  a.click();
}
</script>
</body>
</html>`;

exports.handler = async (event) => {
  // GET /admin → servir le HTML
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow'
      },
      body: ADMIN_HTML
    };
  }
  return { statusCode: 405, body: 'Method Not Allowed' };
};
