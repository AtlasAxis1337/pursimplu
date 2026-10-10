/* PUR&simplu storefront enhancements V14 + V15 */
(function(){
  const defaults=[
    {id:'bio',ro:'Bio',en:'Organic'},{id:'fara-gluten',ro:'Fara Gluten',en:'Gluten Free'},
    {id:'new',ro:'Nou',en:'New'},{id:'atestat-traditional',ro:'Atestat-Traditional',en:'Traditional Certified'}
  ];
  DB.data.tags=DB.data.tags||defaults;
  DB.categories().forEach(c=>c.subcategories=c.subcategories||[]);
  DB.products().forEach(p=>{p.tags=p.tags&&p.tags.length?p.tags:[p.tag].filter(Boolean);p.subcat=p.subcat||'';p.soldOut=p.soldOut===true});
  DB.save();

  const tagsOf=p=>(p.tags&&p.tags.length?p.tags:[p.tag]).filter(Boolean);
  const reEsc=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  window.saleTagId=function(){const x=(DB.data.tags||[]).find(t=>String(t.ro||'').trim().toLowerCase()==='la reducere');return x?x.id:'sale'};
  const WEIGHTS=[100,200,300,400,500,750,1000];

  /* ---------- coș: produsele la 100 g nu depind de stoc ---------- */
  window.addToCart=function(id,qty){
    const p=DB.product(id);if(!p||p.soldOut||(!p.per100g&&p.stock<=0))return;
    const c=Cart.get(),it=c.items.find(i=>i.id===id),q=qty||1;
    if(it)it.qty=p.per100g?+(it.qty+q).toFixed(2):Math.min(it.qty+q,p.stock);
    else c.items.push({id,qty:p.per100g?+q.toFixed(2):Math.min(q,p.stock)});
    Cart.set(c);refreshHeader();renderCart();toggleCart(true);toast(`${t('added')}: ${tn(p)}`,'ok');
  };
  window.setQty=function(id,d){
    const c=Cart.get(),it=c.items.find(i=>i.id===id);if(!it)return;const p=DB.product(id);
    it.qty=+(it.qty+d).toFixed(2);
    if(it.qty<=0)c.items=c.items.filter(i=>i.id!==id);else if(p&&!p.per100g)it.qty=Math.min(it.qty,p.stock);
    Cart.set(c);refreshHeader();renderCart();if(location.hash.startsWith('#/checkout'))router();
  };
  window.addWeightToCart=function(id){const g=+document.getElementById('weight_'+id).value;addToCart(id,g/100)};

  /* ---------- livrare + carousel ---------- */
  function normAddress(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\b(strada|str\.?|nr\.?|numarul)\b/g,' ').replace(/\d+/g,' ').replace(/[,.-]/g,' ').replace(/\s+/g,' ').trim()}
  window.checkDeliveryAddress=function(){const input=document.getElementById('deliveryAddress'),result=document.getElementById('deliveryResult');if(!input||!result)return;const v=normAddress(input.value),ok=(DB.data.deliveryAreas||[]).some(a=>v.includes(normAddress(a.street))&&v.includes(normAddress(a.city)));result.className='delivery-result '+(ok?'ok':'err');result.textContent=ok?'Te afli în aria de livrare.':'Ne pare rău, momentan nu putem livra la adresa ta, dar te asteptam in bacania noastra sa-ti ridici comnada.'};
  let heroIndex=0,heroTimer=null,heroPaused=false;
  function heroSchedule(){clearInterval(heroTimer);if(!heroPaused)heroTimer=setInterval(()=>window.heroSlide(heroIndex?0:1,true),15000)}
  window.heroSlide=function(i,automatic){heroIndex=i;const track=document.getElementById('heroTrack');if(!track)return;track.style.transform=`translateX(-${i*100}%)`;document.querySelectorAll('.hero-carousel-dot').forEach((d,x)=>d.classList.toggle('active',x===i));if(!automatic)heroSchedule()};
  function bindHero(){const car=document.querySelector('.hero-carousel'),input=document.getElementById('deliveryAddress');if(!car)return;const stop=()=>{heroPaused=true;clearInterval(heroTimer)},resume=()=>{heroPaused=false;heroSchedule()};car.addEventListener('mouseenter',stop);car.addEventListener('mouseleave',()=>{if(document.activeElement!==input)resume()});if(input){input.addEventListener('focus',stop);input.addEventListener('input',stop);input.addEventListener('blur',resume)}heroSchedule()}

  /* ---------- card produs ---------- */
  const oldCard=window.card;
  window.card=function(p){
    let h=oldCard(p);const ids=tagsOf(p),sale=saleTagId();
    h=h.replace(/<span class="tag [^"]*">[^<]*<\/span>/,'');
    let badge='';
    if(ids.includes(sale)||ids.includes('sale'))badge='<span class="tag sale-badge">La reducere</span>';
    else if(ids.includes('new'))badge='<span class="tag new">NOU</span>';
    h=h.replace('<article class="prod">','<article class="prod">'+badge);
    h=h.replace(/<span class="stock-pill[^"]*">[^<]*<\/span>/,'');
    const labels=ids.map(id=>DB.data.tags.find(x=>x.id===id)).filter(Boolean);
    if(labels.length)h=h.replace('<span class="cat-lbl">',`<div class="product-tags">${labels.map(x=>`<span class="product-tag-pill ${x.id===sale?'is-sale':''}">${esc(LANG==='en'?(x.en||x.ro):x.ro)}</span>`).join('')}</div><span class="cat-lbl">`);
    const off=p.soldOut||(!p.per100g&&p.stock<=0);
    if(p.per100g)h=h.replace(/<button class="add-btn"[^>]*>\+<\/button>/,`<div class="weight-picker"><select id="weight_${p.id}">${WEIGHTS.map(g=>`<option value="${g}">${g} g</option>`).join('')}</select><button class="add-btn" ${off?'disabled':''} onclick="addWeightToCart('${p.id}')">+</button></div>`);
    else h=h.replace(/<button class="add-btn"[^>]*>/,m=>off?m.replace('class="add-btn"','class="add-btn" disabled'):m.replace(' disabled',''));
    return h;
  };

  /* ---------- pagina produs ---------- */
  const NUTR=[['kj','Valoare energetică','kJ'],['kcal','Valoare energetică','kcal'],['fat','Grăsimi','g'],['sat','din care acizi grași saturați','g'],['carbs','Glucide','g'],['sugars','din care zaharuri','g'],['fiber','Fibre','g'],['protein','Proteine','g'],['salt','Sare','g']];
  function nutritionHtml(p){
    const n=p.nutrition||{};const rows=NUTR.filter(([k])=>n[k]!==undefined&&n[k]!=='');
    if(!rows.length)return '';
    return `<section class="nutrition-box"><div class="nutrition-head"><h3>Valori nutriționale</h3><span>medii per ${esc(n.basis||'100 g')}</span></div><table class="nutrition-table"><tbody>${rows.map(([k,l,u])=>`<tr class="${l.startsWith('din care')?'sub':''}"><td>${l}</td><td>${esc(n[k])} ${u}</td></tr>`).join('')}</tbody></table></section>`;
  }
  const oldProduct=window.viewProduct;
  window.viewProduct=function(id){
    let h=oldProduct(id);const p=DB.product(id);if(!p)return h;
    h=h.replace(/<span class="stock-pill[^"]*">[^<]*<\/span>/,'');
    h=h.replace(new RegExp('<div><b>'+reEsc(t('pd_sku'))+':</b>[^<]*</div>'),'');
    const a=h.indexOf('<div style="display:flex;gap:12px;align-items:center;margin-top:22px">');
    if(a>=0){const b=h.indexOf('</div>',a)+6;const off=p.soldOut||(!p.per100g&&p.stock<=0);
      const buy=p.per100g
        ?`<div class="pd-buy"><select class="inp pd-weight" id="pdWeight">${WEIGHTS.map(g=>`<option value="${g}">${g} g</option>`).join('')}</select><button class="btn btn-primary" ${off?'disabled':''} onclick="addToCart('${p.id}', +document.getElementById('pdWeight').value/100)">🛒 ${t('add')}</button></div>`
        :`<div class="pd-buy"><span class="qty" style="height:44px"><button onclick="pdQty(-1)">−</button><span id="pdQty">1</span><button onclick="pdQty(1)">+</button></span><button class="btn btn-primary" ${off?'disabled':''} onclick="addToCart('${p.id}', +document.getElementById('pdQty').textContent)">🛒 ${t('add')}</button></div>`;
      h=h.slice(0,a)+buy+(off?'<div class="pd-soldout">Momentan indisponibil</div>':'')+h.slice(b);}
    const nut=nutritionHtml(p);
    if(nut){const s=h.indexOf('<div class="sec-head">');h=s>=0?h.slice(0,s)+nut+h.slice(s):h.replace(/<\/div>\s*$/,nut+'</div>')}
    return h;
  };

  /* ---------- prima pagină ---------- */
  const oldHome=window.viewHome;
  window.viewHome=function(){
    let h=oldHome();
    const heroStart=h.indexOf('<section class="hero">'),heroEnd=heroStart>=0?h.indexOf('</section>',heroStart)+10:-1;
    if(heroStart>=0&&heroEnd>heroStart){
      const original=h.slice(heroStart,heroEnd);
      const delivery=`<section class="hero"><div><span class="kicker">Livrare gratuită peste 200 lei</span><h1>Verifică dacă te afli în aria de livrare</h1><p>Introdu adresa completă. Pentru străzile eligibile, numărul poate fi oricare.</p><div class="delivery-check"><input class="inp" id="deliveryAddress" placeholder="Ex: Strada Sofia 24, Otopeni"><button class="btn btn-primary" onclick="checkDeliveryAddress()">Verifică</button></div><div id="deliveryResult" class="delivery-result"></div></div><div class="hero-art delivery-map"><img src="assets/img/livrare-ilfov.png" alt="Aria de livrare"></div></section>`;
      h=h.slice(0,heroStart)+`<div class="hero-carousel"><div class="hero-carousel-track" id="heroTrack">${original}${delivery}</div><div class="hero-carousel-dots"><button class="hero-carousel-dot active" onclick="heroSlide(0)"></button><button class="hero-carousel-dot" onclick="heroSlide(1)"></button></div></div>`+h.slice(heroEnd);
      setTimeout(()=>{heroSlide(0);bindHero()},0);
    }
    const P=DB.products().filter(p=>p.active&&!p.soldOut);
    const cs=h.indexOf('<!-- 3.'),ce=h.indexOf('<!-- 4.');
    if(cs>=0&&ce>cs){
      const sec=`<!-- 3. --><div class="sec-head"><h2>${t('cats_h')}</h2><a href="#/shop">${t('cats_all')} →</a></div><div class="category-rail-wrap"><button class="rail-arrow left" aria-label="Înapoi" onclick="scrollCategoryRail(-1)">‹</button><div class="category-rail" id="categoryRail">${DB.categories().map(c=>`<button type="button" class="category-slide-card" onclick="go('#/shop?cat=${c.id}')"><span class="e"><img src="${c.tile}" alt="${esc(tn(c))}" loading="lazy"></span><b>${esc(tn(c))}</b><span>${P.filter(p=>p.cat===c.id).length} ${LANG==='ro'?'produse':'products'}</span></button>`).join('')}</div><button class="rail-arrow right" aria-label="Înainte" onclick="scrollCategoryRail(1)">›</button></div>`;
      h=h.slice(0,cs)+sec+h.slice(ce);
    }
    h=h.replace("go('#/shop?cat=fructe')","go('#/shop?cat=fructe-legume')").replace("go('#/shop?cat=carne')","go('#/shop?cat=carne-produse')").replace("go('#/shop?cat=conserve')","go('#/shop?cat=de-camara')");
    const saleId=saleTagId(),s5=h.indexOf('<!-- 5.'),s6=h.indexOf('<!-- 6.'),s7=h.indexOf('<!-- 7.');
    if(s5>=0&&s6>s5&&s7>s6){
      const row=(title,link,list)=>list.length?`<div class="sec-head"><h2>${title}</h2><a href="${link}">${t('view_all')} →</a></div><div class="prod-grid home-row">${list.slice(0,5).map(card).join('')}</div>`:'';
      h=h.slice(0,s5)+'<!-- 5. -->'+row(t('offers_h'),'#/shop?tag='+encodeURIComponent(saleId),P.filter(p=>tagsOf(p).includes(saleId)))+'<!-- 6. -->'+row(t('new_h'),'#/shop?tag=new',P.filter(p=>tagsOf(p).includes('new')))+h.slice(s7);
    }
    return h;
  };
  window.scrollCategoryRail=function(dir){const r=document.getElementById('categoryRail');if(r)r.scrollBy({left:dir*Math.max(300,r.clientWidth*.8),behavior:'smooth'})};

  /* ---------- magazin ---------- */
  let selectedSubs=[];
  const oldShop=window.viewShop;
  window.viewShop=function(q){
    selectedSubs=q.get('subcat')?q.get('subcat').split(',').filter(Boolean):[];
    let h=oldShop(q);
    const tagTitle=`<h4 style="margin-top:20px">${t('f_tag')}</h4>`;
    const a=h.indexOf(tagTitle),b=a>=0?h.indexOf(`<h4 style="margin-top:20px">${t('f_avail')}</h4>`,a):-1;
    if(a>=0&&b>a)h=h.slice(0,a)+`${tagTitle}<div class="filter-list tag-filter-list">${DB.data.tags.map(x=>`<label><input type="checkbox" class="fTag" value="${x.id}" ${SHOP.tags.includes(x.id)?'checked':''}> ${esc(LANG==='en'?(x.en||x.ro):x.ro)}</label>`).join('')}</div>`+h.slice(b);
    DB.data.tags.forEach(x=>{h=h.replace(new RegExp('>'+reEsc(x.id)+' <i>','g'),'>'+esc(LANG==='en'?(x.en||x.ro):x.ro)+' <i>')});
    return h;
  };
  window.filterProducts=function(){
    let L=DB.products().filter(p=>p.active&&!p.soldOut);
    if(SHOP.cats.length)L=L.filter(p=>SHOP.cats.includes(p.cat));
    if(SHOP.tags.length)L=L.filter(p=>SHOP.tags.some(x=>tagsOf(p).includes(x)));
    if(selectedSubs.length)L=L.filter(p=>selectedSubs.includes(p.subcat));
    if(SHOP.inStock)L=L.filter(p=>p.per100g||p.stock>0);
    if(SHOP.max)L=L.filter(p=>p.price<=SHOP.max);
    if(SHOP.q){const q=SHOP.q.toLowerCase();L=L.filter(p=>(p.name_ro+' '+p.name_en+' '+tn(DB.category(p.cat))).toLowerCase().includes(q))}
    const s={pmin:(a,b)=>a.price-b.price,pmax:(a,b)=>b.price-a.price,name:(a,b)=>tn(a).localeCompare(tn(b)),rate:(a,b)=>b.rating-a.rating,pop:(a,b)=>(b.featured?1:0)-(a.featured?1:0)||b.rating-a.rating};
    return L.sort(s[SHOP.sort]||s.pop);
  };
  const baseBind=window.bindShop;
  window.bindShop=function(){
    baseBind();
    const layout=document.querySelector('.shop-layout'),aside=layout&&layout.querySelector('aside');
    if(layout&&aside&&!document.getElementById('mobileFilterToggle')){const b=document.createElement('button');b.id='mobileFilterToggle';b.className='btn btn-outline mobile-filter-toggle';b.innerHTML='<span>☰ Filtre și categorii</span><span id="mobileFilterState">Afișează</span>';b.onclick=()=>{const open=aside.classList.toggle('mobile-filter-open');document.getElementById('mobileFilterState').textContent=open?'Ascunde':'Afișează'};layout.parentNode.insertBefore(b,layout)}
    document.querySelectorAll('.fCat').forEach(ch=>{
      const c=DB.category(ch.value),lab=ch.closest('label');if(!c||!lab)return;
      lab.classList.add('category-filter-row');lab.classList.toggle('active',ch.checked);
      ch.onchange=()=>{SHOP.cats=ch.checked?[ch.value]:[];applyShopState()};
      const subs=c.subcategories||[],box=document.createElement('div');box.className='subcat-filter';
      box.innerHTML=subs.map(sc=>`<label class="subcat-row ${selectedSubs.includes(sc.id)?'active':''}"><input type="checkbox" class="fSub" data-cat="${c.id}" value="${sc.id}" ${selectedSubs.includes(sc.id)?'checked':''}> ${esc(LANG==='en'?sc.en:sc.ro)}</label>`).join('');
      lab.after(box);if(box.querySelector('.fSub:checked'))box.classList.add('open');
      const x=document.createElement('button');x.type='button';x.className='cat-expand'+(subs.length?'':' is-empty');x.setAttribute('aria-label','Subcategorii');
      x.innerHTML='<svg viewBox="0 0 20 20" width="14" height="14"><path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      x.classList.toggle('open',box.classList.contains('open'));
      x.onclick=e=>{e.preventDefault();e.stopPropagation();const open=!box.classList.contains('open');document.querySelectorAll('.subcat-filter').forEach(o=>o.classList.remove('open'));document.querySelectorAll('.cat-expand').forEach(o=>o.classList.remove('open'));box.classList.toggle('open',open);x.classList.toggle('open',open)};
      lab.appendChild(x);
    });
    document.querySelectorAll('.fTag').forEach(x=>x.onchange=()=>{SHOP.tags=[...document.querySelectorAll('.fTag:checked')].map(y=>y.value);applyShopState()});
    document.querySelectorAll('.fSub').forEach(x=>x.onchange=()=>{const u=new URLSearchParams(location.hash.split('?')[1]||'');if(x.checked){u.set('cat',x.dataset.cat);u.set('subcat',x.value)}else u.delete('subcat');location.hash='#/shop'+(u.toString()?'?'+u:'')});
  };

  /* ---------- finalizare comandă ---------- */
  const baseCheckout=window.viewCheckout;
  window.viewCheckout=function(){
    let h=baseCheckout();
    const start=h.indexOf('<h4 style="margin-top:8px">'),end=start>=0?h.indexOf('</div>',h.indexOf('<div class="filter-list">',start))+6:-1;
    if(start>=0&&end>start)h=h.slice(0,start)+`<h4 style="margin-top:8px">Metoda de plată / ridicare</h4><div class="checkout-methods"><label><input type="radio" name="pay" value="delivery" checked onchange="toggleDeliverySlots()"><span><b>Numerar/Card la livrare</b><small>Comanda va fi livrată la adresă.</small></span></label><label><input type="radio" name="pay" value="store" onchange="toggleDeliverySlots()"><span><b>Numerar/Card în băcănie</b><small>Ridicare personală din magazin.</small></span></label></div><div id="deliverySlotBox" class="delivery-slot-box"><h4>Alege intervalul de livrare</h4><div class="grid2"><div class="field"><label>Ziua</label><select class="inp" id="deliveryDay"><option>Luni</option><option>Miercuri</option><option>Sâmbătă</option></select></div><div class="field"><label>Intervalul</label><select class="inp" id="deliveryTime"><option>11:00-13:00</option><option>18:00-20:00</option></select></div></div></div>`+h.slice(end);
    return h;
  };
  window.toggleDeliverySlots=function(){const b=document.getElementById('deliverySlotBox'),v=document.querySelector('input[name="pay"]:checked')?.value;if(b)b.style.display=v==='delivery'?'block':'none'};
  window.placeOrder=function(){
    const u=Session.get();if(!u){toast(t('need_login'),'err');return openAuth()}
    const name=coName.value.trim(),email=coEmail.value.trim(),phone=coPhone.value.trim(),addr=coAddr.value.trim();if(!name||!email||!phone||!addr)return toast('Completează toate câmpurile','err');
    const method=document.querySelector('input[name="pay"]:checked')?.value||'delivery',slot=method==='delivery'?`${deliveryDay.value}, ${deliveryTime.value}`:'';
    const c=Cart.get(),tt=Cart.totals(),items=c.items.map(i=>{const p=DB.product(i.id);return{id:p.id,name_ro:p.name_ro,name_en:p.name_en,img:p.img,price:p.price,qty:i.qty,per100g:!!p.per100g}});
    items.forEach(i=>{const p=DB.product(i.id);if(p&&!p.per100g)p.stock=Math.max(0,p.stock-i.qty)});
    const o={id:'PS-'+Math.floor(1000+Math.random()*8999),userId:u.id,customer:name,email,phone,address:addr,items,subtotal:tt.sub,discount:tt.disc,voucher:tt.voucher?tt.voucher.code:null,shipping:method==='store'?0:tt.ship,total:method==='store'?tt.total-tt.ship:tt.total,status:'nou',payment:method,deliverySlot:slot,date:new Date().toISOString(),note:coNote.value.trim()};
    DB.orders().unshift(o);if(tt.voucher)DB.voucher(tt.voucher.code).uses++;DB.save();Cart.set({items:[],voucher:null});refreshHeader();toast(t('order_ok'),'ok');go('#/order/'+o.id);
  };
  router();
})();

