/* ===== PUR&simplu – Data layer (localStorage "backend") =====
   SEED generat din exportul din admin (10.10.2026).
   Cheia DB_KEY s-a schimbat în v5: fiecare browser renunță automat la datele vechi
   și încarcă aceste date. Când actualizezi SEED-ul, crește din nou versiunea (v6, v7...). */
const DB_KEY = 'pursimplu_db_v5';
const SEED = {
  "categories": [
    {
      "id": "dulciuri-snacks",
      "ro": "Dulciuri & snacks",
      "en": "Dulciuri & snacks",
      "img": "assets/img/logo.png",
      "tile": "assets/img/logo-sm.png",
      "desc_ro": "Biscuiți · Cacao de specialitate · Creme · Crackers & chips · Ciocolată",
      "desc_en": "Dulciuri & snacks",
      "subcategories": [
        {
          "id": "dulciuri-snacks-1",
          "ro": "Biscuiți",
          "en": "Biscuiți"
        },
        {
          "id": "dulciuri-snacks-2",
          "ro": "Cacao de specialitate",
          "en": "Cacao de specialitate"
        },
        {
          "id": "dulciuri-snacks-3",
          "ro": "Creme",
          "en": "Creme"
        },
        {
          "id": "dulciuri-snacks-4",
          "ro": "Crackers & chips",
          "en": "Crackers & chips"
        },
        {
          "id": "dulciuri-snacks-5",
          "ro": "Ciocolată",
          "en": "Ciocolată"
        }
      ]
    },
    {
      "id": "paine-patiserie",
      "ro": "Pâine și patiserie",
      "en": "Pâine și patiserie",
      "img": "assets/img/logo.png",
      "tile": "assets/img/logo-sm.png",
      "desc_ro": "Pâine · Patiserie dulce · Patiserie sărată",
      "desc_en": "Pâine și patiserie",
      "subcategories": [
        {
          "id": "paine-patiserie-1",
          "ro": "Pâine",
          "en": "Pâine"
        },
        {
          "id": "paine-patiserie-2",
          "ro": "Patiserie dulce",
          "en": "Patiserie dulce"
        },
        {
          "id": "paine-patiserie-3",
          "ro": "Patiserie sărată",
          "en": "Patiserie sărată"
        }
      ]
    },
    {
      "id": "carne-produse",
      "ro": "Carne și produse din carne",
      "en": "Carne și produse din carne",
      "img": "assets/img/logo.png",
      "tile": "assets/img/logo-sm.png",
      "desc_ro": "Carne proaspătă · Mezeluri · Pate-uri",
      "desc_en": "Carne și produse din carne",
      "subcategories": [
        {
          "id": "carne-produse-1",
          "ro": "Carne proaspătă",
          "en": "Carne proaspătă"
        },
        {
          "id": "carne-produse-2",
          "ro": "Mezeluri",
          "en": "Mezeluri"
        },
        {
          "id": "carne-produse-3",
          "ro": "Pate-uri",
          "en": "Pate-uri"
        }
      ]
    },
    {
      "id": "lactate-branzeturi",
      "ro": "Lactate și brânzeturi",
      "en": "Lactate și brânzeturi",
      "img": "assets/img/logo.png",
      "tile": "assets/img/logo-sm.png",
      "desc_ro": "Lactate · Brânzeturi proaspete · Brânzeturi maturate",
      "desc_en": "Lactate și brânzeturi",
      "subcategories": [
        {
          "id": "lactate-branzeturi-1",
          "ro": "Lactate",
          "en": "Lactate"
        },
        {
          "id": "lactate-branzeturi-2",
          "ro": "Brânzeturi proaspete",
          "en": "Brânzeturi proaspete"
        },
        {
          "id": "lactate-branzeturi-3",
          "ro": "Brânzeturi maturate",
          "en": "Brânzeturi maturate"
        }
      ]
    },
    {
      "id": "de-camara",
      "ro": "De cămară",
      "en": "De cămară",
      "img": "assets/img/logo.png",
      "tile": "assets/img/logo-sm.png",
      "desc_ro": "Zacuscă · Murături · Uscate · Miere · Uleiuri · Sosuri · Conserve · Condimente · Ceaiuri",
      "desc_en": "De cămară",
      "subcategories": [
        {
          "id": "de-camara-1",
          "ro": "Zacuscă",
          "en": "Zacuscă"
        },
        {
          "id": "de-camara-2",
          "ro": "Murături",
          "en": "Murături"
        },
        {
          "id": "de-camara-3",
          "ro": "Uscate",
          "en": "Uscate"
        },
        {
          "id": "de-camara-4",
          "ro": "Miere",
          "en": "Miere"
        },
        {
          "id": "de-camara-5",
          "ro": "Uleiuri",
          "en": "Uleiuri"
        },
        {
          "id": "de-camara-6",
          "ro": "Sosuri",
          "en": "Sosuri"
        },
        {
          "id": "de-camara-7",
          "ro": "Conserve",
          "en": "Conserve"
        },
        {
          "id": "de-camara-8",
          "ro": "Condimente",
          "en": "Condimente"
        },
        {
          "id": "de-camara-9",
          "ro": "Ceaiuri",
          "en": "Ceaiuri"
        }
      ]
    },
    {
      "id": "produse-copii",
      "ro": "Produse copii",
      "en": "Produse copii",
      "img": "assets/img/logo.png",
      "tile": "assets/img/logo-sm.png",
      "desc_ro": "Produse copii",
      "desc_en": "Produse copii",
      "subcategories": []
    },
    {
      "id": "peste",
      "ro": "Pește",
      "en": "Pește",
      "img": "assets/img/logo.png",
      "tile": "assets/img/logo-sm.png",
      "desc_ro": "Icre · Conserve · Produse din pește",
      "desc_en": "Pește",
      "subcategories": [
        {
          "id": "peste-1",
          "ro": "Icre",
          "en": "Icre"
        },
        {
          "id": "peste-2",
          "ro": "Conserve",
          "en": "Conserve"
        },
        {
          "id": "peste-3",
          "ro": "Produse din pește",
          "en": "Produse din pește"
        }
      ]
    },
    {
      "id": "bauturi",
      "ro": "Băuturi",
      "en": "Băuturi",
      "img": "assets/img/logo.png",
      "tile": "assets/img/logo-sm.png",
      "desc_ro": "Fără alcool · Cu alcool",
      "desc_en": "Băuturi",
      "subcategories": [
        {
          "id": "bauturi-1",
          "ro": "Fără alcool",
          "en": "Fără alcool"
        },
        {
          "id": "bauturi-2",
          "ro": "Cu alcool",
          "en": "Cu alcool"
        }
      ]
    }
  ],
  "products": [
    {
      "id": "p_mv1zwqyofh",
      "name_ro": "Apa Aqua 0.5L",
      "name_en": "Apa Aqua 0.5L",
      "cat": "bauturi",
      "img": "assets/img/logo-sm.png",
      "unit": "buc",
      "price": 7,
      "oldPrice": 8,
      "stock": 2,
      "tag": "atestat-traditional",
      "rating": 4.5,
      "featured": false,
      "desc_ro": "",
      "desc_en": "",
      "active": true,
      "subcat": "bauturi-1",
      "per100g": false,
      "unitPrice": 7,
      "price100g": null,
      "tags": [
        "atestat-traditional"
      ],
      "soldOut": false
    },
    {
      "id": "p_mv1yfv573o",
      "name_ro": "Ceai Verde",
      "name_en": "Green Tea",
      "cat": "de-camara",
      "img": "assets/img/logo-sm.png",
      "unit": "buc",
      "price": 12,
      "oldPrice": 15,
      "stock": 2,
      "tag": "tag_mv1zjkw2jj",
      "rating": 4.5,
      "featured": false,
      "desc_ro": "",
      "desc_en": "",
      "active": true,
      "subcat": "de-camara-9",
      "per100g": false,
      "unitPrice": 12,
      "price100g": null,
      "tags": [
        "tag_mv1zjkw2jj"
      ],
      "soldOut": false
    },
    {
      "id": "p_mv17yprto5",
      "name_ro": "Branza Maasdamer",
      "name_en": "Branza Maasdamer",
      "cat": "lactate-branzeturi",
      "img": "assets/img/logo-sm.png",
      "unit": "100 g",
      "price": 33,
      "oldPrice": 35,
      "stock": 0,
      "tag": "tag_mv1zjkw2jj",
      "rating": 4.5,
      "featured": false,
      "desc_ro": "Brânza Maasdamer (sau Maasdam) este o brânză olandeză semi-tare, obținută din lapte de vacă, recunoscută în special pentru găurile sale mari, ovale și gustul dulceag.\n\nCaracteristici principale\n\n• Aspect: Culoare crem-gălbuie, densă, elastică, cu găuri mari și rotunde/ovale formate în timpul maturării.\n• Gust și aromă: Aromă dulce, de unt, cu note subtile de nucă și un gust blând, cremos.\n• Comparație: Este adesea asemănată cu brânza elvețiană Emmental (datorită găurilor și a notei de nucă), dar are o textură mai moale și mai cremoasă, fiind creată inițial ca o alternativă olandeză la aceasta.\n• Utilizare: Se consumă ca atare pe platourile de brânzeturi, în sandvișuri, salate sau topită în diverse preparate culinare.",
      "desc_en": "Brânza Maasdamer (sau Maasdam) este o brânză olandeză semi-tare, obținută din lapte de vacă, recunoscută în special pentru găurile sale mari, ovale și gustul dulceag.\n\nCaracteristici principale\n\n• Aspect: Culoare crem-gălbuie, densă, elastică, cu găuri mari și rotunde/ovale formate în timpul maturării.\n• Gust și aromă: Aromă dulce, de unt, cu note subtile de nucă și un gust blând, cremos.\n• Comparație: Este adesea asemănată cu brânza elvețiană Emmental (datorită găurilor și a notei de nucă), dar are o textură mai moale și mai cremoasă, fiind creată inițial ca o alternativă olandeză la aceasta.\n• Utilizare: Se consumă ca atare pe platourile de brânzeturi, în sandvișuri, salate sau topită în diverse preparate culinare.",
      "active": true,
      "subcat": "lactate-branzeturi-3",
      "per100g": true,
      "unitPrice": 33,
      "price100g": 33,
      "tags": [
        "tag_mv1zjkw2jj"
      ],
      "soldOut": false,
      "nutrition": {
        "basis": "100 g",
        "kj": "1473",
        "kcal": "354",
        "fat": "27",
        "sat": "19",
        "carbs": "0",
        "sugars": "0",
        "fiber": "0",
        "protein": "27",
        "salt": "1"
      }
    },
    {
      "id": "p_mv169kv7lb",
      "slug": "demo-dulciuri-snacks-1",
      "name_ro": "Produs demonstrativ · Biscuiți",
      "name_en": "Demo product · Biscuiți",
      "cat": "dulciuri-snacks",
      "subcat": "dulciuri-snacks-1",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": 22,
      "unit": "buc",
      "stock": 27,
      "rating": 4.7,
      "featured": false,
      "tag": "fara-gluten",
      "tags": [
        "fara-gluten"
      ],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Biscuiți.",
      "desc_en": "Demo product for Biscuiți.",
      "unitPrice": 19.9,
      "price100g": null,
      "soldOut": false
    },
    {
      "id": "p_mv169kv75v",
      "slug": "demo-dulciuri-snacks-2",
      "name_ro": "Produs demonstrativ · Cacao de specialitate",
      "name_en": "Demo product · Cacao de specialitate",
      "cat": "dulciuri-snacks",
      "subcat": "dulciuri-snacks-2",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "fara-gluten",
      "tags": [
        "fara-gluten"
      ],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Cacao de specialitate.",
      "desc_en": "Demo product for Cacao de specialitate.",
      "unitPrice": 19.9,
      "soldOut": false,
      "price100g": null
    },
    {
      "id": "p_mv169kv7rk",
      "slug": "demo-dulciuri-snacks-3",
      "name_ro": "Produs demonstrativ · Creme",
      "name_en": "Demo product · Creme",
      "cat": "dulciuri-snacks",
      "subcat": "dulciuri-snacks-3",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "",
      "tags": [],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Creme.",
      "desc_en": "Demo product for Creme.",
      "unitPrice": 19.9,
      "soldOut": false
    },
    {
      "id": "p_mv169kv7nm",
      "slug": "demo-dulciuri-snacks-4",
      "name_ro": "Produs demonstrativ · Crackers & chips",
      "name_en": "Demo product · Crackers & chips",
      "cat": "dulciuri-snacks",
      "subcat": "dulciuri-snacks-4",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "new",
      "tags": [
        "new"
      ],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Crackers & chips.",
      "desc_en": "Demo product for Crackers & chips.",
      "unitPrice": 19.9,
      "soldOut": false
    },
    {
      "id": "p_mv169kv7lq",
      "slug": "demo-dulciuri-snacks-5",
      "name_ro": "Produs demonstrativ · Ciocolată",
      "name_en": "Demo product · Ciocolată",
      "cat": "dulciuri-snacks",
      "subcat": "dulciuri-snacks-5",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": null,
      "unit": "buc",
      "stock": 29,
      "rating": 4.7,
      "featured": false,
      "tag": "",
      "tags": [],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Ciocolată.",
      "desc_en": "Demo product for Ciocolată.",
      "unitPrice": 19.9,
      "soldOut": false
    },
    {
      "id": "p_mv169kv7cx",
      "slug": "demo-paine-patiserie-1",
      "name_ro": "Produs demonstrativ · Pâine fara gluten",
      "name_en": "Demo product · Pâine",
      "cat": "paine-patiserie",
      "subcat": "paine-patiserie-1",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "fara-gluten",
      "tags": [
        "fara-gluten"
      ],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Pâine.",
      "desc_en": "Demo product for Pâine.",
      "unitPrice": 19.9,
      "soldOut": false,
      "price100g": null
    },
    {
      "id": "p_mv169kv7cxb",
      "slug": "demo-paine-patiserie-2",
      "name_ro": "Produs demonstrativ · Patiserie dulce",
      "name_en": "Demo product · Patiserie dulce",
      "cat": "paine-patiserie",
      "subcat": "paine-patiserie-2",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "",
      "tags": [],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Patiserie dulce.",
      "desc_en": "Demo product for Patiserie dulce.",
      "unitPrice": 19.9,
      "soldOut": false
    },
    {
      "id": "p_mv169kv72o",
      "slug": "demo-paine-patiserie-3",
      "name_ro": "Produs demonstrativ · Patiserie sărată",
      "name_en": "Demo product · Patiserie sărată",
      "cat": "paine-patiserie",
      "subcat": "paine-patiserie-3",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "",
      "tags": [],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Patiserie sărată.",
      "desc_en": "Demo product for Patiserie sărată.",
      "unitPrice": 19.9,
      "soldOut": false
    },
    {
      "id": "p_mv169kv7c3",
      "slug": "demo-carne-produse-1",
      "name_ro": "Produs demonstrativ · Carne proaspătă",
      "name_en": "Demo product · Carne proaspătă",
      "cat": "carne-produse",
      "subcat": "carne-produse-1",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "new",
      "tags": [
        "new"
      ],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Carne proaspătă.",
      "desc_en": "Demo product for Carne proaspătă.",
      "unitPrice": 19.9,
      "soldOut": false
    },
    {
      "id": "p_mv169kv7gr",
      "slug": "demo-carne-produse-2",
      "name_ro": "Produs demonstrativ · Mezeluri",
      "name_en": "Demo product · Mezeluri",
      "cat": "carne-produse",
      "subcat": "carne-produse-2",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "",
      "tags": [],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Mezeluri.",
      "desc_en": "Demo product for Mezeluri.",
      "unitPrice": 19.9,
      "soldOut": false
    },
    {
      "id": "p_mv169kv7gw",
      "slug": "demo-carne-produse-3",
      "name_ro": "Produs demonstrativ · Pate-uri",
      "name_en": "Demo product · Pate-uri",
      "cat": "carne-produse",
      "subcat": "carne-produse-3",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "",
      "tags": [],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Pate-uri.",
      "desc_en": "Demo product for Pate-uri.",
      "unitPrice": 19.9,
      "soldOut": false
    },
    {
      "id": "p_mv169kv77z",
      "slug": "demo-lactate-branzeturi-1",
      "name_ro": "Produs demonstrativ · Lactate",
      "name_en": "Demo product · Lactate",
      "cat": "lactate-branzeturi",
      "subcat": "lactate-branzeturi-1",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "new",
      "tags": [
        "new"
      ],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Lactate.",
      "desc_en": "Demo product for Lactate.",
      "unitPrice": 19.9,
      "soldOut": false
    },
    {
      "id": "p_mv169kv76x",
      "slug": "demo-lactate-branzeturi-2",
      "name_ro": "Produs demonstrativ · Brânzeturi proaspete",
      "name_en": "Demo product · Brânzeturi proaspete",
      "cat": "lactate-branzeturi",
      "subcat": "lactate-branzeturi-2",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "",
      "tags": [],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Brânzeturi proaspete.",
      "desc_en": "Demo product for Brânzeturi proaspete.",
      "unitPrice": 19.9,
      "soldOut": false
    },
    {
      "id": "p_mv169kv7f3",
      "slug": "parmigiano-reggiano",
      "name_ro": "Parmigiano Reggiano",
      "name_en": "Parmigiano Reggiano",
      "cat": "lactate-branzeturi",
      "subcat": "lactate-branzeturi-3",
      "img": "assets/img/logo-sm.png",
      "price": 200,
      "oldPrice": null,
      "unit": "100 g",
      "stock": 0,
      "rating": 4.7,
      "featured": false,
      "tag": "bio",
      "tags": [
        "bio"
      ],
      "per100g": true,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Brânzeturi maturate.",
      "desc_en": "Demo product for Brânzeturi maturate.",
      "unitPrice": 200,
      "price100g": 200,
      "soldOut": false
    },
    {
      "id": "p_mv169kv7kp",
      "slug": "demo-de-camara-1",
      "name_ro": "Produs demonstrativ · Zacuscă",
      "name_en": "Demo product · Zacuscă",
      "cat": "de-camara",
      "subcat": "de-camara-1",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "new",
      "tags": [
        "new"
      ],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Zacuscă.",
      "desc_en": "Demo product for Zacuscă.",
      "unitPrice": 19.9,
      "soldOut": false
    },
    {
      "id": "p_mv169kv7rh",
      "slug": "demo-de-camara-2",
      "name_ro": "Produs demonstrativ · Murături",
      "name_en": "Demo product · Murături",
      "cat": "de-camara",
      "subcat": "de-camara-2",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "",
      "tags": [],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Murături.",
      "desc_en": "Demo product for Murături.",
      "unitPrice": 19.9,
      "soldOut": false
    },
    {
      "id": "p_mv169kv7kt",
      "slug": "demo-de-camara-3",
      "name_ro": "Produs demonstrativ · Uscate",
      "name_en": "Demo product · Uscate",
      "cat": "de-camara",
      "subcat": "de-camara-3",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "",
      "tags": [],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Uscate.",
      "desc_en": "Demo product for Uscate.",
      "unitPrice": 19.9,
      "soldOut": false
    },
    {
      "id": "p_mv169kv77b",
      "slug": "demo-de-camara-4",
      "name_ro": "Produs demonstrativ · Miere",
      "name_en": "Demo product · Miere",
      "cat": "de-camara",
      "subcat": "de-camara-4",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "new",
      "tags": [
        "new"
      ],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Miere.",
      "desc_en": "Demo product for Miere.",
      "unitPrice": 19.9,
      "soldOut": false
    },
    {
      "id": "p_mv169kv7q9",
      "slug": "demo-de-camara-5",
      "name_ro": "Produs demonstrativ · Uleiuri",
      "name_en": "Demo product · Uleiuri",
      "cat": "de-camara",
      "subcat": "de-camara-5",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "",
      "tags": [],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Uleiuri.",
      "desc_en": "Demo product for Uleiuri.",
      "unitPrice": 19.9,
      "soldOut": false
    },
    {
      "id": "p_mv169kv77h",
      "slug": "demo-de-camara-6",
      "name_ro": "Produs demonstrativ · Sosuri",
      "name_en": "Demo product · Sosuri",
      "cat": "de-camara",
      "subcat": "de-camara-6",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "",
      "tags": [],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Sosuri.",
      "desc_en": "Demo product for Sosuri.",
      "unitPrice": 19.9,
      "soldOut": false
    },
    {
      "id": "p_mv169kv7ms",
      "slug": "demo-de-camara-7",
      "name_ro": "Produs demonstrativ · Conserve",
      "name_en": "Demo product · Conserve",
      "cat": "de-camara",
      "subcat": "de-camara-7",
      "img": "assets/img/logo-sm.png",
      "price": 15,
      "oldPrice": 22,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "tag_mv1zjkw2jj",
      "tags": [
        "tag_mv1zjkw2jj"
      ],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Conserve.",
      "desc_en": "Demo product for Conserve.",
      "unitPrice": 15,
      "soldOut": false,
      "price100g": null
    },
    {
      "id": "p_mv169kv7er",
      "slug": "demo-de-camara-8",
      "name_ro": "Produs demonstrativ · Condimente",
      "name_en": "Demo product · Condimente",
      "cat": "de-camara",
      "subcat": "de-camara-8",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "",
      "tags": [],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Condimente.",
      "desc_en": "Demo product for Condimente.",
      "unitPrice": 19.9,
      "soldOut": false
    },
    {
      "id": "p_mv169kv78i",
      "slug": "demo-de-camara-9",
      "name_ro": "Produs demonstrativ · Ceaiuri",
      "name_en": "Demo product · Ceaiuri",
      "cat": "de-camara",
      "subcat": "de-camara-9",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "oldPrice": 22,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "",
      "tags": [],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Ceaiuri.",
      "desc_en": "Demo product for Ceaiuri.",
      "unitPrice": 19.9,
      "price100g": null,
      "soldOut": false
    },
    {
      "id": "p_mv16ojk579",
      "slug": "demo-peste-1",
      "name_ro": "Produs demonstrativ · Icre",
      "name_en": "Demo product · Icre",
      "cat": "peste",
      "subcat": "peste-1",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "unitPrice": 19.9,
      "price100g": null,
      "oldPrice": 22,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "tag_mv1zjkw2jj",
      "tags": [
        "tag_mv1zjkw2jj"
      ],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Icre.",
      "desc_en": "Demo product for Icre.",
      "soldOut": false
    },
    {
      "id": "p_mv16ojk5e",
      "slug": "demo-peste-2",
      "name_ro": "Produs demonstrativ · Conserve",
      "name_en": "Demo product · Conserve",
      "cat": "peste",
      "subcat": "peste-2",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "unitPrice": 19.9,
      "price100g": null,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "",
      "tags": [],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Conserve.",
      "desc_en": "Demo product for Conserve.",
      "soldOut": false
    },
    {
      "id": "p_mv16ojk510",
      "slug": "demo-peste-3",
      "name_ro": "Produs demonstrativ · Produse din pește",
      "name_en": "Demo product · Produse din pește",
      "cat": "peste",
      "subcat": "peste-3",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "unitPrice": 19.9,
      "price100g": null,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "",
      "tags": [],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Produse din pește.",
      "desc_en": "Demo product for Produse din pește.",
      "soldOut": false
    },
    {
      "id": "p_mv16ojk5hp",
      "slug": "demo-bauturi-1",
      "name_ro": "Produs demonstrativ · Fără alcool",
      "name_en": "Demo product · Fără alcool",
      "cat": "bauturi",
      "subcat": "bauturi-1",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "unitPrice": 19.9,
      "price100g": null,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "tag_mv1zjkw2jj",
      "tags": [
        "tag_mv1zjkw2jj"
      ],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Fără alcool.",
      "desc_en": "Demo product for Fără alcool.",
      "soldOut": false
    },
    {
      "id": "p_mv16ojk5df",
      "slug": "demo-bauturi-2",
      "name_ro": "Produs demonstrativ · Cu alcool",
      "name_en": "Demo product · Cu alcool",
      "cat": "bauturi",
      "subcat": "bauturi-2",
      "img": "assets/img/logo-sm.png",
      "price": 19.9,
      "unitPrice": 19.9,
      "price100g": null,
      "oldPrice": null,
      "unit": "buc",
      "stock": 30,
      "rating": 4.7,
      "featured": false,
      "tag": "",
      "tags": [],
      "per100g": false,
      "active": true,
      "desc_ro": "Produs demonstrativ pentru subcategoria Cu alcool.",
      "desc_en": "Demo product for Cu alcool.",
      "soldOut": false
    }
  ],
  "vouchers": [
    {
      "code": "OFERTA10",
      "type": "percent",
      "value": 10,
      "minCart": 0,
      "active": true,
      "uses": 0,
      "maxUses": 500,
      "expires": "2027-12-31",
      "desc_ro": "10% reducere la tot coșul",
      "desc_en": "10% off the entire cart"
    },
    {
      "code": "BUN20",
      "type": "percent",
      "value": 20,
      "minCart": 250,
      "active": true,
      "uses": 0,
      "maxUses": 200,
      "expires": "2027-06-30",
      "desc_ro": "20% la coș peste 250 lei",
      "desc_en": "20% off carts over 250 lei"
    },
    {
      "code": "MINUS25",
      "type": "fixed",
      "value": 25,
      "minCart": 150,
      "active": true,
      "uses": 0,
      "maxUses": 300,
      "expires": "2027-12-31",
      "desc_ro": "-25 lei la coș peste 150 lei",
      "desc_en": "-25 lei on carts over 150 lei"
    },
    {
      "code": "LIVRARE",
      "type": "shipping",
      "value": 0,
      "minCart": 0,
      "active": true,
      "uses": 0,
      "maxUses": 999,
      "expires": "2027-12-31",
      "desc_ro": "Livrare gratuită",
      "desc_en": "Free delivery"
    }
  ],
  "users": [
    {
      "id": "u_admin",
      "name": "Administrator PUR&simplu",
      "email": "admin@pursimplu.ro",
      "pass": "admin123",
      "role": "admin",
      "phone": "0721 071 027",
      "address": "Strada San Marco 1-5, Tunari, Ilfov",
      "created": "2026-01-10"
    }
  ],
  "orders": [],
  "settings": {
    "shipping": 19.9,
    "freeOver": 200,
    "currency": "lei",
    "store": {
      "name": "PUR&simplu",
      "tagline_ro": "Băcănie contemporană",
      "tagline_en": "Contemporary grocery",
      "address": "Strada San Marco 1-5, Tunari, Ilfov 077180",
      "phone": "0721 071 027",
      "email": "contact@pur-simplu.ro",
      "rating": 5,
      "reviewCount": 16,
      "hours_ro": [
        "Luni: Închis",
        "Marți – Vineri: 09:00 – 20:00",
        "Sâmbătă – Duminică: 09:00 – 15:00"
      ],
      "hours_en": [
        "Monday: Closed",
        "Tuesday – Friday: 09:00 – 20:00",
        "Saturday – Sunday: 09:00 – 15:00"
      ]
    }
  },
  "tags": [
    {
      "id": "bio",
      "ro": "Bio",
      "en": "Organic"
    },
    {
      "id": "fara-gluten",
      "ro": "Fara Gluten",
      "en": "Gluten Free"
    },
    {
      "id": "new",
      "ro": "Nou",
      "en": "New"
    },
    {
      "id": "atestat-traditional",
      "ro": "Atestat-Traditional",
      "en": "Traditional Certified"
    },
    {
      "id": "tag_mv1zjkw2jj",
      "ro": "La Reducere",
      "en": "La Reducere",
      "cls": "custom"
    }
  ],
  "deliveryAreas": [
    {
      "id": "area-sofia-otopeni",
      "street": "Strada Sofia",
      "city": "Otopeni"
    },
    {
      "id": "area-1-decembrie-tunari",
      "street": "Strada 1 Decembrie",
      "city": "Tunari"
    }
  ]
};

/* ---------- DB helpers ---------- */
const DB = {
  data: null,
  load(){
    const raw = localStorage.getItem(DB_KEY);
    if (raw){ try { this.data = JSON.parse(raw); } catch(e){ this.data = null; } }
    if (!this.data){ this.data = JSON.parse(JSON.stringify(SEED)); this.save(); }
    return this.data;
  },
  save(){ localStorage.setItem(DB_KEY, JSON.stringify(this.data)); },
  reset(){ localStorage.removeItem(DB_KEY); this.data = null; this.load(); },
  seedOrders(){},
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
  count(){ return this.get().items.filter(i=>DB.product(i.id)).length; },
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
