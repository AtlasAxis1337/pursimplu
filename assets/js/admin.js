/* ===== PUR&simplu – Admin panel ===== */
DB.load();
const ST = { nou:'Nouă', preparare:'În preparare', livrare:'În livrare', finalizat:'Finalizată', anulat:'Anulată' };
const SC = { nou:'c-new', preparare:'c-prep', livrare:'c-ship', finalizat:'c-done', anulat:'c-cancel' };
const esc = s => String(s??'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fdate = d => new Date(d).toLocaleDateString('ro-RO',{day:'2-digit',month:'short',year:'numeric'});
let ROUTE = 'dash';

function toast(m,type){ const w=document.getElementById('toasts'), d=document.createElement('div');
  d.className='toast '+(type||''); d.textContent=m; w.appendChild(d);
  setTimeout(()=>{d.style.opacity='0';d.style.transition='.3s';setTimeout(()=>d.remove(),300);},2400); }

/* ---------- auth gate ---------- */
function adminLogin(){
  const e=document.getElementById('agEmail').value.trim().toLowerCase(), p=document.getElementById('agPass').value;
  const u=DB.users().find(x=>x.email.toLowerCase()===e && x.pass===p && x.role==='admin');
  if(!u) return toast('Acces respins. Cont de admin invalid.','err');
  Session.set(u); boot();
}
function adminLogout(){ Session.clear(); location.reload(); }
function boot(){
  const u = Session.get();
  if(!u || u.role!=='admin') return;
  document.getElementById('gate').classList.remove('on');
  document.getElementById('app').classList.remove('hidden');
  nav(ROUTE);
}
function nav(r){
  ROUTE = r;
  document.querySelectorAll('.side a[data-r]').forEach(a=>a.classList.toggle('active', a.dataset.r===r));
  document.getElementById('amain').innerHTML = ({dash:vDash,orders:vOrders,products:vProducts,stock:vStock,
    cats:vCats,vouchers:vVouchers,users:vUsers,settings:vSettings}[r])();
  const n = DB.orders().filter(o=>o.status==='nou').length;
  const sb = document.getElementById('sbOrders'); sb.textContent = n || ''; sb.style.display = n?'inline-block':'none';
  window.scrollTo(0,0);
}
function head(title, sub, actions){
  return `<div class="admin-top"><div><h1>${title}</h1><p>${sub}</p></div><div style="display:flex;gap:8px">${actions||''}</div></div>`;
}
function save(msg){ DB.save(); nav(ROUTE); toast(msg||'Salvat','ok'); }

/* ---------- modal ---------- */
function openMdl(html){ document.getElementById('mdlBox').innerHTML =
  `<button class="x" onclick="closeMdl()">✕</button>`+html; document.getElementById('mdl').classList.add('on'); }
function closeMdl(){ document.getElementById('mdl').classList.remove('on'); }

/* ================= DASHBOARD ================= */
function vDash(){
  const O = DB.orders(), P = DB.products(), U = DB.users().filter(u=>u.role==='client');
  const valid = O.filter(o=>o.status!=='anulat');
  const revenue = valid.reduce((s,o)=>s+o.total,0);
  const avg = valid.length ? revenue/valid.length : 0;
  const low = P.filter(p=>p.stock<=10);
  const days=[...Array(7)].map((_,i)=>{ const d=new Date(Date.now()-(6-i)*864e5);
    const tot = valid.filter(o=>new Date(o.date).toDateString()===d.toDateString()).reduce((s,o)=>s+o.total,0);
    return { l:d.toLocaleDateString('ro-RO',{weekday:'short'}), v:tot }; });
  const max = Math.max(...days.map(d=>d.v),1);
  const cnt={}; valid.forEach(o=>o.items.forEach(i=>cnt[i.id]=(cnt[i.id]||0)+i.qty));
  const top = Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,5);

  return head('Dashboard','Privire de ansamblu asupra băcăniei PUR&simplu',
      `<button class="btn btn-outline btn-sm" onclick="exportJSON()">⬇️ Export date</button>
       <button class="btn btn-primary btn-sm" onclick="nav('products');setTimeout(()=>editProduct(),100)">＋ Produs nou</button>`) +
  `<div class="stats">
    <div class="stat"><span class="e">💰</span><div><b>${money(revenue)}</b><span>Venit total</span></div></div>
    <div class="stat"><span class="e" style="background:#e3f2fd">📦</span><div><b>${O.length}</b><span>Comenzi (${O.filter(o=>o.status==='nou').length} noi)</span></div></div>
    <div class="stat"><span class="e" style="background:#fff4e0">🧾</span><div><b>${money(avg)}</b><span>Valoare medie coș</span></div></div>
    <div class="stat"><span class="e" style="background:#ede7f6">👥</span><div><b>${U.length}</b><span>Clienți înregistrați</span></div></div>
  </div>
  <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:20px" class="dash-row">
    <div class="card"><div class="ch"><h3>Vânzări ultimele 7 zile</h3></div>
      <div class="bars">${days.map(d=>`<div style="height:${Math.max(4,d.v/max*100)}%"><i>${d.v?Math.round(d.v):''}</i><span>${d.l}</span></div>`).join('')}</div>
      <div style="height:18px"></div></div>
    <div class="card"><div class="ch"><h3>Top produse</h3></div>
      ${top.length?top.map(([id,q])=>{const p=DB.product(id); if(!p)return'';
        return `<div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--line)">
        <span class="oe-thumb"><img src="${p.img}" alt=""></span><div style="flex:1"><b style="font-size:13.5px">${esc(p.name_ro)}</b>
        <div style="font-size:12px;color:#6b7168">${money(p.price)}</div></div><b>${q} buc</b></div>`;}).join('')
        :'<p style="color:#6b7168">Încă nu există vânzări.</p>'}</div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px" class="dash-row">
    <div class="card"><div class="ch"><h3>Comenzi recente</h3><button class="btn btn-ghost btn-sm" onclick="nav('orders')">Vezi toate →</button></div>
      <div class="tbl-scroll"><table class="tb"><thead><tr><th>Comandă</th><th>Client</th><th>Total</th><th>Status</th></tr></thead>
      <tbody>${O.slice(0,6).map(o=>`<tr style="cursor:pointer" onclick="orderDetail('${o.id}')">
        <td><b>${o.id}</b><div style="font-size:12px;color:#6b7168">${fdate(o.date)}</div></td>
        <td>${esc(o.customer)}</td><td><b>${money(o.total)}</b></td>
        <td><span class="chip ${SC[o.status]}">${ST[o.status]}</span></td></tr>`).join('')}</tbody></table></div></div>
    <div class="card"><div class="ch"><h3>⚠️ Stoc redus</h3><button class="btn btn-ghost btn-sm" onclick="nav('stock')">Gestionează →</button></div>
      <div class="tbl-scroll"><table class="tb"><thead><tr><th>Produs</th><th>Stoc</th><th></th></tr></thead>
      <tbody>${low.slice(0,6).map(p=>`<tr><td><span class="oe-thumb"><img src="${p.img}" alt=""></span> ${esc(p.name_ro)}</td>
        <td><span class="chip ${p.stock<=0?'c-cancel':'c-prep'}">${p.stock} buc</span></td>
        <td><button class="btn btn-outline btn-sm" onclick="editProduct('${p.id}')">Editează</button></td></tr>`).join('')
        || '<tr><td colspan="3" style="color:#6b7168">Toate stocurile sunt în regulă 🎉</td></tr>'}</tbody></table></div></div>
  </div>`;
}
function exportJSON(){
  const blob = new Blob([JSON.stringify(DB.data,null,2)],{type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'pursimplu-export-'+new Date().toISOString().slice(0,10)+'.json'; a.click();
  toast('Date exportate','ok');
}

/* ================= ORDERS ================= */
let oFilter = { status:'', q:'' };
function vOrders(){
  let O = DB.orders();
  if (oFilter.status) O = O.filter(o=>o.status===oFilter.status);
  if (oFilter.q){ const s=oFilter.q.toLowerCase();
    O = O.filter(o=>(o.id+o.customer+o.email).toLowerCase().includes(s)); }
  return head('Comenzi', DB.orders().length+' comenzi în total · '+DB.orders().filter(o=>o.status==='nou').length+' noi') +
  `<div class="card">
    <div class="ch">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${['','nou','preparare','livrare','finalizat','anulat'].map(s=>
          `<button class="btn btn-sm ${oFilter.status===s?'btn-primary':'btn-outline'}" onclick="oFilter.status='${s}';nav('orders')">${s?ST[s]:'Toate'}</button>`).join('')}
      </div>
      <input class="mini-in" placeholder="Caută ID, client, email…" value="${esc(oFilter.q)}"
        oninput="oFilter.q=this.value;clearTimeout(window._d);window._d=setTimeout(()=>nav('orders'),300)">
    </div>
    <div class="tbl-scroll"><table class="tb"><thead><tr>
      <th>Comandă</th><th>Data</th><th>Client</th><th>Produse</th><th>Plată</th><th>Voucher</th><th>Total</th><th>Status</th><th></th></tr></thead>
    <tbody>${O.map(o=>`<tr>
      <td><b>${o.id}</b></td><td>${fdate(o.date)}</td>
      <td>${esc(o.customer)}<div style="font-size:12px;color:#6b7168">${esc(o.email)}</div></td>
      <td><span class="mini-thumbs">${o.items.slice(0,3).map(i=>`<img src="${i.img||''}" alt="">`).join('')}</span>
          <div style="font-size:12px;color:#6b7168">${o.items.reduce((s,i)=>s+i.qty,0)} buc</div></td>
      <td>${o.payment==='card'?'💳 Card':'💵 Ramburs'}</td>
      <td>${o.voucher?`<span class="chip c-done">${o.voucher}</span>`:'—'}</td>
      <td><b>${money(o.total)}</b></td>
      <td><select class="mini-in" style="min-width:140px;padding:6px 9px" onchange="setStatus('${o.id}',this.value)">
        ${Object.keys(ST).map(s=>`<option value="${s}" ${o.status===s?'selected':''}>${ST[s]}</option>`).join('')}</select></td>
      <td style="white-space:nowrap"><button class="btn btn-outline btn-sm" onclick="orderDetail('${o.id}')">Detalii</button>
        <button class="btn btn-primary btn-sm" title="Editează produsele" onclick="editOrder('${o.id}')">✏️</button></td>
    </tr>`).join('') || '<tr><td colspan="9" style="color:#6b7168;text-align:center;padding:30px">Nicio comandă găsită</td></tr>'}</tbody></table></div>
  </div>`;
}
function setStatus(id,s){ const o=DB.order(id); o.status=s; save('Status actualizat: '+ST[s]); }
function orderDetail(id){
  const o = DB.order(id);
  openMdl(`<h3>Comanda ${o.id}</h3><p class="sub">${fdate(o.date)} · ${esc(o.customer)} · ${esc(o.phone)}</p>
    <div class="grid2" style="margin-bottom:16px">
      <div class="panel" style="box-shadow:none;background:var(--bg)"><b style="font-size:12px;color:#6b7168">LIVRARE</b>
        <div>${esc(o.address)}</div><div style="font-size:13px;color:#6b7168">${esc(o.email)}</div>
        ${o.note?`<div style="margin-top:8px;font-size:13px">📝 ${esc(o.note)}</div>`:''}</div>
      <div class="panel" style="box-shadow:none;background:var(--bg)"><b style="font-size:12px;color:#6b7168">STATUS & PLATĂ</b>
        <div><span class="chip ${SC[o.status]}">${ST[o.status]}</span></div>
        <div style="margin-top:6px">${o.payment==='card'?'💳 Card online':'💵 Ramburs la livrare'}</div></div>
    </div>
    <div class="tbl-scroll"><table class="tb"><thead><tr><th>Produs</th><th>Cant.</th><th>Preț</th><th>Total</th></tr></thead>
    <tbody>${o.items.map(i=>`<tr><td><span class="oe-thumb"><img src="${i.img||''}" alt=""></span> ${esc(i.name_ro)}</td><td>${i.qty}</td><td>${money(i.price)}</td><td><b>${money(i.price*i.qty)}</b></td></tr>`).join('')}</tbody></table></div>
    <div style="max-width:300px;margin-left:auto;margin-top:14px">
      <div class="sum-row"><span>Subtotal</span><b style="color:#2b2b28">${money(o.subtotal)}</b></div>
      ${o.discount?`<div class="sum-row disc"><span>Reducere (${o.voucher})</span><b>− ${money(o.discount)}</b></div>`:''}
      <div class="sum-row"><span>Livrare</span><b style="color:#2b2b28">${o.shipping?money(o.shipping):'Gratuit'}</b></div>
      <div class="sum-row total"><span>Total</span><span>${money(o.total)}</span></div>
    </div>
    <div style="display:flex;gap:8px;margin-top:18px;flex-wrap:wrap">
      ${Object.keys(ST).filter(s=>s!==o.status).map(s=>`<button class="btn btn-outline btn-sm" onclick="setStatus('${o.id}','${s}');closeMdl()">→ ${ST[s]}</button>`).join('')}
    </div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="btn btn-primary btn-sm" onclick="editOrder('${o.id}')">✏️ Editează produsele</button>
      <button class="btn btn-danger btn-sm" style="margin-left:auto" onclick="delOrder('${o.id}')">🗑️ Șterge comanda</button>
    </div>`);
}
function delOrder(id){ if(!confirm('Ștergi definitiv comanda '+id+'?')) return;
  DB.data.orders = DB.orders().filter(o=>o.id!==id); closeMdl(); save('Comandă ștearsă'); }

/* ================= ORDER EDITOR ================= */
function recalcOrder(o){
  const st = DB.data.settings;
  o.subtotal = +o.items.reduce((t,i)=>t+i.price*i.qty,0).toFixed(2);
  let disc = 0, freeShip = false;
  const v = o.voucher ? DB.voucher(o.voucher) : null;
  if (v && o.subtotal >= v.minCart){
    if (v.type==='percent') disc = o.subtotal * v.value/100;
    else if (v.type==='fixed') disc = Math.min(v.value, o.subtotal);
    else if (v.type==='shipping') freeShip = true;
  }
  o.discount = +disc.toFixed(2);
  const after = o.subtotal - o.discount;
  o.shipping = (o.items.length===0 || after >= st.freeOver || freeShip) ? 0 : st.shipping;
  o.total = +(after + o.shipping).toFixed(2);
  return o;
}
/* delta > 0 => scoate din stoc; delta < 0 => întoarce în stoc */
function moveStock(pid, delta){ const p = DB.product(pid); if (p) p.stock = Math.max(0, p.stock - delta); }

function editOrder(id){
  const o = DB.order(id);
  const cats = DB.categories();
  openMdl(`<h3>Editează comanda ${o.id}</h3>
    <p class="sub">${esc(o.customer)} · ${fdate(o.date)} · <span class="chip ${SC[o.status]}">${ST[o.status]}</span></p>
    <div class="tbl-scroll"><table class="tb"><thead><tr>
      <th></th><th>Produs</th><th>Preț unitar</th><th>Cantitate</th><th>Stoc rămas</th><th>Total</th><th></th></tr></thead>
    <tbody>${o.items.map((i,ix)=>{ const p = DB.product(i.id);
      return `<tr>
        <td><span class="oe-thumb"><img src="${i.img||''}" alt=""></span></td>
        <td><b>${esc(i.name_ro)}</b><div style="font-size:12px;color:#6b7168">${p?esc(p.unit):'—'}</div></td>
        <td><input class="mini-in" style="width:90px;min-width:0" type="number" step="0.1" value="${i.price}"
              onchange="oeSetPrice('${o.id}',${ix},this.value)"></td>
        <td><span class="qty"><button onclick="oeQty('${o.id}',${ix},-1)">−</button><span>${i.qty}</span><button onclick="oeQty('${o.id}',${ix},1)">+</button></span></td>
        <td>${p ? `<span class="chip ${p.stock<=0?'c-cancel':p.stock<=10?'c-prep':'c-done'}">${p.stock}</span>` : '<span class="chip c-cancel">șters</span>'}</td>
        <td><b>${money(i.price*i.qty)}</b></td>
        <td style="white-space:nowrap"><button class="btn btn-outline btn-sm" title="Înlocuiește" onclick="oeSwapUI('${o.id}',${ix})">🔁</button>
            <button class="btn btn-danger btn-sm" title="Șterge" onclick="oeRemove('${o.id}',${ix})">🗑️</button></td>
      </tr>`;}).join('') || '<tr><td colspan="7" style="text-align:center;color:#6b7168;padding:24px">Comanda nu mai are produse</td></tr>'}
    </tbody></table></div>

    <div class="oe-add">
      <div><label style="font-size:12px;font-weight:700;display:block;margin-bottom:5px">Adaugă produs în comandă</label>
        <select class="inp" id="oeProd" style="width:100%">
          ${cats.map(c=>`<optgroup label="${esc(c.ro)}">${DB.products().filter(p=>p.cat===c.id)
            .map(p=>`<option value="${p.id}">${esc(p.name_ro)} — ${money(p.price)} (stoc ${p.stock})</option>`).join('')}</optgroup>`).join('')}
        </select></div>
      <div><label style="font-size:12px;font-weight:700;display:block;margin-bottom:5px">Cant.</label>
        <input class="inp" id="oeQtyNew" type="number" value="1" min="1" style="width:100%"></div>
      <button class="btn btn-primary" onclick="oeAdd('${o.id}')">＋ Adaugă</button>
    </div>

    <div class="grid2" style="margin-top:14px">
      <div>
        <label style="font-size:12px;font-weight:700;display:block;margin-bottom:5px">Voucher aplicat</label>
        <select class="inp" style="width:100%" onchange="oeVoucher('${o.id}',this.value)">
          <option value="">— fără voucher —</option>
          ${DB.vouchers().map(v=>`<option value="${v.code}" ${o.voucher===v.code?'selected':''}>${v.code} — ${esc(v.desc_ro)}</option>`).join('')}
        </select>
      </div>
      <div>
        <label style="font-size:12px;font-weight:700;display:block;margin-bottom:5px">Status comandă</label>
        <select class="inp" style="width:100%" onchange="oeStatus('${o.id}',this.value)">
          ${Object.keys(ST).map(k=>`<option value="${k}" ${o.status===k?'selected':''}>${ST[k]}</option>`).join('')}
        </select>
      </div>
    </div>

    <div style="max-width:320px;margin-left:auto;margin-top:16px">
      <div class="sum-row"><span>Subtotal</span><b style="color:#2b2b28">${money(o.subtotal)}</b></div>
      ${o.discount?`<div class="sum-row disc"><span>Reducere (${o.voucher})</span><b>− ${money(o.discount)}</b></div>`:''}
      <div class="sum-row"><span>Livrare</span><b style="color:#2b2b28">${o.shipping?money(o.shipping):'Gratuit'}</b></div>
      <div class="sum-row total"><span>Total</span><span>${money(o.total)}</span></div>
    </div>
    <div class="hint">Stocul se ajustează automat la fiecare modificare: dacă scoți un produs din comandă, cantitatea se întoarce în stoc.</div>
    <button class="btn btn-primary btn-block" style="margin-top:14px" onclick="closeMdl();nav(ROUTE);toast('Comandă actualizată','ok')">✔️ Gata</button>`);
}
function oeStatus(id, s){ const o = DB.order(id); o.status = s; DB.save(); editOrder(id); toast('Status: '+ST[s],'ok'); }
function oeQty(id, ix, d){
  const o = DB.order(id), it = o.items[ix], p = DB.product(it.id);
  if (d > 0 && p && p.stock <= 0) return toast('Stoc insuficient pentru '+it.name_ro,'err');
  it.qty += d;
  if (it.qty <= 0){ moveStock(it.id, -(it.qty - d)); o.items.splice(ix,1); }
  else moveStock(it.id, d);
  recalcOrder(o); DB.save(); editOrder(id);
}
function oeSetPrice(id, ix, v){
  const o = DB.order(id); o.items[ix].price = Math.max(0, +v||0);
  recalcOrder(o); DB.save(); editOrder(id);
}
function oeRemove(id, ix){
  const o = DB.order(id), it = o.items[ix];
  if (!confirm('Scoți "'+it.name_ro+'" din comandă? Cantitatea se întoarce în stoc.')) return;
  moveStock(it.id, -it.qty); o.items.splice(ix,1);
  recalcOrder(o); DB.save(); editOrder(id); toast('Produs eliminat din comandă','ok');
}
function oeAdd(id){
  const o = DB.order(id);
  const pid = document.getElementById('oeProd').value;
  const q = Math.max(1, +document.getElementById('oeQtyNew').value||1);
  const p = DB.product(pid); if (!p) return;
  if (p.stock < q) return toast('Stoc insuficient: mai sunt doar '+p.stock+' buc','err');
  const ex = o.items.find(i=>i.id===pid);
  if (ex) ex.qty += q;
  else o.items.push({ id:p.id, name_ro:p.name_ro, name_en:p.name_en, img:p.img, price:p.price, qty:q });
  moveStock(pid, q);
  recalcOrder(o); DB.save(); editOrder(id); toast('Adăugat: '+p.name_ro,'ok');
}
function oeSwapUI(id, ix){
  const o = DB.order(id), it = o.items[ix];
  const list = DB.products().filter(p=>p.stock>0 && p.id!==it.id);
  openMdl(`<h3>Înlocuiește produsul</h3>
    <p class="sub">Comanda ${o.id} · în loc de <b>${esc(it.name_ro)}</b> (${it.qty} buc)</p>
    <div class="field"><label>Produs de înlocuire (doar cele cu stoc)</label>
      <select class="inp" id="oeSwapSel" style="width:100%">
        ${DB.categories().map(c=>{ const items = list.filter(p=>p.cat===c.id);
          return items.length ? `<optgroup label="${esc(c.ro)}">${items
            .map(p=>`<option value="${p.id}">${esc(p.name_ro)} — ${money(p.price)} (stoc ${p.stock})</option>`).join('')}</optgroup>` : ''; }).join('')}
      </select></div>
    <div class="field"><label>Cantitate</label><input class="inp" id="oeSwapQty" type="number" value="${it.qty}" min="1"></div>
    <label style="display:flex;gap:8px;align-items:center;margin-bottom:14px">
      <input type="checkbox" id="oeSwapPrice" checked style="accent-color:#6d7f3f"> Folosește prețul curent al produsului nou</label>
    <div style="display:flex;gap:8px">
      <button class="btn btn-outline btn-block" onclick="editOrder('${o.id}')">Anulează</button>
      <button class="btn btn-primary btn-block" onclick="oeSwap('${o.id}',${ix})">🔁 Înlocuiește</button>
    </div>`);
}
function oeSwap(id, ix){
  const o = DB.order(id), it = o.items[ix];
  const np = DB.product(document.getElementById('oeSwapSel').value);
  const q = Math.max(1, +document.getElementById('oeSwapQty').value||1);
  const useNew = document.getElementById('oeSwapPrice').checked;
  if (!np) return;
  if (np.stock < q) return toast('Stoc insuficient: '+np.stock+' buc','err');
  moveStock(it.id, -it.qty);
  moveStock(np.id, q);
  o.items[ix] = { id:np.id, name_ro:np.name_ro, name_en:np.name_en, img:np.img,
                  price: useNew ? np.price : it.price, qty:q };
  recalcOrder(o); DB.save(); editOrder(id); toast('Produs înlocuit cu '+np.name_ro,'ok');
}
function oeVoucher(id, code){
  const o = DB.order(id); o.voucher = code || null;
  recalcOrder(o); DB.save(); editOrder(id);
}

/* ================= PRODUCTS ================= */
let pFilter = { cat:'', q:'' };
function vProducts(){
  let P = DB.products();
  if (pFilter.cat) P = P.filter(p=>p.cat===pFilter.cat);
  if (pFilter.q){ const s=pFilter.q.toLowerCase(); P = P.filter(p=>(p.name_ro+p.name_en).toLowerCase().includes(s)); }
  return head('Produse', DB.products().length+' produse în catalog',
    `<button class="btn btn-primary btn-sm" onclick="editProduct()">＋ Adaugă produs</button>`) +
  `<div class="card">
    <div class="ch">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-sm ${!pFilter.cat?'btn-primary':'btn-outline'}" onclick="pFilter.cat='';nav('products')">Toate</button>
        ${DB.categories().map(c=>`<button class="btn btn-sm ${pFilter.cat===c.id?'btn-primary':'btn-outline'}" onclick="pFilter.cat='${c.id}';nav('products')">${c.ro}</button>`).join('')}
      </div>
      <input class="mini-in" placeholder="Caută produs…" value="${esc(pFilter.q)}"
        oninput="pFilter.q=this.value;clearTimeout(window._d);window._d=setTimeout(()=>nav('products'),300)">
    </div>
    <div class="tbl-scroll"><table class="tb"><thead><tr>
      <th></th><th>Denumire (RO / EN)</th><th>Categorie</th><th>Preț</th><th>Stoc</th><th>Etichetă</th><th>Activ</th><th></th></tr></thead>
    <tbody>${P.map(p=>`<tr>
      <td><span class="oe-thumb"><img src="${p.img}" alt=""></span></td>
      <td><b>${esc(p.name_ro)}</b><div style="font-size:12px;color:#6b7168">${esc(p.name_en)} · ${esc(p.unit)}</div></td>
      <td>${esc((DB.category(p.cat)||{}).ro||'—')}</td>
      <td><b>${money(p.price)}</b>${p.oldPrice?`<div style="font-size:12px;color:#6b7168;text-decoration:line-through">${money(p.oldPrice)}</div>`:''}</td>
      <td><span class="chip ${p.stock<=0?'c-cancel':p.stock<=10?'c-prep':'c-done'}">${p.stock}</span></td>
      <td>${p.tag?`<span class="chip c-new">${p.tag}</span>`:'—'}</td>
      <td><input type="checkbox" ${p.active?'checked':''} style="accent-color:#6d7f3f;width:17px;height:17px" onchange="toggleActive('${p.id}',this.checked)"></td>
      <td style="white-space:nowrap"><button class="btn btn-outline btn-sm" onclick="editProduct('${p.id}')">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="delProduct('${p.id}')">🗑️</button></td>
    </tr>`).join('') || '<tr><td colspan="8" style="text-align:center;color:#6b7168;padding:30px">Niciun produs găsit</td></tr>'}</tbody></table></div>
  </div>`;
}
function toggleActive(id,v){ DB.product(id).active=v; DB.save(); toast(v?'Produs activat':'Produs dezactivat','ok'); }
function delProduct(id){ const p=DB.product(id); if(!confirm('Ștergi produsul "'+p.name_ro+'"?')) return;
  DB.data.products = DB.products().filter(x=>x.id!==id); save('Produs șters'); }
function editProduct(id){
  const p = id ? DB.product(id) : { id:'', name_ro:'', name_en:'', cat:DB.categories()[0].id, price:0,
    oldPrice:null, unit:'buc', stock:0, rating:4.5, featured:false, tag:'', active:true, desc_ro:'', desc_en:'',
    img:'assets/img/logo-sm.png' };
  openMdl(`<h3>${id?'Editează produs':'Adaugă produs'}</h3><p class="sub">${id?p.id.toUpperCase():'Produs nou în catalog'}</p>
    <div class="grid2">
      <div class="field"><label>Denumire RO</label><input class="inp" id="eRo" value="${esc(p.name_ro)}"></div>
      <div class="field"><label>Denumire EN</label><input class="inp" id="eEn" value="${esc(p.name_en)}"></div>
    </div>
    <div class="grid3">
      <div class="field"><label>Categorie</label><select class="inp" id="eCat">${DB.categories().map(c=>`<option value="${c.id}" ${p.cat===c.id?'selected':''}>${c.ro}</option>`).join('')}</select></div>
      <div class="field"><label>Imagine (cale)</label><input class="inp" id="eImg" value="${esc(p.img||'')}" placeholder="assets/img/prod/mere.jpg"></div>
      <div class="field"><label>Unitate</label><input class="inp" id="eUnit" value="${esc(p.unit)}"></div>
    </div>
    <div class="grid3">
      <div class="field"><label>Preț (lei)</label><input class="inp" id="ePrice" type="number" step="0.1" value="${p.price}"></div>
      <div class="field"><label>Preț vechi (opțional)</label><input class="inp" id="eOld" type="number" step="0.1" value="${p.oldPrice||''}"></div>
      <div class="field"><label>Stoc (buc)</label><input class="inp" id="eStock" type="number" value="${p.stock}"></div>
    </div>
    <div class="grid3">
      <div class="field"><label>Etichetă</label><select class="inp" id="eTag">
        ${[['','fără'],['sale','Reducere'],['new','Nou'],['bio','Bio']].map(([v,l])=>`<option value="${v}" ${p.tag===v?'selected':''}>${l}</option>`).join('')}</select></div>
      <div class="field"><label>Rating</label><input class="inp" id="eRate" type="number" step="0.1" min="1" max="5" value="${p.rating}"></div>
      <div class="field"><label>&nbsp;</label>
        <label style="display:flex;gap:8px;align-items:center;padding:10px 0"><input type="checkbox" id="eFeat" ${p.featured?'checked':''} style="accent-color:#6d7f3f"> Recomandat</label></div>
    </div>
    <div class="grid2">
      <div class="field"><label>Descriere RO</label><textarea class="inp" id="eDro" rows="3">${esc(p.desc_ro)}</textarea></div>
      <div class="field"><label>Descriere EN</label><textarea class="inp" id="eDen" rows="3">${esc(p.desc_en)}</textarea></div>
    </div>
    <button class="btn btn-primary btn-block" onclick="saveProduct('${id||''}')">💾 Salvează produsul</button>`);
}
function saveProduct(id){
  const g = i => document.getElementById(i).value;
  if (!g('eRo').trim() || !g('ePrice')) return toast('Completează denumirea și prețul','err');
  const o = { name_ro:g('eRo').trim(), name_en:g('eEn').trim()||g('eRo').trim(), cat:g('eCat'),
    img:g('eImg')||'assets/img/logo-sm.png', unit:g('eUnit')||'buc', price:+g('ePrice'),
    oldPrice:g('eOld')?+g('eOld'):null, stock:+g('eStock')||0, tag:g('eTag'), rating:+g('eRate')||4.5,
    featured:document.getElementById('eFeat').checked, desc_ro:g('eDro'), desc_en:g('eDen')||g('eDro'), active:true };
  if (id) Object.assign(DB.product(id), o);
  else DB.products().unshift(Object.assign({ id:DB.uid('p_') }, o));
  closeMdl(); save(id?'Produs actualizat':'Produs adăugat');
}

/* ================= STOCK ================= */
function vStock(){
  const P = [...DB.products()].sort((a,b)=>a.stock-b.stock);
  const val = P.reduce((s,p)=>s+p.price*p.stock,0);
  return head('Stocuri','Ajustează rapid cantitățile din depozit',
    `<button class="btn btn-outline btn-sm" onclick="bulkStock(10)">＋10 la toate</button>`) +
  `<div class="stats" style="grid-template-columns:repeat(3,1fr)">
    <div class="stat"><span class="e">🏷️</span><div><b>${P.length}</b><span>Produse</span></div></div>
    <div class="stat"><span class="e" style="background:#fff4e0">⚠️</span><div><b>${P.filter(p=>p.stock>0&&p.stock<=10).length}</b><span>Stoc redus (≤10)</span></div></div>
    <div class="stat"><span class="e" style="background:#fdeaea">🚫</span><div><b>${P.filter(p=>p.stock<=0).length}</b><span>Stoc epuizat</span></div></div>
  </div>
  <div class="card"><div class="ch"><h3>Valoare totală stoc: ${money(val)}</h3></div>
  <div class="tbl-scroll"><table class="tb"><thead><tr><th></th><th>Produs</th><th>Categorie</th><th>Stoc</th><th>Ajustează</th><th>Valoare</th></tr></thead>
  <tbody>${P.map(p=>`<tr>
    <td><span class="oe-thumb"><img src="${p.img}" alt=""></span></td>
    <td><b>${esc(p.name_ro)}</b><div style="font-size:12px;color:#6b7168">${esc(p.unit)}</div></td>
    <td>${esc((DB.category(p.cat)||{}).ro||'')}</td>
    <td><span class="chip ${p.stock<=0?'c-cancel':p.stock<=10?'c-prep':'c-done'}">${p.stock} buc</span></td>
    <td><span class="qty"><button onclick="adjStock('${p.id}',-1)">−</button><span>${p.stock}</span><button onclick="adjStock('${p.id}',1)">+</button></span>
      <input class="mini-in" style="width:80px;min-width:0;margin-left:8px" type="number" value="${p.stock}" onchange="setStock('${p.id}',this.value)"></td>
    <td><b>${money(p.price*p.stock)}</b></td></tr>`).join('')}</tbody></table></div></div>`;
}
function adjStock(id,d){ const p=DB.product(id); p.stock=Math.max(0,p.stock+d); save('Stoc: '+p.name_ro+' → '+p.stock); }
function setStock(id,v){ const p=DB.product(id); p.stock=Math.max(0,+v||0); save('Stoc actualizat'); }
function bulkStock(n){ if(!confirm('Adaugi +'+n+' buc la toate produsele?'))return;
  DB.products().forEach(p=>p.stock+=n); save('Stocuri actualizate'); }

/* ================= CATEGORIES ================= */
function vCats(){
  return head('Categorii', DB.categories().length+' categorii active',
    `<button class="btn btn-primary btn-sm" onclick="editCat()">＋ Adaugă categorie</button>`) +
  `<div class="card"><div class="tbl-scroll"><table class="tb"><thead><tr>
    <th></th><th>Nume RO</th><th>Nume EN</th><th>ID</th><th>Produse</th><th></th></tr></thead>
  <tbody>${DB.categories().map(c=>`<tr>
    <td><span class="oe-thumb"><img src="${c.tile}" alt=""></span></td>
    <td><b>${esc(c.ro)}</b><div style="font-size:12px;color:#6b7168">${esc(c.desc_ro)}</div></td>
    <td>${esc(c.en)}</td><td><code>${c.id}</code></td>
    <td>${DB.products().filter(p=>p.cat===c.id).length}</td>
    <td style="white-space:nowrap"><button class="btn btn-outline btn-sm" onclick="editCat('${c.id}')">✏️</button>
      <button class="btn btn-danger btn-sm" onclick="delCat('${c.id}')">🗑️</button></td></tr>`).join('')}</tbody></table></div></div>`;
}
function editCat(id){
  const c = id ? DB.category(id) : { id:'', ro:'', en:'', desc_ro:'', desc_en:'',
    img:'assets/img/logo-sm.png', tile:'assets/img/logo-sm.png' };
  openMdl(`<h3>${id?'Editează categoria':'Categorie nouă'}</h3><p class="sub">Apare în meniu, filtre și homepage</p>
    <div class="grid2">
      <div class="field"><label>Nume RO</label><input class="inp" id="cRo" value="${esc(c.ro)}"></div>
      <div class="field"><label>Nume EN</label><input class="inp" id="cEn" value="${esc(c.en)}"></div>
      <div class="field"><label>Imagine pătrată (cale)</label><input class="inp" id="cTile" value="${esc(c.tile||'')}"></div>
      <div class="field"><label>Imagine banner (cale)</label><input class="inp" id="cImg" value="${esc(c.img||'')}"></div>
      <div class="field"><label>ID (slug)</label><input class="inp" id="cId" value="${esc(c.id)}" ${id?'disabled':''}></div>
      <div class="field"><label>Subtitlu RO</label><input class="inp" id="cDro" value="${esc(c.desc_ro)}"></div>
      <div class="field"><label>Subtitlu EN</label><input class="inp" id="cDen" value="${esc(c.desc_en)}"></div>
    </div>
    <button class="btn btn-primary btn-block" onclick="saveCat('${id||''}')">💾 Salvează</button>`);
}
function saveCat(id){
  const g = i => document.getElementById(i).value.trim();
  if(!g('cRo')) return toast('Completează numele','err');
  const o = { ro:g('cRo'), en:g('cEn')||g('cRo'), tile:g('cTile')||'assets/img/logo-sm.png',
    img:g('cImg')||g('cTile')||'assets/img/logo-sm.png', desc_ro:g('cDro'), desc_en:g('cDen')||g('cDro') };
  if (id) Object.assign(DB.category(id), o);
  else {
    const slug = (g('cId') || g('cRo').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-')).replace(/^-|-$/g,'');
    if (DB.category(slug)) return toast('ID-ul există deja','err');
    DB.categories().push(Object.assign({ id:slug }, o));
  }
  closeMdl(); save(id?'Categorie actualizată':'Categorie adăugată');
}
function delCat(id){
  const n = DB.products().filter(p=>p.cat===id).length;
  if (n) return toast('Categoria are '+n+' produse. Mută-le întâi.','err');
  if(!confirm('Ștergi categoria?')) return;
  DB.data.categories = DB.categories().filter(c=>c.id!==id); save('Categorie ștearsă');
}

/* ================= VOUCHERS ================= */
function vVouchers(){
  const V = DB.vouchers();
  const used = DB.orders().filter(o=>o.voucher).length;
  const saved = DB.orders().reduce((s,o)=>s+(o.discount||0),0);
  return head('Vouchere','Creează coduri de reducere aplicabile pe coșul de cumpărături',
    `<button class="btn btn-primary btn-sm" onclick="editVoucher()">＋ Voucher nou</button>`) +
  `<div class="stats" style="grid-template-columns:repeat(3,1fr)">
    <div class="stat"><span class="e">🎟️</span><div><b>${V.filter(v=>v.active).length}</b><span>Vouchere active</span></div></div>
    <div class="stat"><span class="e" style="background:#e3f2fd">🧾</span><div><b>${used}</b><span>Comenzi cu voucher</span></div></div>
    <div class="stat"><span class="e" style="background:#fff4e0">💸</span><div><b>${money(saved)}</b><span>Reduceri acordate</span></div></div>
  </div>
  <div class="card"><div class="tbl-scroll"><table class="tb"><thead><tr>
    <th>Cod</th><th>Tip</th><th>Valoare</th><th>Coș minim</th><th>Utilizări</th><th>Expiră</th><th>Activ</th><th></th></tr></thead>
  <tbody>${V.map(v=>`<tr>
    <td><b style="letter-spacing:1px">${v.code}</b><div style="font-size:12px;color:#6b7168">${esc(v.desc_ro)}</div></td>
    <td>${{percent:'Procent',fixed:'Sumă fixă',shipping:'Livrare gratuită'}[v.type]}</td>
    <td><b>${v.type==='percent'?v.value+'%':v.type==='fixed'?money(v.value):'—'}</b></td>
    <td>${v.minCart?money(v.minCart):'—'}</td>
    <td>${v.uses} / ${v.maxUses}</td>
    <td>${v.expires}</td>
    <td><input type="checkbox" ${v.active?'checked':''} style="accent-color:#6d7f3f;width:17px;height:17px" onchange="toggleVoucher('${v.code}',this.checked)"></td>
    <td style="white-space:nowrap"><button class="btn btn-outline btn-sm" onclick="editVoucher('${v.code}')">✏️</button>
      <button class="btn btn-danger btn-sm" onclick="delVoucher('${v.code}')">🗑️</button></td></tr>`).join('')}</tbody></table></div></div>`;
}
function toggleVoucher(code,v){ DB.voucher(code).active=v; DB.save(); toast(v?'Voucher activat':'Voucher dezactivat','ok'); }
function delVoucher(code){ if(!confirm('Ștergi voucherul '+code+'?'))return;
  DB.data.vouchers = DB.vouchers().filter(v=>v.code!==code); save('Voucher șters'); }
function editVoucher(code){
  const v = code ? DB.voucher(code) : { code:'', type:'percent', value:10, minCart:0, active:true, uses:0, maxUses:100,
    expires:'2027-12-31', desc_ro:'', desc_en:'' };
  openMdl(`<h3>${code?'Editează voucher':'Voucher nou'}</h3><p class="sub">Ex: OFERTA10 → 10% reducere la tot coșul</p>
    <div class="grid2">
      <div class="field"><label>Cod</label><input class="inp" id="vCode" style="text-transform:uppercase" value="${esc(v.code)}" ${code?'disabled':''}></div>
      <div class="field"><label>Tip reducere</label><select class="inp" id="vType">
        <option value="percent" ${v.type==='percent'?'selected':''}>Procent din coș (%)</option>
        <option value="fixed" ${v.type==='fixed'?'selected':''}>Sumă fixă (lei)</option>
        <option value="shipping" ${v.type==='shipping'?'selected':''}>Livrare gratuită</option></select></div>
      <div class="field"><label>Valoare</label><input class="inp" id="vVal" type="number" step="0.1" value="${v.value}"></div>
      <div class="field"><label>Coș minim (lei)</label><input class="inp" id="vMin" type="number" value="${v.minCart}"></div>
      <div class="field"><label>Utilizări maxime</label><input class="inp" id="vMax" type="number" value="${v.maxUses}"></div>
      <div class="field"><label>Expiră la</label><input class="inp" id="vExp" type="date" value="${v.expires}"></div>
      <div class="field"><label>Descriere RO</label><input class="inp" id="vDro" value="${esc(v.desc_ro)}"></div>
      <div class="field"><label>Descriere EN</label><input class="inp" id="vDen" value="${esc(v.desc_en)}"></div>
    </div>
    <label style="display:flex;gap:8px;align-items:center;margin-bottom:16px"><input type="checkbox" id="vAct" ${v.active?'checked':''} style="accent-color:#6d7f3f"> Voucher activ</label>
    <button class="btn btn-primary btn-block" onclick="saveVoucher('${code||''}')">💾 Salvează voucherul</button>`);
}
function saveVoucher(code){
  const g = i => document.getElementById(i).value;
  const c = g('vCode').trim().toUpperCase();
  if (!code && (!c || DB.voucher(c))) return toast(!c?'Completează codul':'Codul există deja','err');
  const o = { type:g('vType'), value:+g('vVal')||0, minCart:+g('vMin')||0, maxUses:+g('vMax')||100,
    expires:g('vExp'), desc_ro:g('vDro')||'Reducere PUR&simplu', desc_en:g('vDen')||g('vDro')||'PUR&simplu discount',
    active:document.getElementById('vAct').checked };
  if (code) Object.assign(DB.voucher(code), o);
  else DB.vouchers().push(Object.assign({ code:c, uses:0 }, o));
  closeMdl(); save(code?'Voucher actualizat':'Voucher creat');
}

/* ================= USERS ================= */
function vUsers(){
  const U = DB.users();
  return head('Clienți', U.filter(u=>u.role==='client').length+' clienți înregistrați',
    `<button class="btn btn-primary btn-sm" onclick="editUser()">＋ Adaugă client</button>`) +
  `<div class="card"><div class="tbl-scroll"><table class="tb"><thead><tr>
    <th>Client</th><th>Contact</th><th>Adresă</th><th>Rol</th><th>Comenzi</th><th>Total</th><th>Înregistrat</th><th></th></tr></thead>
  <tbody>${U.map(u=>{ const os=DB.orders().filter(o=>o.userId===u.id);
    const tot=os.filter(o=>o.status!=='anulat').reduce((s,o)=>s+o.total,0);
    return `<tr>
      <td><b>${esc(u.name)}</b></td>
      <td>${esc(u.email)}<div style="font-size:12px;color:#6b7168">${esc(u.phone||'—')}</div></td>
      <td style="max-width:220px">${esc(u.address||'—')}</td>
      <td><span class="chip ${u.role==='admin'?'c-ship':'c-done'}">${u.role}</span></td>
      <td>${os.length}</td><td><b>${money(tot)}</b></td><td>${u.created}</td>
      <td style="white-space:nowrap"><button class="btn btn-outline btn-sm" onclick="editUser('${u.id}')">✏️</button>
        ${u.role!=='admin'?`<button class="btn btn-danger btn-sm" onclick="delUser('${u.id}')">🗑️</button>`:''}</td></tr>`;}).join('')}
  </tbody></table></div></div>`;
}
function editUser(id){
  const u = id ? DB.user(id) : { id:'', name:'', email:'', pass:'', phone:'', address:'', role:'client' };
  openMdl(`<h3>${id?'Editează client':'Client nou'}</h3><p class="sub">Datele contului folosit la autentificare</p>
    <div class="grid2">
      <div class="field"><label>Nume</label><input class="inp" id="uName" value="${esc(u.name)}"></div>
      <div class="field"><label>Email</label><input class="inp" id="uEmail" value="${esc(u.email)}"></div>
      <div class="field"><label>Telefon</label><input class="inp" id="uPhone" value="${esc(u.phone||'')}"></div>
      <div class="field"><label>Parolă</label><input class="inp" id="uPass" value="${esc(u.pass)}"></div>
      <div class="field"><label>Rol</label><select class="inp" id="uRole">
        <option value="client" ${u.role==='client'?'selected':''}>Client</option>
        <option value="admin" ${u.role==='admin'?'selected':''}>Administrator</option></select></div>
      <div class="field"><label>Adresă</label><input class="inp" id="uAddr" value="${esc(u.address||'')}"></div>
    </div>
    <button class="btn btn-primary btn-block" onclick="saveUser('${id||''}')">💾 Salvează</button>`);
}
function saveUser(id){
  const g = i => document.getElementById(i).value.trim();
  if(!g('uName')||!g('uEmail')) return toast('Completează numele și emailul','err');
  const o = { name:g('uName'), email:g('uEmail'), phone:g('uPhone'), pass:g('uPass')||'demo1234',
    address:g('uAddr'), role:g('uRole') };
  if (id) Object.assign(DB.user(id), o);
  else DB.users().push(Object.assign({ id:DB.uid('u_'), created:new Date().toISOString().slice(0,10) }, o));
  closeMdl(); save(id?'Client actualizat':'Client adăugat');
}
function delUser(id){ if(!confirm('Ștergi acest client?'))return;
  DB.data.users = DB.users().filter(u=>u.id!==id); save('Client șters'); }

/* ================= SETTINGS ================= */
function vSettings(){
  const s = DB.data.settings, st = s.store;
  return head('Setări','Configurări generale ale magazinului') +
  `<div class="card" style="max-width:680px">
    <h3>Livrare</h3>
    <div class="grid2">
      <div class="field"><label>Cost livrare (lei)</label><input class="inp" id="stShip" type="number" step="0.1" value="${s.shipping}"></div>
      <div class="field"><label>Livrare gratuită peste (lei)</label><input class="inp" id="stFree" type="number" value="${s.freeOver}"></div>
    </div>
    <h3 style="margin-top:10px">Date magazin</h3>
    <div class="grid2">
      <div class="field"><label>Adresă</label><input class="inp" id="stAddr" value="${esc(st.address)}"></div>
      <div class="field"><label>Telefon</label><input class="inp" id="stPhone" value="${esc(st.phone)}"></div>
      <div class="field"><label>Email</label><input class="inp" id="stEmail" value="${esc(st.email)}"></div>
      <div class="field"><label>Rating Google</label><input class="inp" id="stRate" type="number" step="0.1" value="${st.rating}"></div>
    </div>
    <button class="btn btn-primary" onclick="saveSettings()">💾 Salvează setările</button>
  </div>
  <div class="card" style="max-width:680px">
    <h3>Date demo</h3>
    <p style="color:#6b7168">Resetează baza de date locală la starea inițială (produse, comenzi, clienți, vouchere).</p>
    <button class="btn btn-outline" onclick="exportJSON()">⬇️ Export JSON</button>
    <button class="btn btn-danger" onclick="if(confirm('Resetezi toate datele?')){DB.reset();nav('dash');toast('Date resetate','ok')}">♻️ Resetează datele</button>
  </div>`;
}
function saveSettings(){
  const s = DB.data.settings;
  s.shipping = +document.getElementById('stShip').value || 0;
  s.freeOver = +document.getElementById('stFree').value || 0;
  s.store.address = document.getElementById('stAddr').value.trim();
  s.store.phone = document.getElementById('stPhone').value.trim();
  s.store.email = document.getElementById('stEmail').value.trim();
  s.store.rating = +document.getElementById('stRate').value || 5;
  save('Setări salvate');
}

/* ---------- boot ---------- */
(function(){ const u = Session.get(); if (u && u.role==='admin') boot(); })();
