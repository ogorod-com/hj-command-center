import { useState, useRef, useEffect } from "react";

/* ─── PARTY CONSTANTS ─── */
const PARTIES = {hj:"HJ Team",lawrence:"Lawrence Group",oleary:"O'Leary",meyers:"Meyers+",landlord:"Landlord (CIM)",wesbuild:"Wesbuild",external:"External"};
const PARTY_COLORS = {hj:"#7C3AED",lawrence:"#3B82F6",oleary:"#F59E0B",meyers:"#06B6D4",landlord:"#EF4444",wesbuild:"#22C55E",external:"#94A3B8"};
const PARTY_BG = {hj:"#F5F3FF",lawrence:"#EFF6FF",oleary:"#FFFBEB",meyers:"#ECFEFF",landlord:"#FEF2F2",wesbuild:"#F0FDF4",external:"#F8FAFC"};

/* ─── INITIAL DATA ─── */
const initPhases = [
  {
    id:"p1", name:"AOR Drawing Development", color:"#7C3AED",
    start:"2025-11-01", end:"2026-04-15", status:"active", weeks:17.8, days:89,
    tasks:[
      {id:"t1",text:"Survey",done:false,status:"in-progress",owner:"Lawrence Group",duration:"",ballWith:"lawrence"},
      {id:"t2",text:"Pre-Design",done:false,status:"not-started",owner:"Lawrence Group",duration:"19d",ballWith:"lawrence"},
      {id:"t3",text:"Team Meeting",done:false,status:"not-started",owner:"Andrey + Lawrence",duration:"1w",ballWith:"hj"},
      {id:"t4",text:"SD — Schematic Design",done:false,status:"not-started",owner:"Lawrence Group",duration:"3w",ballWith:"lawrence"},
      {id:"t5",text:"Client Review",done:false,status:"overdue",owner:"Andrey / Iliyas",duration:"1w",ballWith:"hj"},
      {id:"t6",text:"Acoustic Site Visit and Report",done:true,status:"complete",owner:"Lawrence Group",duration:"8d",ballWith:"lawrence"},
      {id:"t7",text:"DD — Design Development",done:true,status:"complete",owner:"Lawrence Group",duration:"3w",ballWith:"lawrence"},
      {id:"t8",text:"Issue for Bid / Permit / Construction",done:false,status:"not-started",owner:"Lawrence Group",duration:"30d",ballWith:"lawrence"},
    ]
  },
  {
    id:"p2", name:"Permitting & Bidding Phase", color:"#8B5CF6",
    start:"2026-04-01", end:"2026-06-05", status:"upcoming", weeks:4.2, days:21,
    tasks:[
      {id:"t9",text:"Bid Set Drawings Issued to Wesbuild",done:false,status:"not-started",owner:"Lawrence Group",duration:"1d",ballWith:"lawrence"},
      {id:"t10",text:"Subcontractor Bids Received",done:false,status:"not-started",owner:"Wesbuild",duration:"",ballWith:"wesbuild"},
      {id:"t11",text:"Cost Leveling / Negotiation",done:false,status:"not-started",owner:"Andrey + O'Leary",duration:"1w",ballWith:"hj"},
      {id:"t12",text:"GC Award / Mobilization",done:false,status:"not-started",owner:"Andrey",duration:"1w",ballWith:"hj"},
      {id:"t13",text:"Permitting Process (DOB filing)",done:false,status:"not-started",owner:"Lawrence Group",duration:"10d",ballWith:"lawrence"},
      {id:"t14",text:"DOB Review",done:false,status:"not-started",owner:"NYC DOB",duration:"2w",ballWith:"external"},
      {id:"t15",text:"Permits Received",done:false,status:"not-started",owner:"Lawrence Group",duration:"",ballWith:"lawrence"},
    ]
  },
  {
    id:"p3", name:"Construction", color:"#A78BFA",
    start:"2026-06-05", end:"2026-11-15", status:"upcoming", weeks:26, days:130,
    tasks:[
      {id:"t16",text:"Mobilization / Long Lead Item Release",done:false,status:"not-started",owner:"Wesbuild",duration:"20d",ballWith:"wesbuild"},
      {id:"t17",text:"Demolition & site prep",done:false,status:"not-started",owner:"Wesbuild",duration:"",ballWith:"wesbuild"},
      {id:"t18",text:"Concrete / Masonry / Structural",done:false,status:"not-started",owner:"Wesbuild",duration:"",ballWith:"wesbuild"},
      {id:"t19",text:"MEP rough-in (HVAC, Plumbing, Electrical)",done:false,status:"not-started",owner:"Wesbuild / MEP",duration:"",ballWith:"wesbuild"},
      {id:"t20",text:"Drywall / Carpentry / Ceilings",done:false,status:"not-started",owner:"Wesbuild",duration:"",ballWith:"wesbuild"},
      {id:"t21",text:"Ceramic, Stone & Flooring",done:false,status:"not-started",owner:"Wesbuild",duration:"",ballWith:"wesbuild"},
      {id:"t22",text:"Acoustic spray soundproofing",done:false,status:"not-started",owner:"Wesbuild",duration:"",ballWith:"wesbuild"},
      {id:"t23",text:"Painting & Decorative Finishes",done:false,status:"not-started",owner:"Wesbuild",duration:"",ballWith:"wesbuild"},
      {id:"t24",text:"On Site Construction (full scope)",done:false,status:"not-started",owner:"Wesbuild",duration:"26w",ballWith:"wesbuild"},
    ]
  },
  {
    id:"p4", name:"Ops Setup & Opening", color:"#6D28D9",
    start:"2026-11-15", end:"2026-12-15", status:"upcoming", weeks:1.8, days:9,
    tasks:[
      {id:"t25",text:"FF&E delivery & install (gym equipment)",done:false,status:"not-started",owner:"Equipment Vendor",duration:"",ballWith:"external"},
      {id:"t26",text:"AV / Light / Sound install",done:false,status:"not-started",owner:"AV Vendor",duration:"",ballWith:"external"},
      {id:"t27",text:"IT infrastructure & screens",done:false,status:"not-started",owner:"KZ Tech Team",duration:"",ballWith:"hj"},
      {id:"t28",text:"Ops Turnover — Move-In / Set-Up",done:false,status:"not-started",owner:"Andrey",duration:"9d",ballWith:"hj"},
      {id:"t29",text:"DOB final inspection & TCO",done:false,status:"not-started",owner:"Lawrence Group",duration:"",ballWith:"lawrence"},
      {id:"t30",text:"Staff hiring & training",done:false,status:"not-started",owner:"Fitness Director",duration:"",ballWith:"hj"},
      {id:"t31",text:"Studio Opening / Opening Deadline",done:false,status:"not-started",owner:"Andrey + CMO",duration:"",ballWith:"hj"},
    ]
  },
];

