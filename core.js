
// ═══ CONSTANTS ══════════════════════════════════════════
const MONTHS=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const EST=['Recebido','Pendente','Cancelado'],SST=['Pago','Pendente','Cancelado'];
const PIEC=['#4361EE','#7209B7','#F5A023','#10B981','#EF4444','#0891B2'];
const ACCS=['#F5A023','#10B981','#4361EE','#7209B7','#EF4444','#0891B2'];
const OBJ_COLORS=['#10B981','#4361EE','#7209B7','#F5A023','#EF4444','#0891B2','#F59E0B','#06B6D4'];
const ATYPES=[{k:'receita',l:'Receitas',c:'#10B981'},{k:'custo-fixo',l:'Custos Fixos',c:'#EF4444'},{k:'custo-variavel',l:'Custos Variáveis',c:'#F59E0B'},{k:'despesa',l:'Despesas Operacionais',c:'#7209B7'},{k:'investimento',l:'Investimentos',c:'#4361EE'}];
const PPERIODS=[{k:'all',l:'Tudo',s:null,e:null},{k:'q1',l:'Q1 2025',s:'2025-01-01',e:'2025-03-31'},{k:'q2',l:'Q2 2025',s:'2025-04-01',e:'2025-06-30'},{k:'h1',l:'H1 2025',s:'2025-01-01',e:'2025-06-30'},{k:'custom',l:'Personalizado',s:null,e:null}];
const PREV_MAP={q1:{s:'2025-04-01',e:'2025-06-30',l:'vs Q2'},q2:{s:'2025-01-01',e:'2025-03-31',l:'vs Q1'},h1:{s:'2025-01-01',e:'2025-03-31',l:'vs H1'},all:{s:'2025-01-01',e:'2025-03-31',l:'vs Q1'}};
const INIT_STATUS={planned:{l:'Planejada',c:'#94A3B8',bg:'rgba(148,163,184,.12)'},active:{l:'Em andamento',c:'#4361EE',bg:'rgba(67,97,238,.12)'},done:{l:'Concluída',c:'#10B981',bg:'rgba(16,185,129,.12)'},paused:{l:'Pausada',c:'#F59E0B',bg:'rgba(245,158,11,.12)'}};
const STAGES=['Planejamento','Execução','Validação','Entrega'];

// ⚠️  SECURITY NOTE: Demo credentials below are for testing only.
// DO NOT deploy to production with these hardcoded credentials.
// Use proper authentication (OAuth, LDAP, etc.) in production.
// Credentials should be stored securely server-side.
const USERS=[
  {name:'Administrador',login:'admin',pass:'sias2026',level:3,color:'#F5A023'},
  {name:'Analista',login:'analista',pass:'an2026',level:2,color:'#4361EE'},
  {name:'Visualizador',login:'viewer',pass:'ver123',level:1,color:'#10B981'},
];

let ctab='dashboard',mmode=null,mid=null,mmode2=null,m2ctx=null,m3ctx=null,m4ctx=null;
let period={k:'all',s:null,e:null};
let currentInitFilter='all';
let editModeAnalise=false;
let dashChart=null,bChart=null,pChart=null,projChart=null,fclChart=null,custosChart=null,custosBarChart=null,pdRevChart=null,pdClientsChart=null;
let drePeriod={k:'all',s:null,e:null};
let curStage=0,valEditIdx=-1,selObjColor=OBJ_COLORS[0],selInvert=false;
let currentUser=null;

function ld(k){try{return JSON.parse(localStorage.getItem(k));}catch{return null;}}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function uid(){return Math.random().toString(36).substring(2,11);}
function tod(){return new Date().toISOString().split('T')[0];}
function dtf(s){if(!s)return'';const[y,m,d]=s.split('-');return`${d}/${m}/${y}`;}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function mi(d){return parseInt(d.split('-')[1])-1;}
function gv(id){const el=document.getElementById(id);return el?el.value:'';}
function getLevel(){return currentUser?currentUser.level:0;}
function canEdit(){return getLevel()>=3;}
function canEditMid(){return getLevel()>=2;}

let entries=ld('sias-e')||seedE();
let exits=ld('sias-s')||seedS();
let accounts=ld('sias-a')||seedA();
let cfg=ld('sias-cfg')||{theme:'light',accent:'#F5A023',company:'SIAS',currency:'BRL'};
let okrData=ld('sias-okrs')||seedOKRs();
let initiatives=ld('sias-init')||seedInit();
let swotData=ld('sias-swot')||seedSWOT();
let pestData=ld('sias-pest')||seedPEST();
let mvvData=ld('sias-mvv')||seedMVV();

function cur(v){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:cfg.currency||'BRL'}).format(v);}
function fmtKR(v,unit){
  if(unit==='BRL')return cur(v);if(unit==='PCT')return v.toFixed(1)+'%';
  if(unit==='COUNT')return Math.round(v).toLocaleString('pt-BR');
  if(unit==='DAYS')return v.toFixed(0)+' dias';if(unit==='MONTHS')return v.toFixed(1)+' meses';
  if(unit==='SCORE')return Math.round(v).toString();if(unit==='BOOL')return v>=1?'Sim':'Não';
  return String(v);
}

function seedE(){return[{id:uid(),date:'2025-01-05',desc:'Contrato Empresa ABC',cat:'Prestação de Serviços',value:15000,status:'Recebido'},{id:uid(),date:'2025-01-12',desc:'Venda de Software XYZ',cat:'Vendas de Produtos',value:8500,status:'Recebido'},{id:uid(),date:'2025-01-20',desc:'Consultoria Mensal – Cl.01',cat:'Consultoria Estratégica',value:6000,status:'Recebido'},{id:uid(),date:'2025-02-03',desc:'Renovação de Contrato',cat:'Prestação de Serviços',value:12000,status:'Recebido'},{id:uid(),date:'2025-02-14',desc:'Projeto de IA – Fase 1',cat:'Licenciamento de Software',value:25000,status:'Recebido'},{id:uid(),date:'2025-02-28',desc:'Licença de Software',cat:'Vendas de Produtos',value:3200,status:'Pendente'},{id:uid(),date:'2025-03-07',desc:'Consultoria Estratégica',cat:'Consultoria Estratégica',value:9000,status:'Recebido'},{id:uid(),date:'2025-03-15',desc:'Desenvolvimento de Sistema',cat:'Licenciamento de Software',value:18000,status:'Recebido'},{id:uid(),date:'2025-04-02',desc:'Contrato – Cliente 05',cat:'Prestação de Serviços',value:22000,status:'Recebido'},{id:uid(),date:'2025-04-10',desc:'Treinamento Corporativo IA',cat:'Consultoria Estratégica',value:7500,status:'Recebido'},{id:uid(),date:'2025-04-25',desc:'Venda de Licenças',cat:'Vendas de Produtos',value:5600,status:'Recebido'},{id:uid(),date:'2025-05-03',desc:'Projeto de Automação',cat:'Licenciamento de Software',value:30000,status:'Recebido'},{id:uid(),date:'2025-05-18',desc:'Suporte Técnico Mensal',cat:'Prestação de Serviços',value:4000,status:'Recebido'},{id:uid(),date:'2025-05-28',desc:'Consultoria – Cliente 03',cat:'Consultoria Estratégica',value:11000,status:'Pendente'},{id:uid(),date:'2025-06-05',desc:'Desenvolvimento IA Customizada',cat:'Licenciamento de Software',value:45000,status:'Recebido'},{id:uid(),date:'2025-06-12',desc:'Renovação Anual – Cliente 02',cat:'Prestação de Serviços',value:14400,status:'Recebido'},{id:uid(),date:'2025-06-20',desc:'Dashboard Analytics',cat:'Vendas de Produtos',value:9800,status:'Pendente'}];}
function seedS(){return[{id:uid(),date:'2025-01-05',desc:'Folha de Pagamento Jan',cat:'Salários e Encargos',value:28000,status:'Pago'},{id:uid(),date:'2025-01-10',desc:'Aluguel do Escritório',cat:'Aluguel e Condomínio',value:5500,status:'Pago'},{id:uid(),date:'2025-01-15',desc:'Campanha Google Ads',cat:'Marketing e Publicidade',value:2000,status:'Pago'},{id:uid(),date:'2025-01-22',desc:'Servidores AWS',cat:'Hospedagem e Cloud',value:3200,status:'Pago'},{id:uid(),date:'2025-02-05',desc:'Folha de Pagamento Fev',cat:'Salários e Encargos',value:28000,status:'Pago'},{id:uid(),date:'2025-02-10',desc:'Aluguel do Escritório',cat:'Aluguel e Condomínio',value:5500,status:'Pago'},{id:uid(),date:'2025-02-18',desc:'Licenças de Software',cat:'Assinaturas de Software',value:1800,status:'Pago'},{id:uid(),date:'2025-02-25',desc:'Material de Escritório',cat:'Materiais de Projeto',value:650,status:'Pago'},{id:uid(),date:'2025-03-05',desc:'Folha de Pagamento Mar',cat:'Salários e Encargos',value:29500,status:'Pago'},{id:uid(),date:'2025-03-10',desc:'Aluguel do Escritório',cat:'Aluguel e Condomínio',value:5500,status:'Pago'},{id:uid(),date:'2025-03-20',desc:'Evento de Marketing',cat:'Marketing e Publicidade',value:4200,status:'Pago'},{id:uid(),date:'2025-04-05',desc:'Folha de Pagamento Abr',cat:'Salários e Encargos',value:29500,status:'Pago'},{id:uid(),date:'2025-04-10',desc:'Aluguel do Escritório',cat:'Aluguel e Condomínio',value:5500,status:'Pago'},{id:uid(),date:'2025-04-15',desc:'Campanha LinkedIn Ads',cat:'Marketing e Publicidade',value:3000,status:'Pago'},{id:uid(),date:'2025-04-22',desc:'Ferramentas SaaS',cat:'Assinaturas de Software',value:2400,status:'Pago'},{id:uid(),date:'2025-05-05',desc:'Folha de Pagamento Mai',cat:'Salários e Encargos',value:30000,status:'Pago'},{id:uid(),date:'2025-05-10',desc:'Aluguel do Escritório',cat:'Aluguel e Condomínio',value:5500,status:'Pago'},{id:uid(),date:'2025-05-20',desc:'Contratação Freelancer',cat:'Subcontratações',value:4500,status:'Pago'},{id:uid(),date:'2025-06-05',desc:'Folha de Pagamento Jun',cat:'Salários e Encargos',value:30000,status:'Pago'},{id:uid(),date:'2025-06-10',desc:'Aluguel do Escritório',cat:'Aluguel e Condomínio',value:5500,status:'Pago'},{id:uid(),date:'2025-06-18',desc:'Treinamento da Equipe',cat:'Capacitação e Treinamento',value:2800,status:'Pendente'},{id:uid(),date:'2025-06-25',desc:'Campanha Marketing Digital',cat:'Marketing e Publicidade',value:5000,status:'Pendente'}];}
function seedA(){return[{id:uid(),name:'Vendas de Produtos',type:'receita',desc:'Receita com venda direta'},{id:uid(),name:'Prestação de Serviços',type:'receita',desc:'Receita com contratos'},{id:uid(),name:'Consultoria Estratégica',type:'receita',desc:'Consultoria e planejamento'},{id:uid(),name:'Licenciamento de Software',type:'receita',desc:'Licenciamento de software'},{id:uid(),name:'Salários e Encargos',type:'custo-fixo',desc:'Folha + encargos'},{id:uid(),name:'Aluguel e Condomínio',type:'custo-fixo',desc:'Aluguel do escritório'},{id:uid(),name:'Seguros Corporativos',type:'custo-fixo',desc:'Seguros do negócio'},{id:uid(),name:'Serviços Contábeis',type:'custo-fixo',desc:'Contabilidade mensal'},{id:uid(),name:'Comissões de Vendas',type:'custo-variavel',desc:'Comissões comerciais'},{id:uid(),name:'Hospedagem e Cloud',type:'custo-variavel',desc:'Infraestrutura'},{id:uid(),name:'Materiais de Projeto',type:'custo-variavel',desc:'Insumos por projeto'},{id:uid(),name:'Subcontratações',type:'custo-variavel',desc:'Freelancers'},{id:uid(),name:'Marketing e Publicidade',type:'despesa',desc:'Campanhas e anúncios'},{id:uid(),name:'Capacitação e Treinamento',type:'despesa',desc:'Cursos e treinamentos'},{id:uid(),name:'Assinaturas de Software',type:'despesa',desc:'Ferramentas SaaS'},{id:uid(),name:'Equipamentos e Hardware',type:'investimento',desc:'Compra de equipamentos'},{id:uid(),name:'Desenvolvimento de Produto',type:'investimento',desc:'P&D'}];}
function seedOKRs(){return{cycle:'2026',objectives:[
  {id:'O1',num:'O1',title:'Conquistar tração real e receita recorrente no mercado GovTech',color:'#10B981',krs:[
    {id:'KR1.1',label:'MRR ao final do ciclo anual',target:0,unit:'BRL',calcType:'mrr',current:0,invertGood:false,note:'Auto: receita do mês mais recente'},
    {id:'KR1.2',label:'Clientes pagantes ativados',target:100,unit:'COUNT',calcType:null,current:0,invertGood:false,note:'Municípios ou consultorias com contrato ativo'},
    {id:'KR1.3',label:'Contratos high-ticket fechados',target:10,unit:'COUNT',calcType:null,current:0,invertGood:false,note:''},
    {id:'KR1.4',label:'Crescimento MoM de MRR (%)',target:15,unit:'PCT',calcType:'mom',current:0,invertGood:false,note:'Auto: comparação mês a mês'},
  ]},
  {id:'O2',num:'O2',title:'Transformar o VoxCivis em ferramenta usada ativamente pelos gestores',color:'#4361EE',krs:[
    {id:'KR2.1',label:'Clientes com engajamento semanal — WAU (%)',target:40,unit:'PCT',calcType:null,current:0,invertGood:false,note:''},
    {id:'KR2.2',label:'Churn mensal — manter abaixo de (%)',target:5,unit:'PCT',calcType:null,current:0,invertGood:true,note:'Menor é melhor'},
    {id:'KR2.3',label:'Casos de uso documentados com resultado',target:10,unit:'COUNT',calcType:null,current:0,invertGood:false,note:''},
    {id:'KR2.4',label:'Time-to-value — onboarding em dias',target:14,unit:'DAYS',calcType:null,current:0,invertGood:true,note:'Menor é melhor'},
  ]},
  {id:'O3',num:'O3',title:'Tornar-se a referência nacional em inteligência territorial com IA',color:'#7209B7',krs:[
    {id:'KR3.1',label:'Oportunidades qualificadas/mês',target:15,unit:'COUNT',calcType:null,current:0,invertGood:false,note:''},
    {id:'KR3.2',label:'Presença em eventos ou publicações GovTech',target:5,unit:'COUNT',calcType:null,current:0,invertGood:false,note:''},
    {id:'KR3.3',label:'NPS na base de clientes ativos',target:40,unit:'SCORE',calcType:null,current:0,invertGood:false,note:'Referência: ≥ 40'},
    {id:'KR3.4',label:'Parceiros ativados como canal indireto',target:5,unit:'COUNT',calcType:null,current:0,invertGood:false,note:''},
  ]},
  {id:'O4',num:'O4',title:'Construir base operacional que suporte crescimento sem degradação',color:'#F5A023',krs:[
    {id:'KR4.1',label:'Ciclo de onboarding documentado (dias)',target:7,unit:'DAYS',calcType:null,current:0,invertGood:true,note:'Menor é melhor'},
    {id:'KR4.2',label:'CS estruturado com responsável definido',target:1,unit:'BOOL',calcType:null,current:0,invertGood:false,note:'1 = Sim'},
    {id:'KR4.3',label:'Uptime da plataforma (%)',target:99.5,unit:'PCT',calcType:null,current:0,invertGood:false,note:'Referência: ≥ 99.5%'},
    {id:'KR4.4',label:'Roadmap público com visibilidade (meses)',target:3,unit:'MONTHS',calcType:null,current:0,invertGood:false,note:''},
  ]},
]};}
function seedInit(){return[
  {id:uid(),name:'Outbound high-ticket',desc:'Relatórios polo pré-gerados como isca de prospecção ativa para grandes marcas',status:'planned',stage:0,linkedKRs:['KR1.1','KR1.2'],dueDate:'2026-12-31',responsible:'',notes:''},
  {id:uid(),name:'Revisão de precificação',desc:'Criar 3 tiers (básico, pro, enterprise) com precificação por segmento',status:'planned',stage:0,linkedKRs:['KR1.3'],dueDate:'2026-07-31',responsible:'',notes:''},
  {id:uid(),name:'Onboarding guiado por ICP',desc:'Trilhas por tipo de cliente com check-ins automáticos no D+7 e D+14',status:'active',stage:1,linkedKRs:['KR2.4','KR2.2'],dueDate:'2026-08-31',responsible:'',notes:''},
  {id:uid(),name:'Data PR — Relatórios Nacionais',desc:'Transformar dados da IA em pautas de relevância nacional para autoridade de marca',status:'active',stage:1,linkedKRs:['KR3.1','KR3.2'],dueDate:'2026-12-31',responsible:'',notes:''},
  {id:uid(),name:'Mini-demo no site',desc:'Consulta rápida pública: visitante recebe micro-insights e deixa o lead',status:'active',stage:2,linkedKRs:['KR3.1'],dueDate:'2026-07-31',responsible:'',notes:''},
  {id:uid(),name:'Autoscaling de infraestrutura',desc:'Migração para modelo elástico para suportar crescimento sem degradação',status:'planned',stage:0,linkedKRs:['KR4.3'],dueDate:'2026-09-30',responsible:'',notes:''},
];}
function seedSWOT(){return{
  forcas:['Base de dados curada com todos os 5.571 municípios do país','Time-to-insight: de semanas para minutos com IA','Arquitetura em camadas com segurança e cibersegurança própria','5 agentes especializados de IA cobrindo dimensões distintas do território','Junção única de GovTech + CivTech: democratização de dados públicos','Compliance-first e governança interna robusta desde a fundação'],
  fraquezas:['Sem investimento externo captado ainda','Time enxuto para o volume de demanda possível','Produto em validação inicial — MVP recente','Ausência de case ou cliente anterior consolidado','Empresa recente com baixo brand awareness'],
  oportunidades:['Ciclo eleitoral 2026 e digitalização do governo federal','PBIA 2024–2028 legitima IA no setor público com R$ 23 bi','Setor privado carente de inteligência de dados territorial','Gestão por evidência como exigência crescente em contratações públicas','Crescimento do setor de franquias e varejo no interior'],
  ameacas:['Big techs com capacidade de entrar no espaço GovTech rapidamente','Concorrência de IAs generativas consolidadas','Riscos de cibersegurança e exigências da LGPD','Ciclos de compra longos no setor público'],
};}
function seedPEST(){return{
  politico:['PBIA 2024–2028 legitima IA no setor público e gera abertura institucional real','Eleições 2026 e digitalização ampliam a janela de demanda','Lei de Dados Abertos cria ambiente favorável, mas licitações barram acesso direto','5.571 municípios autônomos = mercado pulverizado, difícil de acessar'],
  economico:['Brasil atrai investimentos em infraestrutura digital com incentivos federais','Reforma tributária remodela estrutura fiscal municipal e cria nova demanda','Alta concentração de receita pública em grandes municípios','Crescimento de franquias e varejo no interior demanda inteligência local'],
  social:['Pressão crescente por transparência pública e accountability governamental','Urbanização do interior cria novas demandas por dados territoriais','Jornalismo de dados e fact-checking ganham relevância','Demanda por políticas públicas baseadas em evidências, não intuição'],
  tecnologico:['Avanços em LLMs reduzem custo de processamento de dados não-estruturados','APIs governamentais (IBGE, DataSUS, IPEADATA) cada vez mais acessíveis','Computação elástica viabiliza escala sem investimento em hardware próprio','IA generativa democratiza análises antes restritas a grandes consultorias'],
};}
function seedMVV(){return{
  missao:'Transformar dados territoriais em decisões mais inteligentes para quem governa, investe e comunica o Brasil.',
  visao:'Ser a plataforma de referência em inteligência territorial com IA para gestores, consultores e líderes estratégicos no Brasil.',
  valores:[
    {id:uid(),nome:'Transparência de dados',desc:'Rastreável, verificável e responsável',icon:'🔒'},
    {id:uid(),nome:'Impacto territorial',desc:'Decisões que transformam municípios',icon:'📍'},
    {id:uid(),nome:'Rigor analítico',desc:'IA responsável sobre suas entregas',icon:'📊'},
    {id:uid(),nome:'Acessibilidade do conhecimento',desc:'Dados de qualidade para quem decide',icon:'📚'},
    {id:uid(),nome:'Inovação com propósito',desc:'Tecnologia a serviço do bem público',icon:'💡'},
  ],
};}

// ═══ KR AUTO-CALC ══════════════════════════════════════
function getLatestMRRMonth(){const months=[...new Set(entries.filter(x=>x.status==='Recebido').map(x=>x.date.substr(0,7)))].sort();return months.length?months[months.length-1]:null;}
function calcMRR(){const latest=getLatestMRRMonth();if(!latest)return{v:0,label:'Sem dados'};const[y,m]=latest.split('-');const last=new Date(parseInt(y),parseInt(m),0).getDate();const s=`${y}-${m}-01`,e=`${y}-${m}-${String(last).padStart(2,'0')}`;const v=entries.filter(x=>x.date>=s&&x.date<=e&&x.status==='Recebido').reduce((a,x)=>a+x.value,0);return{v,label:MONTHS[parseInt(m)-1]+'/'+y};}
function calcMoM(){const months=[...new Set(entries.filter(x=>x.status==='Recebido').map(x=>x.date.substr(0,7)))].sort();if(months.length<2)return{v:0,label:'–'};const cm=months[months.length-1],pm=months[months.length-2];function mrrOf(ym){const[y,m]=ym.split('-');const last=new Date(parseInt(y),parseInt(m),0).getDate();const s=`${y}-${m}-01`,e=`${y}-${m}-${String(last).padStart(2,'0')}`;return entries.filter(x=>x.date>=s&&x.date<=e&&x.status==='Recebido').reduce((a,x)=>a+x.value,0);}const curr=mrrOf(cm),prev=mrrOf(pm);const mn=ym=>MONTHS[parseInt(ym.split('-')[1])-1];if(prev===0)return{v:curr>0?100:0,label:mn(pm)+'>'+mn(cm)};return{v:((curr-prev)/prev)*100,label:mn(pm)+'>'+mn(cm)};}
function calcRunway(){const fxAcc=accounts.filter(a=>a.type==='custo-fixo').map(a=>a.name);const fxEx=exits.filter(e=>fxAcc.includes(e.cat)&&e.status==='Pago');const fxM=new Set(fxEx.map(e=>e.date.substr(0,7)));const avgFx=fxM.size>0?fxEx.reduce((s,e)=>s+e.value,0)/fxM.size:0;const totalRec=entries.filter(e=>e.status==='Recebido').reduce((s,e)=>s+e.value,0);const totalPag=exits.filter(e=>e.status==='Pago').reduce((s,e)=>s+e.value,0);const saldo=totalRec-totalPag;return{v:avgFx>0?saldo/avgFx:Infinity,saldo,avgFx};}
function getKRCurrent(kr){if(kr.calcType==='mrr')return calcMRR().v;if(kr.calcType==='mom')return calcMoM().v;return kr.current||0;}
function getKRProgress(kr){const v=getKRCurrent(kr);if(!kr.target||kr.target===0)return 0;if(kr.unit==='BOOL')return v>=1?100:0;if(kr.invertGood){if(v<=0)return 0;return v<=kr.target?100:Math.min((kr.target/v)*100,100);}return Math.min((v/kr.target)*100,100);}
function getObjPct(obj){if(!obj.krs.length)return 0;return obj.krs.reduce((a,kr)=>a+getKRProgress(kr),0)/obj.krs.length;}
function getOverallPct(){if(!okrData.objectives.length)return 0;return okrData.objectives.reduce((a,o)=>a+getObjPct(o),0)/okrData.objectives.length;}

// ═══ PERIOD ═════════════════════════════════════════════
function setPeriod(k){const pr=PPERIODS.find(p=>p.k===k)||PPERIODS[0];period={k,s:pr.s,e:pr.e};document.querySelectorAll('.pbtn').forEach(b=>b.classList.toggle('active',b.dataset.period===k));document.getElementById('crange').classList.toggle('show',k==='custom');if(k!=='custom')renderFinDash();}
function applyCustom(){const s=gv('d-from'),e=gv('d-to');if(!s||!e)return;period={k:'custom',s,e};renderFinDash();}
function getFiltered(arr){return arr.filter(x=>{if(period.s&&x.date<period.s)return false;if(period.e&&x.date>period.e)return false;return true;});}
function getFilteredRange(arr,s,e){return arr.filter(x=>{if(s&&x.date<s)return false;if(e&&x.date>e)return false;return true;});}
function getPrevRange(){if(PREV_MAP[period.k])return PREV_MAP[period.k];if(period.k==='custom'&&period.s&&period.e){const ms=new Date(period.s).getTime(),me=new Date(period.e).getTime(),dur=me-ms,pe=new Date(ms-86400000),ps=new Date(pe.getTime()-dur);return{s:ps.toISOString().split('T')[0],e:pe.toISOString().split('T')[0],l:'vs ant.'};}return null;}
function periodLabel(){if(period.k==='all')return'Comparativo mensal 2025';const pr=PPERIODS.find(p=>p.k===period.k);if(pr&&pr.k!=='custom')return pr.l;if(period.s&&period.e)return`${dtf(period.s)} → ${dtf(period.e)}`;return'2025';}

