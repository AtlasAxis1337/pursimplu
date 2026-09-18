/* ===== PUR&simplu – Data layer (localStorage "backend") ===== */
const DB_KEY = 'pursimplu_db_v4';

function p(slug,ro,en,cat,price,oldPrice,unit,stock,rating,featured,tag){
  return { id:'p'+(p._i=(p._i||0)+1), slug, name_ro:ro, name_en:en, cat,
    img:'assets/img/prod/'+slug+'.jpg', price, oldPrice, unit, stock, rating, featured, tag, active:true,
    desc_ro:'Produs selectat cu grijă de echipa PUR&simplu, de la producători mici din România. Prospețime garantată, livrat în aceeași zi în Tunari, Otopeni, Pipera și nordul Bucureștiului.',
    desc_en:'Carefully selected by the PUR&simplu team from small Romanian producers. Guaranteed freshness, same-day delivery in Tunari, Otopeni, Pipera and northern Bucharest.' };
}

const SEED = {
  categories: [
    { id:'panificatie', ro:'Panificație', en:'Bakery', img:'assets/img/cat/panificatie.jpg', tile:'assets/img/cat/panificatie-sq.jpg', desc_ro:'Pâine cu maia & patiserie', desc_en:'Sourdough bread & pastry' },
    { id:'fructe', ro:'Fructe și Legume', en:'Fruits & Veggies', img:'assets/img/cat/fructe.jpg', tile:'assets/img/cat/fructe-sq.jpg', desc_ro:'Proaspete, de sezon', desc_en:'Fresh and seasonal' },
    { id:'lactate', ro:'Lactate și Ouă', en:'Dairy & Eggs', img:'assets/img/cat/lactate.jpg', tile:'assets/img/cat/lactate-sq.jpg', desc_ro:'De la ferme mici', desc_en:'From small farms' },
    { id:'carne', ro:'Carne', en:'Meat', img:'assets/img/cat/carne.jpg', tile:'assets/img/cat/carne-sq.jpg', desc_ro:'Măcelării locale', desc_en:'Local butchers' },
    { id:'peste', ro:'Pește', en:'Fish', img:'assets/img/cat/peste.jpg', tile:'assets/img/cat/peste-sq.jpg', desc_ro:'Proaspăt, pe gheață', desc_en:'Fresh, on ice' },
    { id:'conserve', ro:'Conserve', en:'Canned Goods', img:'assets/img/cat/conserve.jpg', tile:'assets/img/cat/conserve-sq.jpg', desc_ro:'Cămara plină', desc_en:'A full pantry' },
    { id:'bauturi', ro:'Băuturi', en:'Beverages', img:'assets/img/cat/bauturi.jpg', tile:'assets/img/cat/bauturi-sq.jpg', desc_ro:'Sucuri, apă, vin', desc_en:'Juice, water, wine' }
  ],

  products: [
    p('paine-secara','Pâine cu maia de secară','Rye sourdough bread','panificatie',16.9,null,'800 g',42,4.9,true,'bio'),
    p('bagheta','Baghetă franțuzească','French baguette','panificatie',7.5,9.5,'250 g',60,4.6,true,'sale'),
    p('croissant','Croissant cu unt','Butter croissant','panificatie',6.5,null,'buc',85,4.9,true,''),
    p('chifla-susan','Pâine cu susan','Sesame bread','panificatie',12.9,null,'500 g',34,4.4,false,''),
    p('paine-seminte','Pâine cu semințe','Multi-seed bread','panificatie',15.5,null,'600 g',28,4.7,true,'bio'),
    p('paine-rozmarin','Pâine cu rozmarin','Rosemary bread','panificatie',14.5,null,'500 g',22,4.5,false,'new'),
    p('paine-alba','Pâine albă cu maia','White sourdough','panificatie',13.9,null,'700 g',38,4.6,false,''),
    p('paine-neagra','Pâine neagră de casă','Homemade dark bread','panificatie',11.9,14.5,'600 g',31,4.4,false,'sale'),

    p('mere','Mere românești','Romanian apples','fructe',7.9,null,'kg',150,4.7,true,'bio'),
    p('rosii-cherry','Roșii cherry','Cherry tomatoes','fructe',16.5,19.9,'500 g',48,4.8,true,'sale'),
    p('morcovi','Morcovi de grădină','Garden carrots','fructe',5.4,null,'kg',80,4.5,false,'bio'),
    p('broccoli','Broccoli proaspăt','Fresh broccoli','fructe',12.9,null,'buc',36,4.3,true,''),
    p('cartofi','Cartofi noi','New potatoes','fructe',4.9,null,'kg',200,4.4,false,''),
    p('ardei-rosu','Ardei gras roșu','Red bell pepper','fructe',13.5,null,'kg',54,4.6,false,''),
    p('castraveti','Castraveți lungi','Long cucumbers','fructe',9.9,null,'kg',62,4.3,false,''),
    p('fasole-verde','Fasole verde păstăi','Green beans','fructe',18.9,null,'500 g',24,4.5,false,'new'),
    p('portocale','Portocale de Sicilia','Sicilian oranges','fructe',10.9,12.9,'kg',70,4.7,true,'sale'),
    p('ceapa-rosie','Ceapă roșie','Red onions','fructe',6.4,null,'kg',88,4.2,false,''),
    p('salata-verde','Salată verde creață','Curly green lettuce','fructe',8.9,null,'buc',40,4.4,false,''),

    p('branza-vaci','Brânză de vaci proaspătă','Fresh cottage cheese','lactate',19.9,null,'500 g',36,4.8,true,''),
    p('lapte','Lapte de fermă 3.5%','Farm milk 3.5%','lactate',9.9,null,'1 L',95,4.7,true,'bio'),
    p('smantana','Smântână 20%','Sour cream 20%','lactate',7.9,null,'400 g',52,4.4,false,''),
    p('cas','Caș matur de oaie','Matured sheep cheese','lactate',48.9,null,'kg',14,4.9,true,''),
    p('unt','Unt 82% grăsime','Butter 82%','lactate',14.9,17.9,'200 g',44,4.6,true,'sale'),
    p('cascaval','Cașcaval de Năsal','Năsal semi-hard cheese','lactate',52.5,null,'kg',18,4.7,false,''),
    p('oua','Ouă de găini crescute liber','Free-range eggs','lactate',19.9,null,'10 buc',58,4.9,true,'bio'),
    p('mozzarella','Mozzarella bilute','Mozzarella pearls','lactate',17.5,null,'250 g',30,4.5,false,'new'),
    p('iaurt','Iaurt grecesc 10%','Greek yogurt 10%','lactate',8.4,null,'400 g',70,4.6,false,''),
    p('telemea','Telemea de oaie','Sheep feta cheese','lactate',36.9,null,'500 g',26,4.8,true,''),

    p('antricot-vita','Antricot de vită maturat','Dry-aged beef ribeye','carne',149.0,null,'kg',9,4.9,true,'new'),
    p('cotlet-porc','Cotlet de porc cu os','Bone-in pork chop','carne',36.9,42.5,'kg',24,4.5,true,'sale'),
    p('muschiulet-porc','Mușchiuleț de porc','Pork tenderloin','carne',44.9,null,'kg',20,4.7,true,''),
    p('kaizer','Piept de porc / kaizer','Pork belly','carne',32.5,null,'kg',26,4.4,false,''),
    p('pulpa-vita','Pulpă de vită','Beef topside','carne',89.9,null,'kg',12,4.6,false,''),
    p('carne-tocata','Mușchi de vită Angus','Angus beef fillet','carne',139.0,null,'kg',7,4.9,true,''),

    p('pastrav','Păstrăv proaspăt','Fresh trout','peste',54.9,null,'kg',15,4.6,true,''),
    p('creveti','Creveți black tiger','Black tiger shrimp','peste',94.0,null,'500 g',9,4.7,true,'new'),
    p('stridii','Stridii franțuzești','French oysters','peste',14.9,null,'buc',24,4.5,false,''),
    p('somon','File de somon norvegian','Norwegian salmon fillet','peste',99.9,115.0,'kg',12,4.9,true,'sale'),
    p('dorada','Dorada proaspătă','Fresh sea bream','peste',69.9,null,'kg',11,4.6,true,''),
    p('macrou','Macrou proaspăt','Fresh mackerel','peste',39.9,null,'kg',20,4.3,false,''),
    p('caracatita','Caracatiță curățată','Cleaned octopus','peste',119.0,null,'kg',5,4.4,false,''),
    p('sardine','Sardine proaspete','Fresh sardines','peste',34.9,null,'kg',16,4.2,false,''),
    p('midii','Midii în cochilie','Mussels in shell','peste',56.0,null,'kg',8,4.3,false,''),

    p('zacusca','Zacuscă de vinete','Aubergine zacuscă','conserve',22.9,null,'500 g',40,4.9,true,'bio'),
    p('dulceata-afine','Dulceață de afine','Blueberry jam','conserve',28.5,null,'350 g',26,4.8,true,''),
    p('gogosari','Gogoșari în oțet','Pickled sweet peppers','conserve',19.9,23.5,'720 ml',33,4.6,true,'sale'),
    p('castraveti-murati','Castraveți murați','Pickled cucumbers','conserve',16.9,null,'720 ml',46,4.5,false,''),
    p('dulceata-zmeura','Dulceață de zmeură','Raspberry jam','conserve',31.9,null,'350 g',19,4.9,true,''),
    p('muraturi-asortate','Murături asortate','Mixed pickles','conserve',21.5,null,'720 ml',28,4.5,false,''),
    p('dulceata-caise','Dulceață de caise','Apricot jam','conserve',24.5,null,'350 g',31,4.7,false,''),
    p('rosii-bulion','Roșii în bulion','Tomatoes in juice','conserve',12.9,null,'800 g',78,4.4,false,''),
    p('mazare-verde','Mazăre verde fină','Fine green peas','conserve',9.9,null,'400 g',66,4.3,false,''),
    p('varza-murata','Varză murată tocată','Shredded sauerkraut','conserve',13.9,null,'700 g',42,4.6,false,''),
    p('bulion','Bulion de roșii','Tomato passata','conserve',15.9,null,'500 ml',50,4.5,false,''),
    p('fasole-pastai','Fasole păstăi în saramură','Pickled green beans','conserve',18.5,null,'720 ml',22,4.4,false,'new'),

    p('suc-morcovi','Suc natural de morcovi','Natural carrot juice','bauturi',17.9,null,'750 ml',36,4.6,true,''),
    p('suc-portocale','Suc natural de portocale','Natural orange juice','bauturi',18.9,22.0,'750 ml',44,4.8,true,'sale'),
    p('apa-plata','Apă minerală de izvor','Spring mineral water','bauturi',4.9,null,'1.5 L',180,4.5,false,''),
    p('cafea','Cafea boabe 100% Arabica','100% Arabica coffee beans','bauturi',68.9,null,'1 kg',19,4.9,true,''),
    p('vin-rosu','Vin roșu Fetească Neagră','Fetească Neagră red wine','bauturi',62.0,75.0,'750 ml',25,4.8,true,'sale'),
    p('limonada','Smoothie de banane','Banana smoothie','bauturi',14.9,null,'500 ml',27,4.4,false,'new'),
    p('suc-visine','Suc natural de vișine','Natural sour cherry juice','bauturi',19.9,null,'750 ml',23,4.7,true,''),
    p('apa-carbogazoasa','Apă carbogazoasă','Sparkling water','bauturi',5.4,null,'1.5 L',140,4.4,false,'')
  ],

  vouchers: [
    { code:'OFERTA10', type:'percent', value:10, minCart:0, active:true, uses:0, maxUses:500, expires:'2027-12-31', desc_ro:'10% reducere la tot coșul', desc_en:'10% off the entire cart' },
    { code:'BUN20', type:'percent', value:20, minCart:250, active:true, uses:0, maxUses:200, expires:'2027-06-30', desc_ro:'20% la coș peste 250 lei', desc_en:'20% off carts over 250 lei' },
    { code:'MINUS25', type:'fixed', value:25, minCart:150, active:true, uses:0, maxUses:300, expires:'2027-12-31', desc_ro:'-25 lei la coș peste 150 lei', desc_en:'-25 lei on carts over 150 lei' },
    { code:'LIVRARE', type:'shipping', value:0, minCart:0, active:true, uses:0, maxUses:999, expires:'2027-12-31', desc_ro:'Livrare gratuită', desc_en:'Free delivery' }
  ],

  users: [
    { id:'u_admin', name:'Administrator PUR&simplu', email:'admin@pursimplu.ro', pass:'admin123', role:'admin', phone:'0721 071 027', address:'Strada San Marco 1-5, Tunari, Ilfov', created:'2026-01-10' },
    { id:'u_demo', name:'Ana Popescu', email:'ana@exemplu.ro', pass:'demo1234', role:'client', phone:'0722 111 222', address:'Str. Lalelelor 12, ap. 3, Tunari, Ilfov', created:'2026-03-02' },
    { id:'u_demo2', name:'Mihai Ionescu', email:'mihai@exemplu.ro', pass:'demo1234', role:'client', phone:'0733 444 555', address:'Bd. Pipera 55, București', created:'2026-05-19' }
  ],

  orders: [],

  settings: {
    shipping: 19.9, freeOver: 200, currency: 'lei',
    store: {
      name:'PUR&simplu', tagline_ro:'Băcănie contemporană', tagline_en:'Contemporary grocery',
      address:'Strada San Marco 1-5, Tunari, Ilfov 077180', phone:'0721 071 027',
      email:'salut@pursimplu.ro', rating:4.9, reviewCount:16,
      hours_ro:['Luni: Închis','Marți – Vineri: 09:00 – 20:00','Sâmbătă – Duminică: 09:00 – 15:00'],
      hours_en:['Monday: Closed','Tuesday – Friday: 09:00 – 20:00','Saturday – Sunday: 09:00 – 15:00']
    }
  }
};

