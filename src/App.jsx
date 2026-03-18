import { useState, useRef, useEffect } from "react";

/* ─── INITIAL DATA ─── */
const initPhases = [
  {
    id:"p1", name:"AOR Drawing Development", color:"#f59e0b",
    start:"2025-11-01", end:"2026-04-15", status:"active", weeks:17.8, days:89,
    tasks:[
      {id:"t1",text:"Survey",done:false,status:"in-progress",owner:"Lawrence Group",duration:""},
      {id:"t2",text:"Pre-Design",done:false,status:"not-started",owner:"Lawrence Group",duration:"19d"},
      {id:"t3",text:"Team Meeting",done:false,status:"not-started",owner:"Andrey + Lawrence",duration:"1w"},
      {id:"t4",text:"SD — Schematic Design",done:false,status:"not-started",owner:"Lawrence Group",duration:"3w"},
      {id:"t5",text:"Client Review",done:false,status:"overdue",owner:"Andrey / Iliyas",duration:"1w"},
      {id:"t6",text:"Acoustic Site Visit and Report",done:true,status:"complete",owner:"Lawrence Group",duration:"8d"},
      {id:"t7",text:"DD — Design Development",done:true,status:"complete",owner:"Lawrence Group",duration:"3w"},
      {id:"t8",text:"Issue for Bid / Permit / Construction",done:false,status:"not-started",owner:"Lawrence Group",duration:"30d"},
    ]
  },
  {
    id:"p2", name:"Permitting & Bidding Phase", color:"#3b82f6",
    start:"2026-04-01", end:"2026-06-05", status:"upcoming", weeks:4.2, days:21,
    tasks:[
      {id:"t9",text:"Bid Set Drawings Issued to Wesbuild",done:false,status:"not-started",owner:"Lawrence Group",duration:"1d"},
      {id:"t10",text:"Subcontractor Bids Received",done:false,status:"not-started",owner:"Wesbuild",duration:""},
      {id:"t11",text:"Cost Leveling / Negotiation",done:false,status:"not-started",owner:"Andrey + O'Leary",duration:"1w"},
      {id:"t12",text:"GC Award / Mobilization",done:false,status:"not-started",owner:"Andrey",duration:"1w"},
      {id:"t13",text:"Permitting Process (DOB filing)",done:false,status:"not-started",owner:"Lawrence Group",duration:"10d"},
      {id:"t14",text:"DOB Review",done:false,status:"not-started",owner:"NYC DOB",duration:"2w"},
      {id:"t15",text:"Permits Received",done:false,status:"not-started",owner:"Lawrence Group",duration:""},
    ]
  },
  {
    id:"p3", name:"Construction", color:"#ef4444",
    start:"2026-06-05", end:"2026-11-15", status:"upcoming", weeks:26, days:130,
    tasks:[
      {id:"t16",text:"Mobilization / Long Lead Item Release",done:false,status:"not-started",owner:"Wesbuild",duration:"20d"},
      {id:"t17",text:"Demolition & site prep",done:false,status:"not-started",owner:"Wesbuild",duration:""},
      {id:"t18",text:"Concrete / Masonry / Structural",done:false,status:"not-started",owner:"Wesbuild",duration:""},
      {id:"t19",text:"MEP rough-in (HVAC, Plumbing, Electrical)",done:false,status:"not-started",owner:"Wesbuild / MEP",duration:""},
      {id:"t20",text:"Drywall / Carpentry / Ceilings",done:false,status:"not-started",owner:"Wesbuild",duration:""},
      {id:"t21",text:"Ceramic, Stone & Flooring",done:false,status:"not-started",owner:"Wesbuild",duration:""},
      {id:"t22",text:"Acoustic spray soundproofing",done:false,status:"not-started",owner:"Wesbuild",duration:""},
      {id:"t23",text:"Painting & Decorative Finishes",done:false,status:"not-started",owner:"Wesbuild",duration:""},
      {id:"t24",text:"On Site Construction (full scope)",done:false,status:"not-started",owner:"Wesbuild",duration:"26w"},
    ]
  },
  {
    id:"p4", name:"Ops Setup & Opening", color:"#10b981",
    start:"2026-11-15", end:"2026-12-15", status:"upcoming", weeks:1.8, days:9,
    tasks:[
      {id:"t25",text:"FF&E delivery & install (gym equipment)",done:false,status:"not-started",owner:"Equipment Vendor",duration:""},
      {id:"t26",text:"AV / Light / Sound install",done:false,status:"not-started",owner:"AV Vendor",duration:""},
      {id:"t27",text:"IT infrastructure & screens",done:false,status:"not-started",owner:"KZ Tech Team",duration:""},
      {id:"t28",text:"Ops Turnover — Move-In / Set-Up",done:false,status:"not-started",owner:"Andrey",duration:"9d"},
      {id:"t29",text:"DOB final inspection & TCO",done:false,status:"not-started",owner:"Lawrence Group",duration:""},
      {id:"t30",text:"Staff hiring & training",done:false,status:"not-started",owner:"Fitness Director",duration:""},
      {id:"t31",text:"Studio Opening / Opening Deadline",done:false,status:"not-started",owner:"Andrey + CMO",duration:""},
    ]
  },
];

