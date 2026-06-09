const KEY = "cep_accessories_v1";

export const ACC_CATS = [
  "Cable","Connector","Structure","Earthing","Protection",
  "Electrical","Monitoring","Battery BOS","Labor","Logistics","Misc",
];

export const UNITS = ["unit","pair","metre","panel","set","roll","trip","kW","lump","hr"];

export const DEFAULT_ACCESSORIES = [
  { id:"d-dc4",  name:"DC Solar Cable 4mm²",            cat:"Cable",       unit:"metre", price:150   },
  { id:"d-dc6",  name:"DC Solar Cable 6mm²",            cat:"Cable",       unit:"metre", price:220   },
  { id:"d-ac6",  name:"AC Cable 6mm² NYY",              cat:"Cable",       unit:"metre", price:185   },
  { id:"d-ac10", name:"AC Cable 10mm² NYY",             cat:"Cable",       unit:"metre", price:270   },
  { id:"d-ac25", name:"AC Cable 25mm² NYY",             cat:"Cable",       unit:"metre", price:520   },
  { id:"d-bcc",  name:"Battery DC Cable 35mm²",         cat:"Cable",       unit:"metre", price:850   },
  { id:"d-mc4",  name:"MC4 Connector Pair",             cat:"Connector",   unit:"pair",  price:350   },
  { id:"d-str",  name:"Aluminium Structure (per panel)", cat:"Structure",  unit:"panel", price:2800  },
  { id:"d-eth",  name:"Earthing Rod + Cable Set",       cat:"Earthing",    unit:"set",   price:8500  },
  { id:"d-spd",  name:"Surge Protection Device (SPD)",  cat:"Protection",  unit:"unit",  price:12000 },
  { id:"d-lar",  name:"Lightning Arrester",             cat:"Protection",  unit:"unit",  price:15000 },
  { id:"d-dcb",  name:"DC Breaker 1000V 32A",           cat:"Electrical",  unit:"unit",  price:4500  },
  { id:"d-acm",  name:"AC MCB 63A",                     cat:"Electrical",  unit:"unit",  price:2800  },
  { id:"d-acm32",name:"AC MCB 32A",                     cat:"Electrical",  unit:"unit",  price:1800  },
  { id:"d-cb4",  name:"DC Combiner Box 4-in-1",         cat:"Electrical",  unit:"unit",  price:26000 },
  { id:"d-cb8",  name:"DC Combiner Box 8-in-1",         cat:"Electrical",  unit:"unit",  price:42000 },
  { id:"d-mtr",  name:"Bidirectional Energy Meter",     cat:"Monitoring",  unit:"unit",  price:36000 },
  { id:"d-wfl",  name:"WiFi Data Logger / Dongle",      cat:"Monitoring",  unit:"unit",  price:15000 },
  { id:"d-bms",  name:"BMS / Battery Protection",       cat:"Battery BOS", unit:"unit",  price:18000 },
  { id:"d-lab",  name:"Civil & Installation Labor",     cat:"Labor",       unit:"kW",    price:8000  },
  { id:"d-trn",  name:"Transport & Commissioning",      cat:"Logistics",   unit:"trip",  price:25000 },
  { id:"d-msc",  name:"Miscellaneous Consumables",      cat:"Misc",        unit:"lump",  price:15000 },
];

function getCustom() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function getAccessories() {
  const custom   = getCustom();
  // apply any price overrides on defaults
  const base = DEFAULT_ACCESSORIES.map((d) => {
    const ov = custom.find((c) => c.id === d.id);
    return ov ? { ...d, price: ov.price } : d;
  });
  // append truly custom (non-default) items
  const extras = custom.filter((c) => !DEFAULT_ACCESSORIES.find((d) => d.id === c.id));
  return [...base, ...extras];
}

export function addAccessory(a) {
  const list = getCustom();
  list.push({ ...a, id: String(Date.now()) });
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function updateAccessoryPrice(id, price) {
  const list = getCustom();
  const idx  = list.findIndex((a) => a.id === id);
  if (idx >= 0) { list[idx] = { ...list[idx], price: Number(price) }; }
  else {
    const def = DEFAULT_ACCESSORIES.find((d) => d.id === id);
    if (def) list.push({ ...def, price: Number(price) });
  }
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function deleteAccessory(id) {
  if (DEFAULT_ACCESSORIES.find((d) => d.id === id)) return; // protect defaults
  localStorage.setItem(KEY, JSON.stringify(getCustom().filter((a) => a.id !== id)));
}