// ═══ HELPERS ════════════════════════════════════════════
function sbadge(s){const cls={Recebido:'bg',Pago:'bg',Pendente:'ba',Cancelado:'br'}[s]||'bx';return`<span class="badge ${cls}">${s}</span>`;}
let _cbadgeMapRef=null,_cbadgeMap=null;
function cbadge(cat){if(_cbadgeMapRef!==accounts){_cbadgeMapRef=accounts;_cbadgeMap=new Map();accounts.forEach(a=>{if(!_cbadgeMap.has(a.name))_cbadgeMap.set(a.name,a.type);});}const cm={'receita':'#10B981','custo-fixo':'#EF4444','custo-variavel':'#F59E0B','despesa':'#7209B7','investimento':'#4361EE'};const c=cm[_cbadgeMap.get(cat)]||'#94A3B8';return`<span class="badge" style="background:${c}18;color:${c};">${escapeHtml(cat)}</span>`;}
function filtArr(arr,q,cat,st,f,t,vn,vx,so){let r=arr.filter(e=>{if(q&&!e.desc.toLowerCase().includes(q.toLowerCase())&&!e.cat.toLowerCase().includes(q.toLowerCase()))return false;if(cat&&e.cat!==cat)return false;if(st&&e.status!==st)return false;if(f&&e.date<f)return false;if(t&&e.date>t)return false;if(vn!==''&&!isNaN(parseFloat(vn))&&e.value<parseFloat(vn))return false;if(vx!==''&&!isNaN(parseFloat(vx))&&e.value>parseFloat(vx))return false;return true;});({'date-d':()=>r.sort((a,b)=>b.date.localeCompare(a.date)),'date-a':()=>r.sort((a,b)=>a.date.localeCompare(b.date)),'val-d':()=>r.sort((a,b)=>b.value-a.value),'val-a':()=>r.sort((a,b)=>a.value-b.value),'az':()=>r.sort((a,b)=>a.desc.localeCompare(b.desc))}[so||'date-d']||function(){})();return r;}
function clrF(t){const p=t==='e'?'se':'ss';['q','cat','st','f','t','vn','vx'].forEach(i=>{const el=document.getElementById(p+'-'+i);if(el)el.value='';});const so=document.getElementById(p+'-so');if(so)so.value='date-d';t==='e'?renderE():renderS();}
function sparkSVG(vals,color,W=80,H=28){if(!vals||vals.length<2)return'';const p=3,mn=Math.min(...vals),mx=Math.max(...vals),rng=mx-mn||1;const pts=vals.map((v,i)=>((p+i/(vals.length-1)*(W-2*p)).toFixed(1)+','+(p+(1-(v-mn)/rng)*(H-2*p)).toFixed(1)));const last=pts[pts.length-1].split(',');const gid='g'+Math.random().toString(36).substring(2,7);return`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity=".3"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><polygon points="${pts.join(' ')} ${last[0]},${H-p} ${p},${H-p}" fill="url(#${gid})"/><polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${last[0]}" cy="${last[1]}" r="2.5" fill="${color}"/></svg>`;}
function trendBadge(curr,prev,inv,lbl){if(prev===null||prev===undefined||prev===0)return'<span style="font-size:10px;color:var(--t3);">–</span>';const pct=((curr-prev)/Math.abs(prev))*100;const isGood=inv?pct<=0:pct>=0;const c=isGood?'#10B981':'#EF4444';return`<span style="font-size:10px;font-weight:800;color:${c};">${pct>=0?'↑':'↓'} ${Math.abs(pct).toFixed(1)}% ${lbl||''}</span>`;}
function linReg(data){const n=data.length,xs=Array.from({length:n},(_,i)=>i),xm=xs.reduce((s,v)=>s+v,0)/n,ym=data.reduce((s,v)=>s+v,0)/n,num=xs.reduce((s,x,i)=>s+(x-xm)*(data[i]-ym),0),den=xs.reduce((s,x)=>s+(x-xm)**2,0),slope=den?num/den:0,intercept=ym-slope*xm;return{slope,intercept};}
function project(data,n){const r=linReg(data),len=data.length;return Array.from({length:n},(_,i)=>Math.max(0,r.intercept+r.slope*(len+i)));}
function singleProgress(stage){const s=stage||0;const pct=s===0?8:s===1?35:s===2?68:100;const label=STAGES[s];return`<div class="iprog"><div class="iprog-track"><div class="iprog-fill" style="width:${pct}%"></div></div><div class="iprog-meta"><span>${label}</span><span>${pct}%</span></div></div>`;}

// ═══ AUTH ════════════════════════════════════════════════
function fillLogin(el){
  // Demo login: extract role from data-role attribute
  const role=el.getAttribute('data-role');
  const demoAccounts={admin:{login:'admin',pass:'sias2026'},analista:{login:'analista',pass:'an2026'},viewer:{login:'viewer',pass:'ver123'}};
  if(!role||!demoAccounts[role])return;
  const acc=demoAccounts[role];
  document.getElementById('l-user').value=acc.login;
  document.getElementById('l-pass').value=acc.pass;
  doLogin();
}
function doLogin(){
  const u=document.getElementById('l-user').value.trim();
  const p=document.getElementById('l-pass').value.trim();
  const user=USERS.find(x=>x.login===u&&x.pass===p);
  const err=document.getElementById('l-err');
  if(!user){err.classList.add('show');return;}
  err.classList.remove('show');
  currentUser=user;
  document.documentElement.dataset.level=user.level;
  try{sessionStorage.setItem('sias-session',JSON.stringify({login:user.login,level:user.level}));}catch(e){}
  document.getElementById('login-overlay').style.display='none';
  document.getElementById('app').style.display='block';
  renderNavUser();
  applyCfg();
  location.href='dashboard.html';
}
function doLogout(){
  currentUser=null;
  document.documentElement.dataset.level=0;
  sessionStorage.removeItem('sias-session');
  document.getElementById('app').style.display='none';
  document.getElementById('login-overlay').style.display='flex';
  document.getElementById('l-user').value='';
  document.getElementById('l-pass').value='';
}
function renderNavUser(){
  const el=document.getElementById('nav-user');if(!el||!currentUser)return;
  const u=currentUser;
  const lvlNames={1:'Visualizador',2:'Analista',3:'Administrador'};
  el.innerHTML=`<div class="nu-avatar" style="background:${u.color}20;color:${u.color};">${u.name[0]}</div>
    <div class="nu-info"><div class="nu-name">${u.name}</div><div class="nu-level">${lvlNames[u.level]}</div></div>
    <button class="nu-logout" onclick="doLogout()" title="Sair da conta">&#x21AA;</button>`;
}
document.getElementById('l-pass').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
document.getElementById('l-user').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('l-pass').focus();});

// ═══ SETTINGS ══════════════════════════════════════════
function applyAccent(hex){
  try{
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    const d=(v)=>Math.max(0,v-28).toString(16).padStart(2,'0');
    document.documentElement.style.setProperty('--orange',hex);
    document.documentElement.style.setProperty('--orange2','#'+d(parseInt(hex.slice(1,3),16))+d(parseInt(hex.slice(3,5),16))+d(parseInt(hex.slice(5,7),16)));
    document.documentElement.style.setProperty('--orange3',`rgba(${r},${g},${b},.1)`);
    document.documentElement.style.setProperty('--orange-glow',`rgba(${r},${g},${b},.25)`);
  }catch(e){}
}
function applyCfg(){document.documentElement.dataset.theme=cfg.theme;applyAccent(cfg.accent||'#F5A023');const td=document.getElementById('togdark');if(td)td.checked=cfg.theme==='dark';const scr=document.getElementById('scur');if(scr)scr.value=cfg.currency;renderCpk();updateCategorySelects();}
function saveCfg(){cfg.currency=gv('scur');sv('sias-cfg',cfg);}
function toggleDark(on){cfg.theme=on?'dark':'light';sv('sias-cfg',cfg);document.documentElement.dataset.theme=cfg.theme;}
function renderCpk(){const el=document.getElementById('cpk');if(el)el.innerHTML=ACCS.map(c=>`<div class="co${c===cfg.accent?' sel':''}" style="background:${c};" onclick="setAcc('${c}')" title="Cor ${c}"></div>`).join('');}
function setAcc(c){cfg.accent=c;sv('sias-cfg',cfg);applyAccent(c);renderCpk();}
function resetData(){if(!confirm('Restaurar dados financeiros de exemplo?'))return;entries=seedE();exits=seedS();accounts=seedA();sv('sias-e',entries);sv('sias-s',exits);sv('sias-a',accounts);updateCategorySelects();renderCur();}
function resetStrategy(){if(!confirm('Restaurar dados estratégicos?'))return;okrData=seedOKRs();initiatives=seedInit();swotData=seedSWOT();pestData=seedPEST();mvvData=seedMVV();sv('sias-okrs',okrData);sv('sias-init',initiatives);sv('sias-swot',swotData);sv('sias-pest',pestData);sv('sias-mvv',mvvData);renderCur();}
function clearAll(){if(!confirm('Apagar TODOS os dados?'))return;entries=[];exits=[];accounts=[];okrData=seedOKRs();initiatives=[];mvvData=seedMVV();swotData=seedSWOT();pestData=seedPEST();partners=seedPartners();teamMembers=seedMembers();squads=seedSquads();sv('sias-e',entries);sv('sias-s',exits);sv('sias-a',accounts);sv('sias-okrs',okrData);sv('sias-init',initiatives);sv('sias-mvv',mvvData);sv('sias-swot',swotData);sv('sias-pest',pestData);sv('sias-partners',partners);sv('sias-members',teamMembers);sv('sias-squads',squads);updateCategorySelects();renderCur();}
function exportHTML(){const h=document.documentElement.outerHTML,a=document.createElement('a');a.href='data:text/html;charset=utf-8,'+encodeURIComponent('<!DOCTYPE html>\n'+h);a.download='sias-centro-controle.html';a.click();}
function updateCategorySelects(){const rA=accounts.filter(a=>a.type==='receita').map(a=>a.name);const sA=accounts.filter(a=>['custo-fixo','custo-variavel','despesa','investimento'].includes(a.type)).map(a=>a.name);const ec=document.getElementById('se-cat');if(ec)ec.innerHTML='<option value="">Todas</option>'+rA.map(c=>`<option>${escapeHtml(c)}</option>`).join('');const sc=document.getElementById('ss-cat');if(sc)sc.innerHTML='<option value="">Todas</option>'+sA.map(c=>`<option>${escapeHtml(c)}</option>`).join('');}

// ═══ NAV ════════════════════════════════════════════════
const TMETA={
  dashboard:['Dashboard','Visão estratégica e financeira unificada'],
  mvv:['MVV — Missão · Visão · Valores','Fundamentos estratégicos da SIAS IA / VoxCivis · Proposta candidata'],
  okrmetas:['OKRs — Objetivos & Key Results','Ciclo 2026 · 4 objetivos estratégicos com KRs globais e táticos'],
  iniciativas:['Iniciativas Estratégicas','Plano de execução com etapas e acompanhamento'],
  analise:['Análise de Contexto','SWOT e PEST · Inteligência estratégica de mercado'],
  findash:['Dashboard Financeiro','Entradas, saídas, análise e projeções · 2025'],
  entradas:['Entradas','Receitas e recebimentos'],
  saidas:['Saídas','Despesas e pagamentos'],
  plano:['Plano de Contas','Estrutura e classificação de contas'],
  config:['Configurações','Personalização e preferências'],
  equipe:['Equipe','Squads, membros e organograma'],
  parceiros:['Parceiros','Gestão de parcerias externas · PF e PJ'],
  parcdash:['Dashboard de Parcerias','Resultados centralizados e desempenho por tipo de parceria'],
  clientes:['Gestão de Clientes','Carteira, ticket, canal de aquisição e saúde da conta'],
  dre:['DRE — Demonstrativo de Resultado','Regime de caixa · comparativo de período'],
  custos:['Análise de Custos','Distribuição, ranking e evolução de gastos'],
  riscos:['Riscos','Inadimplência, capital de giro e desempenho de parceiros e clientes'],
};
function go(tab){
  ctab=tab;
  document.querySelectorAll('.tab').forEach(e=>e.classList.remove('active'));
  const tEl=document.getElementById('tab-'+tab);if(tEl)tEl.classList.add('active');
  document.querySelectorAll('.nb').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  const[t,d]=TMETA[tab]||['',''];
  document.getElementById('pt').textContent=t;document.getElementById('pd').textContent=d;
  const ta=document.getElementById('ta');
  if(tab==='entradas')ta.innerHTML=`<button class="btn bp" onclick="openM('entry')" title="Registrar nova entrada">+ Nova Entrada</button>`;
  else if(tab==='saidas')ta.innerHTML=`<button class="btn bn" onclick="openM('exit')" title="Registrar nova saída">+ Nova Saída</button>`;
  else if(tab==='plano')ta.innerHTML=`<button class="btn bp" onclick="openM('account')" title="Nova conta">+ Nova Conta</button>`;
  else if(tab==='okrmetas')ta.innerHTML=canEdit()?`<button class="btn bp bsm" onclick="openObjModal(null)" title="Adicionar objetivo estratégico">+ Novo Objetivo</button>`:'';
  else if(tab==='iniciativas')ta.innerHTML=canEditMid()?`<button class="btn bp" onclick="openInitModal(null)" title="Nova iniciativa">+ Nova Iniciativa</button>`:'';
  else if(tab==='analise')ta.innerHTML=canEditMid()?`<button id="btn-edit-analise" class="btn bs bsm" onclick="toggleEditAnalise()" title="Ativar edição">Editar</button>`:'';
  else if(tab==='mvv')ta.innerHTML=canEdit()?`<div style="display:flex;gap:8px;"><button class="btn bs bsm" onclick="openMVVText()" title="Editar Missão e Visão">Editar Texto</button><button class="btn bs bsm" onclick="openMVVVals()" title="Gerenciar Valores">Gerenciar Valores</button></div>`:'';
  else if(tab==='parceiros')ta.innerHTML=canEdit()?`<button class="btn bp" onclick="openPartner(null)" title="Novo parceiro">+ Novo Parceiro</button>`:'';
  else if(tab==='clientes')ta.innerHTML=canEdit()?`<button class="btn bp" onclick="openClient(null)" title="Novo cliente">+ Novo Cliente</button>`:'';
  else if(tab==='equipe')ta.innerHTML=canEdit()?`<div style="display:flex;gap:8px;"><button class="btn bs bsm" onclick="openSquad(null)" title="Novo squad">+ Squad</button><button class="btn bp" onclick="openMember(null)" title="Novo membro">+ Membro</button></div>`:'';
  else ta.innerHTML='';
  if(tab==='dre'||tab==='custos'){document.querySelectorAll('.dre-pb').forEach(b=>b.classList.toggle('active',b.dataset.p==='all'));}
  renderCur();
}
function renderCur(){
  if(ctab==='dashboard')renderDash();
  else if(ctab==='mvv')renderMVV();
  else if(ctab==='okrmetas')renderOKRs();
  else if(ctab==='iniciativas')renderIniciativas();
  else if(ctab==='analise')renderAnalise();
  else if(ctab==='findash')renderFinDash();
  else if(ctab==='entradas')renderE();
  else if(ctab==='saidas')renderS();
  else if(ctab==='plano')renderPlano();
  else if(ctab==='equipe')renderEquipe();
  else if(ctab==='parceiros')renderPartners();
  else if(ctab==='parcdash')renderPartnersDash();
  else if(ctab==='clientes')renderClientes();
  else if(ctab==='dre')renderDRE();
  else if(ctab==='custos')renderCustos();
  else if(ctab==='riscos')renderRiscos();
}

// ═══ DASHBOARD ══════════════════════════════════════════
function renderDash(){
  const mrr=calcMRR(),mom=calcMoM(),rwy=calcRunway(),okrPct=getOverallPct();
  document.getElementById('dash-kpis').innerHTML=[
    {l:'MRR — Receita Mensal',v:cur(mrr.v),c:'#10B981',bg:'rgba(16,185,129,.1)',ico:'↑',s:`Mês mais recente com dados · ${mrr.label}`},
    {l:'Crescimento MoM',v:(mom.v>=0?'+':'')+mom.v.toFixed(1)+'%',c:mom.v>=0?'#10B981':'#EF4444',bg:mom.v>=0?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)',ico:'↗',s:`Variação mensal · ${mom.label}`},
    {l:'OKRs — Conclusão Geral',v:okrPct.toFixed(0)+'%',c:okrPct>=70?'#10B981':okrPct>=40?'#F59E0B':'#EF4444',bg:okrPct>=70?'rgba(16,185,129,.1)':okrPct>=40?'rgba(245,158,11,.1)':'rgba(239,68,68,.1)',ico:'◎',s:`${okrData.objectives.length} objetivos · ciclo ${okrData.cycle}`},
    {l:'Runway Estimado',v:rwy.v===Infinity?'∞':rwy.v>=0?rwy.v.toFixed(1)+'m':'–',c:rwy.v>=6?'#10B981':rwy.v>=3?'#F59E0B':'#EF4444',bg:rwy.v>=6?'rgba(16,185,129,.1)':rwy.v>=3?'rgba(245,158,11,.1)':'rgba(239,68,68,.1)',ico:'⏱',s:`Saldo ${cur(rwy.saldo)} ÷ custo fixo médio ${cur(rwy.avgFx)}/mês`},
  ].map(k=>`<div class="kpi" style="border-top:3px solid ${k.c};"><div class="ktop"><div class="klb">${k.l}</div><div class="kic" style="background:${k.bg};color:${k.c};">${k.ico}</div></div><div class="kv" style="color:${k.c};">${k.v}</div><div style="font-size:11px;color:var(--t3);margin-top:4px;">${k.s}</div></div>`).join('');

  const allMonths=[...new Set([...entries,...exits].map(x=>x.date.substr(0,7)))].sort();
  const last6=allMonths.slice(-6);
  const mE=last6.map(ym=>{const[y,m]=ym.split('-');const s=`${y}-${m}-01`,e=`${y}-${m}-${String(new Date(parseInt(y),parseInt(m),0).getDate()).padStart(2,'0')}`;return entries.filter(x=>x.date>=s&&x.date<=e&&x.status==='Recebido').reduce((a,x)=>a+x.value,0);});
  const mS=last6.map(ym=>{const[y,m]=ym.split('-');const s=`${y}-${m}-01`,e=`${y}-${m}-${String(new Date(parseInt(y),parseInt(m),0).getDate()).padStart(2,'0')}`;return exits.filter(x=>x.date>=s&&x.date<=e&&x.status==='Pago').reduce((a,x)=>a+x.value,0);});
  const lbls=last6.map(ym=>{const[y,m]=ym.split('-');return MONTHS[parseInt(m)-1];});
  document.getElementById('dash-chart-sub').textContent=`Entradas vs Saídas — ${lbls.join(', ')}`;
  const dk=cfg.theme==='dark';const gc=dk?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)',tc=dk?'#4B5563':'#94A3B8';
  const ctx=document.getElementById('dashchart')?.getContext('2d');
  if(ctx){if(dashChart)dashChart.destroy();dashChart=new Chart(ctx,{type:'bar',data:{labels:lbls,datasets:[{label:'Entradas',data:mE,backgroundColor:'rgba(16,185,129,.7)',borderRadius:6,borderSkipped:false},{label:'Saídas',data:mS,backgroundColor:'rgba(239,68,68,.5)',borderRadius:6,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>' '+ctx.dataset.label+': '+cur(ctx.raw)}}},scales:{x:{ticks:{color:tc},grid:{display:false}},y:{ticks:{color:tc,callback:v=>v>=1000?'R$'+(v/1000).toFixed(0)+'k':v},grid:{color:gc}}}}});}

  const ohEl=document.getElementById('dash-okr-health');
  if(ohEl)ohEl.innerHTML=okrData.objectives.map(obj=>{const pct=Math.round(getObjPct(obj)),r=15.9155,circ=2*Math.PI*r,dash=(pct/100)*circ;return`<div class="ohc" onclick="location.href='okrmetas.html'" title="Ver KRs de ${escapeHtml(obj.num)}"><div class="oh-ring-wrap"><svg width="48" height="48" viewBox="0 0 36 36"><circle cx="18" cy="18" r="${r}" fill="none" stroke="var(--border)" stroke-width="3"/><circle cx="18" cy="18" r="${r}" fill="none" stroke="${obj.color}" stroke-width="3" stroke-dasharray="${dash.toFixed(2)} ${circ.toFixed(2)}" stroke-linecap="round" transform="rotate(-90 18 18)"/></svg><div class="oh-ring-num" style="color:${obj.color};">${pct}%</div></div><div class="oh-info"><div class="oh-num" style="color:${obj.color};">${escapeHtml(obj.num)}</div><div class="oh-title-sm">${escapeHtml(obj.title.length>55?obj.title.substring(0,55)+'…':obj.title)}</div></div></div>`;}).join('');

  const rec=[...entries.map(e=>({...e,tp:'e'})),...exits.map(e=>({...e,tp:'s'}))].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  document.getElementById('dash-recent-tx').innerHTML=rec.length?rec.map(it=>`<div class="tx"><div class="txi" style="background:${it.tp==='e'?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)'};color:${it.tp==='e'?'#10B981':'#EF4444'};">${it.tp==='e'?'↑':'↓'}</div><div class="txn"><div class="txnm">${escapeHtml(it.desc)}</div><div class="txmt">${dtf(it.date)} · ${escapeHtml(it.cat)}</div></div><div class="txa"><div class="txv" style="color:${it.tp==='e'?'#10B981':'#EF4444'};">${it.tp==='e'?'+':'-'}${cur(it.value)}</div></div></div>`).join(''):`<div style="text-align:center;padding:32px;color:var(--t3);">Sem transações registradas.</div>`;

  const aiEl=document.getElementById('dash-active-init');
  if(aiEl){const ai=initiatives.filter(i=>i.status==='active').slice(0,4);aiEl.innerHTML=ai.length?ai.map(i=>`<div class="tx"><div class="txi" style="background:rgba(67,97,238,.1);color:#4361EE;font-size:12px;">▶</div><div class="txn"><div class="txnm">${escapeHtml(i.name)}</div><div class="txmt">${STAGES[i.stage||0]}</div></div><div class="txa"><span class="badge" style="background:rgba(67,97,238,.1);color:#4361EE;">Ativa</span></div></div>`).join(''):`<div style="text-align:center;padding:32px;color:var(--t3);">Nenhuma iniciativa ativa.</div>`;}
}