const initVendors = [
  {id:"v1",name:"O'Leary Group",role:"Construction Consultant",contact:"Samara Petigrow (samara@olearygroup.com)",status:"active",risk:"low",lastUpdate:"Mar 2026",contract:"Engaged",notes:"Manages the Smartsheet construction timeline ('Hero's Journey Flatiron Schedule'). Andrey has view-only access. Key interface between HJ and all construction partners.",deliverables:["Smartsheet timeline management","Construction oversight","Vendor coordination"],nextAction:"Request automated Smartsheet email reports (daily/weekly)",dueDate:"2026-03-20",budget:0,spent:0},
  {id:"v2",name:"Lawrence Group",role:"Architecture",contact:"Matt Lundgren, Sean Trombly",status:"active",risk:"medium",lastUpdate:"Mar 2026",contract:"Signed",notes:"Leading NYC fitness architect. Equinox portfolio. Currently in AOR Drawing Development. Client Review flagged OVERDUE in Smartsheet. Blocks 30-day 'Issue for Bid' task.",deliverables:["AOR drawings","Bid set drawings","DOB permit filing","MEP coordination"],nextAction:"Resolve Client Review (OVERDUE) then Issue for Bid/Permit",dueDate:"2026-04-01",budget:280000,spent:60000},
  {id:"v3",name:"Wesbuild",role:"General Contractor",contact:"TBC",status:"standby",risk:"low",lastUpdate:"Mar 2026",contract:"Pending permit",notes:"Budget LOW: $5.12M / HIGH: $5.95M (before 20% contingency). On standby pending permit approval. Proven NYC fitness GC track record.",deliverables:["Full buildout","MEP rough-in","26-week construction","FF&E coordination"],nextAction:"Finalize GMP contract after bid drawings issued",dueDate:"2026-05-01",budget:5500000,spent:0},
  {id:"v4",name:"CIM Group",role:"Landlord",contact:"TBC",status:"active",risk:"medium",lastUpdate:"Mar 2026",contract:"Lease executed",notes:"Handover May 15 2026. 9-month rent-free. Pre-permit engineer coordination ongoing -- critical path item. One of largest US commercial landlords.",deliverables:["Engineer coordination pre-permit","Space handover May 15","9-month rent-free period"],nextAction:"Resolve open parameters with landlord engineers",dueDate:"2026-03-31",budget:0,spent:0},
  {id:"v5",name:"JPMorgan",role:"LOC Financing",contact:"TBC",status:"active",risk:"low",lastUpdate:"Feb 2026",contract:"In progress",notes:"$1.4M Letter of Credit personally guaranteed by Iliyas. Drawdown schedule needs alignment with Wesbuild payment milestones.",deliverables:["$1.4M LOC finalization","Drawdown schedule aligned to construction"],nextAction:"Confirm LOC drawdown schedule",dueDate:"2026-04-01",budget:1400000,spent:0},
  {id:"v6",name:"Gym Equipment Vendor",role:"Equipment / FF&E",contact:"TBD",status:"pending",risk:"high",lastUpdate:"--",contract:"Not signed",notes:"Budget $690K. Lead times 12-16 weeks. Must order by August 2026 for November delivery. No vendor shortlisted yet -- URGENT.",deliverables:["Resistance training equipment","HIIT equipment","Megaformers (Reshape room)","Assessment Center"],nextAction:"RFQ & vendor shortlist -- time sensitive",dueDate:"2026-06-01",budget:690000,spent:0},
  {id:"v7",name:"AV / Light / Sound",role:"AV & Lighting",contact:"TBD",status:"pending",risk:"medium",lastUpdate:"--",contract:"Not signed",notes:"Budget $230K. Critical for HJ in-studio experience. Must integrate with HJ proprietary app system. Coordinate with KZ tech team.",deliverables:["Zone sound systems","In-studio screens","Lighting per zone","HJ app integration"],nextAction:"Spec & RFQ -- coordinate with KZ tech team first",dueDate:"2026-06-01",budget:230000,spent:0},
  {id:"v8",name:"CBRE",role:"Real Estate",contact:"TBC",status:"done",risk:"low",lastUpdate:"Jan 2026",contract:"Completed",notes:"Lease at 225 5th executed. 19,451 rentable sq ft secured. Role complete for now.",deliverables:["Lease negotiation complete","225 Fifth secured"],nextAction:"Standby -- re-engage for future NYC locations",dueDate:"--",budget:0,spent:0},
  {id:"v9",name:"Meyers+",role:"MEP Engineering",contact:"Nicholas Modugno",status:"active",risk:"low",lastUpdate:"Feb 2026",contract:"Engaged via Lawrence Group",notes:"Full MEP engineering team — HVAC, plumbing, electrical, fire protection. 7-person team actively coordinating with Lawrence Group on design development. Handling all mechanical responses and hot water/shower systems.",deliverables:["HVAC design & coordination","Plumbing systems","Electrical engineering","Fire protection","MEP coordination with landlord"],nextAction:"Complete MEP responses for SD drawings",dueDate:"2026-04-01",budget:0,spent:0},
];

const initIssues = [
  {id:"i1",title:"Client Review OVERDUE in Smartsheet",severity:"critical",owner:"Andrey / Lawrence Group",phase:"Design",due:"2026-03-15",open:true,notes:"Flagged red in O'Leary's Smartsheet. Blocks the 30-day 'Issue for Bid/Permit/Construction' task. Must be resolved immediately to protect April permit filing target.",ballWith:"hj"},
  {id:"i2",title:"Landlord engineer coordination unresolved",severity:"critical",owner:"Andrey + CIM",phase:"Design",due:"2026-03-31",open:true,notes:"CIM Group engineer sign-off needed before DOB permit submission. Direct blocker on permit timeline.",ballWith:"landlord"},
  {id:"i3",title:"'Issue for Bid' not started -- 30 day task",severity:"high",owner:"Lawrence Group",phase:"Design",due:"2026-04-01",open:true,notes:"This 30-day task hasn't started. It follows Client Review and precedes DOB filing. Every day of delay pushes permit filing and construction start.",ballWith:"lawrence"},
  {id:"i4",title:"Gym equipment vendor not selected",severity:"high",owner:"Andrey",phase:"Procurement",due:"2026-06-01",open:true,notes:"12-16 week lead times. Must place order by August 2026 for November delivery. No vendor even shortlisted yet.",ballWith:"hj"},
  {id:"i5",title:"Useable SF unconfirmed (budget assumes 17,095)",severity:"medium",owner:"Andrey + Lawrence Group",phase:"Design",due:"2026-04-01",open:true,notes:"Budget PSF calculations based on 17,095 useable SF. Lease says 19,451 rentable. Actual useable needs field verification before finalizing construction scope.",ballWith:"hj"},
  {id:"i6",title:"Decorative Metals -- $420K budget variance",severity:"medium",owner:"Andrey + O'Leary",phase:"Budget",due:"2026-04-15",open:true,notes:"LOW: $427K / HIGH: $847K -- single largest cost swing. Design decisions on metal features must be locked before budget can be confirmed.",ballWith:"hj"},
  {id:"i7",title:"CMO not yet hired",severity:"medium",owner:"Iliyas / Andrey",phase:"Pre-Opening",due:"2026-07-01",open:true,notes:"Needed for US brand launch and pre-sales campaign. Interviews in progress.",ballWith:"hj"},
  {id:"i8",title:"GMP contract with Wesbuild not signed",severity:"medium",owner:"Andrey + Gulnur",phase:"Construction",due:"2026-05-01",open:true,notes:"Pending bid drawings and permit. CLO Gulnur review required before execution.",ballWith:"hj"},
  {id:"i9",title:"LOC drawdown schedule not confirmed",severity:"medium",owner:"Andrey + JPMorgan",phase:"Finance",due:"2026-04-01",open:true,notes:"$1.4M LOC drawdown must align with Wesbuild payment milestones. Not yet scheduled.",ballWith:"hj"},
  {id:"i10",title:"AV/Sound vendor not scoped",severity:"low",owner:"Andrey + KZ Tech",phase:"Procurement",due:"2026-06-01",open:true,notes:"Must integrate with HJ proprietary app. Coordinate with Almaty tech team on spec before issuing RFQ.",ballWith:"hj"},
];

