// Field-mapping helpers between core.js in-memory shapes and Supabase table rows.
// Each pair is <thing>ToDb() / <thing>FromDb(). Nested/array structures get
// flatten/unflatten pairs instead (see OKR, initiatives, SWOT/PEST, MVV).

function pick(obj, map, reverse){
  const out = {};
  for (const k in map){
    const from = reverse ? map[k] : k;
    const to = reverse ? k : map[k];
    if (obj[from] !== undefined) out[to] = obj[from];
  }
  return out;
}

// ---------- entries / exits ----------
const ENTRY_MAP = { desc:'description', cat:'cat', date:'date', value:'value', status:'status', id:'id' };
function entryToDb(e){ return pick(e, ENTRY_MAP, false); }
function entryFromDb(r){ return pick(r, ENTRY_MAP, true); }
const exitToDb = entryToDb, exitFromDb = entryFromDb;

// ---------- accounts ----------
const ACCOUNT_MAP = { id:'id', name:'name', type:'type', desc:'description' };
function accountToDb(a){ return pick(a, ACCOUNT_MAP, false); }
function accountFromDb(r){ return pick(r, ACCOUNT_MAP, true); }

// ---------- OKRs (nested objectives→krs ↔ okr_objectives + okr_krs) ----------
const OKR_OBJ_MAP = { id:'id', num:'num', title:'title', color:'color' };
const OKR_KR_MAP = { id:'id', label:'label', target:'target', unit:'unit', calcType:'calc_type', current:'current', invertGood:'invert_good', note:'note' };

function okrToDb(okrData){
  const objectives = okrData.objectives.map(o => ({ ...pick(o, OKR_OBJ_MAP, false), cycle: okrData.cycle }));
  const krs = okrData.objectives.flatMap(o => o.krs.map(k => ({ ...pick(k, OKR_KR_MAP, false), objective_id: o.id })));
  return { objectives, krs };
}
function okrFromDb(objRows, krRows){
  return {
    cycle: objRows[0]?.cycle ?? '',
    objectives: objRows.map(o => ({
      ...pick(o, OKR_OBJ_MAP, true),
      krs: krRows.filter(k => k.objective_id === o.id).map(k => pick(k, OKR_KR_MAP, true)),
    })),
  };
}

// ---------- initiatives (flat + linkedKRs ↔ initiative_krs junction) ----------
const INITIATIVE_MAP = { id:'id', name:'name', desc:'description', status:'status', stage:'stage', dueDate:'due_date', responsible:'responsible', notes:'notes' };
function initiativeToDb(i){ return { initiative: pick(i, INITIATIVE_MAP, false), krLinks: (i.linkedKRs||[]).map(kr_id => ({ initiative_id: i.id, kr_id })) }; }
function initiativesFromDb(rows, links){
  return rows.map(r => ({ ...pick(r, INITIATIVE_MAP, true), linkedKRs: links.filter(l => l.initiative_id === r.id).map(l => l.kr_id) }));
}

// ---------- SWOT / PEST (category-arrays-of-strings ↔ flat rows with position) ----------
function categoryArraysToDb(data){
  return Object.entries(data).flatMap(([category, items]) => items.map((text, position) => ({ category, text, position })));
}
function categoryArraysFromDb(rows, categories){
  const out = {};
  for (const c of categories) out[c] = rows.filter(r => r.category === c).sort((a,b) => a.position - b.position).map(r => r.text);
  return out;
}
const swotToDb = categoryArraysToDb;
const swotFromDb = rows => categoryArraysFromDb(rows, ['forcas','fraquezas','oportunidades','ameacas']);
const pestToDb = categoryArraysToDb;
const pestFromDb = rows => categoryArraysFromDb(rows, ['politico','economico','social','tecnologico']);

// ---------- MVV (missao/visao single row + valores array) ----------
const MVV_VALUE_MAP = { id:'id', nome:'nome', desc:'description', icon:'icon' };
function mvvToDb(mvvData){
  return {
    mvv: { id: 1, missao: mvvData.missao, visao: mvvData.visao },
    values: mvvData.valores.map((v, position) => ({ ...pick(v, MVV_VALUE_MAP, false), position })),
  };
}
function mvvFromDb(mvvRow, valueRows){
  return {
    missao: mvvRow?.missao ?? '',
    visao: mvvRow?.visao ?? '',
    valores: valueRows.sort((a,b) => a.position - b.position).map(r => pick(r, MVV_VALUE_MAP, true)),
  };
}

// ---------- clients ----------
const CLIENT_MAP = { id:'id', name:'name', document:'document', contactName:'contact_name', email:'email', phone:'phone', status:'status', channel:'channel', service:'service', ticket:'ticket', contractLength:'contract_length', startDate:'start_date', renewalDate:'renewal_date', notes:'notes' };
function clientToDb(c){ return pick(c, CLIENT_MAP, false); }
function clientFromDb(r){ return pick(r, CLIENT_MAP, true); }

// ---------- partners ----------
const PARTNER_MAP = { id:'id', name:'name', entityType:'entity_type', type:'type', status:'status', document:'document', contactName:'contact_name', email:'email', phone:'phone', startDate:'start_date', notes:'notes', clientsReferred:'clients_referred', revenueGenerated:'revenue_generated', revSharePct:'rev_share_pct', revShareBase:'rev_share_base', revSharePeriod:'rev_share_period', revShareModules:'rev_share_modules', commissionPct:'commission_pct', referralSegment:'referral_segment', wlType:'wl_type', wlProd:'wl_prod', jointProduct:'joint_product' };
function partnerToDb(p){ return pick(p, PARTNER_MAP, false); }
function partnerFromDb(r){ return pick(r, PARTNER_MAP, true); }

// ---------- squads ----------
const SQUAD_MAP = { id:'id', name:'name', color:'color', desc:'description', managedBy:'managed_by' };
function squadToDb(s){ return pick(s, SQUAD_MAP, false); }
function squadFromDb(r){ return pick(r, SQUAD_MAP, true); }

// ---------- team members ----------
const MEMBER_MAP = { id:'id', name:'name', role:'role', area:'area', squadId:'squad_id', email:'email', phone:'phone', status:'status', avatarColor:'avatar_color', joinDate:'join_date', notes:'notes', reportsTo:'reports_to', isLeader:'is_leader' };
function memberToDb(m){ return pick(m, MEMBER_MAP, false); }
function memberFromDb(r){ return pick(r, MEMBER_MAP, true); }

// ---------- risk notes ----------
const RISK_NOTE_MAP = { id:'id', text:'text', date:'date', author:'author' };
function riskNoteToDb(n){ return pick(n, RISK_NOTE_MAP, false); }
function riskNoteFromDb(r){ return pick(r, RISK_NOTE_MAP, true); }