// ═══ MVV ════════════════════════════════════════════════
function renderMVV(){
  const edit=canEdit();
  document.getElementById('mvv-content').innerHTML=`
    <div class="mvv-hero" style="margin-bottom:12px;">
      <div class="mvv-hero-eyebrow">Missão</div>
      <div class="mvv-stmt">"${escapeHtml(mvvData.missao)}"</div>

    </div>
    <div class="mvv-hero" style="margin-bottom:20px;background:linear-gradient(135deg,#065F46,#064E3B);">
      <div class="mvv-hero-eyebrow" style="color:#6EE7B7;">Visão · 2027</div>
      <div class="mvv-stmt">"${escapeHtml(mvvData.visao)}"</div>

    </div>
    <div class="mvv-vals-section">
      <div class="mvv-vals-title">Valores</div>
      <div class="mvv-vals">
        ${mvvData.valores.map((v,i)=>`<div class="mvv-val">
          <div class="mvv-val-ico">${escapeHtml(v.icon)}</div>
          <div class="mvv-val-name">${escapeHtml(v.nome)}</div>
          <div class="mvv-val-desc">${escapeHtml(v.desc)}</div>
          ${edit?`<div class="mvv-val-acts">
            <button class="btn bic bie" onclick="openMVVValEdit(${i})" title="Editar este valor" style="width:24px;height:24px;font-size:10px;">✏</button>
            <button class="btn bic bid" onclick="delMVVVal(${i})" title="Remover este valor" style="width:24px;height:24px;font-size:14px;">×</button>
          </div>`:''}
        </div>`).join('')}
        ${edit?`<div class="mvv-val" style="border:2px dashed var(--border);cursor:pointer;align-items:center;justify-content:center;display:flex;flex-direction:column;gap:6px;min-height:100px;" onclick="openMVVValNew()" title="Adicionar novo valor">
          <span style="font-size:28px;color:var(--t3);">+</span>
          <span style="font-size:12px;font-weight:700;color:var(--t3);">Adicionar Valor</span>
        </div>`:''}
      </div>
    </div>`;
}
function openMVVText(){
  mmode2='mvv-text';
  document.getElementById('m2tit').textContent='Editar Missão e Visão';
  document.getElementById('m2sub').textContent='Co-criação com liderança';
  document.getElementById('m2-mvv-text').style.display='';
  document.getElementById('m2-mvv-vals').style.display='none';
  document.getElementById('m2-obj-fields').style.display='none';
  document.getElementById('m2-kr-fields').style.display='none';
  document.getElementById('m2-missao').value=mvvData.missao;
  document.getElementById('m2-visao').value=mvvData.visao;
  document.getElementById('ebox2').style.display='none';
  document.getElementById('modal2').classList.add('show');
  setTimeout(()=>document.getElementById('m2-missao').focus(),60);
}
function openMVVVals(){
  mmode2='mvv-vals';valEditIdx=-1;
  document.getElementById('m2tit').textContent='Gerenciar Valores';
  document.getElementById('m2sub').textContent='Adicione, edite ou remova valores';
  document.getElementById('m2-mvv-text').style.display='none';
  document.getElementById('m2-mvv-vals').style.display='';
  document.getElementById('m2-obj-fields').style.display='none';
  document.getElementById('m2-kr-fields').style.display='none';
  document.getElementById('ebox2').style.display='none';
  renderValList();
  cancelValEdit();
  document.getElementById('modal2').classList.add('show');
}
function openMVVValEdit(i){valEditIdx=i;const v=mvvData.valores[i];document.getElementById('val-ico').value=v.icon;document.getElementById('val-nome').value=v.nome;document.getElementById('val-desc').value=v.desc;document.getElementById('val-edit-form').style.display='block';}
function openMVVValNew(){valEditIdx=-1;document.getElementById('val-ico').value='';document.getElementById('val-nome').value='';document.getElementById('val-desc').value='';document.getElementById('val-edit-form').style.display='block';}
function cancelValEdit(){document.getElementById('val-edit-form').style.display='none';}
function renderValList(){document.getElementById('val-edit-list').innerHTML=mvvData.valores.map((v,i)=>`<div class="val-edit-item"><div class="val-edit-ico">${escapeHtml(v.icon)}</div><div class="val-edit-info"><div class="val-edit-name">${escapeHtml(v.nome)}</div><div class="val-edit-desc">${escapeHtml(v.desc)}</div></div><div class="val-edit-acts"><button class="btn bic bie" onclick="openMVVValEdit(${i})" title="Editar" style="width:24px;height:24px;font-size:10px;">✏</button><button class="btn bic bid" onclick="delValInline(${i})" title="Remover" style="width:24px;height:24px;font-size:14px;">×</button></div></div>`).join('');}
function addValorInline(){openMVVValNew();}
function saveValorEdit(){
  const icon=document.getElementById('val-ico').value.trim()||'●';
  const nome=document.getElementById('val-nome').value.trim();
  const desc=document.getElementById('val-desc').value.trim();
  if(!nome){alert('Informe o nome do valor.');return;}
  const v={id:uid(),nome,desc,icon};
  if(valEditIdx>=0)mvvData.valores[valEditIdx]=v;else mvvData.valores.push(v);
  sv('sias-mvv',mvvData);cancelValEdit();renderValList();
}
function delValInline(i){if(!confirm('Remover este valor?'))return;mvvData.valores.splice(i,1);sv('sias-mvv',mvvData);renderValList();}
function delMVVVal(i){if(!confirm('Remover este valor?'))return;mvvData.valores.splice(i,1);sv('sias-mvv',mvvData);renderMVV();}
function closeM2(){document.getElementById('modal2').classList.remove('show');}
function saveM2(){
  const eb=document.getElementById('ebox2');
  if(mmode2==='mvv-text'){
    const m=document.getElementById('m2-missao').value.trim(),v=document.getElementById('m2-visao').value.trim();
    if(!m||!v){eb.textContent='Preencha Missão e Visão.';eb.style.display='block';return;}
    mvvData={...mvvData,missao:m,visao:v};sv('sias-mvv',mvvData);closeM2();renderMVV();
  } else if(mmode2==='mvv-vals'){
    sv('sias-mvv',mvvData);closeM2();renderMVV();
  } else if(mmode2==='obj-new'||mmode2==='obj-edit'){
    const title=document.getElementById('m2-obj-title').value.trim();
    if(!title){eb.textContent='Informe o título do objetivo.';eb.style.display='block';return;}
    if(mmode2==='obj-new'){
      const nums=okrData.objectives.length+1;
      const id=`O${nums}`;
      okrData.objectives.push({id,num:id,title,color:selObjColor,krs:[]});
    } else {
      okrData.objectives=okrData.objectives.map(o=>o.id===m2ctx?{...o,title,color:selObjColor}:o);
    }
    sv('sias-okrs',okrData);closeM2();renderOKRs();
  } else if(mmode2==='kr-new'||mmode2==='kr-edit'){
    const label=document.getElementById('m2-kr-label').value.trim();
    const target=parseFloat(document.getElementById('m2-kr-target').value);
    const unit=document.getElementById('m2-kr-unit').value;
    const calc=document.getElementById('m2-kr-calc').value||null;
    const invertBtn=document.querySelector('#m2-kr-invert .stb.on');
    const invert=invertBtn?parseInt(invertBtn.dataset.v)===1:false;
    const note=document.getElementById('m2-kr-note').value.trim();
    if(!label||isNaN(target)){eb.textContent='Informe o texto e a meta do KR.';eb.style.display='block';return;}
    const curr=parseFloat(document.getElementById('m2-kr-curr').value)||0;
    const kr={id:m2ctx?.krId||uid(),label,target,unit,calcType:calc,current:curr,invertGood:invert,note};
    if(mmode2==='kr-new'){
      okrData.objectives=okrData.objectives.map(o=>o.id===m2ctx?.objId?{...o,krs:[...o.krs,kr]}:o);
    } else {
      okrData.objectives=okrData.objectives.map(o=>o.id===m2ctx?.objId?{...o,krs:o.krs.map(k=>k.id===m2ctx?.krId?kr:k)}:o);
    }
    sv('sias-okrs',okrData);closeM2();renderOKRs();
  }
}

// ═══ OKRs ════════════════════════════════════════════════
function renderOKRs(){
  const overall=getOverallPct();
  document.getElementById('okr-overall-pct').textContent=overall.toFixed(0)+'%';
  const edit=canEdit();
  document.getElementById('okr-objectives').innerHTML=okrData.objectives.length?okrData.objectives.map(obj=>{
    const op=getObjPct(obj),oc=op>=70?'#10B981':op>=40?'#F59E0B':'#EF4444';
    return`<div class="okr-obj-wrap">
      <div class="okr-obj-hdr" onclick="toggleKRs('${obj.id}')" title="Expandir/colapsar KRs">
        <div class="okr-obj-left">
          <div class="okr-obj-num" style="color:${obj.color};">${escapeHtml(obj.num)}</div>
          <div><div class="okr-obj-title">${escapeHtml(obj.title)}</div><div class="okr-obj-sub">${obj.krs.length} Key Results</div></div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="font-size:14px;font-weight:900;color:${oc};">${op.toFixed(0)}%</div>
          ${edit?`<div class="obj-edit-acts" onclick="event.stopPropagation()">
            <button class="btn bic bie" onclick="openObjModal('${obj.id}')" title="Editar objetivo ${obj.num}" style="width:26px;height:26px;font-size:10px;">✏</button>
            <button class="btn bic bid" onclick="delObj('${obj.id}')" title="Excluir objetivo ${obj.num}" style="width:26px;height:26px;font-size:12px;">×</button>
          </div>`:''}
          <span style="font-size:10px;color:var(--t3);">▼</span>
        </div>
      </div>
      <div class="okr-pbar-wrap"><div class="okr-pbar-fill" style="width:${Math.min(op,100).toFixed(1)}%;background:${obj.color};"></div></div>
      <div class="okr-krs" id="krs-${obj.id}">${obj.krs.map(kr=>{
        const curr=getKRCurrent(kr),pct=getKRProgress(kr);
        const bc=pct>=80?'#10B981':pct>=50?'#F59E0B':'#EF4444';
        return`<div class="kr-row">
          <span class="kr-badge-sm" style="background:${obj.color}22;color:${obj.color};">${escapeHtml(kr.id)}</span>
          <div class="kr-text-sm">${escapeHtml(kr.label)}${kr.calcType?`<span class="kr-auto-tag" title="Calculado automaticamente das transações" style="margin-left:6px;">auto</span>`:''}</div>
          <div class="kr-vals">${fmtKR(curr,kr.unit)} / ${fmtKR(kr.target,kr.unit)}</div>
          <div class="kr-prog"><div class="kr-prog-fill" style="width:${Math.min(pct,100).toFixed(1)}%;background:${bc};"></div></div>
          <div class="kr-pct-sm" style="color:${bc};">${pct.toFixed(0)}%</div>
          ${edit?`<div class="kr-acts"><button onclick="openKRModal('${obj.id}','${kr.id}')" title="Editar KR ${kr.id}">✏</button><button style="color:var(--red);" onclick="delKR('${obj.id}','${kr.id}')" title="Remover KR ${kr.id}">×</button></div>`:''}
        </div>`;
      }).join('')}</div>
      <button class="okr-add-kr" onclick="openKRModal('${obj.id}',null)" title="Adicionar novo KR a ${obj.num}">+ Novo Key Result</button>
    </div>`;
  }).join(''):`<div style="text-align:center;padding:60px;color:var(--t3);"><div style="font-size:40px;margin-bottom:12px;">🎯</div><div>Nenhum objetivo cadastrado.</div>${edit?`<button class="btn bp" style="margin-top:16px;" onclick="openObjModal(null)" title="Criar objetivo">+ Criar Objetivo</button>`:''}</div>`;
}
function toggleKRs(id){const el=document.getElementById('krs-'+id);if(el)el.style.display=el.style.display==='none'?'':'none';}
function openObjModal(id){
  mmode2=id?'obj-edit':'obj-new';m2ctx=id;
  const obj=id?okrData.objectives.find(o=>o.id===id):null;
  document.getElementById('m2tit').textContent=obj?'Editar Objetivo':'Novo Objetivo';
  document.getElementById('m2sub').textContent=obj?obj.num:'OKR · Ciclo 2026';
  document.getElementById('m2-mvv-text').style.display='none';
  document.getElementById('m2-mvv-vals').style.display='none';
  document.getElementById('m2-obj-fields').style.display='';
  document.getElementById('m2-kr-fields').style.display='none';
  document.getElementById('m2-obj-title').value=obj?obj.title:'';
  selObjColor=obj?obj.color:OBJ_COLORS[okrData.objectives.length%OBJ_COLORS.length];
  const cpk=document.getElementById('m2-obj-cpk');
  cpk.innerHTML=OBJ_COLORS.map(c=>`<div class="co${c===selObjColor?' sel':''}" style="background:${c};" onclick="setObjColor('${c}')" title="Usar cor ${c}"></div>`).join('');
  document.getElementById('ebox2').style.display='none';
  document.getElementById('modal2').classList.add('show');
  setTimeout(()=>document.getElementById('m2-obj-title').focus(),60);
}
function setObjColor(c){selObjColor=c;document.querySelectorAll('#m2-obj-cpk .co').forEach(el=>el.classList.toggle('sel',el.style.background===c));}
function delObj(id){if(!confirm('Excluir este objetivo e todos os seus KRs?'))return;okrData.objectives=okrData.objectives.filter(o=>o.id!==id);sv('sias-okrs',okrData);renderOKRs();}
function openKRModal(objId,krId){
  mmode2=krId?'kr-edit':'kr-new';
  m2ctx={objId,krId};
  const obj=okrData.objectives.find(o=>o.id===objId);
  const kr=krId?obj?.krs.find(k=>k.id===krId):null;
  document.getElementById('m2tit').textContent=kr?`Editar ${krId}`:'Novo Key Result';
  document.getElementById('m2sub').textContent=obj?obj.title:'';
  document.getElementById('m2-mvv-text').style.display='none';
  document.getElementById('m2-mvv-vals').style.display='none';
  document.getElementById('m2-obj-fields').style.display='none';
  document.getElementById('m2-kr-fields').style.display='';
  document.getElementById('m2-kr-label').value=kr?kr.label:'';
  document.getElementById('m2-kr-target').value=kr?kr.target:'';
  document.getElementById('m2-kr-curr').value=kr?kr.current||0:'0';
  document.getElementById('m2-kr-unit').value=kr?kr.unit:'COUNT';
  document.getElementById('m2-kr-calc').value=kr?kr.calcType||'':'';
  document.getElementById('m2-kr-note').value=kr?kr.note||'':'';
  document.querySelectorAll('#m2-kr-invert .stb').forEach(b=>b.classList.toggle('on',parseInt(b.dataset.v)===(kr?.invertGood?1:0)));
  document.getElementById('ebox2').style.display='none';
  document.getElementById('modal2').classList.add('show');
  setTimeout(()=>document.getElementById('m2-kr-label').focus(),60);
}
function pickInvert(v){document.querySelectorAll('#m2-kr-invert .stb').forEach(b=>b.classList.toggle('on',parseInt(b.dataset.v)===v));}
function delKR(objId,krId){if(!confirm('Remover este KR?'))return;okrData.objectives=okrData.objectives.map(o=>o.id===objId?{...o,krs:o.krs.filter(k=>k.id!==krId)}:o);sv('sias-okrs',okrData);renderOKRs();}
// ═══ INICIATIVAS ════════════════════════════════════════
function setInitFilter(f){currentInitFilter=f;document.querySelectorAll('.if-btn').forEach(b=>b.classList.toggle('on',b.dataset.f===f));renderIniciativas();}
function renderIniciativas(){
  const total=initiatives.length,active=initiatives.filter(i=>i.status==='active').length,done=initiatives.filter(i=>i.status==='done').length,paused=initiatives.filter(i=>i.status==='paused').length;
  const el=document.getElementById('init-stats');
  if(el)el.innerHTML=[{v:total,l:'Total',c:'#4361EE'},{v:active,l:'Em andamento',c:'#10B981'},{v:done,l:'Concluídas',c:'#7209B7'},{v:paused,l:'Pausadas',c:'#F59E0B'}].map(s=>`<div class="init-stat" style="border-top-color:${s.c};"><div class="init-stat-v" style="color:${s.c};">${s.v}</div><div class="init-stat-l">${s.l}</div></div>`).join('');
  const list=currentInitFilter==='all'?initiatives:initiatives.filter(i=>i.status===currentInitFilter);
  const edit=canEditMid();
  const grid=document.getElementById('init-grid');
  if(!grid)return;
  if(!list.length){grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--t3);"><div style="font-size:40px;margin-bottom:12px;">&#x1F680;</div><div>Nenhuma iniciativa nesta categoria.</div>${edit?`<button class="btn bp" style="margin-top:16px;" onclick="openInitModal(null)" title="Nova iniciativa">+ Nova Iniciativa</button>`:''}</div>`;return;}
  grid.innerHTML=list.map(i=>{
    const st=INIT_STATUS[i.status]||INIT_STATUS.planned;
    const krs=i.linkedKRs&&i.linkedKRs.length?i.linkedKRs.map(k=>`<span class="ikr-tag" style="background:rgba(67,97,238,.1);color:#4361EE;">${k}</span>`).join(''):'';
    return`<div class="initc" style="border-left-color:${st.c};">
      <div class="initc-head">
        <div class="initc-name">${escapeHtml(i.name)}</div>
        <span class="badge" style="background:${st.bg};color:${st.c};flex-shrink:0;">${st.l}</span>
      </div>
      <div class="initc-desc">${escapeHtml(i.desc)||'Sem descrição.'}</div>
      ${krs?`<div class="initc-krs">${krs}</div>`:''}
      ${singleProgress(i.stage||0)}
      <div class="initc-meta">${i.dueDate?`&#x1F4C5; Prazo: ${dtf(i.dueDate)}`:''} ${i.responsible?`&nbsp;&#x1F464; ${escapeHtml(i.responsible)}`:''}</div>
      ${edit?`<div class="initc-acts"><button class="btn bs bsm" onclick="openInitModal('${i.id}')" title="Editar iniciativa">Editar</button><button class="btn bsm" style="color:var(--red);border:1px solid var(--border);" onclick="delInit('${i.id}')" title="Excluir iniciativa">Excluir</button></div>`:''}
    </div>`;
  }).join('')+(edit?`<div class="initc" style="border-left-color:var(--border);border:2px dashed var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;min-height:160px;" onclick="openInitModal(null)" title="Nova iniciativa"><span style="font-size:13px;font-weight:700;color:var(--t3);">+ Nova Iniciativa</span></div>`:'');
}
function delInit(id){if(!confirm('Excluir esta iniciativa?'))return;initiatives=initiatives.filter(i=>i.id!==id);sv('sias-init',initiatives);renderIniciativas();}

// ═══ ANÁLISE (SWOT / PEST) ══════════════════════════════
function setAnaliseTab(tab){
  document.querySelectorAll('.subnav-btn').forEach(b=>b.classList.toggle('on',b.dataset.t===tab));
  document.querySelectorAll('.swot-section').forEach(s=>s.classList.toggle('on',s.id===`asec-${tab}`));
}
function toggleEditAnalise(){
  editModeAnalise=!editModeAnalise;
  document.body.classList.toggle('edit-mode',editModeAnalise);
  const btn=document.getElementById('btn-edit-analise');
  if(btn)btn.textContent=editModeAnalise?'Sair da edição':'Editar';
}
function renderAnalise(){
  const swotCfg=[{k:'forcas',l:'Forças',c:'#10B981',bg:'rgba(16,185,129,.1)'},{k:'fraquezas',l:'Fraquezas',c:'#EF4444',bg:'rgba(239,68,68,.1)'},{k:'oportunidades',l:'Oportunidades',c:'#4361EE',bg:'rgba(67,97,238,.1)'},{k:'ameacas',l:'Ameaças',c:'#F59E0B',bg:'rgba(245,158,11,.1)'}];
  const sc=document.getElementById('swot-content');
  if(sc)sc.innerHTML=`<div class="swot-grid">${swotCfg.map(s=>`<div class="swot-card"><div class="swot-hdr" style="background:${s.bg};"><div style="width:32px;height:32px;border-radius:8px;background:${s.c};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:14px;">${s.l[0]}</div><span class="swot-title" style="color:${s.c};">${s.l}</span><span class="swot-cnt" style="background:${s.bg};color:${s.c};">${(swotData[s.k]||[]).length}</span></div><div class="swot-body">${(swotData[s.k]||[]).map((item,idx)=>`<div class="sw-item"><div class="sw-dot" style="background:${s.c};"></div><div class="sw-text">${escapeHtml(item)}</div><button class="sw-del" onclick="delSwot('${s.k}',${idx})" title="Remover">×</button></div>`).join('')}<button class="sw-add" onclick="openM4('swot','${s.k}',-1)" title="Adicionar item">+ Adicionar</button></div></div>`).join('')}</div>`;
  const pestCfg=[{k:'politico',l:'Político',let:'P',c:'#7209B7',bg:'rgba(114,9,183,.1)',sub:'Fatores políticos e regulatórios'},{k:'economico',l:'Econômico',let:'E',c:'#10B981',bg:'rgba(16,185,129,.1)',sub:'Contexto macroeconômico'},{k:'social',l:'Social',let:'S',c:'#4361EE',bg:'rgba(67,97,238,.1)',sub:'Tendências socioculturais'},{k:'tecnologico',l:'Tecnológico',let:'T',c:'#F5A023',bg:'rgba(245,160,35,.1)',sub:'Inovação e tecnologia'}];
  const pc=document.getElementById('pest-content');
  if(pc)pc.innerHTML=`<div class="pest-grid">${pestCfg.map(p=>`<div class="pest-card"><div class="pest-hdr" style="background:${p.bg};"><div style="min-width:44px;"><div class="pest-letter" style="color:${p.c};">${p.let}</div></div><div><div class="pest-name" style="color:${p.c};">${p.l}</div><div class="pest-sub">${p.sub}</div></div></div><div class="swot-body">${(pestData[p.k]||[]).map((item,idx)=>`<div class="sw-item"><div class="sw-dot" style="background:${p.c};"></div><div class="sw-text">${escapeHtml(item)}</div><button class="sw-del" onclick="delPest('${p.k}',${idx})" title="Remover">×</button></div>`).join('')}<button class="sw-add" onclick="openM4('pest','${p.k}',-1)" title="Adicionar item">+ Adicionar</button></div></div>`).join('')}</div>`;
}
function delSwot(q,idx){if(!confirm('Remover item?'))return;swotData[q].splice(idx,1);sv('sias-swot',swotData);renderAnalise();}
function delPest(q,idx){if(!confirm('Remover item?'))return;pestData[q].splice(idx,1);sv('sias-pest',pestData);renderAnalise();}
function openM4(ds,q,idx){m4ctx={ds,q,idx};const labels={forcas:'Forças',fraquezas:'Fraquezas',oportunidades:'Oportunidades',ameacas:'Ameaças',politico:'Político',economico:'Econômico',social:'Social',tecnologico:'Tecnológico'};document.getElementById('m4tit').textContent=(idx>=0?'Editar':'Adicionar')+' item';document.getElementById('m4sub').textContent=labels[q]||q;const data=ds==='swot'?swotData:pestData;document.getElementById('m4-text').value=(idx>=0&&data[q]?data[q][idx]:'');document.getElementById('ebox4').style.display='none';document.getElementById('modal4').classList.add('show');setTimeout(()=>document.getElementById('m4-text').focus(),60);}
function closeM4(){document.getElementById('modal4').classList.remove('show');}
function saveM4(){const text=document.getElementById('m4-text').value.trim();const eb=document.getElementById('ebox4');if(!text){eb.textContent='Preencha o texto do item.';eb.style.display='block';return;}const{ds,q,idx}=m4ctx;const data=ds==='swot'?swotData:pestData;if(idx>=0)data[q][idx]=text;else data[q].push(text);sv(ds==='swot'?'sias-swot':'sias-pest',data);closeM4();renderAnalise();}

// ═══ FINANCEIRO: DASHBOARD ══════════════════════════════
function renderFinDash(){
  renderHealthIndicators();
  const flt=getFiltered(entries),fls=getFiltered(exits);
  const totE=flt.filter(e=>e.status==='Recebido').reduce((a,e)=>a+e.value,0);
  const totS=fls.filter(e=>e.status==='Pago').reduce((a,e)=>a+e.value,0);
  const pndE=flt.filter(e=>e.status==='Pendente').reduce((a,e)=>a+e.value,0);
  const pndS=fls.filter(e=>e.status==='Pendente').reduce((a,e)=>a+e.value,0);
  const saldo=totE-totS;
  const prev=getPrevRange();
  const pE=prev?getFilteredRange(entries,prev.s,prev.e).filter(e=>e.status==='Recebido').reduce((a,e)=>a+e.value,0):null;
  const pS=prev?getFilteredRange(exits,prev.s,prev.e).filter(e=>e.status==='Pago').reduce((a,e)=>a+e.value,0):null;
  const kgEl=document.getElementById('kgrid');
  if(kgEl)kgEl.innerHTML=[
    {l:'Entradas Recebidas',v:cur(totE),c:'#10B981',bg:'rgba(16,185,129,.1)',ico:'↑',tr:trendBadge(totE,pE,false,prev?.l)},
    {l:'Saídas Pagas',v:cur(totS),c:'#EF4444',bg:'rgba(239,68,68,.1)',ico:'↓',tr:trendBadge(totS,pS,true,prev?.l)},
    {l:'Resultado do Período',v:cur(saldo),c:saldo>=0?'#10B981':'#EF4444',bg:saldo>=0?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)',ico:'≡',tr:''},
    {l:'A Receber + A Pagar',v:cur(pndE-pndS),c:'#F59E0B',bg:'rgba(245,158,11,.1)',ico:'⏳',tr:''},
  ].map(k=>`<div class="kpi" style="border-top:3px solid ${k.c};"><div class="ktop"><div class="klb">${k.l}</div><div class="kic" style="background:${k.bg};color:${k.c};">${k.ico}</div></div><div class="kv" style="color:${k.c};">${k.v}</div><div style="font-size:11px;margin-top:4px;">${k.tr}</div></div>`).join('');
  const allMonths=[...new Set([...flt,...fls].map(x=>x.date.substr(0,7)))].sort();
  const last6=allMonths.slice(-6);
  const mE=last6.map(ym=>{const[y,m]=ym.split('-');const s=`${y}-${m}-01`,e2=`${y}-${m}-${String(new Date(parseInt(y),parseInt(m),0).getDate()).padStart(2,'0')}`;return flt.filter(x=>x.date>=s&&x.date<=e2&&x.status==='Recebido').reduce((a,x)=>a+x.value,0);});
  const mS=last6.map(ym=>{const[y,m]=ym.split('-');const s=`${y}-${m}-01`,e2=`${y}-${m}-${String(new Date(parseInt(y),parseInt(m),0).getDate()).padStart(2,'0')}`;return fls.filter(x=>x.date>=s&&x.date<=e2&&x.status==='Pago').reduce((a,x)=>a+x.value,0);});
  const lbls=last6.map(ym=>{const[y,m]=ym.split('-');return MONTHS[parseInt(m)-1]+'/'+y.slice(2);});
  const cpl=document.getElementById('chart-period-label');if(cpl)cpl.textContent=periodLabel();
  const dk=cfg.theme==='dark';const gc=dk?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)',tc=dk?'#4B5563':'#94A3B8';
  const bleg=document.getElementById('bleg');if(bleg)bleg.innerHTML='<span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;"><span style="width:10px;height:10px;border-radius:3px;background:rgba(16,185,129,.7);display:inline-block;"></span>Entradas</span> <span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;"><span style="width:10px;height:10px;border-radius:3px;background:rgba(239,68,68,.5);display:inline-block;"></span>Saídas</span>';
  const bctx=document.getElementById('barchart')?.getContext('2d');
  if(bctx){if(bChart)bChart.destroy();bChart=new Chart(bctx,{type:'bar',data:{labels:lbls,datasets:[{label:'Entradas',data:mE,backgroundColor:'rgba(16,185,129,.7)',borderRadius:6,borderSkipped:false},{label:'Saídas',data:mS,backgroundColor:'rgba(239,68,68,.5)',borderRadius:6,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>' '+c.dataset.label+': '+cur(c.raw)}}},scales:{x:{ticks:{color:tc},grid:{display:false}},y:{ticks:{color:tc,callback:v=>v>=1000?'R$'+(v/1000).toFixed(0)+'k':v},grid:{color:gc}}}}});}
  const catTots={};fls.filter(e=>e.status==='Pago').forEach(e=>{catTots[e.cat]=(catTots[e.cat]||0)+e.value;});
  const catKeys=Object.keys(catTots).sort((a,b)=>catTots[b]-catTots[a]).slice(0,6);
  const pctx=document.getElementById('piechart')?.getContext('2d');
  if(pctx&&catKeys.length){if(pChart)pChart.destroy();pChart=new Chart(pctx,{type:'doughnut',data:{labels:catKeys,datasets:[{data:catKeys.map(k=>catTots[k]),backgroundColor:PIEC,borderWidth:2,borderColor:'transparent'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>' '+c.label+': '+cur(c.raw)}}},cutout:'65%'}});}
  const pleg=document.getElementById('pleg');if(pleg)pleg.innerHTML=catKeys.map((k,i)=>`<span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;margin:2px 6px;"><span style="width:10px;height:10px;border-radius:3px;background:${PIEC[i]};display:inline-block;"></span>${k}</span>`).join('');
  // DRE moved to CONTABILIDADE > DRE & Fluxo tab
  const rec=[...flt.map(e=>({...e,tp:'e'})),...fls.map(e=>({...e,tp:'s'}))].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8);
  const txEl=document.getElementById('txlist');if(txEl)txEl.innerHTML=rec.length?rec.map(t=>`<div class="tx"><div class="txi" style="background:${t.tp==='e'?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)'};color:${t.tp==='e'?'#10B981':'#EF4444'};font-size:13px;">${t.tp==='e'?'↑':'↓'}</div><div class="txn"><div class="txnm">${escapeHtml(t.desc)}</div><div class="txmt">${dtf(t.date)} · ${escapeHtml(t.cat)}</div></div><div class="txa"><div class="txv" style="color:${t.tp==='e'?'#10B981':'#EF4444'};">${t.tp==='e'?'+':'-'}${cur(t.value)}</div>${sbadge(t.status)}</div></div>`).join(''):`<div style="text-align:center;padding:32px;color:var(--t3);">Nenhuma transação no período.</div>`;
  const proj=project(mE,3);const projMonths=['Jul','Ago','Set'];
  const pcEl=document.getElementById('proj-cards');if(pcEl)pcEl.innerHTML=proj.map((v,i)=>`<div class="kpi" style="border-top:3px solid #4361EE;"><div class="klb">${projMonths[i]} 2025</div><div class="kv" style="color:#4361EE;">${cur(v)}</div><div style="font-size:11px;color:var(--t3);">Projeção estimada</div></div>`).join('');
  const prctx=document.getElementById('projchart')?.getContext('2d');
  if(prctx){if(projChart)projChart.destroy();const allL=[...lbls,...projMonths.map(m=>m+'/25')];projChart=new Chart(prctx,{type:'line',data:{labels:allL,datasets:[{label:'Realizado',data:[...mE,...Array(3).fill(null)],borderColor:'#10B981',backgroundColor:'rgba(16,185,129,.1)',borderWidth:2,pointRadius:3,fill:true,tension:.4},{label:'Projeção',data:[...Array(mE.length-1).fill(null),mE[mE.length-1],...proj],borderColor:'#4361EE',backgroundColor:'rgba(67,97,238,.08)',borderWidth:2,borderDash:[6,3],pointRadius:3,fill:true,tension:.4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:tc},grid:{display:false}},y:{ticks:{color:tc,callback:v=>v>=1000?'R$'+(v/1000).toFixed(0)+'k':v},grid:{color:gc}}}}});}
}