/* ---------- DB helpers ---------- */
const DB = {
  data: null,
  load(){
    const raw = localStorage.getItem(DB_KEY);
    if (raw){ try { this.data = JSON.parse(raw); } catch(e){ this.data = null; } }
    if (!this.data){ this.data = JSON.parse(JSON.stringify(SEED)); this.seedOrders(); this.save(); }
    return this.data;
  },
  save(){ localStorage.setItem(DB_KEY, JSON.stringify(this.data)); },
  reset(){ localStorage.removeItem(DB_KEY); this.data = null; this.load(); },
  seedOrders(){
    const d = this.data, pr = d.products;
    const mk = (uid, days, status, items, code) => {
      const its = items.map(([i,q]) => ({ id:pr[i].id, name_ro:pr[i].name_ro, name_en:pr[i].name_en,
        img:pr[i].img, price:pr[i].price, qty:q }));
      const sub = its.reduce((s,x)=>s+x.price*x.qty,0);
      const v = code ? d.vouchers.find(x=>x.code===code) : null;
      let disc = 0;
      if (v && sub >= v.minCart){ disc = v.type==='percent' ? sub*v.value/100 : v.type==='fixed' ? Math.min(v.value,sub) : 0; }
      const ship = (sub-disc) >= 200 ? 0 : 19.9;
      const u = d.users.find(x=>x.id===uid);
      return { id:'PS-'+(1000+Math.floor(Math.random()*8999)), userId:uid, customer:u.name, email:u.email,
        phone:u.phone, address:u.address, items:its, subtotal:+sub.toFixed(2), discount:+disc.toFixed(2),
        voucher:code||null, shipping:ship, total:+(sub-disc+ship).toFixed(2), status,
        payment: days%2 ? 'card' : 'ramburs', date:new Date(Date.now()-days*864e5).toISOString(), note:'' };
    };
    d.orders = [
      mk('u_demo',  1, 'nou',       [[0,2],[20,1],[26,1]], 'OFERTA10'),
      mk('u_demo2', 3, 'preparare', [[30,1],[35,1],[44,2]], null),
      mk('u_demo',  6, 'livrare',   [[8,3],[12,1],[57,2]], null),
      mk('u_demo2', 9, 'finalizat', [[61,1],[2,4],[24,1]], 'MINUS25'),
      mk('u_demo', 14, 'finalizat', [[9,2],[27,1],[46,1],[5,1]], null),
      mk('u_demo2',21, 'anulat',    [[33,1],[38,1]], null)
    ];
  },
  products(){ return this.data.products; },
  categories(){ return this.data.categories; },
  orders(){ return this.data.orders; },
  users(){ return this.data.users; },
  vouchers(){ return this.data.vouchers; },
  product(id){ return this.data.products.find(x=>x.id===id); },
  category(id){ return this.data.categories.find(x=>x.id===id); },
  order(id){ return this.data.orders.find(x=>x.id===id); },
  user(id){ return this.data.users.find(x=>x.id===id); },
  voucher(code){ return this.data.vouchers.find(v=>v.code===String(code||'').trim().toUpperCase()); },
  uid(pref){ return pref + Date.now().toString(36) + Math.floor(Math.random()*999).toString(36); }
};