const budgetLines = [
  {id:"b1",label:"Demolition",low:8548,high:8548,committed:0,spent:0,category:"Hard Costs"},
  {id:"b2",label:"Concrete / Masonry / Fireproofing",low:16000,high:16000,committed:0,spent:0,category:"Hard Costs"},
  {id:"b3",label:"Metals (structural)",low:50000,high:50000,committed:0,spent:0,category:"Hard Costs"},
  {id:"b4",label:"Decorative Metals",low:427170,high:847048,committed:0,spent:0,category:"Hard Costs"},
  {id:"b5",label:"Glass / Glazing",low:251310,high:251310,committed:0,spent:0,category:"Hard Costs"},
  {id:"b6",label:"Doors, Frames & Hardware",low:118000,high:118000,committed:0,spent:0,category:"Hard Costs"},
  {id:"b7",label:"Drywall / Carpentry / Ceilings",low:397813,high:418750,committed:0,spent:0,category:"Hard Costs"},
  {id:"b8",label:"Architectural Woodwork",low:166579,high:195975,committed:0,spent:0,category:"Hard Costs"},
  {id:"b9",label:"Ceramic & Stone",low:364920,high:456150,committed:0,spent:0,category:"Hard Costs"},
  {id:"b10",label:"Flooring / VCT / Base",low:160620,high:200775,committed:0,spent:0,category:"Hard Costs"},
  {id:"b11",label:"Painting",low:119665,high:119665,committed:0,spent:0,category:"Hard Costs"},
  {id:"b12",label:"Decorative Plaster",low:54080,high:67600,committed:0,spent:0,category:"Hard Costs"},
  {id:"b13",label:"Acoustic Spray Soundproofing",low:91000,high:91000,committed:0,spent:0,category:"Hard Costs"},
  {id:"b14",label:"Toilet Partitions & Accessories",low:224825,high:264500,committed:0,spent:0,category:"Hard Costs"},
  {id:"b15",label:"Sprinkler / Fire Protection",low:85475,high:85475,committed:0,spent:0,category:"Hard Costs"},
  {id:"b16",label:"Plumbing",low:140009,high:155565,committed:0,spent:0,category:"Hard Costs"},
  {id:"b17",label:"HVAC",low:512850,high:512850,committed:0,spent:0,category:"Hard Costs"},
  {id:"b18",label:"Electrical",low:418828,high:418828,committed:0,spent:0,category:"Hard Costs"},
  {id:"b19",label:"Lighting & Controls",low:248242,high:292050,committed:0,spent:0,category:"Hard Costs"},
  {id:"b20",label:"Project Labor",low:141814,high:141814,committed:0,spent:0,category:"Hard Costs"},
  {id:"b21",label:"Miscellaneous",low:303580,high:357143,committed:0,spent:0,category:"Hard Costs"},
  {id:"b22",label:"General Conditions",low:386360,high:386360,committed:0,spent:0,category:"GC Costs"},
  {id:"b23",label:"GC Fee",low:253202,high:294467,committed:0,spent:0,category:"GC Costs"},
  {id:"b24",label:"Insurance",low:132930,high:154595,committed:0,spent:0,category:"GC Costs"},
  {id:"b25",label:"Contingency (20%)",low:1024666,high:1189071,committed:0,spent:0,category:"Contingency"},
  {id:"b26",label:"Architecture (Lawrence Group)",low:280000,high:280000,committed:180000,spent:60000,category:"Soft Costs"},
  {id:"b27",label:"Gym Equipment",low:690000,high:690000,committed:0,spent:0,category:"FF&E"},
  {id:"b28",label:"Light & Sound Systems",low:230000,high:230000,committed:0,spent:0,category:"FF&E"},
  {id:"b29",label:"IT & Infrastructure",low:150000,high:150000,committed:0,spent:0,category:"FF&E"},
  {id:"b30",label:"Operating Ramp-up (7-8 mo)",low:950000,high:950000,committed:0,spent:0,category:"Operating"},
  {id:"b31",label:"Corp HQ / Growth Platform",low:875000,high:875000,committed:120000,spent:85000,category:"Operating"},
];

/* ─── HELPERS ─── */
function daysUntil(d){if(!d||d==="--")return null;return Math.ceil((new Date(d)-new Date())/86400000);}
function fmt$(n){if(n>=1000000)return`$${(n/1000000).toFixed(2)}M`;if(n>=1000)return`$${(n/1000).toFixed(0)}K`;return`$${n}`;}
function pct(a,b){return b>0?Math.round((a/b)*100):0;}
function dateStamp(){return new Date().toISOString().split("T")[0];}
function genId(){return "id_"+Date.now()+"_"+Math.random().toString(36).slice(2,7);}

/* ─── STYLE MAPS (HJ Brand) ─── */
const SEV={
  critical:{bg:"#FEF2F2",border:"#EF4444",text:"#991B1B",dot:"#EF4444",badge:"#FEE2E2"},
  high:{bg:"#FFF7ED",border:"#F97316",text:"#9A3412",dot:"#F97316",badge:"#FFEDD5"},
  medium:{bg:"#FFFBEB",border:"#EAB308",text:"#854D0E",dot:"#EAB308",badge:"#FEF3C7"},
  low:{bg:"#F8FAFC",border:"#94A3B8",text:"#475569",dot:"#94A3B8",badge:"#F1F5F9"}
};
const VSTATUS={active:{color:"#7C3AED",label:"ACTIVE"},standby:{color:"#EAB308",label:"STANDBY"},pending:{color:"#F97316",label:"PENDING"},done:{color:"#94A3B8",label:"DONE"}};
const PRISK={low:{color:"#22C55E"},medium:{color:"#EAB308"},high:{color:"#EF4444"}};
const TSTATUS={"complete":{color:"#22C55E",label:"DONE"},"in-progress":{color:"#7C3AED",label:"IN PROG"},"not-started":{color:"#CBD5E1",label:"NOT STARTED"},"overdue":{color:"#EF4444",label:"OVERDUE"}};

/* ─── localStorage HOOK ─── */
function usePersistedState(key, defaultVal) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultVal;
    } catch { return defaultVal; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState];
}

/* ═══════════════════════════════════════════
   APP — HJ Brand Design
   ═══════════════════════════════════════════ */