// ═══ ENTRADAS / SAÍDAS ══════════════════════════════════
const ENTRY_CFG={
  e:{data:()=>entries,prefix:'se',sumEl:'sume',tbEl:'tbe',posStatus:'Recebido',posLabel:'Recebido',posColor:'#10B981',delFn:'delE',emptyMsg:'Nenhuma entrada encontrada.'},
  s:{data:()=>exits,prefix:'ss',sumEl:'sums',tbEl:'tbs',posStatus:'Pago',posLabel:'Pago',posColor:'#EF4444',delFn:'delE2',emptyMsg:'Nenhuma saída encontrada.'}
};
function renderEntryTable(kind){
  const c=ENTRY_CFG[kind];
  const q=gv(`${c.prefix}-q`),cat=gv(`${c.prefix}-cat`),st=gv(`${c.prefix}-st`),f=gv(`${c.prefix}-f`),t=gv(`${c.prefix}-t`),vn=gv(`${c.prefix}-vn`),vx=gv(`${c.prefix}-vx`),so=gv(`${c.prefix}-so`);
  const r=filtArr(c.data(),q,cat,st,f,t,vn,vx,so);
  const totPos=r.filter(e=>e.status===c.posStatus).reduce((a,e)=>a+e.value,0);
  const totPnd=r.filter(e=>e.status==='Pendente').reduce((a,e)=>a+e.value,0);
  const sbar=document.getElementById(c.sumEl);if(sbar)sbar.innerHTML=[{l:c.posLabel,v:cur(totPos),c:c.posColor},{l:'Pendente',v:cur(totPnd),c:'#F59E0B'},{l:'Registros',v:r.length,c:'#4361EE'},{l:'Média',v:r.length?cur(r.reduce((a,e)=>a+e.value,0)/r.length):cur(0),c:'#7209B7'}].map(s=>`<div class="sc" style="border-top-color:${s.c};"><div class="slb">${s.l}</div><div class="sv" style="color:${s.c};">${s.v}</div></div>`).join('');
  const edit=canEdit();const tb=document.getElementById(c.tbEl);if(!tb)return;
  tb.innerHTML=r.length?r.map(e=>`<tr><td>${dtf(e.date)}</td><td>${escapeHtml(e.desc)}</td><td>${cbadge(e.cat)}</td><td style="font-weight:800;color:${c.posColor};">${cur(e.value)}</td><td>${sbadge(e.status)}</td><td>${edit?`<button class="btn bsm" style="padding:4px 10px;" onclick="openE('${kind}','${e.id}')" title="Editar">✏</button> <button class="btn bsm" style="padding:4px 10px;color:var(--red);" onclick="${c.delFn}('${e.id}')" title="Excluir">×</button>`:''}</td></tr>`).join(''):`<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--t3);">${c.emptyMsg}</td></tr>`;
}
function renderE(){renderEntryTable('e');}
function renderS(){renderEntryTable('s');}
function delE(id){if(!confirm('Excluir entrada?'))return;entries=entries.filter(e=>e.id!==id);sv('sias-e',entries);renderE();}
function delE2(id){if(!confirm('Excluir saída?'))return;exits=exits.filter(e=>e.id!==id);sv('sias-s',exits);renderS();}

// ═══ PLANO DE CONTAS ════════════════════════════════════
function renderPlano(){
  const el=document.getElementById('plano');if(!el)return;
  const edit=canEdit();
  el.innerHTML=ATYPES.map(t=>{
    const accs=accounts.filter(a=>a.type===t.k);
    return`<div class="asec"><div class="ahead"><div class="atit"><div class="adot" style="background:${t.c};"></div>${t.l}</div>${edit?`<button class="btn bsm" style="font-size:11px;" onclick="openAcc('${t.k}')" title="Nova conta em ${t.l}">+ Conta</button>`:''}</div><div class="agr">${accs.map(a=>`<div class="ac" style="border-left-color:${t.c};"><div class="acn">${escapeHtml(a.name)}</div><div class="acd" style="color:var(--t3);">${escapeHtml(a.desc)||'–'}</div>${edit?`<div class="acacts"><button class="ace acacts" style="color:var(--blue);" onclick="openEA('${a.id}')" title="Editar conta">✏ Editar</button><button class="acd2 acacts" style="color:var(--red);" onclick="delAcc('${a.id}')" title="Excluir conta">× Excluir</button></div>`:''}</div>`).join('')+( edit?`<button class="aadd" onclick="openAcc('${t.k}')" title="Nova conta">+ Adicionar</button>`:'')}</div></div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════
// CONTABILIDADE — DRE, FCL, CUSTOS, INDICADORES DE SAÚDE
// ═══════════════════════════════════════════════════════

// ── DRE helpers ────────────────────────────────────────
function setDREPeriod(k){
  const pr=PPERIODS.find(p=>p.k===k)||PPERIODS[0];
  drePeriod={k,s:pr.s,e:pr.e};
  document.querySelectorAll('.dre-pb').forEach(b=>b.classList.toggle('active',b.dataset.p===k));
  const cr=document.getElementById('dre-crange');if(cr)cr.classList.toggle('show',k==='custom');
  if(k!=='custom')renderDRE();
}
function applyDRECustom(){const s=gv('dre-from'),e=gv('dre-to');if(!s||!e)return;drePeriod={k:'custom',s,e};renderDRE();}
function getDREFiltered(arr){return arr.filter(x=>{if(drePeriod.s&&x.date<drePeriod.s)return false;if(drePeriod.e&&x.date>drePeriod.e)return false;return true;});}
function getDREPrev(){const p=PREV_MAP[drePeriod.k];if(p)return p;if(drePeriod.k==='custom'&&drePeriod.s&&drePeriod.e){const ms=new Date(drePeriod.s).getTime(),me=new Date(drePeriod.e).getTime(),dur=me-ms,pe=new Date(ms-86400000),ps=new Date(pe.getTime()-dur);return{s:ps.toISOString().split('T')[0],e:pe.toISOString().split('T')[0],l:'vs ant.'};}return null;}

// ── DRE calculadora ─────────────────────────────────────
function calcDREData(ents,exts){
  const recBruta=ents.filter(e=>e.status==='Recebido').reduce((a,e)=>a+e.value,0);
  const cancelados=ents.filter(e=>e.status==='Cancelado').reduce((a,e)=>a+e.value,0);
  const pendentes=ents.filter(e=>e.status==='Pendente').reduce((a,e)=>a+e.value,0);
  const recLiq=recBruta-cancelados;
  const accType=new Map();accounts.forEach(a=>{if(!accType.has(a.name))accType.set(a.name,a.type);});
  const cfD={},cvD={},despD={},invD={};
  const _dreDMap={'custo-fixo':cfD,'custo-variavel':cvD,'despesa':despD,'investimento':invD};
  exts.forEach(e=>{if(e.status!=='Pago')return;const d=_dreDMap[accType.get(e.cat)];if(d)d[e.cat]=(d[e.cat]||0)+e.value;});
  const cf=Object.values(cfD).reduce((a,v)=>a+v,0);
  const cv=Object.values(cvD).reduce((a,v)=>a+v,0);
  const mc=recLiq-cf-cv;
  const mcPct=recLiq>0?(mc/recLiq)*100:0;
  const desp=Object.values(despD).reduce((a,v)=>a+v,0);
  const ebit=mc-desp;
  const ebitPct=recLiq>0?(ebit/recLiq)*100:0;
  const inv=Object.values(invD).reduce((a,v)=>a+v,0);
  const resultado=ebit-inv;
  const resultadoPct=recLiq>0?(resultado/recLiq)*100:0;
  return{recBruta,cancelados,pendentes,recLiq,cfD,cvD,despD,invD,cf,cv,mc,mcPct,desp,ebit,ebitPct,inv,resultado,resultadoPct};
}

// ── DRE render ──────────────────────────────────────────
function renderDRE(){
  const flt=getDREFiltered(entries),fls=getDREFiltered(exits);
  const d=calcDREData(flt,fls);
  const prevRange=getDREPrev();
  let p=null;
  if(prevRange){
    const pe=entries.filter(x=>(!prevRange.s||x.date>=prevRange.s)&&(!prevRange.e||x.date<=prevRange.e));
    const ps=exits.filter(x=>(!prevRange.s||x.date>=prevRange.s)&&(!prevRange.e||x.date<=prevRange.e));
    p=calcDREData(pe,ps);
  }
  const el=document.getElementById('dre-content');if(!el)return;

  // Table row helpers
  const th=(label)=>`<tr><td colspan="4" style="padding:14px 0 5px;font-size:10px;font-weight:800;color:var(--orange);text-transform:uppercase;letter-spacing:.1em;border-top:2px solid var(--border);">${label}</td></tr>`;
  const tr=(label,val,pval,opts={})=>{
    const{indent=0,bold=false,sep=false,pct=null,hl=false}=opts;
    const c=hl?(val>=0?'var(--green)':'var(--red)'):'inherit';
    const delta=p&&pval!==null?trendBadge(val,pval,val<0,''):'-';
    const pctTag=pct!=null?`<span style="font-size:10px;color:var(--t3);margin-left:5px;">(${pct.toFixed(1)}%)</span>`:'';
    return`<tr style="${sep?'border-top:2px solid var(--border);':''}">
      <td style="padding:9px 0 9px ${indent*18}px;font-size:13px;${bold?'font-weight:800;':''}color:${hl?c:'var(--t1)'};">${label}</td>
      <td style="text-align:right;font-size:13px;${bold?'font-weight:900;':'font-weight:600;'}color:${c};">${cur(val)}${pctTag}</td>
      <td style="text-align:right;font-size:12px;color:var(--t3);">${p?cur(pval??0):'—'}</td>
      <td style="text-align:right;font-size:11px;padding-right:4px;">${p?delta:''}</td>
    </tr>`;
  };
  const sub=(label,val)=>`<tr>
    <td style="padding:5px 0 5px 36px;font-size:11.5px;color:var(--t2);">↳ ${escapeHtml(label)}</td>
    <td style="text-align:right;font-size:11.5px;color:var(--t2);">${cur(-val)}</td>
    <td colspan="2"></td>
  </tr>`;

  el.innerHTML=`
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;gap:16px;flex-wrap:wrap;">
      <div>
        <div class="ctit">Demonstrativo de Resultado (DRE)</div>
        <div class="csub">Regime de caixa · valores realizados no período</div>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        ${p?`<span style="font-size:11px;color:var(--t3);background:var(--thead);border-radius:8px;padding:5px 12px;">Comparativo: ${prevRange?.l||''}</span>`:''}
        ${d.pendentes>0?`<span style="font-size:11px;color:var(--amber);background:rgba(245,158,11,.1);border-radius:8px;padding:5px 12px;">⏳ ${cur(d.pendentes)} pendente a receber</span>`:''}
      </div>
    </div>
    <div style="overflow-x:auto;">
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="background:var(--thead);">
        <th style="padding:10px 0;text-align:left;font-size:10px;font-weight:800;color:var(--t3);text-transform:uppercase;letter-spacing:.07em;">Conta</th>
        <th style="padding:10px 0;text-align:right;font-size:10px;font-weight:800;color:var(--t3);text-transform:uppercase;letter-spacing:.07em;">Período Atual</th>
        <th style="padding:10px 0;text-align:right;font-size:10px;font-weight:800;color:var(--t3);text-transform:uppercase;letter-spacing:.07em;">Período Ant.</th>
        <th style="padding:10px 4px 10px 0;text-align:right;font-size:10px;font-weight:800;color:var(--t3);text-transform:uppercase;letter-spacing:.07em;">Var.</th>
      </tr></thead>
      <tbody>
        ${th('1. RECEITAS')}
        ${tr('Receita Bruta',d.recBruta,p?.recBruta??null)}
        ${d.cancelados>0?tr('(-) Cancelamentos / Devoluções',-d.cancelados,p?-p.cancelados:null,{indent:2}):''}
        ${tr('(=) Receita Líquida',d.recLiq,p?.recLiq??null,{bold:true,sep:true,pct:100,hl:true})}

        ${th('2. CUSTOS')}
        ${tr('(-) Custos Fixos',-d.cf,p?-p.cf:null,{indent:2})}
        ${Object.entries(d.cfD).map(([k,v])=>sub(k,v)).join('')}
        ${tr('(-) Custos Variáveis',-d.cv,p?-p.cv:null,{indent:2})}
        ${Object.entries(d.cvD).map(([k,v])=>sub(k,v)).join('')}
        ${tr('(=) Margem de Contribuição',d.mc,p?.mc??null,{bold:true,sep:true,pct:d.mcPct,hl:true})}

        ${th('3. DESPESAS OPERACIONAIS')}
        ${tr('(-) Despesas Operacionais',-d.desp,p?-p.desp:null,{indent:2})}
        ${Object.entries(d.despD).map(([k,v])=>sub(k,v)).join('')}
        ${tr('(=) EBIT',d.ebit,p?(p.mc-p.desp):null,{bold:true,sep:true,pct:d.ebitPct,hl:true})}

        ${th('4. INVESTIMENTOS')}
        ${tr('(-) Investimentos',-d.inv,p?-p.inv:null,{indent:2})}
        ${Object.entries(d.invD).map(([k,v])=>sub(k,v)).join('')}
        ${tr('(=) Resultado Líquido',d.resultado,p?.resultado??null,{bold:true,sep:true,pct:d.resultadoPct,hl:true})}
      </tbody>
    </table>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border);">
      ${[
        {l:'Margem de Contribuição',v:d.mcPct,c:d.mcPct>=50?'var(--green)':d.mcPct>=30?'var(--amber)':'var(--red)'},
        {l:'Margem Líquida',v:d.resultadoPct,c:d.resultadoPct>=20?'var(--green)':d.resultadoPct>=0?'var(--amber)':'var(--red)'},
        {l:'Índice EBIT',v:d.ebitPct,c:d.ebitPct>=15?'var(--green)':d.ebitPct>=0?'var(--amber)':'var(--red)'}
      ].map(k=>`<div style="text-align:center;padding:12px;background:var(--thead);border-radius:var(--r);">
        <div style="font-size:22px;font-weight:900;color:${k.c};">${k.v.toFixed(1)}%</div>
        <div style="font-size:11px;color:var(--t3);margin-top:2px;">${k.l}</div>
      </div>`).join('')}
    </div>`;

  renderFCL();
}

// ── FCL render ──────────────────────────────────────────
function renderFCL(){
  const allMonths=[...new Set([...entries,...exits].map(x=>x.date.substr(0,7)))].sort();
  let balance=0;
  const mData=allMonths.map(ym=>{
    const[y,m]=ym.split('-');
    const s=`${y}-${m}-01`,e2=`${y}-${m}-${String(new Date(parseInt(y),parseInt(m),0).getDate()).padStart(2,'0')}`;
    const inf=entries.filter(x=>x.date>=s&&x.date<=e2&&x.status==='Recebido').reduce((a,x)=>a+x.value,0);
    const out=exits.filter(x=>x.date>=s&&x.date<=e2&&x.status==='Pago').reduce((a,x)=>a+x.value,0);
    const si=balance,sf=balance+inf-out;balance=sf;
    return{ym,lbl:MONTHS[parseInt(m)-1]+'/'+y.slice(2),si,inf,out,sf,net:inf-out};
  });
  const totalInf=mData.reduce((a,d)=>a+d.inf,0),totalOut=mData.reduce((a,d)=>a+d.out,0);

  const el=document.getElementById('fcl-content');if(!el)return;
  el.innerHTML=`
    <div style="margin-bottom:20px;">
      <div class="ctit">Fluxo de Caixa</div>
      <div class="csub">Entradas e saídas realizadas mês a mês</div>
    </div>
    <div style="overflow-x:auto;">
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr style="background:var(--thead);">
        <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:800;color:var(--t3);text-transform:uppercase;white-space:nowrap;">Mês</th>
        <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:800;color:var(--t3);text-transform:uppercase;white-space:nowrap;">Saldo Inicial</th>
        <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:800;color:var(--green);text-transform:uppercase;white-space:nowrap;">Entradas</th>
        <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:800;color:var(--red);text-transform:uppercase;white-space:nowrap;">Saídas</th>
        <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:800;color:var(--t3);text-transform:uppercase;white-space:nowrap;">Resultado</th>
        <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:800;color:var(--t3);text-transform:uppercase;white-space:nowrap;">Saldo Final</th>
        <th style="padding:10px 12px;text-align:center;font-size:10px;font-weight:800;color:var(--t3);text-transform:uppercase;white-space:nowrap;">Sparkline</th>
      </tr></thead>
      <tbody>
        ${mData.map(d=>`<tr style="border-bottom:1px solid var(--border);">
          <td style="padding:10px 12px;font-weight:700;font-size:13px;">${d.lbl}</td>
          <td style="padding:10px 12px;text-align:right;font-size:12px;color:var(--t2);">${cur(d.si)}</td>
          <td style="padding:10px 12px;text-align:right;font-size:13px;font-weight:700;color:var(--green);">+${cur(d.inf)}</td>
          <td style="padding:10px 12px;text-align:right;font-size:13px;font-weight:700;color:var(--red);">-${cur(d.out)}</td>
          <td style="padding:10px 12px;text-align:right;font-size:12px;font-weight:800;color:${d.net>=0?'var(--green)':'var(--red)'};">${d.net>=0?'+':''}${cur(d.net)}</td>
          <td style="padding:10px 12px;text-align:right;font-size:13px;font-weight:900;color:${d.sf>=0?'var(--green)':'var(--red)'};">${cur(d.sf)}</td>
          <td style="padding:10px 12px;text-align:center;">${sparkSVG([d.si,d.sf],d.net>=0?'#10B981':'#EF4444',80,28)}</td>
        </tr>`).join('')}
      </tbody>
      <tfoot><tr style="background:var(--thead);border-top:2px solid var(--border);">
        <td style="padding:10px 12px;font-size:13px;font-weight:900;">TOTAL</td>
        <td style="padding:10px 12px;text-align:right;font-size:12px;color:var(--t3);">—</td>
        <td style="padding:10px 12px;text-align:right;font-size:13px;font-weight:900;color:var(--green);">+${cur(totalInf)}</td>
        <td style="padding:10px 12px;text-align:right;font-size:13px;font-weight:900;color:var(--red);">-${cur(totalOut)}</td>
        <td style="padding:10px 12px;text-align:right;font-size:13px;font-weight:900;color:${totalInf-totalOut>=0?'var(--green)':'var(--red)'};">${totalInf-totalOut>=0?'+':''}${cur(totalInf-totalOut)}</td>
        <td style="padding:10px 12px;text-align:right;font-size:13px;font-weight:900;color:${balance>=0?'var(--green)':'var(--red)'};">${cur(balance)}</td>
        <td></td>
      </tr></tfoot>
    </table>
    </div>`;

  // FCL area chart
  const dk=cfg.theme==='dark';const gc=dk?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)',tc=dk?'#4B5563':'#94A3B8';
  const fctx=document.getElementById('fcl-chart')?.getContext('2d');
  if(fctx){if(fclChart)fclChart.destroy();fclChart=new Chart(fctx,{type:'line',data:{labels:mData.map(d=>d.lbl),datasets:[{label:'Entradas',data:mData.map(d=>d.inf),borderColor:'#10B981',backgroundColor:'rgba(16,185,129,.12)',borderWidth:2,fill:true,tension:.4,pointRadius:3},{label:'Saídas',data:mData.map(d=>d.out),borderColor:'#EF4444',backgroundColor:'rgba(239,68,68,.06)',borderWidth:2,fill:true,tension:.4,pointRadius:3},{label:'Saldo',data:mData.map(d=>d.sf),borderColor:'#4361EE',backgroundColor:'rgba(67,97,238,.06)',borderWidth:2.5,borderDash:[],fill:false,tension:.4,pointRadius:4,pointBackgroundColor:'#4361EE'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,labels:{color:tc,font:{size:11,weight:'700'},usePointStyle:true,pointStyleWidth:10}},tooltip:{callbacks:{label:c=>' '+c.dataset.label+': '+cur(c.raw)}}},scales:{x:{ticks:{color:tc},grid:{display:false}},y:{ticks:{color:tc,callback:v=>v>=1000?'R$'+(v/1000).toFixed(0)+'k':v},grid:{color:gc}}}}});}
}

// ── Indicadores de Saúde (para o FinDash) ───────────────
function renderHealthIndicators(){
  const el=document.getElementById('fin-health');if(!el)return;
  const totRec=entries.filter(e=>e.status==='Recebido').reduce((a,e)=>a+e.value,0);
  const totPag=exits.filter(e=>e.status==='Pago').reduce((a,e)=>a+e.value,0);
  const hiAccType=new Map();accounts.forEach(a=>{if(!hiAccType.has(a.name))hiAccType.set(a.name,a.type);});
  let cfPag=0,cvPag=0,despPag=0;
  exits.forEach(e=>{if(e.status!=='Pago')return;const ty=hiAccType.get(e.cat);if(ty==='custo-fixo')cfPag+=e.value;else if(ty==='custo-variavel')cvPag+=e.value;else if(ty==='despesa')despPag+=e.value;});
  const mc=totRec-cfPag-cvPag;
  const mcPct=totRec>0?(mc/totRec)*100:0;
  const resultado=mc-despPag;
  const margLiq=totRec>0?(resultado/totRec)*100:0;
  const meses=[...new Set(exits.filter(e=>e.status==='Pago').map(e=>e.date.substr(0,7)))].length||1;
  const burnRate=totPag/meses;
  const saldo=totRec-totPag;
  const runway=burnRate>0?saldo/burnRate:Infinity;
  const pe=mcPct>0?(cfPag/(mcPct/100)):Infinity;
  const cobertura=cfPag>0?totRec/cfPag:Infinity;

  const card=(label,val,sub2,c,icon)=>`<div class="kpi" style="border-top:3px solid ${c};">
    <div class="ktop"><div class="klb">${label}</div><div class="kic" style="background:${c}18;color:${c};">${icon}</div></div>
    <div class="kv" style="color:${c};">${val}</div>
    <div style="font-size:11px;color:var(--t3);margin-top:4px;">${sub2}</div>
  </div>`;

  el.innerHTML=`
    <div style="font-size:10px;font-weight:800;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;">Indicadores de Saúde Financeira</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:4px;">
      ${card('Margem de Contribuição',mcPct.toFixed(1)+'%','Receita líquida após custos diretos',mcPct>=50?'#10B981':mcPct>=30?'#F59E0B':'#EF4444','▲')}
      ${card('Margem Líquida',margLiq.toFixed(1)+'%','Resultado / Receita total',margLiq>=20?'#10B981':margLiq>=0?'#F59E0B':'#EF4444','%')}
      ${card('Burn Rate',cur(burnRate)+'/mês','Média mensal de saídas pagas','#7209B7','🔥')}
      ${card('Runway',runway===Infinity?'∞':runway.toFixed(1)+' meses','Saldo ÷ Burn Rate',runway>=6?'#10B981':runway>=3?'#F59E0B':'#EF4444','⏱')}
      ${card('Ponto de Equilíbrio',pe===Infinity?'—':cur(pe),'Receita mínima para cobrir fixos',pe<=totRec?'#10B981':'#EF4444','⚖')}
      ${card('Índice de Cobertura',cobertura===Infinity?'—':cobertura.toFixed(2)+'x','Receita ÷ Custos Fixos',cobertura>=2?'#10B981':cobertura>=1?'#F59E0B':'#EF4444','🛡')}
    </div>`;
}

// ── Análise de Custos ────────────────────────────────────
function renderCustos(){
  const el=document.getElementById('custos-content');if(!el)return;
  const totPag=exits.filter(e=>e.status==='Pago').reduce((a,e)=>a+e.value,0);
  const totRec=entries.filter(e=>e.status==='Recebido').reduce((a,e)=>a+e.value,0);

  const accType=new Map();accounts.forEach(a=>{if(!accType.has(a.name))accType.set(a.name,a.type);});
  const paidExits=exits.filter(e=>e.status==='Pago');

  const typeSums={};ATYPES.forEach(t=>{if(t.k!=='receita')typeSums[t.k]=0;});
  paidExits.forEach(e=>{const ty=accType.get(e.cat);if(ty in typeSums)typeSums[ty]+=e.value;});
  const byType=ATYPES.filter(t=>t.k!=='receita').map(t=>({...t,v:typeSums[t.k],pctTotal:totPag>0?(typeSums[t.k]/totPag)*100:0,pctRec:totRec>0?(typeSums[t.k]/totRec)*100:0}));

  const catRank={};paidExits.forEach(e=>{catRank[e.cat]=(catRank[e.cat]||0)+e.value;});
  const top8=Object.entries(catRank).sort((a,b)=>b[1]-a[1]).slice(0,8);

  const allMonths=[...new Set(exits.map(e=>e.date.substr(0,7)))].sort().slice(-6);
  const monthTypeSums={};allMonths.forEach(ym=>{monthTypeSums[ym]={};ATYPES.forEach(t=>{if(t.k!=='receita')monthTypeSums[ym][t.k]=0;});});
  paidExits.forEach(e=>{const ym=e.date.substr(0,7);if(!monthTypeSums[ym])return;const ty=accType.get(e.cat);if(ty&&monthTypeSums[ym][ty]!==undefined)monthTypeSums[ym][ty]+=e.value;});
  const monthlyByType=allMonths.map(ym=>{
    const[y,m]=ym.split('-');
    const lbl=MONTHS[parseInt(m)-1]+'/'+y.slice(2);
    return{lbl,...monthTypeSums[ym]};
  });

  el.innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px;">
      <div class="card" style="padding:24px;">
        <div class="ctit" style="margin-bottom:4px;">Distribuição por Tipo</div>
        <div class="csub" style="margin-bottom:16px;">% sobre total de saídas pagas</div>
        <div style="position:relative;height:200px;"><canvas id="custos-donut"></canvas></div>
        <div style="margin-top:14px;">
          ${byType.map(t=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);">
            <div style="display:flex;align-items:center;gap:8px;"><div style="width:10px;height:10px;border-radius:3px;background:${t.c};flex-shrink:0;"></div><span style="font-size:12px;font-weight:700;">${t.l}</span></div>
            <div style="text-align:right;"><span style="font-size:13px;font-weight:800;color:${t.c};">${t.pctTotal.toFixed(1)}%</span><span style="font-size:11px;color:var(--t3);margin-left:6px;">${cur(t.v)}</span></div>
          </div>`).join('')}
        </div>
      </div>
      <div class="card" style="padding:24px;">
        <div class="ctit" style="margin-bottom:4px;">Top Categorias de Gasto</div>
        <div class="csub" style="margin-bottom:16px;">Ranking acumulado · todas as saídas pagas</div>
        ${top8.map(([cat,val],i)=>{
          const pct=totPag>0?(val/totPag)*100:0;
          const acc=accounts.find(a=>a.name===cat);
          const tc2=ATYPES.find(t=>t.k===acc?.type)?.c||'#94A3B8';
          return`<div style="margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:11px;font-weight:900;color:var(--t3);">${String(i+1).padStart(2,'0')}</span>
                <span style="font-size:13px;font-weight:700;">${escapeHtml(cat)}</span>
              </div>
              <div style="text-align:right;flex-shrink:0;margin-left:8px;">
                <span style="font-size:13px;font-weight:800;">${cur(val)}</span>
                <span style="font-size:11px;color:var(--t3);margin-left:4px;">(${pct.toFixed(1)}%)</span>
              </div>
            </div>
            <div style="height:6px;background:var(--border);border-radius:4px;overflow:hidden;">
              <div style="height:100%;width:${pct.toFixed(1)}%;background:${tc2};border-radius:4px;transition:width .6s;"></div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
    <div class="card" style="padding:24px;">
      <div class="ctit" style="margin-bottom:4px;">Evolução Mensal de Custos</div>
      <div class="csub" style="margin-bottom:16px;">Últimos 6 meses · empilhado por tipo</div>
      <div style="position:relative;height:240px;"><canvas id="custos-bar"></canvas></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:16px;">
      ${byType.map(t=>`<div class="kpi" style="border-top:3px solid ${t.c};">
        <div class="klb" style="margin-bottom:6px;">${t.l}</div>
        <div class="kv" style="color:${t.c};font-size:20px;">${t.pctRec.toFixed(1)}%</div>
        <div style="font-size:11px;color:var(--t3);">da receita total</div>
      </div>`).join('')}
    </div>`;

  // Donut chart
  const dk=cfg.theme==='dark';const tc=dk?'#4B5563':'#94A3B8';
  const dctx=document.getElementById('custos-donut')?.getContext('2d');
  if(dctx){if(custosChart)custosChart.destroy();custosChart=new Chart(dctx,{type:'doughnut',data:{labels:byType.map(t=>t.l),datasets:[{data:byType.map(t=>t.v),backgroundColor:byType.map(t=>t.c),borderWidth:3,borderColor:'transparent'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>{const tot=c.dataset.data.reduce((a,v)=>a+v,0);return' '+c.label+': '+cur(c.raw)+' ('+(tot>0?(c.raw/tot*100).toFixed(1):0)+'%)'}}}},cutout:'62%'}});}

  // Stacked bar
  const bctx=document.getElementById('custos-bar')?.getContext('2d');
  const gc=dk?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)';
  if(bctx){if(custosBarChart)custosBarChart.destroy();custosBarChart=new Chart(bctx,{type:'bar',data:{labels:monthlyByType.map(d=>d.lbl),datasets:ATYPES.filter(t=>t.k!=='receita').map(t=>({label:t.l,data:monthlyByType.map(d=>d[t.k]||0),backgroundColor:t.c+'CC',borderRadius:3,borderSkipped:false}))},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,labels:{color:tc,font:{size:11},usePointStyle:true}},tooltip:{callbacks:{label:c=>' '+c.dataset.label+': '+cur(c.raw)}}},scales:{x:{stacked:true,ticks:{color:tc},grid:{display:false}},y:{stacked:true,ticks:{color:tc,callback:v=>v>=1000?'R$'+(v/1000).toFixed(0)+'k':v},grid:{color:gc}}}}});}
}