const initVendors = [
  {id:"v1",name:"O'Leary Group",role:"Construction Consultant",contact:"TBC",status:"active",risk:"low",lastUpdate:"Mar 2026",contract:"Engaged",notes:"Manages the Smartsheet construction timeline ('Hero's Journey Flatiron Schedule'). Andrey has view-only access. Key interface between HJ and all construction partners.",deliverables:["Smartsheet timeline management","Construction oversight","Vendor coordination"],nextAction:"Request automated Smartsheet email reports (daily/weekly)",dueDate:"2026-03-20",budget:0,spent:0},
  {id:"v2",name:"Lawrence Group",role:"Architecture",contact:"TBC",status:"active",risk:"medium",lastUpdate:"Mar 2026",contract:"Signed",notes:"Leading NYC fitness architect. Equinox portfolio. Currently in AOR Drawing Development. Client Review flagged OVERDUE in Smartsheet. Blocks 30-day 'Issue for Bid' task.",deliverables:["AOR drawings","Bid set drawings","DOB permit filing","MEP coordination"],nextAction:"Resolve Client Review (OVERDUE) then Issue for Bid/Permit",dueDate:"2026-04-01",budget:280000,spent:60000},
  {id:"v3",name:"Wesbuild",role:"General Contractor",contact:"TBC",status:"standby",risk:"low",lastUpdate:"Mar 2026",contract:"Pending permit",notes:"Budget LOW: $5.12M / HIGH: $5.95M (before 20% contingency). On standby pending permit approval. Proven NYC fitness GC track record.",deliverables:["Full buildout","MEP rough-in","26-week construction","FF&E coordination"],nextAction:"Finalize GMP contract after bid drawings issued",dueDate:"2026-05-01",budget:5500000,spent:0},
  {id:"v4",name:"CIM Group",role:"Landlord",contact:"TBC",status:"active",risk:"medium",lastUpdate:"Mar 2026",contract:"Lease executed",notes:"Handover May 15 2026. 9-month rent-free. Pre-permit engineer coordination ongoing — critical path item. One of largest US commercial landlords.",deliverables:["Engineer coordination pre-permit","Space handover May 15","9-month rent-free period"],nextAction:"Resolve open parameters with landlord engineers",dueDate:"2026-03-31",budget:0,spent:0},
  {id:"v5",name:"JPMorgan",role:"LOC Financing",contact:"TBC",status:"active",risk:"low",lastUpdate:"Feb 2026",contract:"In progress",notes:"$1.4M Letter of Credit personally guaranteed by Iliyas. Drawdown schedule needs alignment with Wesbuild payment milestones.",deliverables:["$1.4M LOC finalization","Drawdown schedule aligned to construction"],nextAction:"Confirm LOC drawdown schedule",dueDate:"2026-04-01",budget:1400000,spent:0},
  {id:"v6",name:"Gym Equipment Vendor",role:"Equipment / FF&E",contact:"TBD",status:"pending",risk:"high",lastUpdate:"—",contract:"Not signed",notes:"Budget $690K. Lead times 12-16 weeks. Must order by August 2026 for November delivery. No vendor shortlisted yet — URGENT.",deliverables:["Resistance training equipment","HIIT equipment","Megaformers (Reshape room)","Assessment Center"],nextAction:"RFQ & vendor shortlist — time sensitive",dueDate:"2026-06-01",budget:690000,spent:0},
  {id:"v7",name:"AV / Light / Sound",role:"AV & Lighting",contact:"TBD",status:"pending",risk:"medium",lastUpdate:"—",contract:"Not signed",notes:"Budget $230K. Critical for HJ in-studio experience. Must integrate with HJ proprietary app system. Coordinate with KZ tech team.",deliverables:["Zone sound systems","In-studio screens","Lighting per zone","HJ app integration"],nextAction:"Spec & RFQ — coordinate with KZ tech team first",dueDate:"2026-06-01",budget:230000,spent:0},
  {id:"v8",name:"CBRE",role:"Real Estate",contact:"TBC",status:"done",risk:"low",lastUpdate:"Jan 2026",contract:"Completed",notes:"Lease at 225 5th executed. 19,451 rentable sq ft secured. Role complete for now.",deliverables:["Lease negotiation complete","225 Fifth secured"],nextAction:"Standby — re-engage for future NYC locations",dueDate:"—",budget:0,spent:0},
];