export default function App(){
  const[tab,setTab]=usePersistedState("hj_tab","overview");
  const[phases,setPhases]=usePersistedState("hj_phases_v2",initPhases);
  const[vendors]=useState(initVendors);
  const[issues,setIssues]=usePersistedState("hj_issues_v2",initIssues);
  const[budget]=useState(budgetLines);
  const[selPhase,setSelPhase]=useState(null);
  const[selVendor,setSelVendor]=useState(null);
  const[selIssue,setSelIssue]=useState(null);
  const[issueFilter,setIssueFilter]=usePersistedState("hj_issueFilter","open");
  const[ballFilter,setBallFilter]=usePersistedState("hj_ballFilter","all");
  const[budgetView,setBudgetView]=usePersistedState("hj_budgetView","low");
  const[logs,setLogs]=usePersistedState("hj_logs",[]);
  const[logText,setLogText]=useState("");
  const[logTag,setLogTag]=useState("general");
  const[showNewIssue,setShowNewIssue]=useState(false);
  const[newIssue,setNewIssue]=useState({title:"",severity:"medium",owner:"",phase:"Design",due:"",notes:"",ballWith:"hj"});
  const[chat,setChat]=usePersistedState("hj_chat",[{role:"assistant",content:"Construction Command Center online. All data loaded from O'Leary Smartsheet and Wesbuild estimates. Use the tabs above to review timeline, vendors, budget, issues, and daily log."}]);
  const[msg,setMsg]=useState("");
  const chatRef=useRef(null);

  useEffect(()=>{chatRef.current?.scrollIntoView({behavior:"smooth"});},[chat]);

  const toggleTask=(pid,tid)=>setPhases(ps=>ps.map(p=>p.id===pid?{...p,tasks:p.tasks.map(t=>t.id===tid?{...t,done:!t.done,status:!t.done?"complete":"not-started"}:t)}:p));
  const toggleIssue=(id)=>setIssues(is=>is.map(i=>i.id===id?{...i,open:!i.open}:i));
  const addLog=()=>{if(!logText.trim())return;setLogs(prev=>[{id:genId(),date:dateStamp(),time:new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}),text:logText.trim(),tag:logTag},...prev]);setLogText("");};
  const deleteLog=(id)=>setLogs(prev=>prev.filter(l=>l.id!==id));
  const addIssue=()=>{if(!newIssue.title.trim())return;setIssues(prev=>[...prev,{...newIssue,id:genId(),open:true}]);setNewIssue({title:"",severity:"medium",owner:"",phase:"Design",due:"",notes:"",ballWith:"hj"});setShowNewIssue(false);};
  const sendMsg=()=>{if(!msg.trim())return;const q=msg.trim();setMsg("");setChat(c=>[...c,{role:"user",content:q},{role:"assistant",content:"This is an offline command center -- all project data is in the tabs above. For AI-powered analysis, an API key integration can be added."}]);};

  /* Computed */
  const totalLow=budget.reduce((s,b)=>s+b.low,0);
  const totalHigh=budget.reduce((s,b)=>s+b.high,0);
  const totalSpent=budget.reduce((s,b)=>s+b.spent,0);
  const totalCommitted=budget.reduce((s,b)=>s+b.committed,0);
  const openIssues=issues.filter(i=>i.open);
  const critIssues=openIssues.filter(i=>i.severity==="critical");
  const allTasks=phases.flatMap(p=>p.tasks);
  const doneTasks=allTasks.filter(t=>t.done);
  const overdueCount=allTasks.filter(t=>t.status==="overdue").length;
  const daysToHandover=daysUntil("2026-05-15");
  const daysToPermit=daysUntil("2026-04-01");
  const daysToOpen=daysUntil("2026-12-15");

  /* Ball tracker computed */
  const incompleteTasks=allTasks.filter(t=>!t.done);
  const ballItems=(bw)=>{
    const matchTasks=incompleteTasks.filter(t=>t.ballWith===bw);
    const matchIssues=openIssues.filter(i=>i.ballWith===bw);
    return{tasks:matchTasks,issues:matchIssues,total:matchTasks.length+matchIssues.length};
  };
  const partnerKeys=["lawrence","oleary","meyers","wesbuild"];
  const hjBall=ballItems("hj");
  const partnerBall={
    tasks:incompleteTasks.filter(t=>partnerKeys.includes(t.ballWith)),
    issues:openIssues.filter(i=>partnerKeys.includes(i.ballWith)),
    get total(){return this.tasks.length+this.issues.length;}
  };
  const landlordBall={
    tasks:incompleteTasks.filter(t=>t.ballWith==="landlord"),
    issues:openIssues.filter(i=>i.ballWith==="landlord"),
    get total(){return this.tasks.length+this.issues.length;}
  };

  /* Filtered issues: status filter then ball filter */
  const statusFiltered=issueFilter==="all"?issues:issueFilter==="open"?issues.filter(i=>i.open):issues.filter(i=>!i.open);
  const filtIssues=ballFilter==="all"?statusFiltered:ballFilter==="hj"?statusFiltered.filter(i=>i.ballWith==="hj"):ballFilter==="partners"?statusFiltered.filter(i=>partnerKeys.includes(i.ballWith)):statusFiltered.filter(i=>i.ballWith==="landlord"||i.ballWith==="external");
  const logsByDate=logs.reduce((acc,l)=>{(acc[l.date]=acc[l.date]||[]).push(l);return acc;},{});

  const TABS=[
    {id:"overview",label:"Overview"},
    {id:"timeline",label:"Timeline"},
    {id:"vendors",label:`Vendors (${vendors.length})`},
    {id:"issues",label:`Issues${critIssues.length?` ${critIssues.length}`:""}`},
    {id:"budget",label:"Budget"},
    {id:"log",label:`Log (${logs.length})`},
    {id:"ai",label:"Ask AI"},
  ];

  const LOG_TAGS=["general","decision","blocker","call","site-visit","finance"];
  const TAG_COLORS={general:"#64748B",decision:"#7C3AED",blocker:"#EF4444",call:"#8B5CF6","site-visit":"#22C55E",finance:"#EAB308"};

  /* Shared styles */
  const card={background:"#fff",borderRadius:12,border:"1px solid #E2E8F0",padding:"16px 20px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"};
  const inputS={background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:8,padding:"8px 12px",color:"#1E293B",fontSize:13,fontFamily:"'Inter',sans-serif",width:"100%"};
  const btnPrimary={background:"#7C3AED",border:"none",borderRadius:8,padding:"8px 16px",color:"#fff",cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif",fontWeight:600};
  const pill=(active,color="#7C3AED")=>({background:active?`${color}10`:"#F8FAFC",border:`1px solid ${active?color:"#E2E8F0"}`,color:active?color:"#64748B",padding:"5px 14px",borderRadius:20,fontSize:12,cursor:"pointer",fontFamily:"'Inter',sans-serif",fontWeight:500});

  /* Ball with badge component */
  const BallBadge=({bw})=>{
    if(!bw)return null;
    return <span style={{fontSize:10,fontWeight:600,color:PARTY_COLORS[bw],background:PARTY_BG[bw],padding:"2px 8px",borderRadius:10,border:`1px solid ${PARTY_COLORS[bw]}33`,whiteSpace:"nowrap"}}>{PARTIES[bw]}</span>;
  };

  /* Ball tracker item renderer */
  const BallItem=({label,due,bw})=>(
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid #F1F5F9",fontSize:12}}>
      <div style={{width:6,height:6,borderRadius:"50%",background:PARTY_COLORS[bw]||"#94A3B8",flexShrink:0}}/>
      <div style={{flex:1,color:"#1E293B",fontWeight:500,lineHeight:1.4}}>{label}</div>
      {due&&due!=="--"&&<div style={{fontSize:10,color:"#94A3B8",whiteSpace:"nowrap",fontWeight:500}}>{due}</div>}
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"#F5F3FF",color:"#1E293B",fontFamily:"'Inter','system-ui',sans-serif",fontSize:14}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#F5F3FF}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:#F1F5F9}::-webkit-scrollbar-thumb{background:#C4B5FD;border-radius:4px}
        .card-hover:hover{box-shadow:0 4px 12px rgba(124,58,237,0.1);border-color:#C4B5FD !important;cursor:pointer}
        textarea:focus,input:focus,select:focus{outline:none;border-color:#7C3AED !important;box-shadow:0 0 0 3px rgba(124,58,237,0.1)}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.fi{animation:fadeUp .3s ease}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}.pulse{animation:pulse 1.5s infinite}
        .pb{transition:width .4s ease}
        button{transition:all .15s ease}
        button:hover{opacity:.9}
        @media(max-width:640px){
          .g4{grid-template-columns:repeat(2,1fr)!important}
          .g3{grid-template-columns:repeat(2,1fr)!important}
          .g2{grid-template-columns:1fr!important}
          .hr{flex-direction:column!important;gap:12px!important}
          .cr{justify-content:flex-start!important}
          .budget-grid{grid-template-columns:2fr 1fr 60px!important}
          .budget-hide{display:none!important}
          .tab-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
          .hdr-title{font-size:22px!important}
          .ball-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <div style={{background:"linear-gradient(135deg, #7C3AED 0%, #A78BFA 50%, #C4B5FD 100%)",padding:"20px 24px 0",borderRadius:"0 0 20px 20px",boxShadow:"0 4px 20px rgba(124,58,237,0.2)"}}>
        <div className="hr" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <img src="/hj-logo.png" alt="Hero's Journey" style={{height:44,width:"auto",flexShrink:0,filter:"brightness(0) invert(1)",opacity:0.95}}/>
            <div>
              <div className="hdr-title" style={{fontSize:28,fontWeight:900,color:"#fff",lineHeight:1,letterSpacing:"-0.02em"}}>225 Fifth Avenue</div>
              <div style={{fontSize:13,fontWeight:500,color:"rgba(255,255,255,0.7)",marginTop:4,letterSpacing:"0.05em"}}>NYC Flagship &middot; Construction Command Center &middot; 17,095 SF</div>
            </div>
          </div>
          <div>
            <div className="cr" style={{display:"flex",gap:20,justifyContent:"flex-end",marginBottom:8}}>
              {[{v:daysToPermit,l:"PERMIT",w:daysToPermit<30},{v:daysToHandover,l:"HANDOVER",w:false},{v:daysToOpen,l:"SOFT OPEN",w:false}].map((d,i)=>(
                <div key={i} style={{textAlign:"center"}}>
                  <div style={{fontSize:24,fontWeight:800,color:d.w?"#FDE68A":"#fff"}}>{d.v}</div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.6)",letterSpacing:"0.1em",fontWeight:600}}>{d.l}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:6,justifyContent:"flex-end",flexWrap:"wrap"}}>
              {critIssues.length>0&&<div style={{background:"rgba(239,68,68,0.2)",backdropFilter:"blur(8px)",border:"1px solid rgba(239,68,68,0.4)",borderRadius:20,padding:"3px 10px",display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600}}><div className="pulse" style={{width:6,height:6,borderRadius:"50%",background:"#FCA5A5"}}/><span style={{color:"#FEE2E2"}}>{critIssues.length} Critical</span></div>}
              {overdueCount>0&&<div style={{background:"rgba(249,115,22,0.2)",border:"1px solid rgba(249,115,22,0.4)",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600,color:"#FFEDD5"}}>{overdueCount} Overdue</div>}
            </div>
          </div>
        </div>
        <div className="tab-scroll" style={{display:"flex",gap:2,overflowX:"auto",paddingBottom:0}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"10px 16px",background:tab===t.id?"#fff":"transparent",border:"none",borderRadius:"10px 10px 0 0",color:tab===t.id?"#7C3AED":"rgba(255,255,255,0.7)",fontSize:12,fontWeight:tab===t.id?700:500,cursor:"pointer",fontFamily:"'Inter',sans-serif",whiteSpace:"nowrap",transition:"all .15s"}}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"20px 24px",maxWidth:1000,margin:"0 auto"}}>

        {/* ═══ OVERVIEW ═══ */}
        {tab==="overview"&&(
          <div className="fi">

            {/* Ball Tracker */}
            <div className="ball-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
              {[
                {key:"hj",label:"Our Court (HJ)",color:PARTY_COLORS.hj,bg:PARTY_BG.hj,data:hjBall},
                {key:"partners",label:"Partners",color:"#3B82F6",bg:"#EFF6FF",data:partnerBall},
                {key:"landlord",label:"Landlord",color:PARTY_COLORS.landlord,bg:PARTY_BG.landlord,data:landlordBall},
              ].map(col=>(
                <div key={col.key} style={{...card,background:col.bg,border:`1px solid ${col.color}33`,padding:"14px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={{fontSize:12,fontWeight:700,color:col.color,letterSpacing:"0.03em"}}>{col.label}</div>
                    <div style={{fontSize:20,fontWeight:900,color:col.color}}>{col.data.total}</div>
                  </div>
                  <div style={{maxHeight:200,overflowY:"auto"}}>
                    {col.data.issues.map(i=>(
                      <BallItem key={i.id} label={i.title} due={i.due} bw={i.ballWith}/>
                    ))}
                    {col.data.tasks.map(t=>(
                      <BallItem key={t.id} label={t.text} due={null} bw={t.ballWith}/>
                    ))}
                    {col.data.total===0&&<div style={{fontSize:12,color:"#94A3B8",fontStyle:"italic",padding:"8px 0"}}>All clear</div>}
                  </div>
                </div>
              ))}
            </div>

            <div className="g4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
              {[{label:"GC Budget LOW",val:fmt$(totalLow),sub:`HIGH: ${fmt$(totalHigh)}`,c:"#7C3AED",bg:"linear-gradient(135deg,#7C3AED,#A78BFA)"},{label:"Spent to Date",val:fmt$(totalSpent),sub:`committed: ${fmt$(totalCommitted)}`,c:"#EF4444",bg:"linear-gradient(135deg,#EF4444,#F87171)"},{label:"Tasks Complete",val:`${doneTasks.length}/${allTasks.length}`,sub:`${overdueCount} overdue`,c:overdueCount?"#F97316":"#22C55E",bg:overdueCount?"linear-gradient(135deg,#F97316,#FB923C)":"linear-gradient(135deg,#22C55E,#4ADE80)"},{label:"Open Issues",val:openIssues.length,sub:`${critIssues.length} critical`,c:critIssues.length?"#EF4444":"#64748B",bg:critIssues.length?"linear-gradient(135deg,#EF4444,#F87171)":"linear-gradient(135deg,#64748B,#94A3B8)"}].map((s,i)=>(
                <div key={i} style={{...card,background:s.bg,color:"#fff",border:"none"}}>
                  <div style={{fontSize:11,fontWeight:600,opacity:.8,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>{s.label}</div>
                  <div style={{fontSize:28,fontWeight:900}}>{s.val}</div>
                  <div style={{fontSize:11,opacity:.7,marginTop:4}}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{...card,background:"linear-gradient(135deg,#F5F3FF,#EDE9FE)",border:"1px solid #DDD6FE",marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:"#7C3AED",letterSpacing:"0.05em",marginBottom:10}}>PREMISES -- 225 FIFTH AVENUE, NEW YORK NY 10010</div>
              <div className="g4" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {[{l:"Useable SF",v:"17,095"},{l:"Rentable SF",v:"19,451"},{l:"Ground Floor",v:"1,510 SF (lobby)"},{l:"Lower Level",v:"17,941 SF (gym)"},{l:"Prop. Share",v:"46.85% of building"},{l:"Competitor Exclusion",v:"<4,500 SF protected"}].map((f,i)=>(
                  <div key={i} style={{fontSize:13}}><span style={{color:"#7C3AED",fontWeight:600}}>{f.l}: </span><span style={{color:"#1E293B"}}>{f.v}</span></div>
                ))}
              </div>
            </div>

            <div style={{...card,marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:700,color:"#7C3AED",letterSpacing:"0.05em"}}>SMARTSHEET PHASES -- O'LEARY GROUP</div>
                <div style={{fontSize:11,color:"#94A3B8"}}>tap to open</div>
              </div>
              {phases.map(p=>{
                const done=p.tasks.filter(t=>t.done).length;
                const ov=p.tasks.filter(t=>t.status==="overdue").length;
                return(
                  <div key={p.id} className="card-hover" onClick={()=>{setSelPhase(p);setTab("timeline");}} style={{padding:"12px 10px",borderBottom:"1px solid #F1F5F9",borderRadius:8,marginBottom:4}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                        <div style={{width:10,height:10,borderRadius:"50%",background:p.color,boxShadow:p.status==="active"?`0 0 10px ${p.color}66`:"none"}}/>
                        <span style={{fontSize:14,fontWeight:600,color:"#1E293B"}}>{p.name}</span>
                        {p.status==="active"&&<span style={{fontSize:10,fontWeight:700,color:"#7C3AED",background:"#F5F3FF",padding:"2px 8px",borderRadius:10,border:"1px solid #DDD6FE"}}>ACTIVE</span>}
                        {ov>0&&<span style={{fontSize:10,fontWeight:700,color:"#EF4444",background:"#FEF2F2",padding:"2px 8px",borderRadius:10,border:"1px solid #FECACA"}}>{ov} OVERDUE</span>}
                      </div>
                      <div style={{fontSize:12,color:"#64748B",fontWeight:600}}>{p.weeks}w &middot; {done}/{p.tasks.length}</div>
                    </div>
                    <div style={{background:"#F1F5F9",borderRadius:6,height:4}}>
                      <div className="pb" style={{width:`${Math.round((done/p.tasks.length)*100)}%`,height:4,background:p.color,borderRadius:6}}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {critIssues.length>0&&(
              <div style={{...card,background:"#FEF2F2",border:"1px solid #FECACA",marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:700,color:"#EF4444",letterSpacing:"0.05em",marginBottom:12}}>CRITICAL BLOCKERS</div>
                {critIssues.map(i=>(
                  <div key={i.id} className="card-hover" onClick={()=>{setSelIssue(i);setTab("issues");}} style={{padding:"10px 0",borderBottom:"1px solid #FECACA",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:"#991B1B",marginBottom:2}}>{i.title}</div>
                      <div style={{fontSize:12,color:"#DC2626"}}>{i.notes.substring(0,90)}...</div>
                    </div>
                    <div style={{fontSize:11,color:"#EF4444",fontWeight:600,whiteSpace:"nowrap",marginLeft:12}}>Due {i.due}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={card}>
              <div style={{fontSize:12,fontWeight:700,color:"#7C3AED",letterSpacing:"0.05em",marginBottom:12}}>VENDOR STATUS</div>
              <div className="g2" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
                {vendors.map(v=>(
                  <div key={v.id} className="card-hover" onClick={()=>{setSelVendor(v);setTab("vendors");}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"#F8FAFC",borderRadius:10,border:`1px solid ${v.risk==="high"?"#FECACA":v.risk==="medium"?"#FDE68A":"#E2E8F0"}`}}>
                    <div><div style={{fontSize:13,fontWeight:600,color:"#1E293B"}}>{v.name}</div><div style={{fontSize:11,color:"#94A3B8"}}>{v.role}</div></div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                      <span style={{fontSize:10,fontWeight:700,color:VSTATUS[v.status].color}}>{VSTATUS[v.status].label}</span>
                      <span style={{fontSize:10,fontWeight:600,color:PRISK[v.risk].color}}>{v.risk} risk</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ TIMELINE ═══ */}
        {tab==="timeline"&&(
          <div className="fi">
            <div style={{...card,background:"#F5F3FF",border:"1px solid #DDD6FE",marginBottom:14,fontSize:12,color:"#7C3AED",fontWeight:500}}>
              Source: O'Leary Group &middot; "Hero's Journey Flatiron Schedule" &middot; Click tasks to toggle complete
            </div>
            {phases.map(p=>{
              const isOpen=selPhase?.id===p.id;
              const done=p.tasks.filter(t=>t.done).length;
              const ov=p.tasks.filter(t=>t.status==="overdue").length;
              return(
                <div key={p.id} style={{marginBottom:10,...card,border:`1px solid ${isOpen?p.color:"#E2E8F0"}`,padding:0,overflow:"hidden"}}>
                  <div className="card-hover" onClick={()=>setSelPhase(isOpen?null:p)} style={{padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                      <div style={{width:12,height:12,borderRadius:"50%",background:p.color,boxShadow:p.status==="active"?`0 0 12px ${p.color}66`:"none"}}/>
                      <div>
                        <div style={{fontSize:15,fontWeight:700,color:"#1E293B"}}>{p.name}</div>
                        <div style={{fontSize:11,color:"#94A3B8",fontWeight:500}}>{p.weeks}w / {p.days}d &middot; {p.start} &rarr; {p.end}</div>
                      </div>
                      {p.status==="active"&&<span style={{fontSize:10,fontWeight:700,color:"#7C3AED",background:"#F5F3FF",padding:"3px 10px",borderRadius:10,border:"1px solid #DDD6FE"}}>ACTIVE</span>}
                      {ov>0&&<span style={{fontSize:10,fontWeight:700,color:"#EF4444",background:"#FEF2F2",padding:"3px 10px",borderRadius:10,border:"1px solid #FECACA"}}>{ov} OVERDUE</span>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:14}}>
                      <div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:800,color:p.color}}>{done}/{p.tasks.length}</div><div style={{fontSize:10,color:"#94A3B8",fontWeight:500}}>done</div></div>
                      <div style={{color:"#CBD5E1",fontSize:14}}>{isOpen?"▲":"▼"}</div>
                    </div>
                  </div>
                  {isOpen&&(
                    <div style={{padding:"0 20px 16px",borderTop:`1px solid ${p.color}22`}}>
                      <div style={{background:"#F1F5F9",borderRadius:6,height:4,margin:"12px 0 14px"}}>
                        <div style={{width:`${Math.round((done/p.tasks.length)*100)}%`,height:4,background:p.color,borderRadius:6,transition:"width .4s"}}/>
                      </div>
                      {p.tasks.map(t=>(
                        <div key={t.id} className="card-hover" onClick={()=>toggleTask(p.id,t.id)} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"10px 8px",borderRadius:8,borderBottom:"1px solid #F1F5F9",opacity:t.done?.5:1,background:t.status==="overdue"?"#FEF2F2":"transparent"}}>
                          <div style={{width:20,height:20,borderRadius:6,flexShrink:0,marginTop:1,background:t.done?p.color:"#fff",border:`2px solid ${t.done?p.color:t.status==="overdue"?"#EF4444":"#CBD5E1"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                            {t.done&&<span style={{color:"#fff",fontSize:11,fontWeight:800}}>&#10003;</span>}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                              <span style={{fontSize:13,fontWeight:t.done?400:600,color:t.done?"#94A3B8":t.status==="overdue"?"#991B1B":"#1E293B",textDecoration:t.done?"line-through":"none"}}>{t.text}</span>
                              <span style={{fontSize:10,fontWeight:700,color:TSTATUS[t.status]?.color,background:`${TSTATUS[t.status]?.color}15`,padding:"2px 8px",borderRadius:10}}>{TSTATUS[t.status]?.label}</span>
                              {t.ballWith&&<span style={{width:8,height:8,borderRadius:"50%",background:PARTY_COLORS[t.ballWith]||"#94A3B8",display:"inline-block",flexShrink:0}} title={PARTIES[t.ballWith]||t.ballWith}/>}
                              {t.duration&&<span style={{fontSize:10,color:"#94A3B8",fontWeight:500}}>{t.duration}</span>}
                            </div>
                            <div style={{fontSize:11,color:"#94A3B8",marginTop:3,fontWeight:500}}>Owner: {t.owner}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ VENDORS ═══ */}
        {tab==="vendors"&&(
          <div className="fi">
            <div className="g2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:selVendor?14:0}}>
              {vendors.map(v=>(
                <div key={v.id} className="card-hover" onClick={()=>setSelVendor(selVendor?.id===v.id?null:v)} style={{...card,border:`1px solid ${selVendor?.id===v.id?"#7C3AED":v.risk==="high"?"#FECACA":v.risk==="medium"?"#FDE68A":"#E2E8F0"}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><div style={{fontSize:15,fontWeight:700,color:"#1E293B"}}>{v.name}</div><span style={{fontSize:10,fontWeight:700,color:VSTATUS[v.status].color}}>{VSTATUS[v.status].label}</span></div>
                  <div style={{fontSize:12,color:"#64748B",fontWeight:500,marginBottom:8}}>{v.role}</div>
                  <div style={{fontSize:12,color:"#94A3B8",marginBottom:8}}>{v.notes.substring(0,80)}...</div>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,fontWeight:700,color:PRISK[v.risk].color}}>{v.risk.toUpperCase()} RISK</span>{v.budget>0&&<span style={{fontSize:11,color:"#64748B",fontWeight:600}}>{fmt$(v.budget)}</span>}</div>
                </div>
              ))}
            </div>
            {selVendor&&(
              <div className="fi" style={{...card,border:"1px solid #7C3AED"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
                  <div><div style={{fontSize:22,fontWeight:900,color:"#7C3AED"}}>{selVendor.name}</div><div style={{fontSize:12,color:"#64748B",fontWeight:500}}>{selVendor.role} &middot; {selVendor.contract}</div></div>
                  <button onClick={()=>setSelVendor(null)} style={{background:"#F1F5F9",border:"none",borderRadius:8,width:32,height:32,color:"#64748B",cursor:"pointer",fontSize:16,fontWeight:700}}>x</button>
                </div>
                <div style={{fontSize:13,color:"#475569",marginBottom:14,lineHeight:1.7}}>{selVendor.notes}</div>
                <div className="g2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"#7C3AED",letterSpacing:"0.05em",marginBottom:8}}>DELIVERABLES</div>
                    {selVendor.deliverables.map((d,i)=><div key={i} style={{fontSize:12,color:"#475569",padding:"4px 0",borderBottom:"1px solid #F1F5F9"}}>&rarr; {d}</div>)}
                  </div>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"#7C3AED",letterSpacing:"0.05em",marginBottom:8}}>NEXT ACTION</div>
                    <div style={{fontSize:13,color:"#7C3AED",fontWeight:600,marginBottom:8,lineHeight:1.6}}>{selVendor.nextAction}</div>
                    <div style={{fontSize:11,color:"#94A3B8",fontWeight:500}}>Due: {selVendor.dueDate}</div>
                    {selVendor.dueDate!=="--"&&daysUntil(selVendor.dueDate)!==null&&<div style={{fontSize:12,fontWeight:700,color:daysUntil(selVendor.dueDate)<14?"#EF4444":"#EAB308",marginTop:4}}>{daysUntil(selVendor.dueDate)} days remaining</div>}
                    {selVendor.budget>0&&<div style={{marginTop:12}}><div style={{fontSize:11,fontWeight:700,color:"#7C3AED",letterSpacing:"0.05em",marginBottom:4}}>BUDGET</div><div style={{fontSize:22,fontWeight:900,color:"#7C3AED"}}>{fmt$(selVendor.budget)}</div><div style={{fontSize:11,color:"#94A3B8",fontWeight:500}}>Spent: {fmt$(selVendor.spent)}</div></div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ ISSUES ═══ */}
        {tab==="issues"&&(
          <div className="fi">
            {/* Ball filter pills */}
            <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
              {[{k:"all",l:"All"},{k:"hj",l:"Our Court"},{k:"partners",l:"Partners"},{k:"landlord",l:"Landlord"}].map(f=>(
                <button key={f.k} onClick={()=>setBallFilter(f.k)} style={pill(ballFilter===f.k,f.k==="hj"?PARTY_COLORS.hj:f.k==="partners"?"#3B82F6":f.k==="landlord"?PARTY_COLORS.landlord:"#7C3AED")}>
                  {f.l}
                </button>
              ))}
            </div>

            <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",justifyContent:"space-between"}}>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["all","open","closed"].map(f=>(
                  <button key={f} onClick={()=>setIssueFilter(f)} style={pill(issueFilter===f)}>
                    {f} ({f==="all"?issues.length:f==="open"?issues.filter(i=>i.open).length:issues.filter(i=>!i.open).length})
                  </button>
                ))}
              </div>
              <button onClick={()=>setShowNewIssue(!showNewIssue)} style={{...btnPrimary,background:showNewIssue?"#94A3B8":"#7C3AED"}}>
                {showNewIssue?"Cancel":"+ New Issue"}
              </button>
            </div>

            {showNewIssue&&(
              <div className="fi" style={{...card,border:"1px solid #7C3AED",marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:700,color:"#7C3AED",letterSpacing:"0.05em",marginBottom:12}}>NEW ISSUE</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <input value={newIssue.title} onChange={e=>setNewIssue(p=>({...p,title:e.target.value}))} placeholder="Issue title..." style={inputS}/>
                  <div className="g4" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
                    <select value={newIssue.severity} onChange={e=>setNewIssue(p=>({...p,severity:e.target.value}))} style={inputS}>
                      {["critical","high","medium","low"].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                    </select>
                    <input value={newIssue.owner} onChange={e=>setNewIssue(p=>({...p,owner:e.target.value}))} placeholder="Owner..." style={inputS}/>
                    <select value={newIssue.phase} onChange={e=>setNewIssue(p=>({...p,phase:e.target.value}))} style={inputS}>
                      {["Design","Procurement","Budget","Construction","Finance","Pre-Opening"].map(p=><option key={p} value={p}>{p}</option>)}
                    </select>
                    <input type="date" value={newIssue.due} onChange={e=>setNewIssue(p=>({...p,due:e.target.value}))} style={inputS}/>
                    <select value={newIssue.ballWith} onChange={e=>setNewIssue(p=>({...p,ballWith:e.target.value}))} style={inputS}>
                      {Object.entries(PARTIES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <textarea value={newIssue.notes} onChange={e=>setNewIssue(p=>({...p,notes:e.target.value}))} placeholder="Notes / context..." rows={2} style={{...inputS,resize:"vertical"}}/>
                  <button onClick={addIssue} disabled={!newIssue.title.trim()} style={{...btnPrimary,opacity:newIssue.title.trim()?1:.4,alignSelf:"flex-start"}}>Add Issue</button>
                </div>
              </div>
            )}

            {filtIssues.map(issue=>{
              const s=SEV[issue.severity];
              const isOpen=selIssue?.id===issue.id;
              return(
                <div key={issue.id} style={{marginBottom:8,...card,background:s.bg,border:`1px solid ${isOpen?s.border:s.border+"44"}`,padding:0,overflow:"hidden"}}>
                  <div className="card-hover" onClick={()=>setSelIssue(isOpen?null:issue)} style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:issue.open?s.dot:"#CBD5E1",flexShrink:0}}/>
                      <div style={{minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:issue.open?s.text:"#94A3B8",textDecoration:issue.open?"none":"line-through"}}>{issue.title}</div>
                        <div style={{fontSize:11,color:"#94A3B8",marginTop:2,fontWeight:500}}>{issue.phase} &middot; {issue.owner}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                      {issue.ballWith&&<BallBadge bw={issue.ballWith}/>}
                      <span style={{fontSize:10,fontWeight:700,color:s.text,background:s.badge,padding:"3px 8px",borderRadius:10}}>{issue.severity.toUpperCase()}</span>
                      <span style={{fontSize:11,color:"#94A3B8",fontWeight:500}}>{issue.due}</span>
                    </div>
                  </div>
                  {isOpen&&(
                    <div style={{padding:"0 16px 14px",borderTop:`1px solid ${s.border}33`}}>
                      <div style={{fontSize:13,color:s.text,margin:"12px 0",lineHeight:1.7}}>{issue.notes}</div>
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={()=>toggleIssue(issue.id)} style={{...btnPrimary,background:issue.open?"#22C55E":"#94A3B8"}}>{issue.open?"Mark Resolved":"Reopen"}</button>
                        <button onClick={()=>setSelIssue(null)} style={{...btnPrimary,background:"#F1F5F9",color:"#64748B"}}>Close</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ BUDGET ═══ */}
        {tab==="budget"&&(
          <div className="fi">
            <div className="g3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
              {[{label:"GC Total LOW",val:fmt$(totalLow),sub:"base estimate",bg:"linear-gradient(135deg,#22C55E,#4ADE80)"},{label:"GC Total HIGH",val:fmt$(totalHigh),sub:`+${fmt$(totalHigh-totalLow)} variance`,bg:"linear-gradient(135deg,#7C3AED,#A78BFA)"},{label:"Spent to Date",val:fmt$(totalSpent),sub:`committed ${fmt$(totalCommitted)}`,bg:"linear-gradient(135deg,#EF4444,#F87171)"}].map((s,i)=>(
                <div key={i} style={{...card,background:s.bg,border:"none",color:"#fff",textAlign:"center"}}>
                  <div style={{fontSize:11,fontWeight:600,opacity:.8,letterSpacing:"0.05em",marginBottom:4}}>{s.label}</div>
                  <div style={{fontSize:26,fontWeight:900}}>{s.val}</div>
                  <div style={{fontSize:11,opacity:.7}}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              {["low","high"].map(v=>(
                <button key={v} onClick={()=>setBudgetView(v)} style={pill(budgetView===v)}>
                  {v} estimate
                </button>
              ))}
            </div>
            <div style={card}>
              <div style={{fontSize:12,fontWeight:700,color:"#7C3AED",letterSpacing:"0.05em",marginBottom:10}}>LINE ITEMS -- {budgetView.toUpperCase()} SCENARIO &middot; 17,095 USEABLE SF</div>
              <div className="budget-grid" style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 60px",gap:0,padding:"6px 0",borderBottom:"2px solid #E2E8F0",marginBottom:4}}>
                <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",letterSpacing:"0.05em"}}>LINE ITEM</div>
                <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",letterSpacing:"0.05em"}}>ESTIMATE</div>
                <div className="budget-hide" style={{fontSize:10,fontWeight:700,color:"#94A3B8",letterSpacing:"0.05em"}}>COMMITTED</div>
                <div className="budget-hide" style={{fontSize:10,fontWeight:700,color:"#94A3B8",letterSpacing:"0.05em"}}>SPENT</div>
                <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",letterSpacing:"0.05em"}}>BURN</div>
              </div>
              {[...new Set(budget.map(b=>b.category))].map(cat=>{
                const items=budget.filter(b=>b.category===cat);
                const catTotal=items.reduce((s,b)=>s+(budgetView==="low"?b.low:b.high),0);
                return(
                  <div key={cat}>
                    <div style={{fontSize:11,fontWeight:700,color:"#7C3AED",padding:"10px 0 6px",borderBottom:"2px solid #EDE9FE"}}>{cat.toUpperCase()} -- {fmt$(catTotal)}</div>
                    {items.map(b=>{
                      const val=budgetView==="low"?b.low:b.high;
                      const burn=pct(b.spent,val);
                      const hasRange=b.low!==b.high;
                      return(
                        <div key={b.id} className="budget-grid" style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 60px",gap:0,padding:"8px 0",borderBottom:"1px solid #F1F5F9"}}>
                          <div>
                            <div style={{fontSize:13,fontWeight:500,color:"#1E293B"}}>{b.label}</div>
                            {hasRange&&<div style={{fontSize:10,color:"#94A3B8"}}>L:{fmt$(b.low)} H:{fmt$(b.high)}</div>}
                          </div>
                          <div style={{fontSize:13,color:"#475569",fontWeight:600}}>{fmt$(val)}</div>
                          <div className="budget-hide" style={{fontSize:13,color:"#7C3AED",fontWeight:500}}>{fmt$(b.committed)}</div>
                          <div className="budget-hide" style={{fontSize:13,color:b.spent>0?"#EF4444":"#CBD5E1",fontWeight:500}}>{fmt$(b.spent)}</div>
                          <div>
                            <div style={{fontSize:11,fontWeight:600,color:burn>80?"#EF4444":burn>0?"#EAB308":"#CBD5E1"}}>{burn}%</div>
                            <div style={{background:"#F1F5F9",borderRadius:4,height:4,marginTop:3,width:50}}><div style={{width:`${Math.min(burn,100)}%`,height:4,background:burn>80?"#EF4444":"#7C3AED",borderRadius:4}}/></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div style={{...card,background:"linear-gradient(135deg,#F5F3FF,#EDE9FE)",border:"1px solid #DDD6FE",marginTop:14}}>
              <div style={{fontSize:11,fontWeight:700,color:"#7C3AED",letterSpacing:"0.05em",marginBottom:10}}>FUNDING STATUS</div>
              {[{l:"Cash on hand",v:"~$4,000,000",c:"#22C55E"},{l:"Bridge round raising",v:"$5,000,000",c:"#7C3AED"},{l:"LOC -- JPMorgan (Iliyas guarantee)",v:"$1,400,000",c:"#EAB308"}].map((f,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #DDD6FE"}}><span style={{fontSize:13,color:"#475569",fontWeight:500}}>{f.l}</span><span style={{fontSize:13,color:f.c,fontWeight:700}}>{f.v}</span></div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0"}}><span style={{fontSize:14,color:"#7C3AED",fontWeight:700}}>Total available</span><span style={{fontSize:20,fontWeight:900,color:"#7C3AED"}}>~$10,400,000</span></div>
            </div>
          </div>
        )}

        {/* ═══ DAILY LOG ═══ */}
        {tab==="log"&&(
          <div className="fi">
            <div style={card}>
              <div style={{fontSize:12,fontWeight:700,color:"#7C3AED",letterSpacing:"0.05em",marginBottom:12}}>NEW LOG ENTRY</div>
              <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                {LOG_TAGS.map(t=>(
                  <button key={t} onClick={()=>setLogTag(t)} style={pill(logTag===t,TAG_COLORS[t])}>
                    {t}
                  </button>
                ))}
              </div>
              <div style={{display:"flex",gap:10}}>
                <textarea value={logText} onChange={e=>setLogText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();addLog();}}} placeholder="What happened today? Decisions, calls, site updates..." rows={2} style={{...inputS,flex:1,resize:"vertical"}}/>
                <button onClick={addLog} disabled={!logText.trim()} style={{...btnPrimary,opacity:logText.trim()?1:.4,alignSelf:"flex-end",padding:"12px 20px"}}>Log</button>
              </div>
            </div>

            {logs.length===0&&(
              <div style={{textAlign:"center",padding:"48px 20px",color:"#94A3B8",fontSize:13,fontWeight:500}}>
                No log entries yet. Add your first daily note above.
              </div>
            )}

            {Object.entries(logsByDate).map(([date,entries])=>(
              <div key={date} style={{marginTop:16}}>
                <div style={{fontSize:12,fontWeight:700,color:"#7C3AED",letterSpacing:"0.05em",padding:"8px 0",borderBottom:"2px solid #EDE9FE",marginBottom:8}}>
                  {new Date(date+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric",year:"numeric"})}
                  <span style={{color:"#94A3B8",marginLeft:8,fontWeight:500}}>{entries.length} {entries.length===1?"entry":"entries"}</span>
                </div>
                {entries.map(entry=>(
                  <div key={entry.id} style={{display:"flex",gap:12,padding:"10px 8px",borderBottom:"1px solid #F1F5F9",alignItems:"flex-start"}}>
                    <div style={{fontSize:11,color:"#94A3B8",whiteSpace:"nowrap",marginTop:2,fontWeight:500}}>{entry.time}</div>
                    <span style={{fontSize:10,fontWeight:700,color:TAG_COLORS[entry.tag]||"#64748B",background:`${TAG_COLORS[entry.tag]||"#64748B"}15`,padding:"2px 8px",borderRadius:10,flexShrink:0,marginTop:1}}>{entry.tag.toUpperCase()}</span>
                    <div style={{flex:1,fontSize:13,color:"#1E293B",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{entry.text}</div>
                    <button onClick={()=>deleteLog(entry.id)} style={{background:"#F1F5F9",border:"none",borderRadius:6,color:"#94A3B8",cursor:"pointer",fontSize:12,flexShrink:0,padding:"2px 8px",fontWeight:700}} title="Delete">x</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ═══ AI ═══ */}
        {tab==="ai"&&(
          <div className="fi" style={{display:"flex",flexDirection:"column",height:"calc(100vh - 240px)",minHeight:420}}>
            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:12,paddingBottom:12}}>
              {chat.map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                  <div style={{maxWidth:"85%",padding:"12px 16px",borderRadius:14,background:m.role==="user"?"#7C3AED":"#fff",border:m.role==="user"?"none":"1px solid #E2E8F0",fontSize:13,lineHeight:1.7,color:m.role==="user"?"#fff":"#1E293B",boxShadow:"0 1px 3px rgba(0,0,0,0.04)",whiteSpace:"pre-wrap"}}>
                    {m.role==="assistant"&&<div style={{fontSize:10,color:"#7C3AED",fontWeight:700,letterSpacing:"0.05em",marginBottom:4}}>CONSTRUCTION AI</div>}
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={chatRef}/>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {["What's blocking permit filing?","Decorative metals risk?","Client Review -- what do I do?","Equipment order deadline?","GMP contract next steps?"].map((q,i)=>(
                <button key={i} onClick={()=>setMsg(q)} style={pill(false)}>{q}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              <textarea value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}} placeholder="Ask about timeline, budget, permits, vendors..." rows={2} style={{...inputS,flex:1,resize:"none"}}/>
              <button onClick={sendMsg} disabled={!msg.trim()} style={{...btnPrimary,opacity:msg.trim()?1:.4,padding:"0 20px",fontSize:18}}>&rarr;</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