function showAccFlds(on){['fgval','fgcat','fgst'].forEach(id=>document.getElementById(id).style.display=on?'none':'block');document.getElementById('fgtype').style.display=on?'block':'none';document.getElementById('fgad').style.display=on?'block':'none';}
function openAcc(typeKey){mmode='account';mid=null;showAccFlds(true);document.getElementById('mtit').textContent='Nova Conta';document.getElementById('msub').textContent='Adicionar ao plano de contas';document.getElementById('fdesc').value='';document.getElementById('ftype').value=typeKey||'receita';document.getElementById('fad').value='';document.getElementById('ebox').style.display='none';document.getElementById('modal').classList.add('show');setTimeout(()=>document.getElementById('fdesc').focus(),60);}
function openEA(id){const a=accounts.find(x=>x.id===id);if(!a)return;mmode='account';mid=id;showAccFlds(true);document.getElementById('mtit').textContent='Editar Conta';document.getElementById('msub').textContent='Atualizar conta';document.getElementById('fdesc').value=a.name;document.getElementById('ftype').value=a.type;document.getElementById('fad').value=a.desc||'';document.getElementById('ebox').style.display='none';document.getElementById('modal').classList.add('show');}
function delAcc(id){if(confirm('Remover esta conta?')){accounts=accounts.filter(a=>a.id!==id);sv('sias-a',accounts);updateCategorySelects();renderPlano();}}
function openM(type){mmode=type;mid=null;const isE=type==='entry';showAccFlds(false);document.getElementById('mtit').textContent=`Nova ${isE?'Entrada':'Saída'}`;document.getElementById('msub').textContent='';const cats=isE?accounts.filter(a=>a.type==='receita').map(a=>a.name):accounts.filter(a=>['custo-fixo','custo-variavel','despesa','investimento'].includes(a.type)).map(a=>a.name);document.getElementById('fcat').innerHTML=cats.map(c=>`<option>${escapeHtml(c)}</option>`).join('');setStBtns(isE?EST:SST,isE?'Recebido':'Pago');document.getElementById('fdate').value=tod();document.getElementById('fdesc').value='';document.getElementById('fval').value='';document.getElementById('ebox').style.display='none';document.getElementById('modal').classList.add('show');setTimeout(()=>document.getElementById('fdesc').focus(),60);}
function openE(tp,id){const data=tp==='e'?entries.find(e=>e.id===id):exits.find(e=>e.id===id);if(!data)return;const isE=tp==='e';mmode=isE?'entry':'exit';mid=id;showAccFlds(false);document.getElementById('mtit').textContent=`Editar ${isE?'Entrada':'Saída'}`;document.getElementById('msub').textContent='';const cats=isE?accounts.filter(a=>a.type==='receita').map(a=>a.name):accounts.filter(a=>['custo-fixo','custo-variavel','despesa','investimento'].includes(a.type)).map(a=>a.name);document.getElementById('fcat').innerHTML=cats.map(c=>`<option${c===data.cat?' selected':''}>${escapeHtml(c)}</option>`).join('');setStBtns(isE?EST:SST,data.status);document.getElementById('fdate').value=data.date;document.getElementById('fdesc').value=data.desc;document.getElementById('fval').value=data.value;document.getElementById('ebox').style.display='none';document.getElementById('modal').classList.add('show');setTimeout(()=>document.getElementById('fdesc').focus(),60);}
function setStBtns(list,active){document.getElementById('fstb').innerHTML=list.map(s=>`<button class="stb${s===active?' on':''}" onclick="pickSt('${s}')" data-s="${s}" title="${s}">${s}</button>`).join('');}
function pickSt(s){document.querySelectorAll('#fstb .stb').forEach(b=>b.classList.toggle('on',b.dataset.s===s));}
function closeM(){document.getElementById('modal').classList.remove('show');}
function saveForm(){
  const eb=document.getElementById('ebox'),desc=document.getElementById('fdesc').value.trim();
  if(mmode==='account'){if(!desc){eb.textContent='Informe o nome da conta.';eb.style.display='block';return;}const item={id:mid||uid(),name:desc,type:document.getElementById('ftype').value,desc:document.getElementById('fad').value.trim()};accounts=mid?accounts.map(a=>a.id===mid?item:a):[...accounts,item];sv('sias-a',accounts);closeM();updateCategorySelects();renderPlano();return;}
  const date=document.getElementById('fdate').value,val=parseFloat(document.getElementById('fval').value),cat=document.getElementById('fcat').value,stb=document.querySelector('#fstb .stb.on');
  if(!desc||!date||!val||val<=0||isNaN(val)){eb.textContent='Preencha todos os campos.';eb.style.display='block';return;}
  const status=stb?stb.dataset.s:(mmode==='entry'?'Recebido':'Pago');
  const item={id:mid||uid(),date,desc,cat,value:val,status};
  if(mmode==='entry'){entries=mid?entries.map(e=>e.id===mid?item:e):[...entries,item];sv('sias-e',entries);closeM();renderE();}
  else{exits=mid?exits.map(e=>e.id===mid?item:e):[...exits,item];sv('sias-s',exits);closeM();renderS();}
}

// ═══ MODAL 3 (Iniciativa) ════════════════════════════════
function openInitModal(id){
  const init=id?initiatives.find(i=>i.id===id):null;
  m3ctx=id;curStage=init?init.stage||0:0;
  document.getElementById('m3tit').textContent=init?'Editar Iniciativa':'Nova Iniciativa';
  document.getElementById('m3sub').textContent=init?'Atualizar dados':'Adicionar ao plano';
  document.getElementById('m3-name').value=init?init.name:'';
  document.getElementById('m3-desc').value=init?init.desc:'';
  document.getElementById('m3-due').value=init?init.dueDate:'';
  const respSel=document.getElementById('m3-resp');
  respSel.innerHTML='<option value="">— Selecionar —</option>'+
    (teamMembers||[]).filter(m=>m.status==='active').map(m=>`<option value="${escapeHtml(m.name)}" ${init?.responsible===m.name?'selected':''}>${escapeHtml(m.name)} · ${escapeHtml(m.role)}</option>`).join('')+
    (init&&init.responsible&&!(teamMembers||[]).find(m=>m.name===init.responsible)?`<option value="${escapeHtml(init.responsible)}" selected>${escapeHtml(init.responsible)}</option>`:'');
  document.getElementById('m3-notes').value=init?init.notes:'';
  const curSt=init?init.status:'planned';
  document.getElementById('m3-status').innerHTML=['planned','active','done','paused'].map(s=>`<button class="stb${s===curSt?' on':''}" data-s="${s}" onclick="pickSt3('${s}')" title="${INIT_STATUS[s]?.l}">${INIT_STATUS[s]?.l}</button>`).join('');
  document.getElementById('m3-stage').innerHTML=STAGES.map((st,i)=>`<button class="stg-btn${i===curStage?' on':''}" onclick="pickStage(${i})" title="${st}">${st}</button>`).join('');
  const allKRs=okrData.objectives.flatMap(o=>o.krs.map(k=>({...k,objColor:o.color})));
  const linked=init?init.linkedKRs:[];
  document.getElementById('m3-krs').innerHTML=allKRs.map(kr=>`<div class="kr-check-item${linked.includes(kr.id)?' sel':''}" onclick="this.classList.toggle('sel')" data-kid="${kr.id}" title="${kr.label}"><span class="kr-check-badge" style="background:${kr.objColor}22;color:${kr.objColor};">${kr.id}</span><span class="kr-check-text">${kr.label.length>48?kr.label.substr(0,48)+'…':kr.label}</span></div>`).join('');
  document.getElementById('ebox3').style.display='none';
  document.getElementById('modal3').classList.add('show');
  setTimeout(()=>document.getElementById('m3-name').focus(),60);
}
function pickSt3(s){document.querySelectorAll('#m3-status .stb').forEach(b=>b.classList.toggle('on',b.dataset.s===s));}
function pickStage(i){curStage=i;document.querySelectorAll('#m3-stage .stg-btn').forEach((b,idx)=>b.classList.toggle('on',idx===i));}
function closeM3(){document.getElementById('modal3').classList.remove('show');}
function saveM3(){
  const eb=document.getElementById('ebox3');
  const name=document.getElementById('m3-name').value.trim();
  if(!name){eb.textContent='Informe o nome.';eb.style.display='block';return;}
  const stb=document.querySelector('#m3-status .stb.on');
  const linkedKRs=[...document.querySelectorAll('#m3-krs .kr-check-item.sel')].map(el=>el.dataset.kid).filter(Boolean);
  const item={id:m3ctx||uid(),name,desc:document.getElementById('m3-desc').value.trim(),status:stb?stb.dataset.s:'planned',stage:curStage,linkedKRs,dueDate:document.getElementById('m3-due').value,responsible:document.getElementById('m3-resp').value.trim(),notes:document.getElementById('m3-notes').value.trim(),startDate:m3ctx?(initiatives.find(i=>i.id===m3ctx)?.startDate||tod()):tod()};
  initiatives=m3ctx?initiatives.map(i=>i.id===m3ctx?item:i):[...initiatives,item];
  sv('sias-init',initiatives);closeM3();renderIniciativas();
}

// ═══ EVENTS ══════════════════════════════════════════════
document.querySelectorAll('.nb').forEach(btn=>btn.addEventListener('click',()=>{if(document.getElementById('tab-'+btn.dataset.tab))go(btn.dataset.tab);}));
['se-q','se-cat','se-st','se-f','se-t','se-vn','se-vx','se-so'].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener('input',renderE);});
['ss-q','ss-cat','ss-st','ss-f','ss-t','ss-vn','ss-vx','ss-so'].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener('input',renderS);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeM();closeM2();closeM3();closeM4();closeM5();closeM6();closeM7();}});

// ═══ BOOT ═════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════
// PESSOAS — PARCEIROS + EQUIPE
// ═══════════════════════════════════════════════════════════════════════

const PARTNER_TYPES={
  'co-branding':{l:'Oferta Combinada',icon:'🤝',c:'#4361EE',desc:'Produto único com selo dos dois'},
  'white-label':{l:'White-label / OEM',icon:'🏷',c:'#7209B7',desc:'Parceiro embute produto sob sua marca'},
  'revenue-share':{l:'Revenue Share',icon:'💹',c:'#10B981',desc:'Pagamento proporcional ao uso ou receita'},
  'referral':{l:'Indicação / Referral',icon:'🎯',c:'#F5A023',desc:'Comissão sobre contrato fechado'},
};
const PARTNER_STATUS={
  active:{l:'Ativo',c:'#10B981',bg:'rgba(16,185,129,.1)'},
  negotiating:{l:'Em Negociação',c:'#4361EE',bg:'rgba(67,97,238,.1)'},
  prospect:{l:'Prospecto',c:'#F59E0B',bg:'rgba(245,158,11,.1)'},
  inactive:{l:'Inativo',c:'#94A3B8',bg:'rgba(148,163,184,.1)'},
};
const AVATAR_COLORS=['#4361EE','#7209B7','#10B981','#F5A023','#EF4444','#0891B2','#BE185D','#065F46'];

const CLIENT_CHANNELS={
  referral:{l:'Indicação',icon:'🎯'},
  organic:{l:'Orgânico / Inbound',icon:'🌱'},
  'paid-ads':{l:'Mídia Paga',icon:'📢'},
  social:{l:'Redes Sociais',icon:'💬'},
  partnership:{l:'Parceria',icon:'🤝'},
  outbound:{l:'Prospecção Ativa',icon:'📞'},
  event:{l:'Evento',icon:'🎪'},
};
const CLIENT_STATUS={
  active:{l:'Ativo',c:'#10B981',bg:'rgba(16,185,129,.1)'},
  'at-risk':{l:'Em Risco',c:'#F59E0B',bg:'rgba(245,158,11,.1)'},
  trial:{l:'Trial',c:'#4361EE',bg:'rgba(67,97,238,.1)'},
  churned:{l:'Perdido',c:'#EF4444',bg:'rgba(239,68,68,.1)'},
};

const TEAM_DATA_V=3; // bump this whenever seeds change to force-reset localStorage
let partners=ld('sias-partners')||seedPartners();
let clients=ld('sias-clients')||seedClients();
(function(){
  const sv_v=parseInt(ld('sias-team-v')||0);
  if(sv_v<TEAM_DATA_V){
    localStorage.removeItem('sias-members');localStorage.removeItem('sias-squads');
    sv('sias-team-v',TEAM_DATA_V);
    console.log('SIAS: dados de equipe redefinidos (v'+TEAM_DATA_V+')');
  }
})();
let teamMembers=ld('sias-members')||seedMembers();
let squads=ld('sias-squads')||seedSquads();
let equipeView='squads';
let m5ctx=null,m6ctx=null,m7ctx=null,m8ctx=null;
let selM6Color=AVATAR_COLORS[0],selM7Color=AVATAR_COLORS[0];

function seedClients(){return[
  {id:uid(),name:'Prefeitura de Anápolis',document:'01.234.567/0001-11',contactName:'Marcos Vidal',email:'marcos@anapolis.go.gov.br',phone:'(62) 99876-5432',status:'active',channel:'partnership',service:'Monitoramento Político + Análise Eleitoral',ticket:18500,contractLength:24,startDate:'2025-02-01',renewalDate:'2027-02-01',notes:'Cliente âncora, renovação automática prevista.'},
  {id:uid(),name:'Instituto Cidadania Digital',document:'09.876.543/0001-22',contactName:'Fernanda Costa',email:'fernanda@cidadaniadigital.org',phone:'(61) 98765-1234',status:'at-risk',channel:'referral',service:'Análise Eleitoral',ticket:6200,contractLength:12,startDate:'2025-08-10',renewalDate:'2026-08-10',notes:'Uso caindo nos últimos 2 meses, agendar call de sucesso.'},
  {id:uid(),name:'Câmara Municipal de Goiânia',document:'02.345.678/0001-33',contactName:'Ricardo Alves',email:'ricardo@camaragoiania.go.gov.br',phone:'(62) 99123-7788',status:'active',channel:'outbound',service:'Monitoramento Político',ticket:9800,contractLength:12,startDate:'2026-01-15',renewalDate:'2027-01-15',notes:''},
  {id:uid(),name:'Movimento Voz Ativa',document:'11.222.333/0001-44',contactName:'Juliana Prado',email:'juliana@vozativa.org.br',phone:'(11) 91234-5678',status:'trial',channel:'social',service:'Análise Eleitoral (piloto)',ticket:0,contractLength:1,startDate:'2026-06-20',renewalDate:'2026-07-20',notes:'Trial de 30 dias, decisão de contratação prevista para o fim do mês.'},
  {id:uid(),name:'Consultoria PoliData',document:'22.333.444/0001-55',contactName:'Bruno Teixeira',email:'bruno@polidata.com.br',phone:'(31) 99988-2211',status:'churned',channel:'organic',service:'Monitoramento Político',ticket:4500,contractLength:6,startDate:'2024-11-01',renewalDate:'2025-05-01',notes:'Não renovou — alegou corte orçamentário.'},
];}

