/* PUR&simplu admin enhancements */
(function(){
 const REQUIRED_ADMIN=[
  ['dulciuri-snacks','Dulciuri & snacks',['Biscuiți','Cacao de specialitate','Creme','Crackers & chips','Ciocolată']],
  ['paine-patiserie','Pâine și patiserie',['Pâine','Patiserie dulce','Patiserie sărată']],
  ['carne-produse','Carne și produse din carne',['Carne proaspătă','Mezeluri','Pate-uri']],
  ['lactate-branzeturi','Lactate și brânzeturi',['Lactate','Brânzeturi proaspete','Brânzeturi maturate']],
  ['de-camara','De cămară',['Zacuscă','Murături','Uscate','Miere','Uleiuri','Sosuri','Conserve','Condimente','Ceaiuri']],
  ['produse-copii','Produse copii',[]],['peste','Pește',['Icre','Conserve','Produse din pește']],['bauturi','Băuturi',['Fără alcool','Cu alcool']]
 ];
 const ids=REQUIRED_ADMIN.map(x=>x[0]);
 DB.data.categories=DB.data.categories||[];
 REQUIRED_ADMIN.forEach(([id,ro,subs])=>{let c=DB.data.categories.find(x=>x.id===id);if(!c){c={id,ro,en:ro,img:'assets/img/logo.png',tile:'assets/img/logo-sm.png',desc_ro:subs.join(' · ')||ro,desc_en:ro,subcategories:subs.map((n,i)=>({id:id+'-'+(i+1),ro:n,en:n}))};DB.data.categories.push(c)}c.subcategories=c.subcategories||[]});
 DB.data.tags=DB.data.tags||[{id:'bio',ro:'Bio',en:'Organic'},{id:'fara-gluten',ro:'Fara Gluten',en:'Gluten Free'},{id:'new',ro:'Nou',en:'New'},{id:'atestat-traditional',ro:'Atestat-Traditional',en:'Traditional Certified'}];
 DB.data.deliveryAreas=DB.data.deliveryAreas||[{id:'area-sofia-otopeni',street:'Strada Sofia',city:'Otopeni'},{id:'area-1-decembrie-tunari',street:'Strada 1 Decembrie',city:'Tunari'}];
 DB.products().forEach(p=>{p.tags=(p.tags||[p.tag].filter(Boolean)).filter(id=>DB.data.tags.some(t=>t.id===id));p.per100g=!!p.per100g;p.subcat=p.subcat||'';p.unitPrice=p.unitPrice??p.price;if(p.per100g)p.price100g=p.price100g??p.price}); DB.save();
 function addLinks(){const side=document.querySelector('.side');if(!side)return;const cats=side.querySelector('[data-r="cats"]');[['tags','🔖 Etichete'],['delivery','🚚 Arie livrare']].forEach(([r,l])=>{if(side.querySelector('[data-r="'+r+'"]'))return;const a=document.createElement('a');a.dataset.r=r;a.textContent=l;a.onclick=()=>nav(r);cats.parentNode.insertBefore(a,cats.nextSibling)})}
 function row(label,del){return `<div class="admin-list-row"><b>${esc(label)}</b><button class="btn btn-danger btn-sm" onclick="${del}">Șterge</button></div>`}
 window.vSubcats=function(){return head('Subcategorii','Gestionează subcategoriile din fiecare categorie',`<button class="btn btn-primary btn-sm" onclick="addSubcat()">＋ Subcategorie</button>`)+DB.categories().map(c=>`<div class="card"><div class="ch"><h3>${esc(c.ro)}</h3></div>${(c.subcategories||[]).map(sc=>row(sc.ro,`delSubcat('${c.id}','${sc.id}')`)).join('')||'<span style="color:var(--muted)">Fără subcategorii</span>'}</div>`).join('')}
 window.addSubcat=function(){openMdl(`<h3>Subcategorie nouă</h3><div class="field"><label>Categorie</label><select class="inp" id="scCat">${DB.categories().map(c=>`<option value="${c.id}">${esc(c.ro)}</option>`).join('')}</select></div><div class="field"><label>Nume</label><input class="inp" id="scName"></div><button class="btn btn-primary btn-block" onclick="saveSubcat()">Salvează</button>`)}
 window.saveSubcat=function(){const c=DB.category(scCat.value),n=scName.value.trim();if(!n)return;c.subcategories=c.subcategories||[];c.subcategories.push({id:DB.uid('sc_'),ro:n,en:n});DB.save();closeMdl();nav('subcats')}
 window.delSubcat=function(cid,sid){if(DB.products().some(p=>p.subcat===sid))return toast('Subcategoria are produse. Mută-le întâi.','err');const c=DB.category(cid);c.subcategories=c.subcategories.filter(x=>x.id!==sid);DB.save();nav('subcats')}
 window.vTags=function(){return head('Etichete','Etichete disponibile în magazin',`<button class="btn btn-primary btn-sm" onclick="addTagAdmin()">＋ Etichetă</button>`)+`<div class="card">${DB.data.tags.map(t=>row(t.ro,`delTagAdmin('${t.id}')`)).join('')}</div>`}
 window.addTagAdmin=function(){openMdl(`<h3>Etichetă nouă</h3><div class="field"><label>Nume</label><input class="inp" id="tagName"></div><button class="btn btn-primary btn-block" onclick="saveTagAdmin()">Salvează</button>`)}
 window.saveTagAdmin=function(){const n=tagName.value.trim();if(!n)return;DB.data.tags.push({id:DB.uid('tag_'),ro:n,en:n,cls:'custom'});DB.save();closeMdl();nav('tags')}
 window.delTagAdmin=function(id){DB.products().forEach(p=>p.tags=(p.tags||[]).filter(x=>x!==id));DB.data.tags=DB.data.tags.filter(x=>x.id!==id);DB.save();nav('tags')}
 window.vDelivery=function(){return head('Aria de livrare','Numărul imobilului este ignorat la verificare',`<button class="btn btn-primary btn-sm" onclick="addDeliveryArea()">＋ Adresă</button>`)+`<div class="card">${DB.data.deliveryAreas.map(a=>row(a.street+', '+a.city+' (orice număr)',`delDeliveryArea('${a.id}')`)).join('')}</div>`}
 window.addDeliveryArea=function(){openMdl(`<h3>Adresă eligibilă</h3><div class="grid2"><div class="field"><label>Stradă</label><input class="inp" id="daStreet"></div><div class="field"><label>Localitate</label><input class="inp" id="daCity"></div></div><button class="btn btn-primary btn-block" onclick="saveDeliveryArea()">Salvează</button>`)}
 window.saveDeliveryArea=function(){const street=daStreet.value.trim(),city=daCity.value.trim();if(!street||!city)return;DB.data.deliveryAreas.push({id:DB.uid('area_'),street,city});DB.save();closeMdl();nav('delivery')}
 window.delDeliveryArea=function(id){DB.data.deliveryAreas=DB.data.deliveryAreas.filter(x=>x.id!==id);DB.save();nav('delivery')}
 const prevNav=window.nav;window.nav=function(r){if(['tags','delivery'].includes(r)){ROUTE=r;document.querySelectorAll('.side a[data-r]').forEach(a=>a.classList.toggle('active',a.dataset.r===r));document.getElementById('amain').innerHTML=({tags:vTags,delivery:vDelivery}[r])();window.scrollTo(0,0);return}prevNav(r);addLinks()}
 const oldEdit=window.editProduct;window.editProduct=function(id){
  oldEdit(id);
  const p=id?DB.product(id):{subcat:'',tags:[],per100g:false,unitPrice:0,price100g:0,soldOut:false};
  const cat=document.getElementById('eCat');if(!cat)return;cat.onchange=fillSubcats;
  // Existing Etichetă dropdown becomes the single source, populated from Admin > Etichete.
  const oldTag=document.getElementById('eTag');
  if(oldTag){const selected=(p.tags&&p.tags[0])||p.tag||'';oldTag.innerHTML='<option value="">fără</option>'+DB.data.tags.map(t=>`<option value="${t.id}" ${selected===t.id?'selected':''}>${esc(t.ro)}</option>`).join('')}
  const price=document.getElementById('ePrice');if(price){price.previousElementSibling.textContent='Preț unitar (lei)';price.value=p.unitPrice??p.price}
  const stock=document.getElementById('eStock');const stockField=stock?.closest('.field');
  const btn=document.querySelector('#mdlBox .btn-primary.btn-block');
  btn.insertAdjacentHTML('beforebegin',`<div class="grid3"><div class="field"><label>Subcategorie</label><select class="inp" id="eSubcat"></select></div><div class="field"><label>&nbsp;</label><label style="display:flex;gap:8px;align-items:center;padding:10px 0"><input type="checkbox" id="ePer100" ${p.per100g?'checked':''} onchange="toggle100gFields()" style="accent-color:#6d7f3f"> Preț per 100g</label></div><div class="field" id="price100Wrap"><label>Preț / 100g (lei)</label><input class="inp" id="ePrice100" type="number" step="0.01" value="${p.price100g??p.price??0}"></div></div><div class="field"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="eSoldOut" ${p.soldOut?'checked':''} style="accent-color:#e53935"> Stoc epuizat / scoate temporar produsul din vânzare</label></div>`);
  if(stockField)stockField.dataset.stockField='1';fillSubcats(p.subcat);toggle100gFields();
 }
 window.toggle100gFields=function(){const on=document.getElementById('ePer100')?.checked,w=document.getElementById('price100Wrap'),sf=document.querySelector('[data-stock-field="1"]');if(w)w.style.display=on?'block':'none';if(sf)sf.style.display=on?'none':'block'}
 window.fillSubcats=function(selected){const c=DB.category(document.getElementById('eCat').value),el=document.getElementById('eSubcat');if(!el)return;el.innerHTML='<option value="">— fără —</option>'+(c.subcategories||[]).map(sc=>`<option value="${sc.id}" ${sc.id===selected?'selected':''}>${esc(sc.ro)}</option>`).join('')}
 const oldSave=window.saveProduct;window.saveProduct=function(id){
  const per=!!document.getElementById('ePer100')?.checked,unit=+document.getElementById('ePrice')?.value||0,p100=+document.getElementById('ePrice100')?.value||0,tag=document.getElementById('eTag')?.value||'';
  const extra={subcat:document.getElementById('eSubcat')?.value||'',per100g:per,unitPrice:unit,price100g:per?p100:null,tags:tag?[tag]:[],tag,soldOut:!!document.getElementById('eSoldOut')?.checked};
  if(per&&p100<=0)return toast('Completează prețul pentru 100g','err');if(per)document.getElementById('ePrice').value=p100;
  const before=DB.products().map(p=>p.id);oldSave(id);const p=id?DB.product(id):DB.products().find(p=>!before.includes(p.id));if(p){Object.assign(p,extra);p.price=per?p100:unit;p.unit=per?'100 g':p.unit;if(per)p.stock=0;DB.save()}
 }
 const oldOrder=window.editOrder;window.editOrder=function(id){oldOrder(id);const o=DB.order(id),rows=document.querySelectorAll('#mdlBox table.tb tbody tr');o.items.forEach((it,ix)=>{const p=DB.product(it.id);if(!p||!p.per100g||!rows[ix])return;if(rows[ix].children[3])rows[ix].children[3].innerHTML=`<span class="weight-qty-inline"><input class="mini-in" style="width:90px;min-width:0" type="number" min="1" value="${Math.round(it.qty*100)}" onchange="oeSetGrams('${id}',${ix},this.value)"><span>g</span></span>`;if(rows[ix].children[4])rows[ix].children[4].textContent='—'})}
 window.oeSetGrams=function(id,ix,g){const o=DB.order(id),it=o.items[ix],n=Math.max(1,+g||1)/100;it.qty=n;recalcOrder(o);DB.save();editOrder(id)}
 // Subcategorii compacte în pagina Categorii
 const oldCats=window.vCats;window.vCats=function(){return oldCats()+`<section class="subcat-accordion"><div class="subcat-accordion-head"><div><h3>Subcategorii</h3><p>Deschide o categorie pentru a vedea și edita subcategoriile.</p></div><button class="btn btn-primary btn-sm" onclick="addSubcat()">＋ Adaugă subcategorie</button></div>${DB.categories().map(c=>`<div class="subcat-acc-row"><button class="subcat-acc-toggle" onclick="toggleAdminSubcats('${c.id}')"><span><b>${esc(c.ro)}</b><small>${(c.subcategories||[]).length} subcategorii</small></span><span class="subcat-chevron" id="chev_${c.id}">⌄</span></button><button class="subcat-quick-add" onclick="addSubcat('${c.id}')" title="Adaugă subcategorie">＋</button><div class="subcat-acc-panel" id="subpanel_${c.id}">${(c.subcategories||[]).map(sc=>`<div class="subcat-compact-item"><span>${esc(sc.ro)}</span><button onclick="editSubcat('${c.id}','${sc.id}')">✏️</button><button class="danger" onclick="delSubcat('${c.id}','${sc.id}')">×</button></div>`).join('')||'<div class="subcat-empty">Fără subcategorii</div>'}</div></div>`).join('')}</section>`}
 window.toggleAdminSubcats=function(cid){const p=document.getElementById('subpanel_'+cid),c=document.getElementById('chev_'+cid);document.querySelectorAll('.subcat-acc-panel').forEach(x=>{if(x!==p)x.classList.remove('open')});document.querySelectorAll('.subcat-chevron').forEach(x=>{if(x!==c)x.textContent='⌄'});p.classList.toggle('open');c.textContent=p.classList.contains('open')?'⌃':'⌄'}
 window.addSubcat=function(cid){openMdl(`<h3>Subcategorie nouă</h3><div class="field"><label>Categorie</label><select class="inp" id="scCat">${DB.categories().map(c=>`<option value="${c.id}" ${cid===c.id?'selected':''}>${esc(c.ro)}</option>`).join('')}</select></div><div class="field"><label>Nume RO</label><input class="inp" id="scName"></div><div class="field"><label>Nume EN</label><input class="inp" id="scNameEn"></div><button class="btn btn-primary btn-block" onclick="saveSubcat()">Salvează</button>`)}
 window.saveSubcat=function(){const c=DB.category(scCat.value),n=scName.value.trim(),en=scNameEn.value.trim()||n;if(!n)return toast('Completează numele','err');c.subcategories=c.subcategories||[];if(c.subcategories.some(x=>x.ro.toLowerCase()===n.toLowerCase()))return toast('Subcategoria există deja','err');c.subcategories.push({id:DB.uid('sc_'),ro:n,en});DB.save();closeMdl();nav('cats');toast('Subcategorie adăugată','ok')}
 window.editSubcat=function(cid,sid){const sc=DB.category(cid).subcategories.find(x=>x.id===sid);openMdl(`<h3>Editează subcategoria</h3><div class="field"><label>Nume RO</label><input class="inp" id="scERo" value="${esc(sc.ro)}"></div><div class="field"><label>Nume EN</label><input class="inp" id="scEEn" value="${esc(sc.en||sc.ro)}"></div><button class="btn btn-primary btn-block" onclick="saveSubcatEdit('${cid}','${sid}')">Salvează</button>`)}
 window.saveSubcatEdit=function(cid,sid){const sc=DB.category(cid).subcategories.find(x=>x.id===sid),ro=scERo.value.trim();if(!ro)return;sc.ro=ro;sc.en=scEEn.value.trim()||ro;DB.save();closeMdl();nav('cats')}
 window.delSubcat=function(cid,sid){if(DB.products().some(p=>p.subcat===sid))return toast('Subcategoria are produse. Mută-le întâi.','err');if(!confirm('Ștergi subcategoria?'))return;const c=DB.category(cid);c.subcategories=c.subcategories.filter(x=>x.id!==sid);DB.save();nav('cats')}
 // Hide stock artifacts for weighted products in dashboard/stock/product tables.
 function cleanWeightedStock(){document.querySelectorAll('table.tb tbody tr').forEach(tr=>{const text=tr.textContent;const p=DB.products().find(x=>x.per100g&&text.includes(x.name_ro));if(!p)return;[...tr.children].forEach(td=>{if(/stoc/i.test(td.previousElementSibling?.textContent||'')||/\b(stoc|buc)\b/i.test(td.textContent)&&!td.textContent.includes(p.name_ro))td.textContent='—'})})}
 const prevNav2=window.nav;window.nav=function(r){prevNav2(r);setTimeout(cleanWeightedStock,0)}

 /* ---------- comenzi: metodă + interval ---------- */
 const payLbl=o=>o.payment==='delivery'?'🚚 Numerar/Card la livrare':o.payment==='store'?'🏪 Numerar/Card în băcănie':o.payment==='card'?'💳 Card':'💵 Ramburs';
 const oldOrders=window.vOrders;window.vOrders=function(){let h=oldOrders();DB.orders().forEach(o=>{h=h.replace(`<td>${o.payment==='card'?'💳 Card':'💵 Ramburs'}</td>`,`<td>${payLbl(o)}${o.deliverySlot?`<div class="delivery-slot-admin">${esc(o.deliverySlot)}</div>`:''}</td>`)});return h}
 const oldDetail=window.orderDetail;window.orderDetail=function(id){oldDetail(id);const o=DB.order(id),box=document.getElementById('mdlBox');const g=box&&box.querySelector('.grid2');if(o&&g)g.insertAdjacentHTML('afterend',`<div class="order-fulfilment"><b>${payLbl(o)}</b>${o.deliverySlot?`<span>${esc(o.deliverySlot)}</span>`:''}</div>`)}

 /* ---------- Etichete ---------- */
 const tagCount=id=>DB.products().filter(p=>(p.tags||[]).includes(id)||p.tag===id).length;
 window.vTags=function(){const T=DB.data.tags;
  return head('Etichete',T.length+' etichete disponibile în magazin')+`
  <div class="adm-grid">
   <div class="card adm-form"><h3>Etichetă nouă</h3><p class="adm-muted">Apare imediat în filtrul din Magazin și în formularul de produs.</p>
    <div class="field"><label>Nume</label><input class="inp" id="tagNew" placeholder="Ex: La reducere" onkeydown="if(event.key==='Enter')createTag()"></div>
    <button class="btn btn-primary btn-block" onclick="createTag()">＋ Adaugă eticheta</button></div>
   <div class="card"><div class="ch"><h3>Etichete existente</h3></div>
    <div class="adm-list">${T.map(x=>`<div class="adm-item"><span class="adm-pill">${esc(x.ro)}</span><span class="adm-meta">${tagCount(x.id)} produse</span><div class="adm-actions"><button class="adm-ico" title="Redenumește" onclick="renameTag('${x.id}')">✏️</button><button class="adm-ico danger" title="Șterge" onclick="delTagAdmin('${x.id}')">🗑️</button></div></div>`).join('')||'<div class="adm-empty">Nu există etichete.</div>'}</div></div>
  </div>`};
 window.createTag=function(){const n=document.getElementById('tagNew').value.trim();if(!n)return toast('Completează numele','err');if(DB.data.tags.some(x=>x.ro.toLowerCase()===n.toLowerCase()))return toast('Eticheta există deja','err');DB.data.tags.push({id:DB.uid('tag_'),ro:n,en:n});DB.save();nav('tags');toast('Etichetă adăugată','ok')};
 window.renameTag=function(id){const x=DB.data.tags.find(t=>t.id===id);openMdl(`<h3>Redenumește eticheta</h3><div class="field"><label>Nume</label><input class="inp" id="tagRen" value="${esc(x.ro)}"></div><button class="btn btn-primary btn-block" onclick="saveTagRename('${id}')">Salvează</button>`)};
 window.saveTagRename=function(id){const x=DB.data.tags.find(t=>t.id===id),n=document.getElementById('tagRen').value.trim();if(!n)return;x.ro=n;x.en=n;DB.save();closeMdl();nav('tags');toast('Etichetă actualizată','ok')};
 window.delTagAdmin=function(id){const n=tagCount(id);if(!confirm(n?`Eticheta este folosită la ${n} produse. O ștergi?`:'Ștergi eticheta?'))return;DB.products().forEach(p=>{p.tags=(p.tags||[]).filter(x=>x!==id);if(p.tag===id)p.tag=''});DB.data.tags=DB.data.tags.filter(x=>x.id!==id);DB.save();nav('tags');toast('Etichetă ștearsă','ok')};

 /* ---------- Arie livrare ---------- */
 window.vDelivery=function(){const A=DB.data.deliveryAreas||[];const cities=[...new Set(A.map(a=>a.city))];
  return head('Arie livrare',A.length+' străzi în '+cities.length+' localități')+`
  <div class="adm-grid">
   <div class="card adm-form"><h3>Adaugă stradă</h3><p class="adm-muted">Numărul imobilului este ignorat. Orice număr de pe stradă este eligibil.</p>
    <div class="field"><label>Stradă</label><input class="inp" id="daStreet" placeholder="Ex: Strada Sofia"></div>
    <div class="field"><label>Localitate</label><input class="inp" id="daCity" placeholder="Ex: Otopeni" onkeydown="if(event.key==='Enter')saveDeliveryArea()"></div>
    <button class="btn btn-primary btn-block" onclick="saveDeliveryArea()">＋ Adaugă în aria de livrare</button>
    <div class="adm-test"><label>Testează o adresă</label><div class="adm-test-row"><input class="inp" id="daTest" placeholder="Ex: Strada Sofia 12, Otopeni"><button class="btn btn-outline btn-sm" onclick="testDeliveryArea()">Verifică</button></div><div id="daTestRes"></div></div></div>
   <div class="card"><div class="ch"><h3>Străzi eligibile</h3></div>
    ${cities.length?cities.map(city=>`<div class="adm-group"><div class="adm-group-title">📍 ${esc(city)} <span>${A.filter(a=>a.city===city).length}</span></div><div class="adm-list">${A.filter(a=>a.city===city).map(a=>`<div class="adm-item"><span><b>${esc(a.street)}</b></span><span class="adm-meta">orice număr</span><div class="adm-actions"><button class="adm-ico danger" title="Șterge" onclick="delDeliveryArea('${a.id}')">🗑️</button></div></div>`).join('')}</div></div>`).join(''):'<div class="adm-empty">Nu există adrese în aria de livrare.</div>'}</div>
  </div>`};
 window.saveDeliveryArea=function(){const street=document.getElementById('daStreet').value.trim(),city=document.getElementById('daCity').value.trim();if(!street||!city)return toast('Completează strada și localitatea','err');DB.data.deliveryAreas=DB.data.deliveryAreas||[];DB.data.deliveryAreas.push({id:DB.uid('area_'),street,city});DB.save();nav('delivery');toast('Adresă adăugată','ok')};
 window.delDeliveryArea=function(id){if(!confirm('Ștergi strada din aria de livrare?'))return;DB.data.deliveryAreas=DB.data.deliveryAreas.filter(x=>x.id!==id);DB.save();nav('delivery')};
 const nrm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\b(strada|str\.?|nr\.?|numarul)\b/g,' ').replace(/\d+/g,' ').replace(/[,.-]/g,' ').replace(/\s+/g,' ').trim();
 window.testDeliveryArea=function(){const v=nrm(document.getElementById('daTest').value),ok=(DB.data.deliveryAreas||[]).some(a=>v.includes(nrm(a.street))&&v.includes(nrm(a.city)));document.getElementById('daTestRes').innerHTML=`<div class="adm-test-res ${ok?'ok':'err'}">${ok?'✅ Adresa este în aria de livrare':'❌ Adresa nu este în aria de livrare'}</div>`};

 /* ---------- Valori nutriționale în formularul de produs ---------- */
 const NUTR=[['kj','Valoare energetică (kJ)'],['kcal','Valoare energetică (kcal)'],['fat','Grăsimi (g)'],['sat','din care acizi grași saturați (g)'],['carbs','Glucide (g)'],['sugars','din care zaharuri (g)'],['fiber','Fibre (g)'],['protein','Proteine (g)'],['salt','Sare (g)']];
 const editV10=window.editProduct;window.editProduct=function(id){editV10(id);const p=id?DB.product(id):{};const n=p.nutrition||{};const btn=document.querySelector('#mdlBox .btn-primary.btn-block');if(!btn)return;
  btn.insertAdjacentHTML('beforebegin',`<details class="nutr-admin" ${Object.keys(n).length?'open':''}><summary>🥗 Valori nutriționale <small>(opțional — apar pe pagina produsului doar dacă sunt completate)</small></summary>
   <div class="field" style="max-width:220px;margin-top:12px"><label>Valori medii per</label><select class="inp" id="nBasis">${['100 g','100 ml'].map(b=>`<option ${n.basis===b?'selected':''}>${b}</option>`).join('')}</select></div>
   <div class="grid3">${NUTR.map(([k,l])=>`<div class="field"><label>${l}</label><input class="inp" id="n_${k}" type="number" step="0.01" min="0" value="${n[k]??''}"></div>`).join('')}</div></details>`)};
 const saveV10=window.saveProduct;window.saveProduct=function(id){const n={basis:document.getElementById('nBasis')?.value||'100 g'};let any=false;NUTR.forEach(([k])=>{const v=document.getElementById('n_'+k)?.value;if(v!==undefined&&v!==''){n[k]=v;any=true}});const before=DB.products().map(p=>p.id);saveV10(id);const p=id?DB.product(id):DB.products().find(p=>!before.includes(p.id));if(p){p.nutrition=any?n:null;DB.save()}};
 addLinks();
})();
/* ===== PUR&simplu V15 — adăugat la finalul admin-enhancements.js ===== */
(function(){
  const grams=q=>Math.round(q*100);
  function fixTotals(o){recalcOrder(o);if(o.payment==='store'){o.shipping=0;o.total=+(o.subtotal-o.discount).toFixed(2)}}

  /* Modificare gramaj real: recalculează totalul și salvează nota pentru client */
  window.oeSetGrams=function(id,ix,g){
    const o=DB.order(id),it=o.items[ix];if(!o||!it)return;
    const real=Math.max(1,Math.round(+g||1));
    if(it.reqQty==null)it.reqQty=it.qty;              // cantitatea comandată inițial de client
    if(o.originalTotal==null)o.originalTotal=o.total;  // totalul inițial, înainte de orice ajustare
    it.qty=real/100;it.per100g=true;
    o.adjustments=o.adjustments||{};
    const reqG=grams(it.reqQty);
    if(real===reqG)delete o.adjustments[it.id];
    else o.adjustments[it.id]={name:it.name_ro,reqG,realG:real,reqPrice:+(it.price*it.reqQty).toFixed(2),realPrice:+(it.price*it.qty).toFixed(2)};
    fixTotals(o);
    if(!Object.keys(o.adjustments).length){delete o.originalTotal}
    DB.save();editOrder(id);
    toast(real===reqG?'Gramaj readus la valoarea comandată':`Gramaj actualizat: ${reqG} g → ${real} g · total ${money(o.total)}`,'ok');
  };

  /* În editorul comenzii: afișează ce vede clientul */
  const baseEdit=window.editOrder;
  window.editOrder=function(id){
    baseEdit(id);const o=DB.order(id),adj=Object.values(o.adjustments||{});
    const box=document.getElementById('mdlBox'),hint=box&&box.querySelector('.hint');if(!hint)return;
    if(adj.length)hint.insertAdjacentHTML('beforebegin',`<div class="adm-adjust"><b>⚖️ Ajustări vizibile clientului</b>${adj.map(a=>`<div>${esc(a.name)}: ${a.reqG} g → ${a.realG} g · ${money(a.reqPrice)} → ${money(a.realPrice)}</div>`).join('')}${o.originalTotal!=null?`<div class="adm-adjust-total">Total: ${money(o.originalTotal)} → <b>${money(o.total)}</b></div>`:''}</div>`);
    // pentru produsele la gramaj, afișează și gramajul comandat lângă câmp
    o.items.forEach((it,ix)=>{if(it.reqQty==null)return;const row=box.querySelectorAll('table.tb tbody tr')[ix];const cell=row&&row.querySelector('.weight-qty-inline');if(cell&&!cell.querySelector('.req-g'))cell.insertAdjacentHTML('beforeend',`<small class="req-g">comandat ${grams(it.reqQty)} g</small>`)});
  };
})();