const initIssues = [
  {id:"i1",title:"Client Review OVERDUE in Smartsheet",severity:"critical",owner:"Andrey / Lawrence Group",phase:"Design",due:"2026-03-15",open:true,notes:"Flagged red in O'Leary's Smartsheet. Blocks the 30-day 'Issue for Bid/Permit/Construction' task. Must be resolved immediately to protect April permit filing target."},
  {id:"i2",title:"Landlord engineer coordination unresolved",severity:"critical",owner:"Andrey + CIM",phase:"Design",due:"2026-03-31",open:true,notes:"CIM Group engineer sign-off needed before DOB permit submission. Direct blocker on permit timeline."},
  {id:"i3",title:"'Issue for Bid' not started — 30 day task",severity:"high",owner:"Lawrence Group",phase:"Design",due:"2026-04-01",open:true,notes:"This 30-day task hasn't started. It follows Client Review and precedes DOB filing. Every day of delay pushes permit filing and construction start."},
  {id:"i4",title:"Gym equipment vendor not selected",severity:"high",owner:"Andrey",phase:"Procurement",due:"2026-06-01",open:true,notes:"12-16 week lead times. Must place order by August 2026 for November delivery. No vendor even shortlisted yet."},
  {id:"i5",title:"Useable SF unconfirmed (budget assumes 17,095)",severity:"medium",owner:"Andrey + Lawrence Group",phase:"Design",due:"2026-04-01",open:true,notes:"Budget PSF calculations based on 17,095 useable SF. Lease says 19,451 rentable. Actual useable needs field verification before finalizing construction scope."},
  {id:"i6",title:"Decorative Metals — $420K budget variance",severity:"medium",owner:"Andrey + O'Leary",phase:"Budget",due:"2026-04-15",open:true,notes:"LOW: $427K / HIGH: $847K — single largest cost swing. Design decisions on metal features must be locked before budget can be confirmed."},
  {id:"i7",title:"CMO not yet hired",severity:"medium",owner:"Iliyas / Andrey",phase:"Pre-Opening",due:"2026-07-01",open:true,notes:"Needed for US brand launch and pre-sales campaign. Interviews in progress."},
  {id:"i8",title:"GMP contract with Wesbuild not signed",severity:"medium",owner:"Andrey + Gulnur",phase:"Construction",due:"2026-05-01",open:true,notes:"Pending bid drawings and permit. CLO Gulnur review required before execution."},
  {id:"i9",title:"LOC drawdown schedule not confirmed",severity:"medium",owner:"Andrey + JPMorgan",phase:"Finance",due:"2026-04-01",open:true,notes:"$1.4M LOC drawdown must align with Wesbuild payment milestones. Not yet scheduled."},
  {id:"i10",title:"AV/Sound vendor not scoped",severity:"low",owner:"Andrey + KZ Tech",phase:"Procurement",due:"2026-06-01",open:true,notes:"Must integrate with HJ proprietary app. Coordinate with Almaty tech team on spec before issuing RFQ."},
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
function daysUntil(d){if(!d||d==="—")return null;return Math.ceil((new Date(d)-new Date())/86400000);}
function fmt$(n){if(n>=1000000)return`$${(n/1000000).toFixed(2)}M`;if(n>=1000)return`$${(n/1000).toFixed(0)}K`;return`$${n}`;}
function pct(a,b){return b>0?Math.round((a/b)*100):0;}
function dateStamp(){return new Date().toISOString().split("T")[0];}
function genId(){return "id_"+Date.now()+"_"+Math.random().toString(36).slice(2,7);}

/* ─── STYLE MAPS ─── */
const SEV={critical:{bg:"#450a0a",border:"#dc2626",text:"#fca5a5",dot:"#ef4444"},high:{bg:"#431407",border:"#ea580c",text:"#fdba74",dot:"#f97316"},medium:{bg:"#1c1917",border:"#ca8a04",text:"#fde047",dot:"#eab308"},low:{bg:"#0f172a",border:"#475569",text:"#94a3b8",dot:"#64748b"}};
const VSTATUS={active:{color:"#22c55e",label:"ACTIVE"},standby:{color:"#eab308",label:"STANDBY"},pending:{color:"#f97316",label:"PENDING"},done:{color:"#475569",label:"DONE"}};
const PRISK={low:{color:"#22c55e"},medium:{color:"#eab308"},high:{color:"#ef4444"}};
const TSTATUS={"complete":{color:"#22c55e",label:"DONE"},"in-progress":{color:"#3b82f6",label:"IN PROG"},"not-started":{color:"#374151",label:"NOT STARTED"},"overdue":{color:"#ef4444",label:"OVERDUE"}};

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

/* ═══════════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════════ */
export default function App(){
  const[tab,setTab]=usePersistedState("hj_tab","overview");
  const[phases,setPhases]=usePersistedState("hj_phases",initPhases);
  const[vendors]=useState(initVendors);
  const[issues,setIssues]=usePersistedState("hj_issues",initIssues);
  const[budget]=useState(budgetLines);
  const[selPhase,setSelPhase]=useState(null);
  const[selVendor,setSelVendor]=useState(null);
  const[selIssue,setSelIssue]=useState(null);
  const[issueFilter,setIssueFilter]=usePersistedState("hj_issueFilter","open");
  const[budgetView,setBudgetView]=usePersistedState("hj_budgetView","low");

  /* Daily Log */
  const[logs,setLogs]=usePersistedState("hj_logs",[]);
  const[logText,setLogText]=useState("");
  const[logTag,setLogTag]=useState("general");

  /* Inline Issue Creation */
  const[showNewIssue,setShowNewIssue]=useState(false);
  const[newIssue,setNewIssue]=useState({title:"",severity:"medium",owner:"",phase:"Design",due:"",notes:""});

  /* Chat (offline — displays project data without API) */
  const[chat,setChat]=usePersistedState("hj_chat",[{role:"assistant",content:"Construction Command Center online. All data loaded from O'Leary Smartsheet and Wesbuild estimates. Use the tabs above to review timeline, vendors, budget, issues, and daily log."}]);
  const[msg,setMsg]=useState("");
  const chatRef=useRef(null);

  useEffect(()=>{chatRef.current?.scrollIntoView({behavior:"smooth"});},[chat]);

  const toggleTask=(pid,tid)=>setPhases(ps=>ps.map(p=>p.id===pid?{...p,tasks:p.tasks.map(t=>t.id===tid?{...t,done:!t.done,status:!t.done?"complete":"not-started"}:t)}:p));
  const toggleIssue=(id)=>setIssues(is=>is.map(i=>i.id===id?{...i,open:!i.open}:i));

  const addLog=()=>{
    if(!logText.trim())return;
    setLogs(prev=>[{id:genId(),date:dateStamp(),time:new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}),text:logText.trim(),tag:logTag},...prev]);
    setLogText("");
  };

  const deleteLog=(id)=>setLogs(prev=>prev.filter(l=>l.id!==id));

  const addIssue=()=>{
    if(!newIssue.title.trim())return;
    setIssues(prev=>[...prev,{...newIssue,id:genId(),open:true}]);
    setNewIssue({title:"",severity:"medium",owner:"",phase:"Design",due:"",notes:""});
    setShowNewIssue(false);
  };

  const sendMsg=()=>{
    if(!msg.trim())return;
    const q=msg.trim();setMsg("");
    setChat(c=>[...c,{role:"user",content:q},{role:"assistant",content:"This is an offline command center — all project data is in the tabs above. For AI-powered analysis, an API key integration can be added."}]);
  };

  /* ─── COMPUTED ─── */
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
  const filtIssues=issueFilter==="all"?issues:issueFilter==="open"?issues.filter(i=>i.open):issues.filter(i=>!i.open);
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
  const TAG_COLORS={general:"#6b7280",decision:"#3b82f6",blocker:"#ef4444",call:"#8b5cf6","site-visit":"#10b981",finance:"#eab308"};
  const inputStyle={background:"#111418",border:"1px solid #1a1f26",borderRadius:3,padding:"6px 10px",color:"#d4c9a8",fontSize:11,fontFamily:"'DM Mono',monospace",width:"100%"};
  const btnAmber={background:"#92400e",border:"none",borderRadius:3,padding:"6px 14px",color:"#fde68a",cursor:"pointer",fontSize:10,fontFamily:"'DM Mono',monospace",letterSpacing:1};

  return(
    <div style={{minHeight:"100vh",background:"#080a0d",color:"#d4c9a8",fontFamily:"'DM Mono','Courier New',monospace",fontSize:13}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#080a0d}
        ::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-track{background:#0d0f12}::-webkit-scrollbar-thumb{background:#f59e0b44;border-radius:2px}
        .rh:hover{background:#0d1117 !important;cursor:pointer}
        .tb:hover{color:#f59e0b !important}
        textarea:focus,input:focus,select:focus{outline:none;border-color:#f59e0b66 !important}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}.fi{animation:fadeUp .25s ease}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}.bl{animation:blink 1.2s infinite}
        .pb{transition:width .4s ease}
        @media(max-width:640px){
          .g4{grid-template-columns:repeat(2,1fr)!important}
          .g3{grid-template-columns:repeat(2,1fr)!important}
          .g2{grid-template-columns:1fr!important}
          .hr{flex-direction:column!important;gap:10px!important}
          .cr{justify-content:flex-start!important}
          .budget-grid{grid-template-columns:2fr 1fr 60px!important}
          .budget-hide{display:none!important}
          .tab-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
        }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <div style={{background:"#0d0f12",borderBottom:"1px solid #1a1f26",padding:"14px 20px 0"}}>
        <div className="hr" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:3,color:"#f59e0b",lineHeight:1}}>225 FIFTH AVENUE</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:13,letterSpacing:3,color:"#6b7280"}}>NYC FLAGSHIP · CONSTRUCTION COMMAND · 17,095 USEABLE SF</div>
          </div>
          <div>
            <div className="cr" style={{display:"flex",gap:16,justifyContent:"flex-end",marginBottom:6}}>
              {[{v:daysToPermit,l:"DAYS TO PERMIT",w:daysToPermit<30},{v:daysToHandover,l:"DAYS TO HANDOVER",w:false},{v:daysToOpen,l:"DAYS TO SOFT OPEN",w:false}].map((d,i)=>(
                <div key={i} style={{textAlign:"center"}}>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:d.w?"#ef4444":"#f59e0b"}}>{d.v}</div>
                  <div style={{fontSize:9,color:"#4b5563",letterSpacing:1}}>{d.l}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:6,justifyContent:"flex-end",flexWrap:"wrap"}}>
              {critIssues.length>0&&<div style={{background:"#450a0a",border:"1px solid #dc2626",borderRadius:3,padding:"2px 8px",display:"inline-flex",alignItems:"center",gap:5,fontSize:10}}><div className="bl" style={{width:6,height:6,borderRadius:"50%",background:"#ef4444"}}/><span style={{color:"#fca5a5"}}>{critIssues.length} CRITICAL</span></div>}
              {overdueCount>0&&<div style={{background:"#1a0000",border:"1px solid #f9731644",borderRadius:3,padding:"2px 8px",fontSize:10,color:"#f97316"}}>{overdueCount} OVERDUE</div>}
            </div>
          </div>
        </div>
        <div className="tab-scroll" style={{display:"flex",gap:0,overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} className="tb" onClick={()=>setTab(t.id)} style={{padding:"8px 14px",background:"transparent",border:"none",borderBottom:tab===t.id?"2px solid #f59e0b":"2px solid transparent",color:tab===t.id?"#f59e0b":"#4b5563",fontSize:11,letterSpacing:1,cursor:"pointer",fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap",transition:"color .15s"}}>{t.label.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"16px 20px",maxWidth:980,margin:"0 auto"}}>

        {/* ═══ OVERVIEW ═══ */}
        {tab==="overview"&&(
          <div className="fi">
            <div className="g4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
              {[{label:"GC Budget LOW",val:fmt$(totalLow),sub:`HIGH: ${fmt$(totalHigh)}`,c:"#f59e0b"},{label:"Spent to Date",val:fmt$(totalSpent),sub:`committed: ${fmt$(totalCommitted)}`,c:"#ef4444"},{label:"Tasks Complete",val:`${doneTasks.length}/${allTasks.length}`,sub:`${overdueCount} overdue`,c:overdueCount?"#f97316":"#22c55e"},{label:"Open Issues",val:openIssues.length,sub:`${critIssues.length} critical`,c:critIssues.length?"#ef4444":"#6b7280"}].map((s,i)=>(
                <div key={i} style={{background:"#0d0f12",border:"1px solid #1a1f26",borderRadius:4,padding:"12px 14px"}}>
                  <div style={{fontSize:9,color:"#4b5563",letterSpacing:1.5,marginBottom:6}}>{s.label.toUpperCase()}</div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:s.c}}>{s.val}</div>
                  <div style={{fontSize:9,color:"#374151",marginTop:3}}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{background:"#0a0d0a",border:"1px solid #14532d44",borderRadius:4,padding:"12px 16px",marginBottom:12}}>
              <div style={{fontSize:10,color:"#22c55e",letterSpacing:2,marginBottom:8}}>PREMISES — 225 FIFTH AVENUE, NEW YORK NY 10010</div>
              <div className="g4" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {[{l:"Useable SF",v:"17,095"},{l:"Rentable SF",v:"19,451"},{l:"Ground Floor",v:"1,510 SF (lobby)"},{l:"Lower Level",v:"17,941 SF (gym)"},{l:"Prop. Share",v:"46.85% of building"},{l:"Competitor Exclusion",v:"<4,500 SF protected"}].map((f,i)=>(
                  <div key={i} style={{fontSize:11}}><span style={{color:"#374151"}}>{f.l}: </span><span style={{color:"#d4c9a8"}}>{f.v}</span></div>
                ))}
              </div>
            </div>

            <div style={{background:"#0d0f12",border:"1px solid #1a1f26",borderRadius:4,padding:"14px 16px",marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontSize:10,color:"#6b7280",letterSpacing:2}}>SMARTSHEET PHASES — O'LEARY GROUP</div>
                <div style={{fontSize:9,color:"#374151"}}>tap to open</div>
              </div>
              {phases.map(p=>{
                const done=p.tasks.filter(t=>t.done).length;
                const ov=p.tasks.filter(t=>t.status==="overdue").length;
                return(
                  <div key={p.id} className="rh" onClick={()=>{setSelPhase(p);setTab("timeline");}} style={{padding:"10px 8px",borderBottom:"1px solid #111418",borderRadius:4,marginBottom:4}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:p.color,boxShadow:p.status==="active"?`0 0 8px ${p.color}`:"none"}}/>
                        <span style={{fontSize:12,color:p.status==="active"?"#e5e7eb":"#6b7280"}}>{p.name}</span>
                        {p.status==="active"&&<span style={{fontSize:9,color:p.color,background:`${p.color}22`,border:`1px solid ${p.color}44`,padding:"1px 6px",borderRadius:2}}>ACTIVE</span>}
                        {ov>0&&<span style={{fontSize:9,color:"#ef4444",background:"#450a0a",padding:"1px 6px",borderRadius:2}}>{ov} OVERDUE</span>}
                      </div>
                      <div style={{fontSize:10,color:"#6b7280",whiteSpace:"nowrap"}}>{p.weeks}w · {done}/{p.tasks.length}</div>
                    </div>
                    <div style={{background:"#111418",borderRadius:2,height:3}}>
                      <div className="pb" style={{width:`${Math.round((done/p.tasks.length)*100)}%`,height:3,background:p.color,borderRadius:2}}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {critIssues.length>0&&(
              <div style={{background:"#450a0a22",border:"1px solid #dc262666",borderRadius:4,padding:"14px 16px",marginBottom:12}}>
                <div style={{fontSize:10,color:"#ef4444",letterSpacing:2,marginBottom:10}}>CRITICAL BLOCKERS</div>
                {critIssues.map(i=>(
                  <div key={i.id} className="rh" onClick={()=>{setSelIssue(i);setTab("issues");}} style={{padding:"8px 0",borderBottom:"1px solid #1f0707",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontSize:12,color:"#fca5a5",marginBottom:2}}>{i.title}</div>
                      <div style={{fontSize:10,color:"#6b7280"}}>{i.notes.substring(0,90)}...</div>
                    </div>
                    <div style={{fontSize:10,color:"#ef4444",whiteSpace:"nowrap",marginLeft:12}}>Due {i.due}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{background:"#0d0f12",border:"1px solid #1a1f26",borderRadius:4,padding:"14px 16px"}}>
              <div style={{fontSize:10,color:"#6b7280",letterSpacing:2,marginBottom:10}}>VENDOR STATUS</div>
              <div className="g2" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
                {vendors.map(v=>(
                  <div key={v.id} className="rh" onClick={()=>{setSelVendor(v);setTab("vendors");}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",background:"#111418",borderRadius:3,border:`1px solid ${v.risk==="high"?"#dc262633":v.risk==="medium"?"#ca8a0433":"#1a1f26"}`}}>
                    <div><div style={{fontSize:11,color:"#d4c9a8"}}>{v.name}</div><div style={{fontSize:9,color:"#4b5563"}}>{v.role}</div></div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
                      <span style={{fontSize:9,color:VSTATUS[v.status].color}}>{VSTATUS[v.status].label}</span>
                      <span style={{fontSize:9,color:PRISK[v.risk].color}}>{v.risk} risk</span>
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
            <div style={{background:"#0a0d14",border:"1px solid #1a1f26",borderRadius:4,padding:"10px 14px",marginBottom:12,fontSize:11,color:"#4b5563"}}>
              Source: O'Leary Group · "Hero's Journey Flatiron Schedule" · Click tasks to toggle complete
            </div>
            {phases.map(p=>{
              const isOpen=selPhase?.id===p.id;
              const done=p.tasks.filter(t=>t.done).length;
              const ov=p.tasks.filter(t=>t.status==="overdue").length;
              return(
                <div key={p.id} style={{marginBottom:8,background:"#0d0f12",border:`1px solid ${isOpen?p.color+"66":"#1a1f26"}`,borderRadius:4,overflow:"hidden"}}>
                  <div className="rh" onClick={()=>setSelPhase(isOpen?null:p)} style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                      <div style={{width:10,height:10,borderRadius:"50%",background:p.color,boxShadow:p.status==="active"?`0 0 10px ${p.color}`:"none"}}/>
                      <div>
                        <div style={{fontSize:13,color:p.status==="active"?"#f5f5f0":"#9ca3af"}}>{p.name}</div>
                        <div style={{fontSize:10,color:"#4b5563"}}>{p.weeks}w / {p.days}d · {p.start} → {p.end}</div>
                      </div>
                      {p.status==="active"&&<span style={{fontSize:9,color:p.color,background:`${p.color}22`,padding:"2px 6px",border:`1px solid ${p.color}44`,borderRadius:2}}>ACTIVE</span>}
                      {ov>0&&<span style={{fontSize:9,color:"#ef4444",background:"#450a0a",padding:"2px 6px",borderRadius:2}}>{ov} OVERDUE</span>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{textAlign:"right"}}><div style={{fontSize:11,color:p.color}}>{done}/{p.tasks.length}</div><div style={{fontSize:9,color:"#374151"}}>done</div></div>
                      <div style={{color:"#374151",fontSize:12}}>{isOpen?"▲":"▼"}</div>
                    </div>
                  </div>
                  {isOpen&&(
                    <div style={{padding:"0 16px 14px",borderTop:`1px solid ${p.color}22`}}>
                      <div style={{background:"#111418",borderRadius:2,height:3,margin:"10px 0 12px"}}>
                        <div style={{width:`${Math.round((done/p.tasks.length)*100)}%`,height:3,background:p.color,borderRadius:2,transition:"width .4s"}}/>
                      </div>
                      {p.tasks.map(t=>(
                        <div key={t.id} className="rh" onClick={()=>toggleTask(p.id,t.id)} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 6px",borderRadius:3,borderBottom:"1px solid #0d1117",opacity:t.done?.45:1,background:t.status==="overdue"?"#1a000033":"transparent"}}>
                          <div style={{width:16,height:16,borderRadius:2,flexShrink:0,marginTop:1,background:t.done?p.color:"transparent",border:`1.5px solid ${t.done?p.color:t.status==="overdue"?"#ef4444":"#374151"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                            {t.done&&<span style={{color:"#000",fontSize:10,fontWeight:700}}>✓</span>}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                              <span style={{fontSize:12,color:t.done?"#4b5563":t.status==="overdue"?"#fca5a5":"#d4c9a8",textDecoration:t.done?"line-through":"none"}}>{t.text}</span>
                              <span style={{fontSize:9,color:TSTATUS[t.status]?.color,background:`${TSTATUS[t.status]?.color}22`,padding:"1px 5px",borderRadius:2}}>{TSTATUS[t.status]?.label}</span>
                              {t.duration&&<span style={{fontSize:9,color:"#374151"}}>{t.duration}</span>}
                            </div>
                            <div style={{fontSize:10,color:"#374151",marginTop:2}}>Owner: {t.owner}</div>
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
            <div className="g2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:selVendor?12:0}}>
              {vendors.map(v=>(
                <div key={v.id} className="rh" onClick={()=>setSelVendor(selVendor?.id===v.id?null:v)} style={{background:"#0d0f12",border:`1px solid ${selVendor?.id===v.id?"#f59e0b66":v.risk==="high"?"#dc262633":v.risk==="medium"?"#ca8a0433":"#1a1f26"}`,borderRadius:4,padding:"12px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div style={{fontSize:13,color:"#e5e7eb"}}>{v.name}</div><span style={{fontSize:9,color:VSTATUS[v.status].color}}>{VSTATUS[v.status].label}</span></div>
                  <div style={{fontSize:10,color:"#6b7280",marginBottom:6}}>{v.role}</div>
                  <div style={{fontSize:10,color:"#374151",marginBottom:6}}>{v.notes.substring(0,80)}...</div>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:9,color:PRISK[v.risk].color}}>{v.risk.toUpperCase()} RISK</span>{v.budget>0&&<span style={{fontSize:9,color:"#4b5563"}}>{fmt$(v.budget)}</span>}</div>
                </div>
              ))}
            </div>
            {selVendor&&(
              <div className="fi" style={{background:"#0d0f12",border:"1px solid #f59e0b44",borderRadius:4,padding:"16px 18px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                  <div><div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:"#f59e0b",letterSpacing:2}}>{selVendor.name}</div><div style={{fontSize:10,color:"#6b7280"}}>{selVendor.role} · {selVendor.contract}</div></div>
                  <button onClick={()=>setSelVendor(null)} style={{background:"none",border:"none",color:"#374151",cursor:"pointer",fontSize:18}}>x</button>
                </div>
                <div style={{fontSize:12,color:"#9ca3af",marginBottom:12,lineHeight:1.6}}>{selVendor.notes}</div>
                <div className="g2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div>
                    <div style={{fontSize:9,color:"#4b5563",letterSpacing:1.5,marginBottom:6}}>DELIVERABLES</div>
                    {selVendor.deliverables.map((d,i)=><div key={i} style={{fontSize:11,color:"#6b7280",padding:"3px 0",borderBottom:"1px solid #111418"}}>- {d}</div>)}
                  </div>
                  <div>
                    <div style={{fontSize:9,color:"#4b5563",letterSpacing:1.5,marginBottom:6}}>NEXT ACTION</div>
                    <div style={{fontSize:12,color:"#f59e0b",marginBottom:8,lineHeight:1.5}}>{selVendor.nextAction}</div>
                    <div style={{fontSize:10,color:"#4b5563"}}>Due: {selVendor.dueDate}</div>
                    {selVendor.dueDate!=="—"&&daysUntil(selVendor.dueDate)!==null&&<div style={{fontSize:11,color:daysUntil(selVendor.dueDate)<14?"#ef4444":"#eab308",marginTop:4}}>{daysUntil(selVendor.dueDate)} days remaining</div>}
                    {selVendor.budget>0&&<div style={{marginTop:10}}><div style={{fontSize:9,color:"#4b5563",letterSpacing:1.5,marginBottom:4}}>BUDGET</div><div style={{fontSize:16,fontFamily:"'Bebas Neue'",color:"#f59e0b"}}>{fmt$(selVendor.budget)}</div><div style={{fontSize:10,color:"#374151"}}>Spent: {fmt$(selVendor.spent)}</div></div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ ISSUES ═══ */}
        {tab==="issues"&&(
          <div className="fi">
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",justifyContent:"space-between"}}>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {["all","open","closed"].map(f=>(
                  <button key={f} onClick={()=>setIssueFilter(f)} style={{background:issueFilter===f?"#1a1f26":"#0d0f12",border:`1px solid ${issueFilter===f?"#f59e0b44":"#1a1f26"}`,color:issueFilter===f?"#f59e0b":"#6b7280",padding:"4px 12px",borderRadius:3,fontSize:10,cursor:"pointer",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>
                    {f} ({f==="all"?issues.length:f==="open"?issues.filter(i=>i.open).length:issues.filter(i=>!i.open).length})
                  </button>
                ))}
              </div>
              <button onClick={()=>setShowNewIssue(!showNewIssue)} style={{...btnAmber,background:showNewIssue?"#374151":"#92400e"}}>
                {showNewIssue?"CANCEL":"+ NEW ISSUE"}
              </button>
            </div>

            {showNewIssue&&(
              <div className="fi" style={{background:"#0d0f12",border:"1px solid #f59e0b44",borderRadius:4,padding:"14px 16px",marginBottom:12}}>
                <div style={{fontSize:10,color:"#f59e0b",letterSpacing:2,marginBottom:10}}>NEW ISSUE</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <input value={newIssue.title} onChange={e=>setNewIssue(p=>({...p,title:e.target.value}))} placeholder="Issue title..." style={inputStyle}/>
                  <div className="g4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                    <select value={newIssue.severity} onChange={e=>setNewIssue(p=>({...p,severity:e.target.value}))} style={inputStyle}>
                      {["critical","high","medium","low"].map(s=><option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>
                    <input value={newIssue.owner} onChange={e=>setNewIssue(p=>({...p,owner:e.target.value}))} placeholder="Owner..." style={inputStyle}/>
                    <select value={newIssue.phase} onChange={e=>setNewIssue(p=>({...p,phase:e.target.value}))} style={inputStyle}>
                      {["Design","Procurement","Budget","Construction","Finance","Pre-Opening"].map(p=><option key={p} value={p}>{p}</option>)}
                    </select>
                    <input type="date" value={newIssue.due} onChange={e=>setNewIssue(p=>({...p,due:e.target.value}))} style={{...inputStyle,colorScheme:"dark"}}/>
                  </div>
                  <textarea value={newIssue.notes} onChange={e=>setNewIssue(p=>({...p,notes:e.target.value}))} placeholder="Notes / context..." rows={2} style={{...inputStyle,resize:"vertical"}}/>
                  <button onClick={addIssue} disabled={!newIssue.title.trim()} style={{...btnAmber,opacity:newIssue.title.trim()?1:.4,alignSelf:"flex-start"}}>ADD ISSUE</button>
                </div>
              </div>
            )}

            {filtIssues.map(issue=>{
              const s=SEV[issue.severity];
              const isOpen=selIssue?.id===issue.id;
              return(
                <div key={issue.id} style={{marginBottom:6,background:s.bg,border:`1px solid ${isOpen?s.border:s.border+"66"}`,borderRadius:4,overflow:"hidden"}}>
                  <div className="rh" onClick={()=>setSelIssue(isOpen?null:issue)} style={{padding:"11px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:issue.open?s.dot:"#374151",flexShrink:0}}/>
                      <div style={{minWidth:0}}>
                        <div style={{fontSize:12,color:issue.open?s.text:"#4b5563",textDecoration:issue.open?"none":"line-through"}}>{issue.title}</div>
                        <div style={{fontSize:10,color:"#374151",marginTop:2}}>{issue.phase} · {issue.owner}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                      <span style={{fontSize:9,color:s.text,background:`${s.dot}22`,padding:"2px 6px",borderRadius:2}}>{issue.severity.toUpperCase()}</span>
                      <span style={{fontSize:10,color:"#374151"}}>{issue.due}</span>
                    </div>
                  </div>
                  {isOpen&&(
                    <div style={{padding:"0 14px 12px",borderTop:`1px solid ${s.border}33`}}>
                      <div style={{fontSize:12,color:s.text,margin:"10px 0",lineHeight:1.6}}>{issue.notes}</div>
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={()=>toggleIssue(issue.id)} style={{background:issue.open?"#14532d":"#1a1f26",border:`1px solid ${issue.open?"#22c55e44":"#374151"}`,color:issue.open?"#4ade80":"#6b7280",padding:"5px 12px",borderRadius:3,fontSize:10,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>{issue.open?"MARK RESOLVED":"REOPEN"}</button>
                        <button onClick={()=>setSelIssue(null)} style={{background:"none",border:"1px solid #1a1f26",color:"#4b5563",padding:"5px 12px",borderRadius:3,fontSize:10,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>CLOSE</button>
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
            <div className="g3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
              {[{label:"GC Total LOW",val:fmt$(totalLow),sub:"base estimate",c:"#22c55e"},{label:"GC Total HIGH",val:fmt$(totalHigh),sub:`+${fmt$(totalHigh-totalLow)} variance`,c:"#f59e0b"},{label:"Spent to Date",val:fmt$(totalSpent),sub:`committed ${fmt$(totalCommitted)}`,c:"#ef4444"}].map((s,i)=>(
                <div key={i} style={{background:"#0d0f12",border:"1px solid #1a1f26",borderRadius:4,padding:"12px 14px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:"#4b5563",letterSpacing:1.5,marginBottom:4}}>{s.label}</div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:s.c}}>{s.val}</div>
                  <div style={{fontSize:9,color:"#374151"}}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              {["low","high"].map(v=>(
                <button key={v} onClick={()=>setBudgetView(v)} style={{background:budgetView===v?"#1a1f26":"#0d0f12",border:`1px solid ${budgetView===v?"#f59e0b44":"#1a1f26"}`,color:budgetView===v?"#f59e0b":"#6b7280",padding:"4px 14px",borderRadius:3,fontSize:10,cursor:"pointer",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>
                  {v} estimate
                </button>
              ))}
            </div>
            <div style={{background:"#0d0f12",border:"1px solid #1a1f26",borderRadius:4,padding:"14px 16px"}}>
              <div style={{fontSize:10,color:"#6b7280",letterSpacing:2,marginBottom:12}}>LINE ITEMS — {budgetView.toUpperCase()} SCENARIO · 17,095 USEABLE SF</div>
              {[...new Set(budget.map(b=>b.category))].map(cat=>{
                const items=budget.filter(b=>b.category===cat);
                const catTotal=items.reduce((s,b)=>s+(budgetView==="low"?b.low:b.high),0);
                return(
                  <div key={cat}>
                    <div style={{fontSize:9,color:"#f59e0b",letterSpacing:1.5,padding:"8px 0 4px",borderBottom:"1px solid #1a1f26"}}>{cat.toUpperCase()} — {fmt$(catTotal)}</div>
                    {items.map(b=>{
                      const val=budgetView==="low"?b.low:b.high;
                      const burn=pct(b.spent,val);
                      const hasRange=b.low!==b.high;
                      return(
                        <div key={b.id} className="budget-grid" style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 60px",gap:0,padding:"7px 0",borderBottom:"1px solid #0d1117"}}>
                          <div>
                            <div style={{fontSize:11,color:"#d4c9a8"}}>{b.label}</div>
                            {hasRange&&<div style={{fontSize:9,color:"#374151"}}>L:{fmt$(b.low)} H:{fmt$(b.high)}</div>}
                          </div>
                          <div style={{fontSize:11,color:"#9ca3af"}}>{fmt$(val)}</div>
                          <div className="budget-hide" style={{fontSize:11,color:"#3b82f6"}}>{fmt$(b.committed)}</div>
                          <div className="budget-hide" style={{fontSize:11,color:b.spent>0?"#ef4444":"#374151"}}>{fmt$(b.spent)}</div>
                          <div>
                            <div style={{fontSize:10,color:burn>80?"#ef4444":burn>0?"#eab308":"#374151"}}>{burn}%</div>
                            <div style={{background:"#111418",borderRadius:1,height:3,marginTop:3,width:50}}><div style={{width:`${Math.min(burn,100)}%`,height:3,background:burn>80?"#ef4444":"#22c55e",borderRadius:1}}/></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div style={{marginTop:12,background:"#0a0f0a",border:"1px solid #14532d44",borderRadius:4,padding:"12px 14px"}}>
              <div style={{fontSize:10,color:"#4b5563",letterSpacing:1.5,marginBottom:8}}>FUNDING STATUS</div>
              {[{l:"Cash on hand",v:"~$4,000,000",c:"#22c55e"},{l:"Bridge round raising",v:"$5,000,000",c:"#3b82f6"},{l:"LOC — JPMorgan (Iliyas guarantee)",v:"$1,400,000",c:"#eab308"}].map((f,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #111418"}}><span style={{fontSize:12,color:"#9ca3af"}}>{f.l}</span><span style={{fontSize:12,color:f.c}}>{f.v}</span></div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0 0"}}><span style={{fontSize:12,color:"#f59e0b"}}>Total available</span><span style={{fontSize:14,fontFamily:"'Bebas Neue'",color:"#f59e0b"}}>~$10,400,000</span></div>
            </div>
          </div>
        )}

        {/* ═══ DAILY LOG ═══ */}
        {tab==="log"&&(
          <div className="fi">
            <div style={{background:"#0d0f12",border:"1px solid #1a1f26",borderRadius:4,padding:"14px 16px",marginBottom:12}}>
              <div style={{fontSize:10,color:"#f59e0b",letterSpacing:2,marginBottom:10}}>NEW LOG ENTRY</div>
              <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                {LOG_TAGS.map(t=>(
                  <button key={t} onClick={()=>setLogTag(t)} style={{background:logTag===t?`${TAG_COLORS[t]}22`:"#111418",border:`1px solid ${logTag===t?TAG_COLORS[t]+"66":"#1a1f26"}`,color:logTag===t?TAG_COLORS[t]:"#4b5563",padding:"3px 10px",borderRadius:3,fontSize:9,cursor:"pointer",fontFamily:"'DM Mono',monospace",letterSpacing:1,textTransform:"uppercase"}}>{t}</button>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <textarea value={logText} onChange={e=>setLogText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();addLog();}}} placeholder="What happened today? Decisions, calls, site updates..." rows={2} style={{...inputStyle,flex:1,resize:"vertical"}}/>
                <button onClick={addLog} disabled={!logText.trim()} style={{...btnAmber,opacity:logText.trim()?1:.4,alignSelf:"flex-end",padding:"10px 18px"}}>LOG</button>
              </div>
            </div>

            {logs.length===0&&(
              <div style={{textAlign:"center",padding:"40px 20px",color:"#374151",fontSize:12}}>
                No log entries yet. Add your first daily note above.
              </div>
            )}

            {Object.entries(logsByDate).map(([date,entries])=>(
              <div key={date} style={{marginBottom:12}}>
                <div style={{fontSize:10,color:"#6b7280",letterSpacing:2,padding:"6px 0",borderBottom:"1px solid #1a1f26",marginBottom:6}}>
                  {new Date(date+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric",year:"numeric"})}
                  <span style={{color:"#374151",marginLeft:8}}>{entries.length} {entries.length===1?"entry":"entries"}</span>
                </div>
                {entries.map(entry=>(
                  <div key={entry.id} style={{display:"flex",gap:10,padding:"8px 6px",borderBottom:"1px solid #0d1117",alignItems:"flex-start"}}>
                    <div style={{fontSize:10,color:"#374151",whiteSpace:"nowrap",marginTop:2}}>{entry.time}</div>
                    <span style={{fontSize:9,color:TAG_COLORS[entry.tag]||"#6b7280",background:`${TAG_COLORS[entry.tag]||"#6b7280"}22`,padding:"1px 6px",borderRadius:2,flexShrink:0,marginTop:1}}>{entry.tag.toUpperCase()}</span>
                    <div style={{flex:1,fontSize:12,color:"#d4c9a8",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{entry.text}</div>
                    <button onClick={()=>deleteLog(entry.id)} style={{background:"none",border:"none",color:"#374151",cursor:"pointer",fontSize:14,flexShrink:0,padding:"0 4px"}} title="Delete entry">x</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ═══ AI ═══ */}
        {tab==="ai"&&(
          <div className="fi" style={{display:"flex",flexDirection:"column",height:"calc(100vh - 220px)",minHeight:420}}>
            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingBottom:12}}>
              {chat.map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                  <div style={{maxWidth:"85%",padding:"10px 14px",borderRadius:4,background:m.role==="user"?"#1a1400":"#0d0f12",border:`1px solid ${m.role==="user"?"#f59e0b44":"#1a1f26"}`,fontSize:12,lineHeight:1.7,color:m.role==="user"?"#fde68a":"#d4c9a8",whiteSpace:"pre-wrap"}}>
                    {m.role==="assistant"&&<div style={{fontSize:9,color:"#374151",letterSpacing:1.5,marginBottom:4}}>CONSTRUCTION AI</div>}
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={chatRef}/>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
              {["What's blocking permit filing?","Decorative metals risk?","Client Review — what do I do?","Equipment order deadline?","GMP contract next steps?"].map((q,i)=>(
                <button key={i} onClick={()=>setMsg(q)} style={{background:"#0d0f12",border:"1px solid #1a1f26",color:"#4b5563",fontSize:10,padding:"4px 10px",borderRadius:3,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>{q}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <textarea value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}} placeholder="Ask about timeline, budget, permits, vendors..." rows={2} style={{flex:1,background:"#0d0f12",border:"1px solid #1a1f26",borderRadius:4,padding:"10px 12px",color:"#d4c9a8",fontSize:12,resize:"none",fontFamily:"'DM Mono',monospace"}}/>
              <button onClick={sendMsg} disabled={!msg.trim()} style={{background:!msg.trim()?"#111418":"#92400e",border:"none",borderRadius:4,padding:"0 18px",color:!msg.trim()?"#374151":"#fde68a",cursor:!msg.trim()?"not-allowed":"pointer",fontSize:16,transition:"background .2s"}}>{"->"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