/* ===== PUR&simplu V15 — adăugat la finalul enhancements.js ===== */
(function(){
  const grams=q=>Math.round(q*100);

  /* ---------- Indicator livrare gratuită (coș + finalizare) ---------- */
  function freeShipBox(){
    const c=Cart.get();if(!c.items.length)return '';
    const tt=Cart.totals(),limit=+DB.data.settings.freeOver||0;if(!limit)return '';
    const spent=Math.max(0,tt.sub-tt.disc),left=+(limit-spent).toFixed(2),pct=Math.min(100,spent/limit*100);
    return left>0
      ?`<div class="free-ship"><div class="free-ship-txt">🚚 Mai adaugă <b>${money(left)}</b> pentru livrare gratuită</div><div class="free-ship-bar"><span style="width:${pct}%"></span></div></div>`
      :`<div class="free-ship done"><div class="free-ship-txt">🎉 Ai livrare gratuită!</div><div class="free-ship-bar"><span style="width:100%"></span></div></div>`;
  }
  const baseRenderCart=window.renderCart;
  window.renderCart=function(){baseRenderCart();const f=document.getElementById('cartFoot');if(f&&f.innerHTML.trim())f.insertAdjacentHTML('afterbegin',freeShipBox())};
  const baseCheckout15=window.viewCheckout;
  window.viewCheckout=function(){let h=baseCheckout15();const i=h.indexOf(`<div class="sum-row"><span>${t('subtotal')}`);return i>=0?h.slice(0,i)+freeShipBox()+h.slice(i):h};

  /* ---------- Pagina comenzii: gramaj real + notă pentru client ---------- */
  const baseOrder=window.viewOrder;
  window.viewOrder=function(id){
    let h=baseOrder(id);const o=DB.order(id);if(!o)return h;
    // cantitățile la 100 g se afișează în grame
    o.items.forEach(i=>{const p=DB.product(i.id);if(!(p&&p.per100g)&&!i.per100g)return;
      const name=esc(LANG==='en'?i.name_en:i.name_ro);
      h=h.replace(`${name}</td><td>${i.qty}</td><td>${money(i.price)}</td>`,`${name}</td><td>${grams(i.qty)} g</td><td>${money(i.price)} / 100 g</td>`)});
    const adj=Object.values(o.adjustments||{});
    if(adj.length){
      const note=`<div class="order-adjust"><div class="order-adjust-head">⚖️ Comanda ta a fost ajustată după cântărire</div>
        <p>Unele produse se vând la gramaj și nu pot fi tăiate exact. Am actualizat cantitatea și prețul după cântărirea reală:</p>
        <ul>${adj.map(a=>`<li><b>${esc(a.name)}</b>: ai comandat ${a.reqG} g (${money(a.reqPrice)}) → cântărit ${a.realG} g (<b>${money(a.realPrice)}</b>) <span class="${a.realPrice>=a.reqPrice?'up':'down'}">${a.realPrice>=a.reqPrice?'+':'−'}${money(Math.abs(a.realPrice-a.reqPrice))}</span></li>`).join('')}</ul>
        ${o.originalTotal!=null?`<div class="order-adjust-total">Total inițial: <s>${money(o.originalTotal)}</s> → Total actualizat: <b>${money(o.total)}</b></div>`:''}</div>`;
      const g=h.indexOf('<div class="grid3" style="margin:20px 0">');
      h=g>=0?h.slice(0,g)+note+h.slice(g):h;
    }
    return h;
  };
  router();
})();