/* ---------- session ---------- */
const Session = {
  key:'pursimplu_session',
  get(){ const id = localStorage.getItem(this.key); return id ? DB.user(id) : null; },
  set(u){ localStorage.setItem(this.key, u.id); },
  clear(){ localStorage.removeItem(this.key); }
};

/* ---------- cart ---------- */
const Cart = {
  key(){ const u = Session.get(); return 'pursimplu_cart_' + (u ? u.id : 'guest'); },
  get(){ try { return JSON.parse(localStorage.getItem(this.key())) || { items:[], voucher:null }; }
         catch(e){ return { items:[], voucher:null }; } },
  set(c){ localStorage.setItem(this.key(), JSON.stringify(c)); },
  count(){ return this.get().items.reduce((s,i)=>s+i.qty,0); },
  totals(){
    const c = this.get(), s = DB.data.settings;
    const sub = c.items.reduce((t,i)=>{ const p = DB.product(i.id); return t + (p ? p.price*i.qty : 0); },0);
    let disc = 0, freeShip = false;
    const v = c.voucher ? DB.voucher(c.voucher) : null;
    if (v && v.active && sub >= v.minCart){
      if (v.type==='percent') disc = sub * v.value/100;
      else if (v.type==='fixed') disc = Math.min(v.value, sub);
      else if (v.type==='shipping') freeShip = true;
    }
    const after = sub - disc;
    const ship = (after >= s.freeOver || freeShip || sub===0) ? 0 : s.shipping;
    return { sub:+sub.toFixed(2), disc:+disc.toFixed(2), ship:+ship.toFixed(2), total:+(after+ship).toFixed(2), voucher:v };
  }
};

const money = n => Number(n||0).toFixed(2).replace('.', ',') + ' lei';