function seedPartners(){return[
  {id:uid(),name:'VoxCivis',entityType:'PJ',type:'co-branding',status:'active',document:'12.345.678/0001-90',contactName:'Ana Lima',email:'ana@voxcivis.com.br',phone:'(61) 99123-4567',startDate:'2025-01-15',jointProduct:'Plataforma de Monitoramento Político + Análise Eleitoral',notes:'Parceiro estratégico principal. Modelos podem ser combinados conforme demanda.',clientsReferred:14,revenueGenerated:186000},
  {id:uid(),name:'GovTech Soluções Ltda',entityType:'PJ',type:'revenue-share',status:'active',document:'98.765.432/0001-10',contactName:'Carlos Mendes',email:'carlos@govtech.com.br',phone:'(11) 98765-4321',startDate:'2025-03-01',revSharePct:20,revShareBase:'Receita Bruta',revSharePeriod:'Trimestral',revShareModules:'Agente Monitor + Dashboard Setorial',notes:'Integração via API REST. Repasse em até 30 dias do fechamento do trimestre.',clientsReferred:9,revenueGenerated:132000},
  {id:uid(),name:'Marcos Evangelista',entityType:'PF',type:'referral',status:'active',document:'123.456.789-00',contactName:'Marcos Evangelista',email:'marcos.evangelista@gmail.com',phone:'(61) 99876-5432',startDate:'2025-02-10',commissionPct:10,referralSegment:'Consultorias e assessorias políticas',notes:'Consultor sênior com rede relevante em Brasília. Foco em executivos seniores e partidos.',clientsReferred:5,revenueGenerated:64000},
  {id:uid(),name:'DataGov Sistemas',entityType:'PJ',type:'white-label',status:'negotiating',document:'55.444.333/0001-22',contactName:'Renata Oliveira',email:'renata@datagov.com.br',phone:'(21) 97654-3210',startDate:'2025-05-01',wlType:'powered-by',wlProd:'Observatório Político Regional',notes:'Em fase de due diligence técnica. Previsão de fechamento Q3 2025.',clientsReferred:null,revenueGenerated:null},
];}

function seedSquads(){return[
  {id:'sq1',name:'Produto & IA',color:'#4361EE',desc:'Desenvolvimento, roadmap e modelos de IA',managedBy:'m-cto'},
  {id:'sq2',name:'Comercial',color:'#F5A023',desc:'Vendas, parcerias e canais de distribuição',managedBy:'m-head-sales'},
  {id:'sq3',name:'Operações & Dados',color:'#10B981',desc:'Infraestrutura, dados e entrega ao cliente',managedBy:'m-cto'},
];}

function seedMembers(){return[
  // Nível Estratégico (C-level)
  {id:'m-ceo',name:'Ana Souza',role:'CEO & Fundadora',area:'Liderança',squadId:'',email:'ana@sias.com',phone:'(61)99100-0001',status:'active',avatarColor:'#F5A023',joinDate:'2024-01-01',notes:'Fundadora. Responsável pela estratégia geral e parcerias.',reportsTo:null,isLeader:true},
  {id:'m-cto',name:'Pedro Alves',role:'CTO',area:'Tecnologia',squadId:'sq1',email:'pedro@sias.com',phone:'(61)99100-0002',status:'active',avatarColor:'#4361EE',joinDate:'2024-01-01',notes:'Co-fundador. Lidera produto e tecnologia.',reportsTo:'m-ceo',isLeader:true},
  {id:'m-head-sales',name:'Lucas Pimentel',role:'Head de Vendas',area:'Comercial',squadId:'sq2',email:'lucas@sias.com',phone:'(61)99100-0003',status:'active',avatarColor:'#7209B7',joinDate:'2024-03-01',notes:'Responsável por crescimento comercial e parcerias.',reportsTo:'m-ceo',isLeader:true},
  // Nível Tático
  {id:'m-pm',name:'Clara Ribeiro',role:'Product Manager',area:'Produto',squadId:'sq1',email:'clara@sias.com',phone:'(61)99100-0004',status:'active',avatarColor:'#10B981',joinDate:'2024-04-01',notes:'Gestão do roadmap e entregas de produto.',reportsTo:'m-cto',isLeader:false},
  {id:'m-tl',name:'Rafael Torres',role:'Tech Lead',area:'Tecnologia',squadId:'sq1',email:'rafael@sias.com',phone:'(61)99100-0005',status:'active',avatarColor:'#2952E8',joinDate:'2024-05-01',notes:'Lidera a stack técnica e arquitetura backend.',reportsTo:'m-cto',isLeader:false},
  {id:'m-data',name:'Felipe Costa',role:'Analista de Dados',area:'Dados',squadId:'sq3',email:'felipe@sias.com',phone:'(61)99100-0006',status:'active',avatarColor:'#F5A023',joinDate:'2024-09-01',notes:'Pipelines de dados e dashboards analíticos.',reportsTo:'m-cto',isLeader:false},
  // Nível Operacional
  {id:'m-dev1',name:'Júlia Santos',role:'Desenvolvedora Frontend',area:'Tecnologia',squadId:'sq1',email:'julia@sias.com',phone:'',status:'active',avatarColor:'#BE185D',joinDate:'2024-07-01',notes:'',reportsTo:'m-tl',isLeader:false},
  {id:'m-dev2',name:'Bruno Nascimento',role:'Desenvolvedor Backend',area:'Tecnologia',squadId:'sq1',email:'bruno@sias.com',phone:'',status:'active',avatarColor:'#0891B2',joinDate:'2024-08-01',notes:'',reportsTo:'m-tl',isLeader:false},
  {id:'m-sales1',name:'Amanda Silva',role:'Analista Comercial',area:'Comercial',squadId:'sq2',email:'amanda@sias.com',phone:'(61)99100-0009',status:'active',avatarColor:'#10B981',joinDate:'2024-06-01',notes:'',reportsTo:'m-head-sales',isLeader:false},
];}

// ── Partners CRUD ────────────────────────────────────────────────────────
function renderPartners(){
  const typeF=gv('pf-type'),stF=gv('pf-status'),entF=gv('pf-entity');
  const list=partners.filter(p=>{
    if(typeF&&p.type!==typeF)return false;
    if(stF&&p.status!==stF)return false;
    if(entF&&p.entityType!==entF)return false;
    return true;
  });
  const active=partners.filter(p=>p.status==='active').length;
  const negot=partners.filter(p=>p.status==='negotiating').length;
  const rsCount=partners.filter(p=>p.type==='revenue-share'&&p.status==='active').length;
  const refCount=partners.filter(p=>p.type==='referral'&&p.status==='active').length;
  const st=document.getElementById('prc-stats');
  if(st)st.innerHTML=[
    {l:'Total de Parceiros',v:partners.length,c:'#4361EE',ico:'🤝'},
    {l:'Parceiros Ativos',v:active,c:'#10B981',ico:'✅'},
    {l:'Em Negociação',v:negot,c:'#F5A023',ico:'⚙'},
    {l:'Revenue Share · Referral',v:`${rsCount}+${refCount}`,c:'#7209B7',ico:'💹'},
  ].map(k=>`<div class="kpi" style="border-top:3px solid ${k.c};">
    <div class="ktop"><div class="klb">${k.l}</div><div class="kic" style="background:${k.c}18;color:${k.c};">${k.ico}</div></div>
    <div class="kv" style="color:${k.c};">${k.v}</div>
  </div>`).join('');

  const edit=canEdit();
  const gr=document.getElementById('prc-grid');if(!gr)return;
  if(!list.length){gr.innerHTML=`<div class="prc-empty"><div style="font-size:36px;margin-bottom:10px;">🤝</div><div style="font-weight:700;margin-bottom:6px;">Nenhum parceiro encontrado</div><div style="font-size:12px;">${edit?'<button class="btn bp" style="margin-top:12px;" onclick="openPartner(null)">+ Cadastrar Parceiro</button>':''}</div></div>`;return;}
  gr.innerHTML=list.map(p=>{
    const tp=PARTNER_TYPES[p.type]||{l:p.type,c:'#94A3B8',icon:'🔗'};
    const st2=PARTNER_STATUS[p.status]||PARTNER_STATUS.inactive;
    const extra=buildPartnerExtra(p,tp);
    const results=buildPartnerResults(p,tp);
    return`<div class="prc-card" style="border-top-color:${tp.c};">
      <div class="prc-head">
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span class="prc-entity" style="background:${p.entityType==='PJ'?'rgba(67,97,238,.1)':'rgba(245,160,35,.1)'};color:${p.entityType==='PJ'?'#4361EE':'#F5A023'};">${escapeHtml(p.entityType)}</span>
            <span style="font-size:10px;color:var(--t3);">${escapeHtml(p.document||'')}</span>
          </div>
          <div class="prc-name">${escapeHtml(p.name)}</div>
          <span class="prc-type-badge" style="background:${tp.c}18;color:${tp.c};">${tp.icon} ${escapeHtml(tp.l)}</span>
        </div>
        <span class="badge" style="background:${st2.bg};color:${st2.c};flex-shrink:0;">${escapeHtml(st2.l)}</span>
      </div>
      ${results}
      ${p.contactName||p.email||p.phone?`<div class="prc-section">Contato</div>
      ${p.contactName?`<div class="prc-row">👤 <b>${escapeHtml(p.contactName)}</b></div>`:''}
      ${p.email?`<div class="prc-row">✉ <a href="mailto:${encodeURIComponent(p.email)}" style="color:var(--blue);text-decoration:none;">${escapeHtml(p.email)}</a></div>`:''}
      ${p.phone?`<div class="prc-row">📞 ${escapeHtml(p.phone)}</div>`:''}`:'' }
      ${extra}
      <div style="margin-top:8px;font-size:11px;color:var(--t3);">${p.startDate?'Desde '+dtf(p.startDate):''}</div>
      ${p.notes?`<div style="margin-top:8px;padding:10px 12px;background:var(--thead);border-radius:4px;border-left:2px solid var(--border);font-size:12px;color:var(--t2);line-height:1.5;">${escapeHtml(p.notes)}</div>`:''}
      ${edit?`<div class="prc-acts"><button class="btn bs bsm" onclick="openPartner('${p.id}')" title="Editar parceiro">Editar</button><button class="btn bsm" style="color:var(--red);border:1px solid var(--border);" onclick="delPartner('${p.id}')" title="Excluir parceiro">Excluir</button></div>`:''}
    </div>`;
  }).join('');
}

function buildPartnerExtra(p,tp){
  if(p.type==='revenue-share'&&p.revSharePct!=null)
    return`<div class="prc-extra" style="border-left-color:${tp.c};margin-top:10px;"><div class="prc-extra-lbl">Modelo Revenue Share</div><div class="prc-extra-val" style="color:${tp.c};">${p.revSharePct}%</div><div class="prc-extra-sub">${escapeHtml(p.revShareBase||'Receita')} · ${escapeHtml(p.revSharePeriod||'Mensal')}${p.revShareModules?' · '+escapeHtml(p.revShareModules):''}</div></div>`;
  if(p.type==='referral'&&p.commissionPct!=null)
    return`<div class="prc-extra" style="border-left-color:${tp.c};margin-top:10px;"><div class="prc-extra-lbl">Comissão sobre contrato fechado</div><div class="prc-extra-val" style="color:${tp.c};">${p.commissionPct}%</div><div class="prc-extra-sub">${escapeHtml(p.referralSegment||'')}</div></div>`;
  if(p.type==='co-branding'&&p.jointProduct)
    return`<div class="prc-extra" style="border-left-color:${tp.c};margin-top:10px;"><div class="prc-extra-lbl">Produto / Oferta Conjunta</div><div class="prc-extra-sub" style="color:var(--t1);font-weight:700;">${escapeHtml(p.jointProduct)}</div></div>`;
  if(p.type==='white-label'&&p.wlProd)
    return`<div class="prc-extra" style="border-left-color:${tp.c};margin-top:10px;"><div class="prc-extra-lbl">${p.wlType==='powered-by'?'Powered by SIAS':'White-label'}</div><div class="prc-extra-sub" style="color:var(--t1);font-weight:700;">${escapeHtml(p.wlProd)}</div></div>`;
  return'';
}

function buildPartnerResults(p,tp){
  const clients=p.clientsReferred,revenue=p.revenueGenerated;
  const containerStyle=`border-color:${tp.c}44;background:${tp.c}0d;`;
  if(clients==null&&revenue==null)
    return`<div class="prc-results" style="${containerStyle}">
      <div class="prc-results-hd" style="color:${tp.c};">📊 Resultados da Parceria</div>
      <div class="prc-extra-sub">Aguardando primeiros resultados desta parceria.</div>
    </div>`;
  let calc=null;
  if(p.type==='revenue-share'&&p.revSharePct!=null&&revenue!=null)
    calc={lbl:'Repasse Devido',val:cur(revenue*p.revSharePct/100),sub:p.revSharePeriod||'Mensal'};
  else if(p.type==='referral'&&p.commissionPct!=null&&revenue!=null)
    calc={lbl:'Comissão Devida',val:cur(revenue*p.commissionPct/100),sub:''};
  else if(revenue!=null&&clients)
    calc={lbl:'Ticket Médio',val:cur(revenue/clients),sub:'por cliente'};
  return`<div class="prc-results" style="${containerStyle}">
    <div class="prc-results-hd" style="color:${tp.c};">📊 Resultados da Parceria</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      ${clients!=null?`<div class="prc-metric"><div class="prc-metric-lbl">Clientes Captados</div><div class="prc-metric-val" style="color:${tp.c};">${clients}</div></div>`:''}
      ${revenue!=null?`<div class="prc-metric"><div class="prc-metric-lbl">Receita Gerada</div><div class="prc-metric-val" style="color:${tp.c};">${cur(revenue)}</div></div>`:''}
      ${calc?`<div class="prc-metric"><div class="prc-metric-lbl">${calc.lbl}</div><div class="prc-metric-val" style="color:${tp.c};">${calc.val}</div>${calc.sub?`<div class="prc-metric-sub">${escapeHtml(calc.sub)}</div>`:''}</div>`:''}
    </div>
  </div>`;
}

