/* ===== PUR&simplu – Storefront app ===== */
DB.load();
document.getElementById('flagRo').src = FLAG_RO;
document.getElementById('flagEn').src = FLAG_EN;

/* ---------- utils ---------- */
function toast(msg, type){
  const w = document.getElementById('toasts');
  const d = document.createElement('div');
  d.className = 'toast ' + (type||'');
  d.textContent = msg; w.appendChild(d);
  setTimeout(()=>{ d.style.opacity='0'; d.style.transition='.3s'; setTimeout(()=>d.remove(),300); }, 2400);
}
const esc = s => String(s??'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const stars = r => '★'.repeat(Math.round(r)) + '☆'.repeat(5-Math.round(r));
const fmtDate = d => new Date(d).toLocaleDateString(LANG==='ro'?'ro-RO':'en-GB',{day:'2-digit',month:'short',year:'numeric'});
const stockCls = s => s<=0 ? 'st-out' : s<=10 ? 'st-low' : 'st-in';
const stockTxt = s => s<=0 ? t('out_stock') : s<=10 ? t('low_stock') : t('in_stock');
const statusCls = {nou:'c-new',preparare:'c-prep',livrare:'c-ship',finalizat:'c-done',anulat:'c-cancel'};

/* ---------- header state ---------- */
function refreshHeader(){
  const u = Session.get(), tt = Cart.totals();
  document.getElementById('cartCount').textContent = Cart.count();
  document.getElementById('cartTotal').textContent = money(tt.total);
  document.getElementById('accMeta').textContent = u ? t('hi') : t('account');
  document.getElementById('accLabel').textContent = u ? u.name.split(' ')[0] : t('login');
}
function buildMega(){
  const m = document.getElementById('megaMenu');
  m.innerHTML = DB.categories().map(c =>
    `<a href="#/shop?cat=${c.id}"><span class="emo"><img src="${c.tile}" alt=""></span>
     <span>${tn(c)}<br><small style="color:#6b7168;font-weight:500">${LANG==='en'?c.desc_en:c.desc_ro}</small></span></a>`).join('');
}
function buildFootHours(){
  const el = document.getElementById('footHours'); if(!el) return;
  const st = DB.data.settings.store;
  el.innerHTML = (LANG==='en'?st.hours_en:st.hours_ro).map(h=>`<div>${h}</div>`).join('');
}
function toggleMega(e){ e.stopPropagation(); document.getElementById('megaMenu').classList.toggle('hidden'); }
document.addEventListener('click', ()=> document.getElementById('megaMenu').classList.add('hidden'));

/* ---------- product card ---------- */
function card(p){
  const out = p.stock <= 0;
  const tagTxt = {sale:'-'+Math.round((1-p.price/p.oldPrice)*100)+'%', new:t('f_new'), bio:'BIO'}[p.tag] || '';
  return `<article class="prod">
    ${p.tag ? `<span class="tag ${p.tag}">${tagTxt}</span>` : ''}
    <div class="thumb" onclick="go('#/product/${p.id}')"><img src="${p.img}" alt="${esc(tn(p))}" loading="lazy"></div>
    <span class="cat-lbl">${tn(DB.category(p.cat))}</span>
    <h3 onclick="go('#/product/${p.id}')">${esc(tn(p))}</h3>
    <div class="stars">${stars(p.rating)}<span>${p.rating.toFixed(1)}</span></div>
    <div class="price">${money(p.price)} ${p.oldPrice?`<span class="old">${money(p.oldPrice)}</span>`:''}
      <div class="unit">/ ${esc(p.unit)}</div></div>
    <div class="row">
      <span class="stock-pill ${stockCls(p.stock)}">${stockTxt(p.stock)}</span>
      <button class="add-btn" ${out?'disabled':''} onclick="addToCart('${p.id}')" title="${t('add')}">+</button>
    </div></article>`;
}

/* ---------- cart ---------- */
function addToCart(id, qty){
  const p = DB.product(id); if (!p || p.stock<=0) return;
  const c = Cart.get(); const it = c.items.find(i=>i.id===id);
  const q = qty || 1;
  if (it){ it.qty = Math.min(it.qty + q, p.stock); } else c.items.push({ id, qty: Math.min(q, p.stock) });
  Cart.set(c); refreshHeader(); renderCart(); toggleCart(true);
  toast(`${t('added')}: ${tn(p)}`, 'ok');
}
function setQty(id, d){
  const c = Cart.get(), it = c.items.find(i=>i.id===id); if (!it) return;
  const p = DB.product(id);
  it.qty += d;
  if (it.qty <= 0) c.items = c.items.filter(i=>i.id!==id);
  else it.qty = Math.min(it.qty, p.stock);
  Cart.set(c); refreshHeader(); renderCart(); if (location.hash.startsWith('#/checkout')) router();
}
function removeItem(id){ const c = Cart.get(); c.items = c.items.filter(i=>i.id!==id); Cart.set(c);
  refreshHeader(); renderCart(); toast(t('removed')); if (location.hash.startsWith('#/checkout')) router(); }
function toggleCart(on){
  document.getElementById('cartDrawer').classList.toggle('on', on);
  document.getElementById('overlay').classList.toggle('on', on);
  if (on) renderCart();
}
function applyVoucher(code){
  code = String(code||'').trim().toUpperCase();
  const v = DB.voucher(code), tt = Cart.totals();
  if (!v || !v.active || (v.expires && new Date(v.expires) < new Date())) return toast(t('voucher_bad'), 'err');
  if (tt.sub < v.minCart) return toast(`${t('voucher_min')}: ${money(v.minCart)}`, 'err');
  const c = Cart.get(); c.voucher = v.code; Cart.set(c);
  refreshHeader(); renderCart(); if (location.hash.startsWith('#/checkout')) router();
  toast(`${t('voucher_ok')}: ${v.code}`, 'ok');
}
function clearVoucher(){ const c = Cart.get(); c.voucher = null; Cart.set(c);
  refreshHeader(); renderCart(); if (location.hash.startsWith('#/checkout')) router(); }

function renderCart(){
  const c = Cart.get(), tt = Cart.totals();
  const body = document.getElementById('cartBody'), foot = document.getElementById('cartFoot');
  if (!c.items.length){
    body.innerHTML = `<div class="empty"><span class="e">🛒</span><b>${t('cart_empty')}</b><p>${t('cart_empty_p')}</p>
      <button class="btn btn-primary" onclick="toggleCart(false);go('#/shop')">${t('continue_shop')}</button></div>`;
    foot.innerHTML = ''; return;
  }
  body.innerHTML = c.items.map(i=>{ const p = DB.product(i.id); if(!p) return '';
    return `<div class="ci"><div class="th"><img src="${p.img}" alt=""></div>
      <div style="flex:1">
        <b>${esc(tn(p))}</b><span style="font-size:12px;color:#6b7168">${esc(p.unit)}</span>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:7px">
          <span class="qty"><button onclick="setQty('${p.id}',-1)">−</button><span>${i.qty}</span><button onclick="setQty('${p.id}',1)">+</button></span>
          <span class="p">${money(p.price*i.qty)}</span>
        </div>
      </div>
      <button style="border:0;background:0;cursor:pointer;color:#e53935" onclick="removeItem('${p.id}')">✕</button>
    </div>`;}).join('');

  foot.innerHTML = `
    ${tt.voucher ? `<div class="vch-on"><span>🎟️ ${tt.voucher.code} · ${LANG==='en'?tt.voucher.desc_en:tt.voucher.desc_ro}</span><button onclick="clearVoucher()">✕</button></div>`
      : `<div class="voucher-box"><input class="inp" id="vchIn" placeholder="${t('voucher_ph')}">
         <button class="btn btn-outline" onclick="applyVoucher(document.getElementById('vchIn').value)">${t('apply')}</button></div>`}
    <div class="sum-row"><span>${t('subtotal')}</span><b style="color:#2b2b28">${money(tt.sub)}</b></div>
    ${tt.disc ? `<div class="sum-row disc"><span>${t('discount')}</span><b>− ${money(tt.disc)}</b></div>`:''}
    <div class="sum-row"><span>${t('shipping')}</span><b style="color:#2b2b28">${tt.ship? money(tt.ship) : t('free')}</b></div>
    <div class="sum-row total"><span>${t('total')}</span><span>${money(tt.total)}</span></div>
    <button class="btn btn-primary btn-block" style="margin-top:14px" onclick="toggleCart(false);go('#/checkout')">${t('checkout')} →</button>`;
}

/* ---------- auth ---------- */
function openAccount(){ Session.get() ? go('#/account') : openAuth(); }
function openAuth(){ document.getElementById('authModal').classList.add('on'); }
function closeAuth(){ document.getElementById('authModal').classList.remove('on'); }
function authTab(w){
  document.getElementById('tabLogin').classList.toggle('active', w==='login');
  document.getElementById('tabReg').classList.toggle('active', w==='reg');
  document.getElementById('authLogin').classList.toggle('hidden', w!=='login');
  document.getElementById('authReg').classList.toggle('hidden', w!=='reg');
}
function doLogin(){
  const e = document.getElementById('liEmail').value.trim().toLowerCase();
  const p = document.getElementById('liPass').value;
  const u = DB.users().find(x=>x.email.toLowerCase()===e && x.pass===p);
  if (!u) return toast(LANG==='ro'?'Email sau parolă greșite':'Wrong email or password','err');
  const guest = Cart.get();
  Session.set(u);
  if (guest.items.length){ const c = Cart.get();
    guest.items.forEach(g=>{ const f=c.items.find(i=>i.id===g.id); f? f.qty+=g.qty : c.items.push(g); });
    c.voucher = c.voucher || guest.voucher; Cart.set(c); localStorage.removeItem('pursimplu_cart_guest'); }
  closeAuth(); refreshHeader();
  toast(`${t('hi')}, ${u.name.split(' ')[0]}!`,'ok');
  if (u.role==='admin'){ setTimeout(()=>{ if(confirm(LANG==='ro'?'Ești admin. Deschizi panoul de administrare?':'You are admin. Open the admin panel?')) location.href='admin.html'; },300); }
  else go('#/account');
}
function doRegister(){
  const n=document.getElementById('rgName').value.trim(), e=document.getElementById('rgEmail').value.trim().toLowerCase(),
        ph=document.getElementById('rgPhone').value.trim(), p=document.getElementById('rgPass').value,
        a=document.getElementById('rgAddr').value.trim();
  if (!n||!e||!p) return toast(LANG==='ro'?'Completează numele, emailul și parola':'Fill in name, email and password','err');
  if (p.length<6) return toast(LANG==='ro'?'Parola: minim 6 caractere':'Password: min 6 characters','err');
  if (DB.users().some(x=>x.email.toLowerCase()===e)) return toast(LANG==='ro'?'Emailul există deja':'Email already registered','err');
  const u = { id:DB.uid('u_'), name:n, email:e, pass:p, role:'client', phone:ph, address:a, created:new Date().toISOString().slice(0,10) };
  DB.users().push(u); DB.save(); Session.set(u); closeAuth(); refreshHeader();
  toast(LANG==='ro'?'Cont creat. Bine ai venit!':'Account created. Welcome!','ok'); go('#/account');
}
function logout(){ Session.clear(); refreshHeader(); toast(t('logged_out')); go('#/'); }

/* ---------- routing ---------- */
function go(h){ location.hash = h; window.scrollTo({top:0,behavior:'smooth'}); }
function doSearch(){
  const q = document.getElementById('searchInput').value.trim();
  go(q ? '#/shop?q=' + encodeURIComponent(q) : '#/shop');
}
document.getElementById('searchInput').addEventListener('keydown', e=>{ if(e.key==='Enter') doSearch(); });

function parseHash(){
  const h = location.hash.replace(/^#/,'') || '/';
  const [path, qs] = h.split('?');
  return { parts: path.split('/').filter(Boolean), q: new URLSearchParams(qs||'') };
}
window.addEventListener('hashchange', router);
window.onLangChange = () => { buildMega(); buildFootHours(); refreshHeader(); renderCart(); router(); };

function router(){
  const { parts, q } = parseHash();
  const v = document.getElementById('view');
  const hash = location.hash || '#/';
  document.querySelectorAll('.nav-links a').forEach(a=>a.classList.toggle('active', a.getAttribute('href')===hash));
  switch(parts[0]){
    case undefined:   v.innerHTML = viewHome(); break;
    case 'shop':      v.innerHTML = viewShop(q); bindShop(); break;
    case 'product':   v.innerHTML = viewProduct(parts[1]); break;
    case 'checkout':  v.innerHTML = viewCheckout(); break;
    case 'account':   v.innerHTML = viewAccount(q.get('tab')||'orders'); break;
    case 'order':     v.innerHTML = viewOrder(parts[1]); break;
    case 'about':     v.innerHTML = viewAbout(); break;
    case 'contact':   v.innerHTML = viewContact(); break;
    default:          v.innerHTML = `<div class="container page"><div class="empty"><span class="e">🤷</span><b>404</b></div></div>`;
  }
  refreshHeader();
}

/* ---------- reviews ---------- */
const REVIEWS = [
  { n:'Andreea M.', r:5,
    ro:'Cea mai bună pâine cu maia din zonă și o selecție de brânzeturi cum rar găsești. Oamenii sunt extrem de amabili și îți explică de la ce producător vine fiecare produs.',
    en:'The best sourdough bread around and a cheese selection you rarely find. The staff are lovely and explain which producer each product comes from.' },
  { n:'Radu P.', r:5,
    ro:'Magazin mic, dar cu produse alese cu cap. Zacusca și dulcețurile sunt exact ca la bunica. Am devenit client fix.',
    en:'A small shop with very well chosen products. The zacuscă and jams taste just like my grandmother had. I have become a regular.' },
  { n:'Ioana D.', r:5,
    ro:'Legume proaspete, ouă de țară, carne de la măcelării locale. Prețurile sunt corecte pentru calitatea pe care o primești.',
    en:'Fresh vegetables, farm eggs, meat from local butchers. Prices are fair for the quality you get.' },
  { n:'Mihai V.', r:4,
    ro:'Îmi place conceptul de băcănie contemporană. Aș vrea program și lunea, dar altfel nu am ce reproșa.',
    en:'I love the contemporary grocery concept. I wish they were open on Mondays too, but otherwise nothing to complain about.' }
];
function viewReviews(){
  const st = DB.data.settings.store;
  return `<div class="sec-head"><div><h2>${t('rev_h')}</h2>
      <p style="margin:4px 0 0;color:var(--muted);font-size:14px">${t('rev_sub')}</p></div>
    <div class="rev-score"><b>${st.rating.toFixed(1)}</b>
      <span class="stars" style="font-size:15px;margin:0">${stars(st.rating)}</span>
      <span>${st.reviewCount} ${t('rev_google')}</span></div></div>
  <div class="rev-grid">${REVIEWS.map(r=>`<figure class="rev">
      <div class="stars">${stars(r.r)}</div>
      <blockquote>${esc(LANG==='en'?r.en:r.ro)}</blockquote>
      <figcaption><span class="av">${esc(r.n[0])}</span><span><b>${esc(r.n)}</b><small>Google</small></span></figcaption>
    </figure>`).join('')}</div>`;
}

/* ---------- HOME ---------- */
function viewHome(){
  const P = DB.products().filter(p=>p.active);
  const sale = P.filter(p=>p.tag==='sale').slice(0,5);
  const nou  = P.filter(p=>p.tag==='new').concat(P.filter(p=>p.tag==='bio')).slice(0,5);
  return `<div class="container page">

    <!-- 1. HERO -->
    <section class="hero">
      <div>
        <span class="kicker">${t('hero_kick')}</span>
        <h1>${t('hero_h1')}</h1>
        <p>${t('hero_p')}</p>
        <button class="btn btn-primary" onclick="go('#/shop')">${t('hero_cta')} →</button>
        <button class="btn btn-outline" onclick="go('#/shop?tag=sale')" style="margin-left:8px">${t('hero_cta2')}</button>
      </div>
      <div class="hero-art"><img src="assets/img/hero.jpg" alt="PUR&simplu"></div>
    </section>

    <!-- 2. CELE 4 AVANTAJE -->
    <div class="usp">
      <div><span class="e">🚚</span><div><b>${t('usp1')}</b><span>${t('usp1s')}</span></div></div>
      <div><span class="e">🌱</span><div><b>${t('usp2')}</b><span>${t('usp2s')}</span></div></div>
      <div><span class="e">🔒</span><div><b>${t('usp3')}</b><span>${t('usp3s')}</span></div></div>
      <div><span class="e">↩️</span><div><b>${t('usp4')}</b><span>${t('usp4s')}</span></div></div>
    </div>

    <!-- 3. CUMPĂRĂ PE CATEGORII -->
    <div class="sec-head"><h2>${t('cats_h')}</h2><a href="#/shop">${t('cats_all')} →</a></div>
    <div class="cat-grid">${DB.categories().map(c=>`
      <div class="cat-card" onclick="go('#/shop?cat=${c.id}')">
        <span class="e"><img src="${c.tile}" alt="${tn(c)}" loading="lazy"></span><b>${tn(c)}</b>
        <span>${P.filter(p=>p.cat===c.id).length} ${LANG==='ro'?'produse':'products'}</span>
      </div>`).join('')}</div>

    <!-- 4. CELE 3 BANNERE -->
    <div class="banners">
      <div class="bann b1"><h4>${t('b1t')}</h4><p>${t('b1p')}</p><button class="btn btn-outline btn-sm" onclick="go('#/shop?cat=fructe')">${t('b_cta')}</button><img class="be" src="assets/img/cat/fructe.jpg" alt=""></div>
      <div class="bann b2"><h4>${t('b2t')}</h4><p>${t('b2p')}</p><button class="btn btn-outline btn-sm" onclick="go('#/shop?cat=carne')">${t('b_cta')}</button><img class="be" src="assets/img/cat/carne.jpg" alt=""></div>
      <div class="bann b3"><h4>${t('b3t')}</h4><p>${t('b3p')}</p><button class="btn btn-outline btn-sm" onclick="go('#/shop?cat=conserve')">${t('b_cta')}</button><img class="be" src="assets/img/cat/conserve.jpg" alt=""></div>
    </div>

    <!-- 5. LA PREȚ REDUS -->
    <div class="sec-head"><h2>${t('offers_h')}</h2><a href="#/shop?tag=sale">${t('view_all')} →</a></div>
    <div class="prod-grid">${sale.map(card).join('')}</div>

    <!-- 6. NOUTĂȚI ÎN BĂCĂNIE -->
    <div class="sec-head"><h2>${t('new_h')}</h2><a href="#/shop?tag=new">${t('view_all')} →</a></div>
    <div class="prod-grid">${nou.map(card).join('')}</div>

    <!-- 7. RECENZII -->
    ${viewReviews()}
  </div>`;
}

/* ---------- SHOP (filtre derivate 100% din URL) ---------- */
const SHOP_DEFAULTS = { cats:[], tags:[], inStock:false, sort:'pop', q:'', max:0 };
let SHOP = Object.assign({}, SHOP_DEFAULTS);

function shopUrl(s){
  const p = new URLSearchParams();
  if (s.cats.length) p.set('cat', s.cats.join(','));
  if (s.tags.length) p.set('tag', s.tags.join(','));
  if (s.inStock) p.set('stock', '1');
  if (s.sort && s.sort !== 'pop') p.set('sort', s.sort);
  if (s.max) p.set('max', s.max);
  if (s.q) p.set('q', s.q);
  const qs = p.toString();
  return '#/shop' + (qs ? '?' + qs : '');
}
function applyShopState(){ location.hash = shopUrl(SHOP); }

function viewShop(q){
  /* starea vine EXCLUSIV din URL — fără parametri = magazin curat, fără filtre reziduale */
  SHOP = {
    cats:    q.get('cat') ? q.get('cat').split(',').filter(Boolean) : [],
    tags:    q.get('tag') ? q.get('tag').split(',').filter(Boolean) : [],
    inStock: q.get('stock') === '1',
    sort:    q.get('sort') || 'pop',
    q:       q.get('q') || '',
    max:     +q.get('max') || 0
  };
  const si = document.getElementById('searchInput');
  if (si && si.value !== SHOP.q) si.value = SHOP.q;

  const maxPrice = Math.ceil(Math.max(...DB.products().map(p=>p.price)));
  const curMax = SHOP.max || maxPrice;
  const list = filterProducts();
  const tagLbl = { sale:t('f_sale'), bio:t('f_bio'), new:t('f_new') };
  const chips = [
    ...SHOP.cats.map(c=>({ l:tn(DB.category(c)||{ro:c,en:c}), k:'cat', v:c })),
    ...SHOP.tags.map(x=>({ l:tagLbl[x]||x, k:'tag', v:x })),
    ...(SHOP.inStock ? [{ l:t('f_instock'), k:'stock', v:'1' }] : []),
    ...(SHOP.q ? [{ l:'"'+SHOP.q+'"', k:'q', v:SHOP.q }] : []),
    ...(SHOP.max ? [{ l:'≤ '+SHOP.max+' lei', k:'max', v:SHOP.max }] : [])
  ];

  return `<div class="container page">
    <div class="crumbs"><a href="#/">${t('nav_home')}</a> / ${t('nav_shop')}${SHOP.q?` / "${esc(SHOP.q)}"`:''}</div>
    <div class="shop-layout">
      <aside>
        <div class="panel">
          <h4>${t('f_cat')}</h4>
          <div class="filter-list">${DB.categories().map(c=>`
            <label><input type="checkbox" class="fCat" value="${c.id}" ${SHOP.cats.includes(c.id)?'checked':''}>
            ${tn(c)} <span style="margin-left:auto;color:#9aa192;font-size:12px">${DB.products().filter(p=>p.cat===c.id&&p.active).length}</span></label>`).join('')}</div>
          <h4 style="margin-top:20px">${t('f_price')}</h4>
          <input type="range" id="fPrice" min="5" max="${maxPrice}" value="${curMax}" style="width:100%;accent-color:#6d7f3f">
          <div style="font-size:13px;color:#6b7168">0 — <b id="fPriceVal">${curMax}</b> lei</div>
          <h4 style="margin-top:20px">${t('f_tag')}</h4>
          <div class="filter-list">
            <label><input type="checkbox" class="fTag" value="sale" ${SHOP.tags.includes('sale')?'checked':''}> 🔥 ${t('f_sale')}</label>
            <label><input type="checkbox" class="fTag" value="bio" ${SHOP.tags.includes('bio')?'checked':''}> 🌱 ${t('f_bio')}</label>
            <label><input type="checkbox" class="fTag" value="new" ${SHOP.tags.includes('new')?'checked':''}> ✨ ${t('f_new')}</label>
          </div>
          <h4 style="margin-top:20px">${t('f_avail')}</h4>
          <div class="filter-list"><label><input type="checkbox" id="fStock" ${SHOP.inStock?'checked':''}> ${t('f_instock')}</label></div>
          <button class="btn btn-outline btn-block btn-sm" style="margin-top:16px" onclick="clearFilters()">${t('f_clear')}</button>
        </div>
      </aside>
      <div>
        <div class="toolbar">
          <span><b>${list.length}</b> ${t('results')}</span>
          <div><label style="font-size:13px;color:#6b7168">${t('sort_by')}</label>
            <select id="fSort">
              <option value="pop" ${SHOP.sort==='pop'?'selected':''}>${t('s_pop')}</option>
              <option value="pmin" ${SHOP.sort==='pmin'?'selected':''}>${t('s_pmin')}</option>
              <option value="pmax" ${SHOP.sort==='pmax'?'selected':''}>${t('s_pmax')}</option>
              <option value="name" ${SHOP.sort==='name'?'selected':''}>${t('s_name')}</option>
              <option value="rate" ${SHOP.sort==='rate'?'selected':''}>${t('s_rate')}</option>
            </select></div>
        </div>
        ${chips.length ? `<div class="chips-bar"><span class="cb-lbl">${t('active_filters')}</span>
          ${chips.map(c=>`<button class="fchip" onclick="dropFilter('${c.k}','${esc(String(c.v))}')">${esc(c.l)} <i>✕</i></button>`).join('')}
          <button class="fchip clear" onclick="clearFilters()">${t('f_clear')}</button></div>`:''}
        <div class="prod-grid">${ list.length ? list.map(card).join('')
          : `<div class="empty" style="grid-column:1/-1"><span class="e">🔍</span><b>${t('no_res')}</b><p>${t('no_res_p')}</p>
             <button class="btn btn-primary" style="margin-top:10px" onclick="clearFilters()">${t('f_clear')}</button></div>` }</div>
      </div>
    </div></div>`;
}
function filterProducts(){
  let L = DB.products().filter(p=>p.active);
  if (SHOP.cats.length) L = L.filter(p=>SHOP.cats.includes(p.cat));
  if (SHOP.tags.length) L = L.filter(p=>SHOP.tags.includes(p.tag));
  if (SHOP.inStock) L = L.filter(p=>p.stock>0);
  if (SHOP.max) L = L.filter(p=>p.price <= SHOP.max);
  if (SHOP.q){ const s = SHOP.q.toLowerCase();
    L = L.filter(p => (p.name_ro+' '+p.name_en+' '+tn(DB.category(p.cat))).toLowerCase().includes(s)); }
  const srt = { pmin:(a,b)=>a.price-b.price, pmax:(a,b)=>b.price-a.price,
    name:(a,b)=>tn(a).localeCompare(tn(b)), rate:(a,b)=>b.rating-a.rating,
    pop:(a,b)=>(b.featured?1:0)-(a.featured?1:0)||b.rating-a.rating };
  return L.sort(srt[SHOP.sort] || srt.pop);
}
function bindShop(){
  document.querySelectorAll('.fCat').forEach(c=>c.onchange=()=>{
    SHOP.cats=[...document.querySelectorAll('.fCat:checked')].map(x=>x.value); applyShopState(); });
  document.querySelectorAll('.fTag').forEach(c=>c.onchange=()=>{
    SHOP.tags=[...document.querySelectorAll('.fTag:checked')].map(x=>x.value); applyShopState(); });
  const st = document.getElementById('fStock'); if(st) st.onchange = ()=>{ SHOP.inStock = st.checked; applyShopState(); };
  const so = document.getElementById('fSort'); if(so) so.onchange = ()=>{ SHOP.sort = so.value; applyShopState(); };
  const pr = document.getElementById('fPrice');
  if (pr){ pr.oninput = ()=> document.getElementById('fPriceVal').textContent = pr.value;
           pr.onchange = ()=>{ SHOP.max = +pr.value; applyShopState(); }; }
}
function dropFilter(kind, val){
  if (kind==='cat')   SHOP.cats = SHOP.cats.filter(x=>x!==val);
  if (kind==='tag')   SHOP.tags = SHOP.tags.filter(x=>x!==val);
  if (kind==='stock') SHOP.inStock = false;
  if (kind==='max')   SHOP.max = 0;
  if (kind==='q'){ SHOP.q = ''; const si=document.getElementById('searchInput'); if(si) si.value=''; }
  applyShopState();
}
function clearFilters(){
  SHOP = Object.assign({}, SHOP_DEFAULTS);
  const si = document.getElementById('searchInput'); if (si) si.value = '';
  if (location.hash === '#/shop') router(); else location.hash = '#/shop';
}

function viewProduct(id){
  const p = DB.product(id); if (!p) return `<div class="container page"><div class="empty">404</div></div>`;
  const rel = DB.products().filter(x=>x.cat===p.cat && x.id!==p.id && x.active).slice(0,5);
  return `<div class="container page">
    <div class="crumbs"><a href="#/">${t('nav_home')}</a> / <a href="#/shop?cat=${p.cat}">${tn(DB.category(p.cat))}</a> / ${esc(tn(p))}</div>
    <div class="pd">
      <div class="big"><img src="${p.img}" alt="${esc(tn(p))}"></div>
      <div>
        <span class="cat-lbl">${tn(DB.category(p.cat))}</span>
        <h1>${esc(tn(p))}</h1>
        <div class="stars">${stars(p.rating)} <span>${p.rating.toFixed(1)} · 128 ${LANG==='ro'?'recenzii':'reviews'}</span></div>
        <div class="pprice">${money(p.price)} ${p.oldPrice?`<span class="old">${money(p.oldPrice)}</span>`:''}
          <span style="font-size:14px;color:#6b7168;font-weight:500"> / ${esc(p.unit)}</span></div>
        <span class="stock-pill ${stockCls(p.stock)}">${stockTxt(p.stock)} · ${p.stock} ${LANG==='ro'?'buc':'pcs'}</span>
        <p class="desc" style="margin-top:16px">${esc(td(p))}</p>
        <div style="display:flex;gap:12px;align-items:center;margin-top:22px">
          <span class="qty" style="height:44px"><button onclick="pdQty(-1)">−</button><span id="pdQty">1</span><button onclick="pdQty(1)">+</button></span>
          <button class="btn btn-primary" ${p.stock<=0?'disabled':''} onclick="addToCart('${p.id}', +document.getElementById('pdQty').textContent)">🛒 ${t('add')}</button>
        </div>
        <div class="meta-list">
          <div><b>${t('pd_sku')}:</b> ${p.id.toUpperCase()}</div>
          <div><b>${t('pd_cat')}:</b> ${tn(DB.category(p.cat))}</div>
          <div><b>${t('pd_unit')}:</b> ${esc(p.unit)}</div>
          <div>🚚 ${t('usp1')} · ↩️ ${t('usp4')}</div>
        </div>
      </div>
    </div>
    <div class="sec-head"><h2>${LANG==='ro'?'Produse similare':'Related products'}</h2></div>
    <div class="prod-grid">${rel.map(card).join('')}</div>
  </div>`;
}
function pdQty(d){ const e=document.getElementById('pdQty'); e.textContent = Math.max(1, +e.textContent + d); }

function viewCheckout(){
  const c = Cart.get(), tt = Cart.totals(), u = Session.get();
  if (!c.items.length) return `<div class="container page"><div class="empty"><span class="e">🛒</span><b>${t('cart_empty')}</b>
    <p>${t('cart_empty_p')}</p><button class="btn btn-primary" onclick="go('#/shop')">${t('continue_shop')}</button></div></div>`;
  return `<div class="container page">
    <div class="crumbs"><a href="#/">${t('nav_home')}</a> / ${t('co_title')}</div>
    <h1 style="margin:0 0 22px">${t('co_title')}</h1>
    <div class="shop-layout" style="grid-template-columns:1fr 380px">
      <div class="panel">
        <h4>${t('co_data')}</h4>
        ${!u ? `<div class="hint" style="margin:0 0 16px">${t('need_login')} — <a href="javascript:openAuth()" style="color:#6d7f3f;font-weight:700">${t('login')}</a></div>`:''}
        <div class="grid2">
          <div class="field"><label>${t('name')}</label><input class="inp" id="coName" value="${esc(u?u.name:'')}"></div>
          <div class="field"><label>${t('email')}</label><input class="inp" id="coEmail" value="${esc(u?u.email:'')}"></div>
        </div>
        <div class="field"><label>${t('phone')}</label><input class="inp" id="coPhone" value="${esc(u?u.phone:'')}"></div>
        <div class="field"><label>${t('address')}</label><input class="inp" id="coAddr" value="${esc(u?u.address:'')}"></div>
        <div class="field"><label>${t('note')}</label><textarea class="inp" id="coNote" rows="2"></textarea></div>
        <h4 style="margin-top:8px">${t('payment')}</h4>
        <div class="filter-list">
          <label><input type="radio" name="pay" value="card" checked> 💳 ${t('pay_card')}</label>
          <label><input type="radio" name="pay" value="ramburs"> 💵 ${t('pay_cash')}</label>
        </div>
      </div>
      <div class="panel">
        <h4>${t('co_summary')}</h4>
        ${c.items.map(i=>{const p=DB.product(i.id); return `<div class="ci"><div class="th"><img src="${p.img}" alt=""></div>
          <div style="flex:1"><b>${esc(tn(p))}</b><span style="font-size:12px;color:#6b7168">${i.qty} × ${money(p.price)}</span></div>
          <span class="p">${money(p.price*i.qty)}</span></div>`;}).join('')}
        <div style="margin-top:14px">
        ${tt.voucher ? `<div class="vch-on"><span>🎟️ ${tt.voucher.code}</span><button onclick="clearVoucher()">✕</button></div>`
          : `<div class="voucher-box"><input class="inp" id="vchIn2" placeholder="${t('voucher_ph')}">
             <button class="btn btn-outline" onclick="applyVoucher(document.getElementById('vchIn2').value)">${t('apply')}</button></div>`}
        <div class="sum-row"><span>${t('subtotal')}</span><b style="color:#2b2b28">${money(tt.sub)}</b></div>
        ${tt.disc?`<div class="sum-row disc"><span>${t('discount')}</span><b>− ${money(tt.disc)}</b></div>`:''}
        <div class="sum-row"><span>${t('shipping')}</span><b style="color:#2b2b28">${tt.ship?money(tt.ship):t('free')}</b></div>
        <div class="sum-row total"><span>${t('total')}</span><span>${money(tt.total)}</span></div>
        <button class="btn btn-primary btn-block" style="margin-top:16px" onclick="placeOrder()">${t('place')}</button>
        </div>
      </div>
    </div></div>`;
}
function placeOrder(){
  const u = Session.get();
  if (!u) { toast(t('need_login'),'err'); return openAuth(); }
  const name=document.getElementById('coName').value.trim(), email=document.getElementById('coEmail').value.trim(),
        phone=document.getElementById('coPhone').value.trim(), addr=document.getElementById('coAddr').value.trim();
  if (!name||!email||!phone||!addr) return toast(LANG==='ro'?'Completează toate câmpurile de livrare':'Fill in all delivery fields','err');
  const c = Cart.get(), tt = Cart.totals();
  const items = c.items.map(i=>{ const p=DB.product(i.id);
    return { id:p.id, name_ro:p.name_ro, name_en:p.name_en, img:p.img, price:p.price, qty:i.qty }; });
  items.forEach(i=>{ const p = DB.product(i.id); p.stock = Math.max(0, p.stock - i.qty); });
  const o = { id:'PS-'+Math.floor(1000+Math.random()*8999), userId:u.id, customer:name, email, phone, address:addr,
    items, subtotal:tt.sub, discount:tt.disc, voucher:tt.voucher?tt.voucher.code:null, shipping:tt.ship,
    total:tt.total, status:'nou', payment:[...document.getElementsByName('pay')].find(r=>r.checked).value,
    date:new Date().toISOString(), note:document.getElementById('coNote').value.trim() };
  DB.orders().unshift(o);
  if (tt.voucher){ const v = DB.voucher(tt.voucher.code); v.uses++; }
  DB.save(); Cart.set({ items:[], voucher:null }); refreshHeader();
  toast(t('order_ok'),'ok'); go('#/order/'+o.id);
}

function viewAccount(tab){
  const u = Session.get();
  if (!u){ setTimeout(openAuth,100);
    return `<div class="container page"><div class="empty"><span class="e">🔐</span><b>${t('need_login')}</b>
      <button class="btn btn-primary" style="margin-top:12px" onclick="openAuth()">${t('login')}</button></div></div>`; }
  const my = DB.orders().filter(o=>o.userId===u.id);
  const spent = my.filter(o=>o.status!=='anulat').reduce((s,o)=>s+o.total,0);
  const tabs = [['orders','📦 '+t('acc_orders')],['profile','👤 '+t('acc_profile')],['vouchers','🎟️ '+t('acc_vouchers')]];
  let body = '';
  if (tab==='orders'){
    body = my.length ? `<div class="tbl-scroll"><table class="tb"><thead><tr>
        <th>${t('o_no')}</th><th>${t('o_date')}</th><th>${t('o_items')}</th><th>${t('o_total')}</th><th>${t('o_status')}</th><th></th></tr></thead>
      <tbody>${my.map(o=>`<tr>
        <td><b>${o.id}</b></td><td>${fmtDate(o.date)}</td>
        <td><span class="mini-thumbs">${o.items.slice(0,4).map(i=>`<img src="${i.img||'assets/img/logo-sm.png'}" alt="">`).join('')}</span>${o.items.length>4?' +'+(o.items.length-4):''}</td>
        <td><b>${money(o.total)}</b></td>
        <td><span class="chip ${statusCls[o.status]}">${t('st_'+o.status)}</span></td>
        <td><button class="btn btn-outline btn-sm" onclick="go('#/order/${o.id}')">${t('o_details')}</button></td>
      </tr>`).join('')}</tbody></table></div>`
      : `<div class="empty"><span class="e">📦</span><b>${t('no_orders')}</b><p>${t('no_orders_p')}</p>
         <button class="btn btn-primary" onclick="go('#/shop')">${t('continue_shop')}</button></div>`;
  } else if (tab==='profile'){
    body = `<div class="grid2">
      <div class="field"><label>${t('name')}</label><input class="inp" id="pfName" value="${esc(u.name)}"></div>
      <div class="field"><label>${t('email')}</label><input class="inp" id="pfEmail" value="${esc(u.email)}"></div>
      <div class="field"><label>${t('phone')}</label><input class="inp" id="pfPhone" value="${esc(u.phone||'')}"></div>
      <div class="field"><label>${t('pass')}</label><input class="inp" id="pfPass" type="password" value="${esc(u.pass)}"></div>
    </div>
    <div class="field"><label>${t('address')}</label><input class="inp" id="pfAddr" value="${esc(u.address||'')}"></div>
    <button class="btn btn-primary" onclick="saveProfile()">${t('save')}</button>`;
  } else {
    const vs = DB.vouchers().filter(v=>v.active);
    body = `<div class="grid3">${vs.map(v=>`<div class="vch-card">
      <div style="font-size:26px">🎟️</div><b style="font-size:19px;letter-spacing:1px">${v.code}</b>
      <p style="color:#6b7168;font-size:13px;margin:6px 0 12px">${LANG==='en'?v.desc_en:v.desc_ro}</p>
      <button class="btn btn-outline btn-sm" onclick="applyVoucher('${v.code}')">${t('apply')}</button></div>`).join('')}</div>`;
  }
  return `<div class="container page">
    <div class="crumbs"><a href="#/">${t('nav_home')}</a> / ${t('acc_t')}</div>
    <div class="shop-layout" style="grid-template-columns:270px 1fr">
      <div class="panel">
        <div style="text-align:center;padding-bottom:16px;border-bottom:1px solid var(--line);margin-bottom:14px">
          <div style="width:64px;height:64px;border-radius:50%;background:var(--green-l);display:grid;place-items:center;font-size:26px;margin:0 auto 10px">👤</div>
          <b>${esc(u.name)}</b><div style="font-size:13px;color:#6b7168">${esc(u.email)}</div>
          ${u.role==='admin'?`<a class="btn btn-dark btn-sm" style="margin-top:10px" href="admin.html">⚙️ ${t('admin')}</a>`:''}
        </div>
        <div class="filter-list">${tabs.map(([k,l])=>`<a href="#/account?tab=${k}" style="display:block;padding:10px 12px;border-radius:9px;font-weight:600;${tab===k?'background:var(--green-l);color:var(--green)':''}">${l}</a>`).join('')}</div>
        <button class="btn btn-danger btn-block btn-sm" style="margin-top:14px" onclick="logout()">${t('logout')}</button>
      </div>
      <div>
        <div class="stats" style="grid-template-columns:repeat(3,1fr)">
          <div class="stat"><span class="e">📦</span><div><b>${my.length}</b><span>${t('acc_orders')}</span></div></div>
          <div class="stat"><span class="e">💰</span><div><b>${money(spent)}</b><span>${LANG==='ro'?'Total cheltuit':'Total spent'}</span></div></div>
          <div class="stat"><span class="e">🎟️</span><div><b>${DB.vouchers().filter(v=>v.active).length}</b><span>${t('acc_vouchers')}</span></div></div>
        </div>
        <div class="panel">${body}</div>
      </div>
    </div></div>`;
}
function saveProfile(){
  const u = Session.get();
  u.name=document.getElementById('pfName').value.trim(); u.email=document.getElementById('pfEmail').value.trim();
  u.phone=document.getElementById('pfPhone').value.trim(); u.address=document.getElementById('pfAddr').value.trim();
  const p=document.getElementById('pfPass').value; if(p) u.pass=p;
  DB.save(); refreshHeader(); toast(t('saved'),'ok');
}

function viewOrder(id){
  const o = DB.order(id);
  if (!o) return `<div class="container page"><div class="empty">404</div></div>`;
  const steps = ['nou','preparare','livrare','finalizat'];
  const idx = o.status==='anulat' ? -1 : steps.indexOf(o.status);
  return `<div class="container page">
    <div class="crumbs"><a href="#/">${t('nav_home')}</a> / <a href="#/account">${t('acc_t')}</a> / ${o.id}</div>
    <div class="panel">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
        <div><h2 style="margin:0">${t('o_no')} ${o.id}</h2>
          <span style="color:#6b7168;font-size:13px">${fmtDate(o.date)} · ${o.payment==='card'?t('pay_card'):t('pay_cash')}</span></div>
        <span class="chip ${statusCls[o.status]}" style="font-size:13px;padding:7px 16px">${t('st_'+o.status)}</span>
      </div>
      ${o.status!=='anulat' ? `<div class="tl">${[['🧾','st_nou'],['👨‍🍳','st_preparare'],['🚚','st_livrare'],['✅','st_finalizat']].map(([e,k],i)=>
        `<div class="st ${i<=idx?'done':''}"><div class="dot">${e}</div><b>${t(k)}</b></div>`).join('')}</div>`:''}
      <div class="grid3" style="margin:20px 0">
        <div><b style="font-size:12px;color:#6b7168">${t('name')}</b><div>${esc(o.customer)}</div></div>
        <div><b style="font-size:12px;color:#6b7168">${t('phone')}</b><div>${esc(o.phone)}</div></div>
        <div><b style="font-size:12px;color:#6b7168">${t('address')}</b><div>${esc(o.address)}</div></div>
      </div>
      <div class="tbl-scroll"><table class="tb"><thead><tr><th>${t('o_items')}</th><th>${t('qty')}</th><th>${LANG==='ro'?'Preț':'Price'}</th><th>${t('total')}</th></tr></thead>
      <tbody>${o.items.map(i=>`<tr><td><span class="row-thumb"><img src="${i.img||'assets/img/logo-sm.png'}" alt=""></span> ${esc(LANG==='en'?i.name_en:i.name_ro)}</td><td>${i.qty}</td><td>${money(i.price)}</td><td><b>${money(i.price*i.qty)}</b></td></tr>`).join('')}</tbody></table></div>
      <div style="max-width:320px;margin-left:auto;margin-top:18px">
        <div class="sum-row"><span>${t('subtotal')}</span><b style="color:#2b2b28">${money(o.subtotal)}</b></div>
        ${o.discount?`<div class="sum-row disc"><span>${t('discount')} ${o.voucher?'('+o.voucher+')':''}</span><b>− ${money(o.discount)}</b></div>`:''}
        <div class="sum-row"><span>${t('shipping')}</span><b style="color:#2b2b28">${o.shipping?money(o.shipping):t('free')}</b></div>
        <div class="sum-row total"><span>${t('total')}</span><span>${money(o.total)}</span></div>
      </div>
      <button class="btn btn-outline" style="margin-top:18px" onclick="go('#/account')">← ${t('back')}</button>
      <button class="btn btn-primary" style="margin-top:18px" onclick="reorder('${o.id}')">🔁 ${LANG==='ro'?'Comandă din nou':'Order again'}</button>
    </div></div>`;
}
function reorder(id){
  const o = DB.order(id); const c = Cart.get();
  o.items.forEach(i=>{ const p = DB.product(i.id); if(!p||p.stock<=0) return;
    const f = c.items.find(x=>x.id===i.id); f ? f.qty+=i.qty : c.items.push({id:i.id, qty:Math.min(i.qty,p.stock)}); });
  Cart.set(c); refreshHeader(); toggleCart(true); toast(t('added'),'ok');
}

function viewAbout(){
  return `<div class="container page">
    <div class="crumbs"><a href="#/">${t('nav_home')}</a> / ${t('nav_about')}</div>
    <div class="hero" style="margin-top:0"><div>
      <span class="kicker">${t('hero_kick')}</span>
      <h1>${LANG==='ro'?'O băcănie ca pe vremuri, făcută pentru azi.':'An old-school grocery, built for today.'}</h1>
      <p>${LANG==='ro'
        ?'Suntem o băcănie de cartier din Tunari, pe Strada San Marco 1-5. Lucrăm cu producători mici din toată țara: pâine cu maia, brânzeturi de fermă, carne de la măcelării locale, zacuscă și dulcețuri de casă. Livrăm în Tunari, Otopeni, Pipera și nordul Bucureștiului.'
        :'We are a neighbourhood grocery in Tunari, on Strada San Marco 1-5. We work with small producers from all over the country: sourdough bread, farm cheeses, meat from local butchers, homemade preserves and jams. We deliver in Tunari, Otopeni, Pipera and northern Bucharest.'}</p>
    </div><div class="hero-art"><img src="assets/img/store.jpg" alt=""></div></div>
    <div class="usp" style="grid-template-columns:repeat(3,1fr)">
      <div><span class="e">🌾</span><div><b>${LANG==='ro'?'Producători mici':'Small producers'}</b><span>${LANG==='ro'?'din toată România':'from all over Romania'}</span></div></div>
      <div><span class="e">🗺️</span><div><b>Tunari</b><span>${LANG==='ro'?'Str. San Marco 1-5, Ilfov':'San Marco St. 1-5, Ilfov'}</span></div></div>
      <div><span class="e">⭐</span><div><b>4,9 / 5</b><span>16 ${t('rev_google')}</span></div></div>
    </div>
    <div class="grid3" style="margin-top:20px">
      <div class="panel"><h4>🚚 ${t('delivery')}</h4><p style="color:#6b7168;margin:0">${LANG==='ro'?'Livrăm în Tunari, Otopeni, Pipera și nordul Bucureștiului pentru comenzile plasate până la 18:00. Gratuit peste 200 lei, altfel 19,90 lei.':'We deliver in Tunari, Otopeni, Pipera and northern Bucharest for orders placed before 6 PM. Free over 200 lei, otherwise 19.90 lei.'}</p></div>
      <div class="panel"><h4>↩️ ${t('returns')}</h4><p style="color:#6b7168;margin:0">${LANG==='ro'?'Dacă un produs nu e perfect, îl înlocuim sau returnăm banii în 24 de ore, fără întrebări.':'If a product is not perfect, we replace it or refund you within 24 hours, no questions asked.'}</p></div>
      <div class="panel"><h4>🎟️ ${LANG==='ro'?'Vouchere':'Vouchers'}</h4><p style="color:#6b7168;margin:0">${LANG==='ro'?'Folosește codul OFERTA10 pentru 10% reducere la tot coșul.':'Use code OFERTA10 for 10% off your entire cart.'}</p></div>
    </div>
    ${viewReviews()}
  </div>`;
}

function viewContact(){
  const st = DB.data.settings.store;
  const hrs = LANG==='en' ? st.hours_en : st.hours_ro;
  return `<div class="container page">
    <div class="crumbs"><a href="#/">${t('nav_home')}</a> / ${t('nav_contact')}</div>
    <div class="contact-grid">
      <div class="panel contact-panel">
        <h4>${t('write_us')}</h4>
        <div class="grid2">
          <div class="field"><label>${t('name')}</label><input class="inp" id="ctName"></div>
          <div class="field"><label>${t('email')}</label><input class="inp" id="ctEmail"></div>
        </div>
        <div class="field"><label>${t('phone')}</label><input class="inp" id="ctPhone"></div>
        <div class="field msg-field"><label>${t('message')}</label><textarea class="inp" id="ctMsg"></textarea></div>
        <button class="btn btn-primary" onclick="toast(LANG==='ro'?'Mesaj trimis. Revenim în 24h.':'Message sent. We reply within 24h.','ok')">${t('send_msg')}</button>
      </div>
      <div class="panel contact-panel">
        <h4>${st.name} — ${LANG==='en'?st.tagline_en:st.tagline_ro}</h4>
        <div class="info-row"><span>📍</span><div><b>${t('find_us')}</b><div>${esc(st.address)}</div></div></div>
        <div class="info-row"><span>📞</span><div><b>${t('phone')}</b><div><a href="tel:${st.phone.replace(/ /g,'')}">${st.phone}</a></div></div></div>
        <div class="info-row"><span>✉️</span><div><b>${t('email')}</b><div><a href="mailto:${st.email}">${st.email}</a></div></div></div>
        <div class="info-row"><span>🕗</span><div><b>${t('hours')}</b>${hrs.map(h=>`<div>${h}</div>`).join('')}</div></div>
        <div class="info-row"><span>⭐</span><div><b>${st.rating.toFixed(1)} / 5</b><div>${st.reviewCount} ${t('rev_google')}</div></div></div>
        <iframe class="map" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps?q=${encodeURIComponent(st.address)}&output=embed"></iframe>
      </div>
    </div>
    ${viewReviews()}
  </div>`;
}

/* ================= COOKIE CONSENT (GDPR) ================= */
const CK_KEY = 'pursimplu_cookie_consent';
function ckGet(){ try { return JSON.parse(localStorage.getItem(CK_KEY)); } catch(e){ return null; } }
function ckHide(){
  document.getElementById('cookieCard').classList.remove('on');
  document.getElementById('ckPrefs').classList.remove('on');
  document.getElementById('ckFab').classList.add('on');
}
function ckSet(o){
  o.date = new Date().toISOString();
  localStorage.setItem(CK_KEY, JSON.stringify(o));
  ckHide(); toast(t('ck_saved'),'ok');
}
function ckAcceptAll(){ ckSet({ necessary:true, analytics:true, marketing:true }); }
function ckRejectAll(){ ckSet({ necessary:true, analytics:false, marketing:false }); }
function ckPrefs(){
  const c = ckGet() || { analytics:false, marketing:false };
  document.getElementById('ckAna').checked = !!c.analytics;
  document.getElementById('ckMkt').checked = !!c.marketing;
  document.getElementById('ckPrefs').classList.add('on');
}
function ckSavePrefs(){ ckSet({ necessary:true,
  analytics:document.getElementById('ckAna').checked,
  marketing:document.getElementById('ckMkt').checked }); }
function ckOpen(){ document.getElementById('ckFab').classList.remove('on'); ckPrefs(); }
function ckInit(){
  if (ckGet()) document.getElementById('ckFab').classList.add('on');
  else setTimeout(()=>document.getElementById('cookieCard').classList.add('on'), 800);
}

/* ---------- boot ---------- */
buildMega(); buildFootHours(); setLang(LANG); refreshHeader(); router(); ckInit();
