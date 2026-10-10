/* ==========================================================================
   PUR&simplu — Import produse din CSV  (modul independent)
   Se încarcă în admin.html DUPĂ admin.js:
     <script src="assets/js/admin-import.js"></script>
   Nu modifică niciun fișier existent.
   ========================================================================== */
(function(){
  'use strict';

  /* ---------- 1. Parser CSV (RFC 4180: ghilimele, virgule în text, \n în câmp) ---------- */
  function parseCSV(text, delim){
    text = text.replace(/^\uFEFF/, '');              // taie BOM-ul Excel
    const rows = []; let row = [], val = '', q = false;
    for (let i = 0; i < text.length; i++){
      const c = text[i], n = text[i+1];
      if (q){
        if (c === '"' && n === '"'){ val += '"'; i++; }
        else if (c === '"'){ q = false; }
        else val += c;
      } else {
        if (c === '"') q = true;
        else if (c === delim){ row.push(val); val = ''; }
        else if (c === '\r'){ /* ignoră */ }
        else if (c === '\n'){ row.push(val); rows.push(row); row = []; val = ''; }
        else val += c;
      }
    }
    if (val !== '' || row.length){ row.push(val); rows.push(row); }
    return rows.filter(r => r.some(c => String(c).trim() !== ''));
  }

  /* delimitatorul: Excel RO salvează cu ";" */
  function sniffDelim(text){
    const line = text.split(/\r?\n/)[0] || '';
    const c = (line.match(/,/g)||[]).length, s = (line.match(/;/g)||[]).length, t = (line.match(/\t/g)||[]).length;
    return (t > c && t > s) ? '\t' : (s > c ? ';' : ',');
  }

  /* ---------- 2. Normalizare ---------- */
  const norm = s => String(s||'').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');

  /* sinonime acceptate pentru fiecare coloană */
  const COLS = {
    name_ro:  ['nume_ro','denumire_ro','nume','denumire','produs','name_ro','name'],
    name_en:  ['nume_en','denumire_en','name_en','english'],
    cat:      ['categorie','cat','category','categorie_id'],
    price:    ['pret','pret_lei','price','pret_curent'],
    oldPrice: ['pret_vechi','oldprice','old_price','pret_intreg','pret_initial'],
    unit:     ['unitate','um','unit','unitate_masura'],
    stock:    ['stoc','stock','cantitate','qty'],
    img:      ['imagine','img','image','poza','imagine_cale'],
    tag:      ['eticheta','tag','label'],
    rating:   ['rating','nota','scor'],
    featured: ['recomandat','featured','promovat'],
    active:   ['activ','active','publicat'],
    desc_ro:  ['descriere_ro','descriere','desc_ro'],
    desc_en:  ['descriere_en','desc_en']
  };

  function mapHeader(headerRow){
    const map = {}, unknown = [];
    headerRow.forEach((h, idx) => {
      const n = norm(h); let found = null;
      for (const key in COLS){ if (COLS[key].includes(n)){ found = key; break; } }
      if (found) map[found] = idx; else if (n) unknown.push(h.trim());
    });
    return { map, unknown };
  }

  const numRO = v => {
    if (v === undefined || v === null) return NaN;
    let s = String(v).trim().replace(/\s|lei|RON/gi,'');
    if (s === '') return NaN;
    if (s.includes(',') && s.includes('.')) s = s.replace(/\./g,'').replace(',','.');  // 1.234,50
    else s = s.replace(',','.');
    return parseFloat(s);
  };
  const boolRO = v => {
    const s = norm(v);
    if (['1','da','yes','true','adevarat','x','y'].includes(s)) return true;
    if (['0','nu','no','false','fals',''].includes(s)) return false;
    return null;
  };
  const slugify = s => String(s||'').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50);

  /* rezolvă categoria: după id, după nume RO sau EN */
  function resolveCat(raw){
    const n = norm(raw);
    if (!n) return null;
    const cats = DB.categories();
    return (cats.find(c => norm(c.id) === n) ||
            cats.find(c => norm(c.ro) === n) ||
            cats.find(c => norm(c.en) === n) || null);
  }

  /* ---------- 3. Validare rând cu rând ---------- */
  let IMPORT = { rows: [], stats: null, fileName: '' };

  function analyse(text){
    const delim = sniffDelim(text);
    const table = parseCSV(text, delim);
    if (table.length < 2) return { fatal: 'Fișierul nu conține date (minim un cap de tabel și un rând).' };

    const { map, unknown } = mapHeader(table[0]);
    if (map.name_ro === undefined) return { fatal: 'Lipsește coloana obligatorie "nume_ro" (denumirea produsului).' };
    if (map.cat === undefined)     return { fatal: 'Lipsește coloana obligatorie "categorie".' };
    if (map.price === undefined)   return { fatal: 'Lipsește coloana obligatorie "pret".' };

    const get = (r, k) => map[k] !== undefined ? String(r[map[k]] ?? '').trim() : '';
    const seen = {};                                  // duplicate în interiorul fișierului
    const rows = [];

    for (let i = 1; i < table.length; i++){
      const r = table[i];
      const errs = [], warns = [];

      const name_ro = get(r,'name_ro');
      if (!name_ro) errs.push('denumire lipsă');

      const catRaw = get(r,'cat');
      const cat = resolveCat(catRaw);
      if (!cat && catRaw) errs.push('categorie necunoscută: "'+catRaw+'"');
      if (!catRaw) errs.push('categorie lipsă');

      const price = numRO(get(r,'price'));
      if (isNaN(price)) errs.push('preț invalid');
      else if (price <= 0) errs.push('prețul trebuie să fie > 0');

      let oldPrice = map.oldPrice !== undefined ? numRO(get(r,'oldPrice')) : NaN;
      if (!isNaN(oldPrice) && !isNaN(price) && oldPrice <= price){
        warns.push('preț vechi ≤ preț curent, ignorat'); oldPrice = NaN;
      }

      let stock = map.stock !== undefined ? numRO(get(r,'stock')) : 0;
      if (isNaN(stock)){ stock = 0; if (get(r,'stock')) warns.push('stoc invalid → 0'); }
      stock = Math.max(0, Math.round(stock));

      let rating = map.rating !== undefined ? numRO(get(r,'rating')) : NaN;
      if (isNaN(rating)) rating = 4.5;
      else if (rating < 1 || rating > 5){ rating = Math.min(5, Math.max(1, rating)); warns.push('rating ajustat în 1–5'); }

      let tag = norm(get(r,'tag'));
      const tagMap = { reducere:'sale', sale:'sale', oferta:'sale', nou:'new', new:'new', noutate:'new',
                       bio:'bio', organic:'bio', eco:'bio', '':'' };
      if (tagMap[tag] === undefined){ warns.push('etichetă necunoscută "'+get(r,'tag')+'", ignorată'); tag = ''; }
      else tag = tagMap[tag];
      if (tag === 'sale' && isNaN(oldPrice)) warns.push('etichetă "reducere" fără preț vechi');

      const featured = map.featured !== undefined ? (boolRO(get(r,'featured')) ?? false) : false;
      const activeV  = map.active   !== undefined ? (boolRO(get(r,'active'))   ?? true)  : true;

      let img = get(r,'img');
      if (!img && cat) img = 'assets/img/cat/' + cat.id + '-sq.jpg';   // fallback: poza categoriei
      if (img && !/^(https?:)?\/\//.test(img) && !img.startsWith('assets/')) img = 'assets/img/prod/' + img;

      const unit = get(r,'unit') || 'buc';

      /* duplicate: în fișier şi în catalogul existent */
      const key = norm(name_ro);
      if (seen[key]) errs.push('duplicat în fișier (rândul ' + seen[key] + ')');
      else seen[key] = i + 1;

      const existing = DB.products().find(p => norm(p.name_ro) === key);
      if (existing) warns.push('există deja în catalog');

      rows.push({
        line: i + 1,
        ok: errs.length === 0,
        errs, warns, existing: existing ? existing.id : null,
        data: {
          slug: slugify(name_ro),
          name_ro,
          name_en: get(r,'name_en') || name_ro,
          cat: cat ? cat.id : '',
          catLabel: cat ? cat.ro : catRaw,
          img,
          price: isNaN(price) ? 0 : +price.toFixed(2),
          oldPrice: isNaN(oldPrice) ? null : +oldPrice.toFixed(2),
          unit, stock, rating: +rating.toFixed(1), featured, tag,
          active: activeV,
          desc_ro: get(r,'desc_ro') || 'Produs selectat cu grijă de echipa PUR&simplu, de la producători mici din România.',
          desc_en: get(r,'desc_en') || get(r,'desc_ro') || 'Carefully selected by the PUR&simplu team from small Romanian producers.'
        }
      });
    }

    const valid = rows.filter(r => r.ok);
    return {
      delim, unknown, rows,
      stats: {
        total: rows.length,
        valid: valid.length,
        errors: rows.length - valid.length,
        warns: rows.filter(r => r.ok && r.warns.length).length,
        updates: valid.filter(r => r.existing).length,
        creates: valid.filter(r => !r.existing).length
      }
    };
  }

  /* ---------- 4. Ecranul de import ---------- */
  function vImport(){
    const cats = DB.categories();
    const s = IMPORT.stats;

    return head('Import produse (CSV)',
      'Încarcă zeci de produse deodată, din categorii diferite, dintr-un singur fișier',
      `<button class="btn btn-outline btn-sm" onclick="csvTemplate()">⬇️ Descarcă model CSV</button>`) +

    `<div class="card">
      <div class="ch"><h3>1 · Alege fișierul</h3></div>
      <div id="csvDrop" class="csv-drop">
        <div class="csv-ico">📄</div>
        <b>Trage fișierul .csv aici</b>
        <p>sau apasă pentru a-l alege din calculator · se acceptă separator <code>,</code> <code>;</code> sau Tab</p>
        <input type="file" id="csvFile" accept=".csv,.txt,text/csv" hidden>
      </div>
      ${IMPORT.fileName ? `<p style="margin:12px 0 0;font-size:13px;color:var(--muted)">Fișier încărcat: <b style="color:var(--ink)">${esc(IMPORT.fileName)}</b></p>` : ''}
      <div id="csvMsg"></div>
    </div>

    ${s ? `
    <div class="card">
      <div class="ch"><h3>2 · Verifică rezultatul</h3>
        <span style="font-size:12.5px;color:var(--muted)">separator detectat: <code>${IMPORT.delim === '\t' ? 'Tab' : IMPORT.delim}</code></span></div>
      <div class="stats" style="margin-bottom:16px">
        <div class="stat"><span class="e">📋</span><div><b>${s.total}</b><span>rânduri citite</span></div></div>
        <div class="stat"><span class="e" style="background:var(--green-l)">✅</span><div><b>${s.valid}</b><span>valide (${s.creates} noi · ${s.updates} actualizări)</span></div></div>
        <div class="stat"><span class="e" style="background:#fff4e0">⚠️</span><div><b>${s.warns}</b><span>cu avertismente</span></div></div>
        <div class="stat"><span class="e" style="background:#fdeaea">⛔</span><div><b>${s.errors}</b><span>cu erori (se sar)</span></div></div>
      </div>

      ${IMPORT.unknown.length ? `<div class="hint">Coloane necunoscute, ignorate: <b>${IMPORT.unknown.map(esc).join(', ')}</b></div>` : ''}

      <div class="tbl-scroll" style="max-height:440px;overflow-y:auto">
        <table class="tb"><thead><tr>
          <th>Rând</th><th></th><th>Produs</th><th>Categorie</th><th>Preț</th><th>Stoc</th><th>Stare</th></tr></thead>
        <tbody>${IMPORT.rows.map(r => `<tr style="${r.ok?'':'background:#fff8f8'}">
          <td style="color:var(--muted)">${r.line}</td>
          <td><span class="oe-thumb"><img src="${esc(r.data.img)}" alt="" onerror="this.style.opacity=.25"></span></td>
          <td><b>${esc(r.data.name_ro)}</b><div style="font-size:11.5px;color:var(--muted)">${esc(r.data.name_en)}</div></td>
          <td>${esc(r.data.catLabel || '—')}</td>
          <td><b>${r.data.price ? money(r.data.price) : '—'}</b>${r.data.oldPrice?`<div style="font-size:11.5px;color:var(--muted);text-decoration:line-through">${money(r.data.oldPrice)}</div>`:''}</td>
          <td>${r.data.stock}</td>
          <td>${ r.ok
              ? (r.existing ? '<span class="chip c-prep">actualizare</span>' : '<span class="chip c-done">nou</span>')
                + (r.warns.length ? `<div style="font-size:11px;color:#b26a00;margin-top:3px">⚠ ${r.warns.map(esc).join('; ')}</div>` : '')
              : `<span class="chip c-cancel">eroare</span><div style="font-size:11px;color:var(--red);margin-top:3px">${r.errs.map(esc).join('; ')}</div>` }</td>
        </tr>`).join('')}</tbody></table>
      </div>
    </div>

    <div class="card">
      <div class="ch"><h3>3 · Confirmă importul</h3></div>
      <label class="imp-opt"><input type="checkbox" id="impUpdate" checked>
        <span><b>Actualizează produsele existente</b><br><small>Dacă denumirea există deja, îi schimb prețul, stocul și restul datelor. Debifat → produsele existente sunt sărite.</small></span></label>
      <label class="imp-opt"><input type="checkbox" id="impSkipErr" checked disabled>
        <span><b>Sar peste rândurile cu erori</b><br><small>Cele ${s.errors} rânduri cu probleme nu vor fi importate.</small></span></label>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">
        <button class="btn btn-primary" ${s.valid?'':'disabled'} onclick="csvCommit()">✔️ Importă ${s.valid} produse</button>
        <button class="btn btn-outline" onclick="csvReset()">Anulează</button>
      </div>
    </div>` : `
    <div class="card">
      <div class="ch"><h3>Cum trebuie să arate fișierul</h3></div>
      <p style="color:var(--muted);margin-top:0">Prima linie conține numele coloanelor. Ordinea lor nu contează, iar coloanele opționale pot lipsi complet.</p>
      <div class="tbl-scroll"><table class="tb"><thead><tr><th>Coloană</th><th>Obligatorie</th><th>Explicație</th><th>Exemplu</th></tr></thead><tbody>
        <tr><td><code>nume_ro</code></td><td><span class="chip c-cancel">DA</span></td><td>Denumirea produsului în română</td><td>Pâine cu maia</td></tr>
        <tr><td><code>categorie</code></td><td><span class="chip c-cancel">DA</span></td><td>ID-ul sau numele categoriei</td><td>panificatie</td></tr>
        <tr><td><code>pret</code></td><td><span class="chip c-cancel">DA</span></td><td>Preț curent, cu virgulă sau punct</td><td>16,90</td></tr>
        <tr><td><code>nume_en</code></td><td>nu</td><td>Denumirea în engleză</td><td>Sourdough bread</td></tr>
        <tr><td><code>pret_vechi</code></td><td>nu</td><td>Prețul tăiat, pentru reduceri</td><td>19,90</td></tr>
        <tr><td><code>unitate</code></td><td>nu</td><td>Unitate de măsură</td><td>kg · buc · 500 g</td></tr>
        <tr><td><code>stoc</code></td><td>nu</td><td>Cantitate disponibilă</td><td>40</td></tr>
        <tr><td><code>imagine</code></td><td>nu</td><td>Cale sau nume de fișier</td><td>assets/img/prod/mere.jpg</td></tr>
        <tr><td><code>eticheta</code></td><td>nu</td><td>reducere · nou · bio</td><td>bio</td></tr>
        <tr><td><code>rating</code></td><td>nu</td><td>Între 1 și 5</td><td>4,8</td></tr>
        <tr><td><code>recomandat</code></td><td>nu</td><td>da / nu — apare pe prima pagină</td><td>da</td></tr>
        <tr><td><code>activ</code></td><td>nu</td><td>da / nu — vizibil în magazin</td><td>da</td></tr>
        <tr><td><code>descriere_ro</code></td><td>nu</td><td>Text descriptiv</td><td>Coaptă zilnic…</td></tr>
      </tbody></table></div>
      <div class="hint">Categorii disponibile acum: ${cats.map(c=>`<code>${c.id}</code>`).join(' · ')}<br>
        Poți scrie fie ID-ul (<code>panificatie</code>), fie numele afișat (<code>Panificație</code>).
        Dacă nu completezi <code>imagine</code>, produsul primește automat poza categoriei.</div>
    </div>`}`;
  }

  /* ---------- 5. Acțiuni ---------- */
  window.csvReset = function(){ IMPORT = { rows:[], stats:null, fileName:'' }; nav('import'); };

  window.csvCommit = function(){
    const doUpdate = document.getElementById('impUpdate').checked;
    let created = 0, updated = 0, skipped = 0;

    IMPORT.rows.filter(r => r.ok).forEach(r => {
      const d = r.data;
      if (r.existing){
        if (!doUpdate){ skipped++; return; }
        Object.assign(DB.product(r.existing), {
          name_ro:d.name_ro, name_en:d.name_en, cat:d.cat, img:d.img, price:d.price,
          oldPrice:d.oldPrice, unit:d.unit, stock:d.stock, rating:d.rating,
          featured:d.featured, tag:d.tag, active:d.active, desc_ro:d.desc_ro, desc_en:d.desc_en
        });
        updated++;
      } else {
        DB.products().unshift({
          id: DB.uid('p_'), slug:d.slug, name_ro:d.name_ro, name_en:d.name_en, cat:d.cat,
          img:d.img, price:d.price, oldPrice:d.oldPrice, unit:d.unit, stock:d.stock,
          rating:d.rating, featured:d.featured, tag:d.tag, active:d.active,
          desc_ro:d.desc_ro, desc_en:d.desc_en
        });
        created++;
      }
    });

    DB.save();
    IMPORT = { rows:[], stats:null, fileName:'' };
    nav('products');
    toast(`Import reușit: ${created} produse noi, ${updated} actualizate${skipped?', '+skipped+' sărite':''}`, 'ok');
  };

  window.csvTemplate = function(){
    const cats = DB.categories();
    const head = 'nume_ro;nume_en;categorie;pret;pret_vechi;unitate;stoc;imagine;eticheta;rating;recomandat;activ;descriere_ro';
    const sample = cats.slice(0,3).map((c,i) =>
      `Produs exemplu ${i+1};Sample product ${i+1};${c.id};${(10+i*5).toFixed(2).replace('.',',')};;buc;25;;${['bio','nou',''][i]||''};4,5;nu;da;Descriere scurtă a produsului.`);
    const csv = '\uFEFF' + [head, ...sample].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8'}));
    a.download = 'model-import-produse.csv'; a.click();
    toast('Model CSV descărcat','ok');
  };

  function readFile(file){
    if (!file) return;
    if (file.size > 5e6) return toast('Fișier prea mare (max 5 MB)','err');
    const rd = new FileReader();
    rd.onload = e => {
      const res = analyse(e.target.result);
      if (res.fatal){
        IMPORT = { rows:[], stats:null, fileName:file.name };
        nav('import');
        document.getElementById('csvMsg').innerHTML =
          `<div class="hint" style="background:#fdeaea;color:var(--red);font-weight:600">⛔ ${esc(res.fatal)}</div>`;
        return toast(res.fatal,'err');
      }
      IMPORT = Object.assign({ fileName:file.name }, res);
      nav('import');
      toast(`${res.stats.valid} din ${res.stats.total} rânduri sunt valide`, res.stats.errors ? '' : 'ok');
    };
    rd.readAsText(file, 'UTF-8');
  }

  function bindDrop(){
    const box = document.getElementById('csvDrop'), inp = document.getElementById('csvFile');
    if (!box) return;
    box.onclick = () => inp.click();
    inp.onchange = e => readFile(e.target.files[0]);
    ['dragenter','dragover'].forEach(ev => box.addEventListener(ev, e => {
      e.preventDefault(); box.classList.add('over'); }));
    ['dragleave','drop'].forEach(ev => box.addEventListener(ev, e => {
      e.preventDefault(); box.classList.remove('over'); }));
    box.addEventListener('drop', e => readFile(e.dataTransfer.files[0]));
  }

  /* ---------- 6. Integrare în meniul existent ---------- */
  function addMenuLink(){
    const side = document.querySelector('.side');
    if (!side || side.querySelector('[data-r="import"]')) return;
    const anchor = side.querySelector('[data-r="cats"]') || side.querySelector('[data-r="products"]');
    const a = document.createElement('a');
    a.dataset.r = 'import';
    a.innerHTML = '📥 Import CSV';
    a.onclick = () => nav('import');
    if (anchor && anchor.nextSibling) side.insertBefore(a, anchor.nextSibling);
    else side.appendChild(a);
  }

  const _nav = window.nav;
  window.nav = function(r){
    if (r === 'import'){
      ROUTE = 'import';
      document.querySelectorAll('.side a[data-r]').forEach(a => a.classList.toggle('active', a.dataset.r === 'import'));
      document.getElementById('amain').innerHTML = vImport();
      bindDrop();
      window.scrollTo(0,0);
      return;
    }
    _nav(r);
    addMenuLink();
  };

  /* linkul apare şi dacă adminul e deja autentificat la încărcarea paginii */
  const obs = new MutationObserver(() => {
    if (!document.getElementById('app').classList.contains('hidden')) addMenuLink();
  });
  obs.observe(document.getElementById('app'), { attributes:true, attributeFilter:['class'] });
  if (!document.getElementById('app').classList.contains('hidden')) addMenuLink();

  /* ---------- 7. Stiluri proprii ---------- */
  const css = document.createElement('style');
  css.textContent = `
    .csv-drop{border:2px dashed var(--line);border-radius:14px;padding:34px 20px;text-align:center;cursor:pointer;
      transition:.2s;background:var(--bg)}
    .csv-drop:hover,.csv-drop.over{border-color:var(--green);background:var(--green-l)}
    .csv-drop .csv-ico{font-size:40px;margin-bottom:8px}
    .csv-drop b{display:block;font-size:15px;margin-bottom:4px}
    .csv-drop p{margin:0;font-size:13px;color:var(--muted)}
    .csv-drop code{background:#fff;padding:1px 6px;border-radius:5px;font-size:12px;border:1px solid var(--line)}
    .imp-opt{display:flex;gap:11px;align-items:flex-start;padding:12px 0;border-bottom:1px solid var(--line);cursor:pointer}
    .imp-opt input{accent-color:var(--green);width:18px;height:18px;margin-top:2px;flex:0 0 auto}
    .imp-opt small{color:var(--muted);font-size:12.5px;line-height:1.5}
    table.tb code{background:var(--bg);padding:2px 7px;border-radius:5px;font-size:12px}
    @media(max-width:900px){ .csv-drop{padding:24px 14px} .csv-drop .csv-ico{font-size:32px} }
  `;
  document.head.appendChild(css);
})();