// ═══ DASHBOARD DE PARCERIAS ════════════════════════════════
function renderPartnersDash(){
  const el=document.getElementById('parcdash-content');if(!el)return;
  const activePartners=partners.filter(p=>p.status==='active');
  const totClients=partners.reduce((a,p)=>a+(p.clientsReferred||0),0);
  const totRevenue=partners.reduce((a,p)=>a+(p.revenueGenerated||0),0);
  const avgTicket=totClients>0?totRevenue/totClients:0;

  const byType=Object.keys(PARTNER_TYPES).map(k=>{
    const tp=PARTNER_TYPES[k];
    const list=partners.filter(p=>p.type===k);
    const clients=list.reduce((a,p)=>a+(p.clientsReferred||0),0);
    const revenue=list.reduce((a,p)=>a+(p.revenueGenerated||0),0);
    return{k,l:tp.l,c:tp.c,icon:tp.icon,count:list.length,active:list.filter(p=>p.status==='active').length,clients,revenue,avg:clients>0?revenue/clients:0};
  });
  const revByType=byType.filter(t=>t.revenue>0);
  const topPartners=partners.filter(p=>p.revenueGenerated).sort((a,b)=>b.revenueGenerated-a.revenueGenerated).slice(0,8);

  el.innerHTML=`
    <div class="kgrid">
      ${[
        {l:'Parceiros Ativos',v:activePartners.length,c:'#4361EE',bg:'rgba(67,97,238,.1)',ico:'🤝'},
        {l:'Clientes Captados',v:totClients,c:'#10B981',bg:'rgba(16,185,129,.1)',ico:'👥'},
        {l:'Receita Gerada',v:cur(totRevenue),c:'#F5A023',bg:'rgba(245,160,35,.1)',ico:'💰'},
        {l:'Ticket Médio',v:cur(avgTicket),c:'#7209B7',bg:'rgba(114,9,183,.1)',ico:'📊'},
      ].map(k=>`<div class="kpi" style="border-top:3px solid ${k.c};"><div class="ktop"><div class="klb">${k.l}</div><div class="kic" style="background:${k.bg};color:${k.c};">${k.ico}</div></div><div class="kv" style="color:${k.c};">${k.v}</div></div>`).join('')}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px;">
      <div class="card" style="padding:24px;">
        <div class="ctit" style="margin-bottom:4px;">Receita por Tipo de Parceria</div>
        <div class="csub" style="margin-bottom:16px;">Distribuição da receita gerada</div>
        <div style="position:relative;height:200px;"><canvas id="pd-donut"></canvas></div>
        <div style="margin-top:14px;">
          ${revByType.length?revByType.map(t=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);">
            <div style="display:flex;align-items:center;gap:8px;"><div style="width:10px;height:10px;border-radius:3px;background:${t.c};flex-shrink:0;"></div><span style="font-size:12px;font-weight:700;">${t.l}</span></div>
            <div style="text-align:right;"><span style="font-size:13px;font-weight:800;color:${t.c};">${cur(t.revenue)}</span></div>
          </div>`).join(''):'<div style="text-align:center;padding:20px;color:var(--t3);">Sem receita registrada.</div>'}
        </div>
      </div>
      <div class="card" style="padding:24px;">
        <div class="ctit" style="margin-bottom:4px;">Clientes Captados por Tipo</div>
        <div class="csub" style="margin-bottom:16px;">Volume de clientes trazidos por cada modalidade</div>
        <div style="position:relative;height:240px;"><canvas id="pd-clients"></canvas></div>
      </div>
    </div>
    <div class="card" style="padding:24px;margin-bottom:18px;">
      <div class="ctit" style="margin-bottom:4px;">Desempenho por Tipo de Parceria</div>
      <div class="csub" style="margin-bottom:16px;">Parceiros, clientes captados, receita e ticket médio por modalidade</div>
      ${byType.map(t=>`<div style="display:flex;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid var(--border);flex-wrap:wrap;">
        <div style="width:34px;height:34px;border-radius:8px;background:${t.c}22;color:${t.c};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">${t.icon}</div>
        <div style="flex:1;min-width:140px;"><div style="font-size:13px;font-weight:700;">${t.l}</div><div style="font-size:11px;color:var(--t3);">${t.count} parceiro(s) · ${t.active} ativo(s)</div></div>
        <div style="text-align:right;min-width:90px;"><div style="font-size:11px;color:var(--t3);">Clientes</div><div style="font-size:14px;font-weight:800;">${t.clients}</div></div>
        <div style="text-align:right;min-width:110px;"><div style="font-size:11px;color:var(--t3);">Receita</div><div style="font-size:14px;font-weight:800;color:${t.c};">${cur(t.revenue)}</div></div>
        <div style="text-align:right;min-width:110px;"><div style="font-size:11px;color:var(--t3);">Ticket Médio</div><div style="font-size:14px;font-weight:800;">${t.avg>0?cur(t.avg):'–'}</div></div>
      </div>`).join('')}
    </div>
    <div class="card" style="padding:24px;">
      <div class="ctit" style="margin-bottom:4px;">Top Parceiros por Receita</div>
      <div class="csub" style="margin-bottom:16px;">Ranking dos parceiros que mais geraram receita</div>
      ${topPartners.length?topPartners.map((p,i)=>{
        const tp=PARTNER_TYPES[p.type];
        const maxRev=topPartners[0].revenueGenerated||1;
        const pct=(p.revenueGenerated/maxRev)*100;
        return`<div style="margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:11px;font-weight:900;color:var(--t3);">${String(i+1).padStart(2,'0')}</span>
              <span style="font-size:13px;font-weight:700;">${escapeHtml(p.name)}</span>
              <span class="badge" style="background:${tp.c}1A;color:${tp.c};font-size:10px;">${tp.l}</span>
            </div>
            <div style="text-align:right;flex-shrink:0;margin-left:8px;">
              <span style="font-size:13px;font-weight:800;">${cur(p.revenueGenerated)}</span>
              ${p.clientsReferred?`<span style="font-size:11px;color:var(--t3);margin-left:4px;">(${p.clientsReferred} cliente${p.clientsReferred>1?'s':''})</span>`:''}
            </div>
          </div>
          <div style="height:6px;background:var(--border);border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${pct.toFixed(1)}%;background:${tp.c};border-radius:4px;transition:width .6s;"></div>
          </div>
        </div>`;
      }).join(''):'<div style="text-align:center;padding:32px;color:var(--t3);">Nenhum resultado de parceria registrado ainda.</div>'}
    </div>`;

  const dk=cfg.theme==='dark';const tc=dk?'#4B5563':'#94A3B8';
  const dctx=document.getElementById('pd-donut')?.getContext('2d');
  if(dctx){if(pdRevChart)pdRevChart.destroy();pdRevChart=revByType.length?new Chart(dctx,{type:'doughnut',data:{labels:revByType.map(t=>t.l),datasets:[{data:revByType.map(t=>t.revenue),backgroundColor:revByType.map(t=>t.c),borderWidth:3,borderColor:'transparent'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>{const tot=c.dataset.data.reduce((a,v)=>a+v,0);return' '+c.label+': '+cur(c.raw)+' ('+(tot>0?(c.raw/tot*100).toFixed(1):0)+'%)'}}}},cutout:'62%'}}):null;}

  const gc=dk?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)';
  const cctx=document.getElementById('pd-clients')?.getContext('2d');
  if(cctx){if(pdClientsChart)pdClientsChart.destroy();pdClientsChart=new Chart(cctx,{type:'bar',data:{labels:byType.map(t=>t.l),datasets:[{label:'Clientes Captados',data:byType.map(t=>t.clients),backgroundColor:byType.map(t=>t.c+'CC'),borderRadius:6,borderSkipped:false}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>' '+c.raw+' cliente(s)'}}},scales:{x:{ticks:{color:tc,precision:0},grid:{color:gc}},y:{ticks:{color:tc},grid:{display:false}}}}});}
}

function showPartnerTypeFields(type){
  ['co-branding','white-label','revenue-share','referral'].forEach(t=>{
    ['tf-'+t,...(t==='white-label'?['tf-wl-type','tf-wl-product']:[]),...(t==='revenue-share'?['tf-rs-pct','tf-rs-base','tf-rs-period','tf-rs-modules']:[]),...(t==='referral'?['tf-ref-pct','tf-ref-seg']:[])].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('on');});
  });
  if(!type)return;
  if(type==='co-branding'){['tf-co-branding'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.add('on');});}
  if(type==='white-label'){['tf-wl-type','tf-wl-product'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.add('on');});}
  if(type==='revenue-share'){['tf-rs-pct','tf-rs-base','tf-rs-period','tf-rs-modules'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.add('on');});}
  if(type==='referral'){['tf-ref-pct','tf-ref-seg'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.add('on');});}
}

function openPartner(id){
  m5ctx=id;
  const p=id?partners.find(x=>x.id===id):null;
  document.getElementById('m5tit').textContent=p?'Editar Parceiro':'Novo Parceiro';
  document.getElementById('m5sub').textContent=p?p.name:'Preencha os dados do parceiro';
  document.getElementById('m5-name').value=p?p.name:'';
  document.getElementById('m5-doc').value=p?p.document||'':'';
  document.getElementById('m5-status').value=p?p.status:'active';
  document.querySelector(`input[name="m5-entity"][value="${p?p.entityType:'PJ'}"]`).checked=true;
  document.getElementById('m5-type').value=p?p.type:'';
  document.getElementById('m5-joint').value=p?p.jointProduct||'':'';
  document.getElementById('m5-wltype').value=p?p.wlType||'white-label':'white-label';
  document.getElementById('m5-wlprod').value=p?p.wlProd||'':'';
  document.getElementById('m5-rspct').value=p?p.revSharePct||'':'';
  document.getElementById('m5-rsbase').value=p?p.revShareBase||'Receita Bruta':'Receita Bruta';
  document.getElementById('m5-rsperiod').value=p?p.revSharePeriod||'Trimestral':'Trimestral';
  document.getElementById('m5-rsmod').value=p?p.revShareModules||'':'';
  document.getElementById('m5-refpct').value=p?p.commissionPct||'':'';
  document.getElementById('m5-refseg').value=p?p.referralSegment||'':'';
  document.getElementById('m5-clients').value=p?p.clientsReferred||'':'';
  document.getElementById('m5-revenue').value=p?p.revenueGenerated||'':'';
  document.getElementById('m5-cname').value=p?p.contactName||'':'';
  document.getElementById('m5-email').value=p?p.email||'':'';
  document.getElementById('m5-phone').value=p?p.phone||'':'';
  document.getElementById('m5-start').value=p?p.startDate||'':'';
  document.getElementById('m5-notes').value=p?p.notes||'':'';
  document.getElementById('ebox5').style.display='none';
  showPartnerTypeFields(p?p.type:'');
  document.getElementById('modal5').classList.add('show');
  setTimeout(()=>document.getElementById('m5-name').focus(),60);
}
function closeM5(){document.getElementById('modal5').classList.remove('show');}
function saveM5(){
  const name=document.getElementById('m5-name').value.trim();
  const type=document.getElementById('m5-type').value;
  const eb=document.getElementById('ebox5');
  if(!name){eb.textContent='Informe o nome do parceiro.';eb.style.display='block';return;}
  if(!type){eb.textContent='Selecione o tipo de parceria.';eb.style.display='block';return;}
  const entity=document.querySelector('input[name="m5-entity"]:checked')?.value||'PJ';
  const item={
    id:m5ctx||uid(),name,entityType:entity,type,status:document.getElementById('m5-status').value,
    document:document.getElementById('m5-doc').value.trim(),
    contactName:document.getElementById('m5-cname').value.trim(),
    email:document.getElementById('m5-email').value.trim(),
    phone:document.getElementById('m5-phone').value.trim(),
    startDate:document.getElementById('m5-start').value,
    notes:document.getElementById('m5-notes').value.trim(),
    jointProduct:document.getElementById('m5-joint').value.trim(),
    wlType:document.getElementById('m5-wltype').value,
    wlProd:document.getElementById('m5-wlprod').value.trim(),
    revSharePct:(v=>isNaN(v)?null:v)(parseFloat(document.getElementById('m5-rspct').value)),
    revShareBase:document.getElementById('m5-rsbase').value,
    revSharePeriod:document.getElementById('m5-rsperiod').value,
    revShareModules:document.getElementById('m5-rsmod').value.trim(),
    commissionPct:(v=>isNaN(v)?null:v)(parseFloat(document.getElementById('m5-refpct').value)),
    referralSegment:document.getElementById('m5-refseg').value.trim(),
    clientsReferred:(v=>isNaN(v)?null:v)(parseFloat(document.getElementById('m5-clients').value)),
    revenueGenerated:(v=>isNaN(v)?null:v)(parseFloat(document.getElementById('m5-revenue').value)),
  };
  partners=m5ctx?partners.map(p=>p.id===m5ctx?item:p):[...partners,item];
  sv('sias-partners',partners);closeM5();renderPartners();
}
function delPartner(id){if(!confirm('Excluir este parceiro?'))return;partners=partners.filter(p=>p.id!==id);sv('sias-partners',partners);renderPartners();}

// ── Clients CRUD ─────────────────────────────────────────────────────────
function monthsSince(dateStr){
  if(!dateStr)return 0;
  const d=new Date(dateStr),now=new Date();
  let m=(now.getFullYear()-d.getFullYear())*12+(now.getMonth()-d.getMonth());
  if(now.getDate()<d.getDate())m--;
  return Math.max(0,m);
}
function renderClientes(){
  const stF=gv('cf-status'),chF=gv('cf-channel');
  const list=clients.filter(c=>{
    if(stF&&c.status!==stF)return false;
    if(chF&&c.channel!==chF)return false;
    return true;
  });
  const active=clients.filter(c=>c.status==='active');
  const atRisk=clients.filter(c=>c.status==='at-risk').length;
  const ticketTotal=active.reduce((a,c)=>a+(c.ticket||0),0);
  const st=document.getElementById('cli-stats');
  if(st)st.innerHTML=[
    {l:'Total de Clientes',v:clients.length,c:'#4361EE',ico:'🧑‍💼'},
    {l:'Clientes Ativos',v:active.length,c:'#10B981',ico:'✅'},
    {l:'Em Risco',v:atRisk,c:'#F59E0B',ico:'⚠'},
    {l:'Ticket Recorrente Total',v:cur(ticketTotal),c:'#7209B7',ico:'💰'},
  ].map(k=>`<div class="kpi" style="border-top:3px solid ${k.c};">
    <div class="ktop"><div class="klb">${k.l}</div><div class="kic" style="background:${k.c}18;color:${k.c};">${k.ico}</div></div>
    <div class="kv" style="color:${k.c};">${k.v}</div>
  </div>`).join('');

  const edit=canEdit();
  const gr=document.getElementById('cli-grid');if(!gr)return;
  if(!list.length){gr.innerHTML=`<div class="prc-empty"><div style="font-size:36px;margin-bottom:10px;">🧑‍💼</div><div style="font-weight:700;margin-bottom:6px;">Nenhum cliente encontrado</div><div style="font-size:12px;">${edit?'<button class="btn bp" style="margin-top:12px;" onclick="openClient(null)">+ Cadastrar Cliente</button>':''}</div></div>`;return;}
  gr.innerHTML=list.map(c=>{
    const ch=CLIENT_CHANNELS[c.channel]||{l:c.channel,icon:'🔗'};
    const st2=CLIENT_STATUS[c.status]||CLIENT_STATUS.active;
    const tenure=monthsSince(c.startDate);
    return`<div class="prc-card" style="border-top-color:${st2.c};">
      <div class="prc-head">
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span style="font-size:10px;color:var(--t3);">${escapeHtml(c.document||'')}</span>
          </div>
          <div class="prc-name">${escapeHtml(c.name)}</div>
          <span class="prc-type-badge" style="background:${st2.c}18;color:${st2.c};">${ch.icon} ${escapeHtml(ch.l)}</span>
        </div>
        <span class="badge" style="background:${st2.bg};color:${st2.c};flex-shrink:0;">${escapeHtml(st2.l)}</span>
      </div>
      <div class="prc-results" style="border-color:${st2.c}44;background:${st2.c}0d;">
        <div class="prc-results-hd" style="color:${st2.c};">📊 Conta</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <div class="prc-metric"><div class="prc-metric-lbl">Ticket</div><div class="prc-metric-val" style="color:${st2.c};">${cur(c.ticket||0)}</div></div>
          <div class="prc-metric"><div class="prc-metric-lbl">Contrato</div><div class="prc-metric-val" style="color:${st2.c};">${c.contractLength||0}m</div></div>
          <div class="prc-metric"><div class="prc-metric-lbl">Tempo como Cliente</div><div class="prc-metric-val" style="color:${st2.c};">${tenure}m</div></div>
        </div>
      </div>
      ${c.service?`<div class="prc-section">Serviço</div><div class="prc-row">🧩 ${escapeHtml(c.service)}</div>`:''}
      ${c.contactName||c.email||c.phone?`<div class="prc-section">Contato</div>
      ${c.contactName?`<div class="prc-row">👤 <b>${escapeHtml(c.contactName)}</b></div>`:''}
      ${c.email?`<div class="prc-row">✉ <a href="mailto:${encodeURIComponent(c.email)}" style="color:var(--blue);text-decoration:none;">${escapeHtml(c.email)}</a></div>`:''}
      ${c.phone?`<div class="prc-row">📞 ${escapeHtml(c.phone)}</div>`:''}`:'' }
      <div style="margin-top:8px;font-size:11px;color:var(--t3);">${c.startDate?'Cliente desde '+dtf(c.startDate):''}${c.renewalDate?' · Renovação '+dtf(c.renewalDate):''}</div>
      ${c.notes?`<div style="margin-top:8px;padding:10px 12px;background:var(--thead);border-radius:4px;border-left:2px solid var(--border);font-size:12px;color:var(--t2);line-height:1.5;">${escapeHtml(c.notes)}</div>`:''}
      ${edit?`<div class="prc-acts"><button class="btn bs bsm" onclick="openClient('${c.id}')" title="Editar cliente">Editar</button><button class="btn bsm" style="color:var(--red);border:1px solid var(--border);" onclick="delClient('${c.id}')" title="Excluir cliente">Excluir</button></div>`:''}
    </div>`;
  }).join('');
}
function openClient(id){
  m8ctx=id;
  const c=id?clients.find(x=>x.id===id):null;
  document.getElementById('m8tit').textContent=c?'Editar Cliente':'Novo Cliente';
  document.getElementById('m8sub').textContent=c?c.name:'Preencha os dados do cliente';
  document.getElementById('m8-name').value=c?c.name:'';
  document.getElementById('m8-doc').value=c?c.document||'':'';
  document.getElementById('m8-status').value=c?c.status:'active';
  document.getElementById('m8-channel').value=c?c.channel:'';
  document.getElementById('m8-service').value=c?c.service||'':'';
  document.getElementById('m8-ticket').value=c?c.ticket||'':'';
  document.getElementById('m8-contract').value=c?c.contractLength||'':'';
  document.getElementById('m8-cname').value=c?c.contactName||'':'';
  document.getElementById('m8-email').value=c?c.email||'':'';
  document.getElementById('m8-phone').value=c?c.phone||'':'';
  document.getElementById('m8-start').value=c?c.startDate||'':'';
  document.getElementById('m8-renewal').value=c?c.renewalDate||'':'';
  document.getElementById('m8-notes').value=c?c.notes||'':'';
  document.getElementById('ebox8').style.display='none';
  document.getElementById('modal8').classList.add('show');
  setTimeout(()=>document.getElementById('m8-name').focus(),60);
}
function closeM8(){document.getElementById('modal8').classList.remove('show');}
function saveM8(){
  const name=document.getElementById('m8-name').value.trim();
  const channel=document.getElementById('m8-channel').value;
  const eb=document.getElementById('ebox8');
  if(!name){eb.textContent='Informe o nome do cliente.';eb.style.display='block';return;}
  if(!channel){eb.textContent='Selecione o canal de aquisição.';eb.style.display='block';return;}
  const item={
    id:m8ctx||uid(),name,status:document.getElementById('m8-status').value,channel,
    document:document.getElementById('m8-doc').value.trim(),
    service:document.getElementById('m8-service').value.trim(),
    ticket:(v=>isNaN(v)?null:v)(parseFloat(document.getElementById('m8-ticket').value)),
    contractLength:(v=>isNaN(v)?null:v)(parseFloat(document.getElementById('m8-contract').value)),
    contactName:document.getElementById('m8-cname').value.trim(),
    email:document.getElementById('m8-email').value.trim(),
    phone:document.getElementById('m8-phone').value.trim(),
    startDate:document.getElementById('m8-start').value,
    renewalDate:document.getElementById('m8-renewal').value,
    notes:document.getElementById('m8-notes').value.trim(),
  };
  clients=m8ctx?clients.map(c=>c.id===m8ctx?item:c):[...clients,item];
  sv('sias-clients',clients);closeM8();renderClientes();
}
function delClient(id){if(!confirm('Excluir este cliente?'))return;clients=clients.filter(c=>c.id!==id);sv('sias-clients',clients);renderClientes();}

// ── Gestão de Riscos ───────────────────────────────────────────────────────
function calcPartnerRisk(){
  const byType={};
  partners.forEach(p=>{(byType[p.type]=byType[p.type]||[]).push(p);});
  return partners.map(p=>{
    const peers=byType[p.type]||[p];
    const avgRev=peers.reduce((s,x)=>s+(x.revenueGenerated||0),0)/peers.length;
    const relPerf=avgRev>0?(p.revenueGenerated||0)/avgRev:1;
    let risk;
    if(p.status==='inactive')risk=100;
    else if(p.status==='negotiating')risk=60;
    else risk=Math.max(0,Math.min(100,Math.round((1-relPerf)*100)));
    return{p,risk};
  }).sort((a,b)=>b.risk-a.risk);
}
function loadRiskNotes(){return ld('sias-risk-notes')||[];}
function addRiskNote(){
  const ta=document.getElementById('risk-note-input');
  const text=ta.value.trim();
  if(!text)return;
  const notes=loadRiskNotes();
  notes.unshift({id:uid(),text,date:tod(),author:currentUser?currentUser.name:'—'});
  sv('sias-risk-notes',notes);
  renderRiscos();
  showToast('Comentário adicionado');
}
function delRiskNote(id){
  if(!confirm('Excluir este comentário?'))return;
  sv('sias-risk-notes',loadRiskNotes().filter(n=>n.id!==id));
  renderRiscos();
}
function renderRiscos(){
  const el=document.getElementById('riscos-content');if(!el)return;
  const edit=canEdit();

  const overdueRec=entries.filter(e=>e.status==='Pendente'&&e.date<tod());
  const overduePag=exits.filter(e=>e.status==='Pendente'&&e.date<tod());
  const overdueTotal=overdueRec.reduce((s,e)=>s+e.value,0)+overduePag.reduce((s,e)=>s+e.value,0);
  const runway=calcRunway();
  const runwayColor=runway.v===Infinity?'#10B981':runway.v<3?'#EF4444':runway.v<6?'#F59E0B':'#10B981';

  const partnerRisk=calcPartnerRisk();
  const partnersAtRisk=partnerRisk.filter(x=>x.risk>=50);

  const clientsAtRisk=clients.filter(c=>c.status==='at-risk');
  const clientsChurned=clients.filter(c=>c.status==='churned');
  const ticketAtRisk=clientsAtRisk.reduce((s,c)=>s+(c.ticket||0),0);
  const renewSoon=clients.filter(c=>c.status==='active'&&c.renewalDate).map(c=>({c,days:Math.round((new Date(c.renewalDate)-new Date(tod()))/86400000)})).filter(x=>x.days>=0&&x.days<=60).sort((a,b)=>a.days-b.days);

  const kpis=[
    {l:'Inadimplência',v:cur(overdueTotal),c:overdueTotal>0?'#EF4444':'#10B981',bg:overdueTotal>0?'rgba(239,68,68,.1)':'rgba(16,185,129,.1)',ico:'⚠',s:`${overdueRec.length+overduePag.length} lançamento(s) vencido(s)`},
    {l:'Capital de Giro (Runway)',v:runway.v===Infinity?'∞':`${runway.v.toFixed(1)} meses`,c:runwayColor,bg:runwayColor+'18',ico:'🏦',s:`Saldo ${cur(runway.saldo)}`},
    {l:'Parceiros em Risco',v:partnersAtRisk.length,c:partnersAtRisk.length>0?'#F59E0B':'#10B981',bg:partnersAtRisk.length>0?'rgba(245,158,11,.1)':'rgba(16,185,129,.1)',ico:'🤝',s:`de ${partners.length} parceiro(s)`},
    {l:'Clientes em Risco/Perdidos',v:clientsAtRisk.length+clientsChurned.length,c:(clientsAtRisk.length+clientsChurned.length)>0?'#EF4444':'#10B981',bg:(clientsAtRisk.length+clientsChurned.length)>0?'rgba(239,68,68,.1)':'rgba(16,185,129,.1)',ico:'🧑‍💼',s:`Ticket em risco: ${cur(ticketAtRisk)}`},
  ];
  const kpiHtml=`<div class="kgrid">${kpis.map(k=>`<div class="kpi" style="border-top:3px solid ${k.c};">
    <div class="ktop"><div class="klb">${k.l}</div><div class="kic" style="background:${k.bg};color:${k.c};">${k.ico}</div></div>
    <div class="kv" style="color:${k.c};">${k.v}</div>
    <div style="font-size:11px;color:var(--t3);margin-top:4px;">${k.s}</div>
  </div>`).join('')}</div>`;

  const finRows=[...overdueRec.map(e=>({...e,kind:'Recebimento'})),...overduePag.map(e=>({...e,kind:'Pagamento'}))].sort((a,b)=>a.date.localeCompare(b.date));
  const finHtml=`<div class="card" style="padding:24px;">
    <div class="ctit" style="margin-bottom:4px;">💵 Financeiro — Inadimplência &amp; Capital de Giro</div>
    <div class="csub" style="margin-bottom:16px;">Lançamentos vencidos e saúde do caixa</div>
    ${finRows.length?finRows.slice(0,8).map(e=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px;">
      <span>📅 ${dtf(e.date)} · ${escapeHtml(e.kind)} · ${escapeHtml(e.cat||'')}</span><b style="color:#EF4444;">${cur(e.value)}</b>
    </div>`).join(''):'<div style="text-align:center;padding:20px;color:var(--t3);">Nenhum lançamento vencido 🎉</div>'}
    <div style="margin-top:12px;font-size:11px;color:var(--t3);">Custo fixo médio ${cur(runway.avgFx)}/mês</div>
  </div>`;

  const partnerHtml=`<div class="card" style="padding:24px;">
    <div class="ctit" style="margin-bottom:4px;">🤝 Parceiros — Risco por Desempenho</div>
    <div class="csub" style="margin-bottom:16px;">Comparado à média de receita do próprio tipo de parceria</div>
    ${partnerRisk.length?partnerRisk.slice(0,8).map(x=>{
      const t=PARTNER_TYPES[x.p.type]||{l:x.p.type,c:'#94A3B8'};
      const pct=Math.max(4,x.risk);
      const color=x.risk>=70?'#EF4444':x.risk>=40?'#F59E0B':'#10B981';
      return`<div style="margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;"><span>${t.icon} <b>${escapeHtml(x.p.name)}</b> · ${escapeHtml(t.l)}</span><span style="color:${color};font-weight:700;">${x.risk}% risco</span></div>
        <div style="height:6px;background:var(--border);border-radius:4px;overflow:hidden;"><div style="height:100%;width:${pct}%;background:${color};border-radius:4px;transition:width .6s;"></div></div>
      </div>`;
    }).join(''):'<div style="text-align:center;padding:20px;color:var(--t3);">Nenhum parceiro cadastrado</div>'}
  </div>`;

  const cliHtml=`<div class="card" style="padding:24px;">
    <div class="ctit" style="margin-bottom:4px;">🧑‍💼 Clientes — Risco de Contrato</div>
    <div class="csub" style="margin-bottom:16px;">Em risco, perdidos e renovações próximas</div>
    ${clientsAtRisk.length||clientsChurned.length?[...clientsAtRisk,...clientsChurned].map(c=>{
      const st=CLIENT_STATUS[c.status];
      return`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px;">
        <span>${c.status==='churned'?'❌':'⚠'} <b>${escapeHtml(c.name)}</b> · ${cur(c.ticket||0)}</span><span class="badge" style="background:${st.bg};color:${st.c};">${escapeHtml(st.l)}</span>
      </div>`;
    }).join(''):'<div style="text-align:center;padding:20px;color:var(--t3);">Nenhum cliente em risco 🎉</div>'}
    ${renewSoon.length?`<div style="font-size:11px;font-weight:800;color:var(--t3);margin:14px 0 6px;text-transform:uppercase;">Renovações nos próximos 60 dias</div>${renewSoon.map(x=>`<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;"><span>📆 ${escapeHtml(x.c.name)} · ${dtf(x.c.renewalDate)}</span><b>em ${x.days}d</b></div>`).join('')}`:''}
  </div>`;

  const notes=loadRiskNotes();
  const notesHtml=`<div class="card" style="padding:24px;">
    <div class="ctit" style="margin-bottom:4px;">📝 Comentários Qualitativos</div>
    <div class="csub" style="margin-bottom:16px;">Observações sobre riscos financeiros, de parceiros ou de clientes</div>
    ${edit?`<textarea id="risk-note-input" placeholder="Registrar observação..." style="width:100%;min-height:60px;padding:11px 14px;border:1.5px solid var(--border);border-radius:12px;background:var(--input);color:var(--t1);font-family:inherit;font-size:13px;resize:vertical;outline:none;"></textarea>
    <button class="btn bp bsm" style="margin-top:8px;" onclick="addRiskNote()">+ Adicionar comentário</button>`:''}
    <div style="margin-top:14px;display:flex;flex-direction:column;gap:8px;">
      ${notes.length?notes.map(n=>`<div style="padding:10px 12px;background:var(--thead);border-radius:8px;border-left:3px solid var(--orange);font-size:12px;color:var(--t2);">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;color:var(--t3);font-size:11px;"><span>${escapeHtml(n.author)} · ${dtf(n.date)}</span>${edit?`<span style="cursor:pointer;color:var(--red);font-weight:700;" onclick="delRiskNote('${n.id}')" title="Excluir">×</span>`:''}</div>
        ${escapeHtml(n.text)}
      </div>`).join(''):'<div style="text-align:center;padding:16px;color:var(--t3);">Nenhum comentário registrado</div>'}
    </div>
  </div>`;

  el.innerHTML=`${kpiHtml}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:18px 0;">${finHtml}${partnerHtml}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">${cliHtml}${notesHtml}</div>`;
}

// ── Equipe CRUD ──────────────────────────────────────────────────────────
function setEquipeView(v){equipeView=v;document.querySelectorAll('.eqp-view-btn').forEach(b=>b.classList.toggle('on',b.dataset.v===v));renderEquipe();}
function resetTeamData(){if(!confirm('Redefinir toda a equipe e squads para os dados de exemplo? Esta ação é irreversível.'))return;localStorage.removeItem('sias-members');localStorage.removeItem('sias-squads');sv('sias-team-v',TEAM_DATA_V);teamMembers=seedMembers();squads=seedSquads();showToast('✅ Equipe redefinida para dados de exemplo');renderEquipe();}

function renderEquipe(){
  const el=document.getElementById('equipe-content');if(!el)return;
  const edit=canEdit();
  const viewBtns=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
    <div class="eqp-view-toggle">
      <button class="eqp-view-btn ${equipeView==='squads'?'on':''}" data-v="squads" onclick="setEquipeView('squads')" title="Ver por squads">⬛ Squads</button>
      <button class="eqp-view-btn ${equipeView==='list'?'on':''}" data-v="list" onclick="setEquipeView('list')" title="Ver como lista">☰ Lista</button>
      <button class="eqp-view-btn ${equipeView==='org'?'on':''}" data-v="org" onclick="setEquipeView('org')" title="Organograma">🌿 Organograma</button>
    </div>
    <div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12px;color:var(--t3);">${teamMembers.filter(m=>m.status==='active').length} membros ativos · ${squads.length} squads</span>${canEdit()?'<button class="btn bs bsm" onclick="resetTeamData()" title="Redefinir para dados de exemplo" style="font-size:10px;color:var(--t3);">↺ Redefinir</button>':''}</div>
  </div>`;

  if(equipeView==='squads') el.innerHTML=viewBtns+renderSquadsView(edit);
  else if(equipeView==='list') el.innerHTML=viewBtns+renderMemberList(edit);
  else el.innerHTML=viewBtns+renderOrgChart();
}

function _renderLeaderBanner(edit){
  const leaders=teamMembers.filter(m=>m.status==='active'&&m.isLeader);
  if(!leaders.length)return'';
  const cards=leaders.map(m=>{
    const ini=m.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
    const manages=squads.filter(s=>s.managedBy===m.id).map(s=>s.name).join(', ');
    const editBtn=edit?('<button class="btn bsm" onclick="openMember(this.dataset.id)" data-id="'+m.id+'" style="font-size:10px;padding:3px 8px;margin-left:4px;" title="Editar">&#x270F;</button>'):'';
    return '<div style="display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--border);border-radius:5px;padding:7px 10px;">'
      +'<div style="width:28px;height:28px;border-radius:4px;background:'+(m.avatarColor||'#F5A023')+';display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#fff;">'+escapeHtml(ini)+'</div>'
      +'<div><div style="font-size:12px;font-weight:800;color:var(--t1);">'+escapeHtml(m.name)+'</div>'
      +'<div style="font-size:10px;color:var(--t3);">'+escapeHtml(m.role)+(manages?' · '+escapeHtml(manages):'')+'</div></div>'
      +editBtn+'</div>';
  }).join('');
  return '<div style="margin-bottom:18px;padding:14px 16px;background:rgba(245,160,35,.05);border:1px solid rgba(245,160,35,.18);border-radius:var(--r);border-left:3px solid var(--orange);">'
    +'<div style="font-size:9.5px;font-weight:800;color:var(--orange);text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px;">★ Liderança Estratégica</div>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap;">'+cards+'</div>'
    +'</div>';
}

function renderSquadsView(edit){
  const leaderSection=_renderLeaderBanner(edit);

  const noSquad=teamMembers.filter(m=>!m.squadId||!squads.find(s=>s.id===m.squadId));
  let cols=squads.map(sq=>{
    const members=teamMembers.filter(m=>m.squadId===sq.id);
    const lead=members.find(m=>m.id===sq.managedBy)||members[0];
    return`<div class="squad-col">
      <div class="squad-hdr" style="border-top-color:${sq.color};">
        <div>
          <div class="squad-title" style="color:${sq.color};">${escapeHtml(sq.name)}</div>
          ${lead?`<div class="squad-lead">Lead: ${escapeHtml(lead.name)}</div>`:sq.desc?`<div class="squad-lead">${escapeHtml(sq.desc)}</div>`:''}
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="squad-cnt" style="background:${sq.color}18;color:${sq.color};">${members.length}</span>
          ${edit?`<button class="btn bsm bic" onclick="openSquad('${sq.id}')" title="Editar squad" style="font-size:10px;background:transparent;border:1px solid var(--border);">✏</button>`:''}
        </div>
      </div>
      <div class="squad-body">
        ${members.map(m=>memberCardHTML(m,edit)).join('')}
        ${edit?`<button class="squad-add" onclick="openMemberInSquad('${sq.id}')" title="Adicionar membro a este squad">+ Adicionar</button>`:''}
      </div>
    </div>`;
  }).join('');
  if(noSquad.length) cols+=`<div class="squad-col"><div class="squad-hdr" style="border-top-color:var(--border);"><div><div class="squad-title" style="color:var(--t3);">Sem Squad</div></div><span class="squad-cnt">${noSquad.length}</span></div><div class="squad-body">${noSquad.map(m=>memberCardHTML(m,edit)).join('')}</div></div>`;
  return leaderSection+`<div class="squad-grid">${cols}</div>`;
}

function memberCardHTML(m,edit){
  const initials=m.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  return`<div class="mem-card">
    <div class="mem-av" style="background:${m.avatarColor||'#4361EE'};">${escapeHtml(initials)}</div>
    <div class="mem-info">
      <div class="mem-name">${escapeHtml(m.name)}</div>
      <div class="mem-role">${escapeHtml(m.role)}${m.area?' · '+escapeHtml(m.area):''}</div>
    </div>
    ${edit?`<div class="mem-acts">
      <button class="btn bsm bic bie" onclick="openMember('${m.id}')" title="Editar membro" style="font-size:10px;">✏</button>
      <button class="btn bsm bic bid" onclick="delMember('${m.id}')" title="Excluir membro" style="font-size:10px;">×</button>
    </div>`:''}
  </div>`;
}

function renderMemberList(edit){
  if(!teamMembers.length) return`<div style="text-align:center;padding:60px;color:var(--t3);">Nenhum membro cadastrado.</div>`;
  return`<div class="tw"><table><thead><tr>
    <th>Membro</th><th>Cargo</th><th>Área</th><th>Squad</th><th>Contato</th><th>Status</th>${edit?'<th></th>':''}
  </tr></thead><tbody>
    ${teamMembers.map(m=>{
      const sq=squads.find(s=>s.id===m.squadId);
      const initials=m.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
      return`<tr>
        <td><div style="display:flex;align-items:center;gap:9px;"><div class="mem-av" style="background:${m.avatarColor||'#4361EE'};width:28px;height:28px;font-size:10px;">${escapeHtml(initials)}</div><span style="font-weight:700;">${escapeHtml(m.name)}</span></div></td>
        <td>${escapeHtml(m.role)||'–'}</td><td>${escapeHtml(m.area)||'–'}</td>
        <td>${sq?`<span style="background:${sq.color}18;color:${sq.color};padding:2px 7px;border-radius:3px;font-size:11px;font-weight:700;">${escapeHtml(sq.name)}</span>`:'–'}</td>
        <td>${m.email?`<a href="mailto:${encodeURIComponent(m.email)}" style="color:var(--blue);text-decoration:none;">${escapeHtml(m.email)}</a>`:escapeHtml(m.phone)||'–'}</td>
        <td><span class="badge" style="background:${m.status==='active'?'rgba(16,185,129,.1)':'rgba(148,163,184,.1)'};color:${m.status==='active'?'var(--green)':'var(--t3)'};">${m.status==='active'?'Ativo':'Inativo'}</span></td>
        ${edit?`<td><div style="display:flex;gap:4px;"><button class="btn bsm bic bie" onclick="openMember('${m.id}')" title="Editar">✏</button><button class="btn bsm bic bid" onclick="delMember('${m.id}')" title="Excluir">×</button></div></td>`:''}
      </tr>`;
    }).join('')}
  </tbody></table></div>`;
}

function _renderOrphans(roots){
  const reachable=new Set();
  function mark(id,d){
    if(d>14||reachable.has(id))return;
    reachable.add(id);
    // Traverse direct reports
    teamMembers.filter(m=>m.reportsTo===id).forEach(m=>mark(m.id,d+1));
    // Also mark members shown inside squads managed by this node
    squads.filter(s=>s.managedBy===id).forEach(sq=>{
      teamMembers.filter(m=>m.squadId===sq.id&&m.reportsTo===id).forEach(m=>mark(m.id,d+1));
    });
  }
  roots.forEach(r=>mark(r.id,0)); // mark() adds r.id itself and traverses children
  const orphans=teamMembers.filter(m=>m.status==='active'&&!reachable.has(m.id));
  if(!orphans.length)return'';
  const edit=canEdit();
  const cards=orphans.map(m=>{
    const ini=m.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
    const editBtn=edit?('<button class="org-edit-btn" style="position:static;color:var(--t3);" onclick="openMember(this.dataset.id)" data-id="'+m.id+'" title="Editar">&#x270F;</button>'):'';
    return '<div style="display:flex;align-items:center;gap:6px;background:var(--card);border:1px solid var(--border);border-radius:4px;padding:6px 10px;font-size:11.5px;">'
      +'<div style="width:22px;height:22px;border-radius:3px;background:'+(m.avatarColor||'#4361EE')+';display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;color:#fff;">'+escapeHtml(ini)+'</div>'
      +'<div><div style="font-weight:700;">'+escapeHtml(m.name)+'</div><div style="font-size:10px;color:var(--t3);">'+escapeHtml(m.role)+'</div></div>'
      +editBtn+'</div>';
  }).join('');
  return '<div style="margin-top:22px;padding:14px 18px;background:rgba(245,158,11,.06);border:1.5px dashed rgba(245,158,11,.25);border-radius:var(--r);">'
    +'<div style="font-size:10px;font-weight:800;color:var(--amber);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">⚠ Membros sem posição visível na hierarquia</div>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap;">'+cards+'</div>'
    +'<div style="font-size:10px;color:var(--t3);margin-top:8px;">Arraste estes cards para o organograma ou clique ✏ para editar o campo "Reporta para".</div>'
    +'</div>';
}

function renderOrgChart(){
  // Auto-fix any corrupted hierarchy state before rendering
  sanitizeHierarchy();

  const roots=teamMembers.filter(m=>m.status==='active'&&!m.reportsTo);
  const edit=canEdit();

  function mkCard(m){
    const ini=m.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
    const sqBadges=squads.filter(s=>s.managedBy===m.id).map(s=>`<span style="background:${s.color}18;color:${s.color};padding:1px 5px;border-radius:3px;font-size:9px;font-weight:700;">${escapeHtml(s.name)}</span>`).join('');
    const isRoot=!m.reportsTo;
    return`<div class="org-card${isRoot?' root-card':''}${m.isLeader&&!isRoot?' leader-card':''}"
      draggable="true"
      ondragstart="orgDragStart(event,'member','${m.id}')"
      ondragover="orgDragOver(event,'member','${m.id}')"
      ondragleave="orgDragLeave(event)"
      ondrop="orgDrop(event,'member','${m.id}')"
      ondragend="orgDragEnd(event)">
      <div style="width:30px;height:30px;border-radius:4px;background:${m.avatarColor||'#4361EE'};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:#fff;margin:0 auto 6px;">${escapeHtml(ini)}</div>
      <div style="font-size:12px;font-weight:800;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px;">${escapeHtml(m.name)}</div>
      <div style="font-size:10px;color:var(--t3);margin-top:1px;">${escapeHtml(m.role)}</div>
      ${sqBadges?`<div style="margin-top:4px;display:flex;gap:2px;flex-wrap:wrap;justify-content:center;">${sqBadges}</div>`:''}
      ${m.isLeader&&!isRoot?`<div style="font-size:9px;color:var(--orange);font-weight:700;margin-top:3px;letter-spacing:.03em;">★ LIDERANÇA</div>`:''}
      ${edit?`<button class="org-edit-btn" onclick="event.stopPropagation();openMember('${m.id}')" title="Editar membro">✏</button>`:''}
    </div>`;
  }

  function mkSquad(sq,parentId){
    // Count all members in the squad's org-chart subtree (recursive).
    // Direct members = those who report to parentId AND are in this squad.
    // Their descendants are also counted (e.g. Júlia/Bruno under Rafael under Produto & IA).
    const direct=parentId
      ?teamMembers.filter(m=>m.status==='active'&&m.squadId===sq.id&&m.reportsTo===parentId)
      :[];
    function countBelow(mId,d){
      if(d>8)return 0;
      const kids=teamMembers.filter(k=>k.status==='active'&&k.reportsTo===mId);
      return kids.reduce((s,k)=>s+1+countBelow(k.id,d+1),0);
    }
    const total=direct.length+direct.reduce((s,m)=>s+countBelow(m.id,0),0);
    const cntLabel=`${total} membro${total!==1?'s':''}`;
    return`<div class="org-squad-node" style="border-top:2px solid ${sq.color};"
      ondragover="orgDragOver(event,'squad','${sq.id}')"
      ondragleave="orgDragLeave(event)"
      ondrop="orgDrop(event,'squad','${sq.id}')">
      <div style="font-size:11px;font-weight:800;color:${sq.color};">${escapeHtml(sq.name)}</div>
      <div style="font-size:9.5px;color:var(--t3);margin-top:1px;">${cntLabel}</div>
      ${edit?`<button class="org-edit-btn" onclick="event.stopPropagation();openSquad('${sq.id}')" title="Editar squad">✏</button>`:''}
    </div>`;
  }

  // Recursively build subtree under a parent
  // FIX: include ALL direct reports regardless of isLeader
  // FIX: squads appear as leaf nodes only — no duplicate member cards inside them
  // Build children row under a squad node
  function buildSquadSub(squadMembers,depth){
    if(!squadMembers.length||depth>8)return'';
    const single=squadMembers.length===1;
    const items=squadMembers.map(m=>{
      const sub=buildSubtree(m.id,depth+1);
      return`<div class="ochild"><div class="ovup"></div>${mkCard(m)}${sub}</div>`;
    }).join('');
    return`<div class="ovdown"></div><div class="orow${single?' single':''}">${items}</div>`;
  }

  function buildSubtree(parentId,depth){
    if(depth>8)return'';
    const memberKids=teamMembers.filter(m=>m.status==='active'&&m.reportsTo===parentId);
    const squadKids=squads.filter(s=>s.managedBy===parentId);

    // Members who belong to a squad managed by THIS parent
    // → they appear UNDER their squad node, not as direct siblings
    const inSquadIds=new Set(
      memberKids.filter(m=>squadKids.some(s=>s.id===m.squadId)).map(m=>m.id)
    );

    // Direct reports NOT in any managed squad → appear as siblings alongside squads
    const directSiblings=memberKids.filter(m=>!inSquadIds.has(m.id));

    const all=[...directSiblings,...squadKids];
    if(!all.length)return'';
    const single=all.length===1;

    const items=all.map(item=>{
      const isMember=('role' in item);
      if(isMember){
        // Regular direct report — with their own recursive subtree
        return`<div class="ochild"><div class="ovup"></div>${mkCard(item)}${buildSubtree(item.id,depth+1)}</div>`;
      }else{
        // Squad node — members of this squad who report to parentId go UNDER it
        const squadMembers=memberKids.filter(m=>m.squadId===item.id);
        return`<div class="ochild"><div class="ovup"></div>${mkSquad(item,parentId)}${buildSquadSub(squadMembers,depth+1)}</div>`;
      }
    }).join('');

    return`<div class="ovdown"></div><div class="orow${single?' single':''}">${items}</div>`;
  }

  let rootsHTML;
  if(!roots.length){
    rootsHTML=`<div style="text-align:center;padding:40px;color:var(--t3);">Nenhum líder raiz. Arraste um card para a zona acima para promover um membro.</div>`;
  }else if(roots.length===1){
    rootsHTML=`<div class="ochild">${mkCard(roots[0])}${buildSubtree(roots[0].id,0)}</div>`;
  }else{
    rootsHTML=`<div style="display:flex;gap:28px;justify-content:center;flex-wrap:wrap;">${roots.map(r=>`<div class="ochild">${mkCard(r)}${buildSubtree(r.id,0)}</div>`).join('')}</div>`;
  }

  return`<div class="org-tree-wrap">
    <div class="org-drop-root"
      ondragover="orgDragOver(event,'root',null)"
      ondragleave="orgDragLeave(event)"
      ondrop="orgDrop(event,'root',null)">
      ⬆ Solte aqui para remover supervisor (promover a líder raiz)
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;">${rootsHTML}</div>
    ${_renderOrphans(roots)}
    <div style="margin-top:20px;font-size:11px;color:var(--t3);text-align:center;">🎯 Arraste cards para reorganizar · ✏ para editar · Membro sobre outro membro = define hierarquia</div>
  </div>`;
}


// ── Drag & Drop handlers ─────────────────────────────────────────────
let _drag={type:null,id:null};
function orgDragStart(e,type,id){_drag={type,id};e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',id);setTimeout(()=>{const el=e.target.closest('.org-card,.org-squad-node');if(el)el.classList.add('dragging');},0);}
function orgDragOver(e,tgt,tgtId){e.preventDefault();e.dataTransfer.dropEffect='move';if(!_isValidDrop(_drag.type,_drag.id,tgt,tgtId))return;const el=e.currentTarget;el.classList.add('drag-over');}
function orgDragLeave(e){e.currentTarget.classList.remove('drag-over');}
function orgDrop(e,tgt,tgtId){e.preventDefault();e.stopPropagation();e.currentTarget.classList.remove('drag-over');if(!_drag.id)return;_applyDrop(_drag.type,_drag.id,tgt,tgtId);_drag={type:null,id:null};}
function orgDragEnd(e){document.querySelectorAll('.dragging,.drag-over').forEach(el=>el.classList.remove('dragging','drag-over'));_drag={type:null,id:null};}
// ── Hierarchy safety: detect cycles, self-loops, broken refs ───────
function _wouldCycle(mId,newRepId){
  if(!mId||!newRepId)return false;
  if(mId===newRepId)return true;
  let cur=newRepId;const v=new Set([mId]);let i=0;
  while(cur&&i<40){
    if(v.has(cur))return true;
    v.add(cur);
    const m=teamMembers.find(x=>x.id===cur);
    cur=m?.reportsTo;i++;
  }
  return false;
}

function _isValidDrop(st,si,tt,ti){
  if(!si)return false;
  const memberIds=new Set(teamMembers.map(m=>m.id));
  if(!memberIds.has(si))return false;

  if(st==='member'&&tt==='member'){
    if(si===ti)return false;                         // drop onto self
    if(!memberIds.has(ti))return false;              // target doesn't exist
    if(_wouldCycle(si,ti))return false;              // cycle check
  }

  if(st==='member'&&tt==='squad'){
    const sq=squads.find(s=>s.id===ti);
    if(!sq)return false;                             // squad doesn't exist
    if(sq.managedBy===si)return false;               // member manages this squad → self-loop
    if(sq.managedBy&&_wouldCycle(si,sq.managedBy))return false; // manager chain → cycle
  }

  if(st==='member'&&tt==='root'){
    const m=teamMembers.find(x=>x.id===si);
    if(!m)return false;
    if(!m.reportsTo&&m.isLeader)return false;        // already a root leader
  }

  return true;
}

// ── Auto-sanitize: fix corrupted state silently ─────────────────────
function sanitizeHierarchy(){
  const memberIds=new Set(teamMembers.map(m=>m.id));
  let dirty=false;

  // Fix members
  teamMembers=teamMembers.map(m=>{
    if(!m.reportsTo)return m;
    // reportsTo points to self
    if(m.reportsTo===m.id){dirty=true;return{...m,reportsTo:null,isLeader:true};}
    // reportsTo points to non-existent member
    if(!memberIds.has(m.reportsTo)){dirty=true;return{...m,reportsTo:null};}
    // reportsTo creates a cycle
    if(_wouldCycle(m.id,m.reportsTo)){dirty=true;return{...m,reportsTo:null};}
    return m;
  });

  // Fix squads: managedBy pointing to non-existent member
  squads=squads.map(sq=>{
    if(sq.managedBy&&!memberIds.has(sq.managedBy)){dirty=true;return{...sq,managedBy:null};}
    return sq;
  });

  // Fix squadId mismatches: squad no longer exists
  teamMembers=teamMembers.map(m=>{
    if(!m.squadId)return m;
    const sq=squads.find(s=>s.id===m.squadId);
    if(!sq)return{...m,squadId:''};
    return m;
  });

  // Fix squadId mismatches: member must appear in the squad's reportsTo chain.
  // Uses a recursive chain check — Júlia reporting to Rafael reporting to Pedro (sq1 manager)
  // is still a valid sq1 member even though she doesn't directly report to Pedro.
  function _inSquadChain(mId,managerId,d){
    if(d>8||!mId)return false;
    const m=teamMembers.find(x=>x.id===mId);
    if(!m||!m.reportsTo)return false;
    if(m.reportsTo===managerId)return true;
    return _inSquadChain(m.reportsTo,managerId,d+1);
  }
  teamMembers=teamMembers.map(m=>{
    if(!m.squadId||!m.reportsTo)return m;
    const sq=squads.find(s=>s.id===m.squadId);
    if(!sq||!sq.managedBy)return m;
    if(sq.managedBy===m.id)return m;               // squad manager → stays above squad ✅
    if(_inSquadChain(m.id,sq.managedBy,0))return m; // anywhere in squad chain ✅
    dirty=true;return{...m,squadId:''};             // genuinely outside squad → clear
  });

  if(dirty){
    sv('sias-members',teamMembers);
    sv('sias-squads',squads);
    console.warn('SIAS: hierarquia sanitizada — estado corrompido detectado e corrigido.');
  }
}

function _applyDrop(st,si,tt,ti){
  if(!_isValidDrop(st,si,tt,ti)){
    const reason=
      (st==='member'&&tt==='squad'&&squads.find(s=>s.id===ti)?.managedBy===si)
        ?'Um membro não pode ser movido para o squad que ele próprio gerencia.'
        :(st==='member'&&tt==='member'&&si===ti)
        ?'Um membro não pode reportar para si mesmo.'
        :'Essa operação criaria uma hierarquia circular ou referência inválida.';
    showToast('⛔ '+reason);
    return;
  }

  if(st==='member'&&tt==='member'){
    // When dropped onto another member, keep squadId only if that member manages this squad
    const target=teamMembers.find(x=>x.id===ti);
    const keepSquad=teamMembers.find(x=>x.id===si);
    const squadStillValid=keepSquad?.squadId&&squads.some(s=>s.id===keepSquad.squadId&&s.managedBy===ti);
    teamMembers=teamMembers.map(m=>m.id===si?{...m,reportsTo:ti,isLeader:false,...(!squadStillValid?{squadId:''}:{})}:m);
    showToast('✅ Hierarquia atualizada');
  }else if(st==='member'&&tt==='squad'){
    const sq=squads.find(s=>s.id===ti);
    // Only update reportsTo if squad has a manager; otherwise keep existing reportsTo
    const newRep=sq?.managedBy||null;
    teamMembers=teamMembers.map(m=>m.id===si
      ?{...m,squadId:ti,...(newRep?{reportsTo:newRep}:{})}
      :m);
    showToast('✅ Membro movido para '+(sq?.name||'squad'));
  }else if(st==='member'&&tt==='root'){
    // Roots are above squads, so clear squadId (they manage squads, not belong to them)
    teamMembers=teamMembers.map(m=>m.id===si?{...m,reportsTo:null,isLeader:true,squadId:''}:m);
    showToast('⭐ Promovido a líder raiz');
  }

  sv('sias-members',teamMembers);
  renderEquipe();
}
function showToast(msg){let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t);}t.textContent=msg;t.classList.remove('show');void t.offsetWidth;t.classList.add('show');clearTimeout(t._tmr);t._tmr=setTimeout(()=>t.classList.remove('show'),2400);}

function openMember(id){openMemberInSquad(null,id);}
function openMemberInSquad(squadId,id){
  m6ctx=id||null;
  const m=id?teamMembers.find(x=>x.id===id):null;
  document.getElementById('m6tit').textContent=m?'Editar Membro':'Novo Membro';
  document.getElementById('m6sub').textContent=m?m.name:'Adicionar à equipe';
  document.getElementById('m6-name').value=m?m.name:'';
  document.getElementById('m6-role').value=m?m.role:'';
  document.getElementById('m6-area').value=m?m.area:'';
  document.getElementById('m6-email').value=m?m.email||'':'';
  document.getElementById('m6-phone').value=m?m.phone||'':'';
  document.getElementById('m6-status').value=m?m.status:'active';
  document.getElementById('m6-join').value=m?m.joinDate||'':'';
  document.getElementById('m6-notes').value=m?m.notes||'':'';
  document.getElementById('m6-leader').checked=m?!!m.isLeader:false;
  const sqSel=document.getElementById('m6-squad');
  sqSel.innerHTML='<option value="">Sem squad</option>'+squads.map(s=>`<option value="${s.id}" ${(m?m.squadId:squadId)===s.id?'selected':''}>${escapeHtml(s.name)}</option>`).join('');
  const repSel=document.getElementById('m6-reports');
  repSel.innerHTML='<option value="">— Sem hierarquia —</option>'+teamMembers.filter(x=>x.id!==id).map(x=>`<option value="${x.id}" ${m?.reportsTo===x.id?'selected':''}>${escapeHtml(x.name)} · ${escapeHtml(x.role)}</option>`).join('');
  selM6Color=m?m.avatarColor||AVATAR_COLORS[0]:AVATAR_COLORS[0];
  const cpk=document.getElementById('m6-cpk');
  if(cpk)cpk.innerHTML=AVATAR_COLORS.map(c=>`<div onclick="selM6Color='${c}';renderM6Cpk();" style="width:22px;height:22px;border-radius:4px;background:${c};cursor:pointer;border:2px solid ${c===selM6Color?'#fff':'transparent'};outline:${c===selM6Color?'2px solid '+c:'none'};"></div>`).join('');
  document.getElementById('ebox6').style.display='none';
  document.getElementById('modal6').classList.add('show');
  setTimeout(()=>document.getElementById('m6-name').focus(),60);
}
function renderM6Cpk(){const cpk=document.getElementById('m6-cpk');if(cpk)cpk.innerHTML=AVATAR_COLORS.map(c=>`<div onclick="selM6Color='${c}';renderM6Cpk();" style="width:22px;height:22px;border-radius:4px;background:${c};cursor:pointer;border:2px solid ${c===selM6Color?'#fff':'transparent'};outline:${c===selM6Color?'2px solid '+c:'none'};"></div>`).join('');}
function closeM6(){document.getElementById('modal6').classList.remove('show');}
function saveM6(){
  const name=document.getElementById('m6-name').value.trim(),role=document.getElementById('m6-role').value.trim();
  const eb=document.getElementById('ebox6');
  if(!name){eb.textContent='Informe o nome do membro.';eb.style.display='block';return;}
  if(!role){eb.textContent='Informe o cargo.';eb.style.display='block';return;}
  const item={id:m6ctx||uid(),name,role,area:document.getElementById('m6-area').value.trim(),squadId:document.getElementById('m6-squad').value,email:document.getElementById('m6-email').value.trim(),phone:document.getElementById('m6-phone').value.trim(),status:document.getElementById('m6-status').value,joinDate:document.getElementById('m6-join').value,avatarColor:selM6Color,notes:document.getElementById('m6-notes').value.trim(),reportsTo:document.getElementById('m6-reports').value||null,isLeader:document.getElementById('m6-leader').checked};
  teamMembers=m6ctx?teamMembers.map(m=>m.id===m6ctx?item:m):[...teamMembers,item];
  sv('sias-members',teamMembers);closeM6();renderEquipe();
}
function delMember(id){if(!confirm('Excluir este membro da equipe?'))return;teamMembers=teamMembers.filter(m=>m.id!==id);sv('sias-members',teamMembers);renderEquipe();}

function openSquad(id){
  m7ctx=id;
  const sq=id?squads.find(s=>s.id===id):null;
  document.getElementById('m7tit').textContent=sq?'Editar Squad':'Novo Squad';
  document.getElementById('m7-name').value=sq?sq.name:'';
  document.getElementById('m7-desc').value=sq?sq.desc||'':'';
  const mgdSel=document.getElementById('m7-managed');
  mgdSel.innerHTML='<option value="">— Nenhum —</option>'+teamMembers.filter(m=>m.status==='active').map(m=>`<option value="${m.id}" ${sq?.managedBy===m.id?'selected':''}>${escapeHtml(m.name)} · ${escapeHtml(m.role)}</option>`).join('');
  selM7Color=sq?sq.color:AVATAR_COLORS[0];
  const cpk=document.getElementById('m7-cpk');
  if(cpk)cpk.innerHTML=AVATAR_COLORS.map(c=>`<div onclick="selM7Color='${c}';renderM7Cpk();" style="width:22px;height:22px;border-radius:4px;background:${c};cursor:pointer;border:2px solid ${c===selM7Color?'#fff':'transparent'};outline:${c===selM7Color?'2px solid '+c:'none'};"></div>`).join('');
  document.getElementById('ebox7').style.display='none';
  document.getElementById('modal7').classList.add('show');
  setTimeout(()=>document.getElementById('m7-name').focus(),60);
}
function renderM7Cpk(){const cpk=document.getElementById('m7-cpk');if(cpk)cpk.innerHTML=AVATAR_COLORS.map(c=>`<div onclick="selM7Color='${c}';renderM7Cpk();" style="width:22px;height:22px;border-radius:4px;background:${c};cursor:pointer;border:2px solid ${c===selM7Color?'#fff':'transparent'};outline:${c===selM7Color?'2px solid '+c:'none'};"></div>`).join('');}
function closeM7(){document.getElementById('modal7').classList.remove('show');}
function saveM7(){
  const name=document.getElementById('m7-name').value.trim();
  const eb=document.getElementById('ebox7');
  if(!name){eb.textContent='Informe o nome do squad.';eb.style.display='block';return;}
  const item={id:m7ctx||uid(),name,color:selM7Color,desc:document.getElementById('m7-desc').value.trim(),managedBy:document.getElementById('m7-managed').value||null};
  squads=m7ctx?squads.map(s=>s.id===m7ctx?item:s):[...squads,item];
  sv('sias-squads',squads);closeM7();renderEquipe();
}
function delSquad(id){if(!confirm('Excluir este squad? Os membros não serão deletados.'))return;squads=squads.filter(s=>s.id!==id);teamMembers=teamMembers.map(m=>m.squadId===id?{...m,squadId:''}:m);sv('sias-squads',squads);sv('sias-members',teamMembers);renderEquipe();}

const CURRENT_TAB=document.body.dataset.tab;
(function boot(){
  // Check for existing session
  try{
    const saved=sessionStorage.getItem('sias-session');
    if(saved){
      const s=JSON.parse(saved);
      const user=USERS.find(u=>u.login===s.login&&u.level===s.level);
      if(user){
        currentUser=user;
        document.documentElement.dataset.level=user.level;
        document.getElementById('login-overlay').style.display='none';
        document.getElementById('app').style.display='block';
        renderNavUser();
        applyCfg();
        go(CURRENT_TAB);
        return;
      }
    }
  }catch(e){}
  // Show login
  document.getElementById('login-overlay').style.display='flex';
  document.getElementById('app').style.display='none';
})();

