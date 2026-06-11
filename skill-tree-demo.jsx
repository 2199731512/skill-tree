import { useState, useRef, useEffect, useCallback, useMemo } from "react";

const ORANGE = "#f59e0b";
const GREEN  = "#10b981";
const RED    = "#ef4444";
const FI = { pdf:"📄",md:"📝",json:"🔧",txt:"📋",png:"🖼️",jpg:"🖼️",default:"📎" };
const RATING_LABELS = ["未评级","了解","基础","熟悉","熟练","精通"];
const STATE_LABELS = { green:"学习中", orange:"已掌握" };
const NW=158, NH=74;
const T=Date.now(), D=86400000;

const mk = d => d ? {
  bg:"#07101e",panel:"#0c1828",node:"#0f1e32",sub:"#070e1a",
  bdr:"#1c2e48",text:"#d8eaf8",dim:"#5a7898",muted:"#2d4460",
} : {
  bg:"#eef2f7",panel:"#ffffff",node:"#ffffff",sub:"#f3f7fb",
  bdr:"#cddaeb",text:"#142032",dim:"#4a6680",muted:"#a8bccf",
};

const NODES0 = [
  {id:"root", title:"AI工程师转型",   sub:"核心目标",    rating:5,stateColor:null,  pending:false,isNew:false,x:310,y:20, createdAt:T-14*D,files:[{n:"转型路线图.pdf",t:"pdf"},{n:"三个月计划.md",t:"md"}],notes:"以变现为核心驱动，所有技能选择服务于3个月收入目标。"},
  {id:"react",title:"React / Next.js",sub:"前端框架",    rating:4,stateColor:null,  pending:false,isNew:false,x:40, y:158,createdAt:T-12*D,files:[{n:"React项目笔记.md",t:"md"}],                          notes:"已完成AI聊天组件、混凝土计算器等项目。"},
  {id:"ts",   title:"TypeScript",     sub:"类型系统",    rating:3,stateColor:"green",pending:false,isNew:false,x:218,y:158,createdAt:T-11*D,files:[],                                                         notes:"重点掌握接口、泛型和类型推断。"},
  {id:"sb",   title:"Supabase",       sub:"后端即服务",  rating:4,stateColor:null,  pending:false,isNew:false,x:396,y:158,createdAt:T-10*D,files:[{n:"Supabase配置.txt",t:"txt"}],                           notes:"region: eu-west-1，基础认证和数据库配置完成。"},
  {id:"n8n",  title:"n8n 自动化",     sub:"工作流引擎",  rating:5,stateColor:"orange",pending:false,isNew:false,x:574,y:158,createdAt:T-9*D,files:[{n:"工作流.json",t:"json"},{n:"SMTP配置.md",t:"md"}],    notes:"核心工作流完成。MiMo模型名必须全小写 mimo-v2.5-pro。"},
  {id:"api",  title:"AI API集成",     sub:"MiMo/Claude", rating:4,stateColor:null,  pending:false,isNew:false,x:40, y:300,createdAt:T-8*D, files:[{n:"接入文档.md",t:"md"}],                               notes:"OpenAI兼容格式，SSE流式输出已实现。"},
  {id:"sse",  title:"SSE 流式输出",   sub:"实时响应",    rating:4,stateColor:null,  pending:false,isNew:false,x:218,y:300,createdAt:T-7*D, files:[],                                                          notes:"解决MiMo响应慢问题，实现打字机效果。"},
  {id:"wf",   title:"工作流产品化",   sub:"自动化→服务", rating:5,stateColor:null,  pending:false,isNew:false,x:396,y:300,createdAt:T-6*D, files:[{n:"闲鱼定价策略.md",t:"md"}],                            notes:"简历优化服务MVP：AI草稿+人工审核混合模式。"},
  {id:"cons", title:"建筑行业AI工具", sub:"核心变现赛道",rating:5,stateColor:null,  pending:false,isNew:false,x:574,y:300,createdAt:T-5*D, files:[{n:"施工日报需求分析.md",t:"md"}],                        notes:"利用土木背景切入施工日报、合规文档场景。"},
  {id:"inc",  title:"首单变现",        sub:"3个月里程碑", rating:0,stateColor:null,  pending:false,isNew:false,x:396,y:426,createdAt:T-3*D, files:[],                                                          notes:"目标：通过闲鱼或熟人网络完成第一笔收入。"},
];
const EDGES0 = [
  {f:"root",t:"react"},{f:"root",t:"ts"},{f:"root",t:"sb"},{f:"root",t:"n8n"},
  {f:"react",t:"api"},{f:"ts",t:"api"},{f:"ts",t:"sse"},{f:"sb",t:"sse"},
  {f:"sb",t:"wf"},{f:"n8n",t:"wf"},{f:"n8n",t:"cons"},{f:"wf",t:"inc"},{f:"cons",t:"inc"},
];

const fmtDate = ts => {
  if(!ts)return"—";
  const d=new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
};

function buildMaps(edges){const ch={},pa={};edges.forEach(e=>{(ch[e.f]=ch[e.f]||[]).push(e.t);(pa[e.t]=pa[e.t]||[]).push(e.f);});return{ch,pa};}
function ancestorPath(id,pa,nodes){const p=[];let c=id;while(c){const n=nodes.find(x=>x.id===c);if(n)p.unshift(n.title);const ps=pa[c];c=ps?.length?ps[0]:null;}return p;}
function hasMatch(id,ch,nodes,q){const n=nodes.find(x=>x.id===id);if(!n)return false;if(n.title.toLowerCase().includes(q)||n.sub.toLowerCase().includes(q))return true;return(ch[id]||[]).some(c=>hasMatch(c,ch,nodes,q));}
function computeDepths(nodes,edges,ch){const d={},ci=new Set(edges.map(e=>e.t));const roots=nodes.filter(n=>!ci.has(n.id)&&!n.pending&&!n.isNew).map(n=>n.id);const q=[...roots.map(id=>[id,0])];const vis=new Set();while(q.length){const[id,dep]=q.shift();if(vis.has(id))continue;vis.add(id);d[id]=dep;(ch[id]||[]).forEach(c=>q.push([c,dep+1]));}return d;}

function genSummary(nodes,stats){
  const now=fmtDate(Date.now());
  let t=`技能树总结\n生成时间：${now}\n${"=".repeat(42)}\n\n总览\n${"-".repeat(22)}\n总节点：${stats.total}\n已评级：${stats.rated} 个\n5星节点：${stats.top} 个\n未评级：${stats.unrated} 个\n`;
  if(stats.pend>0)t+=`草稿：${stats.pend} 个\n`;t+="\n";
  const rated=nodes.filter(n=>!n.pending&&!n.isNew&&n.rating>0).sort((a,b)=>b.rating-a.rating);
  const unrated=nodes.filter(n=>!n.pending&&!n.isNew&&n.rating===0);
  if(rated.length){t+=`已评级节点\n${"-".repeat(22)}\n`;for(const n of rated){t+=`${"★".repeat(n.rating)}${"☆".repeat(5-n.rating)} ${n.title}【${n.sub}】\n  创建：${fmtDate(n.createdAt)}\n`;if(n.stateColor)t+=`  状态：${STATE_LABELS[n.stateColor]}\n`;if(n.files.length)t+=`  附件：${n.files.map(f=>f.n).join("，")}\n`;if(n.notes.trim())t+=`  笔记：${n.notes.trim()}\n`;t+="\n";}}
  if(unrated.length){t+=`未评级节点\n${"-".repeat(22)}\n`;unrated.forEach(n=>{t+=`□ ${n.title}【${n.sub}】\n`;});}
  return t;
}

// ── Stars ────────────────────────────────────────────────────
function Stars({value,onChange,size=12,C,readonly=false}){
  const[hov,setHov]=useState(0);
  return(
    <div style={{display:"flex",gap:2}} onMouseLeave={()=>!readonly&&setHov(0)}>
      {[1,2,3,4,5].map(i=>(
        <span key={i} onMouseEnter={()=>!readonly&&setHov(i)}
          onMouseDown={e=>e.stopPropagation()}
          onClick={e=>{e.stopPropagation();if(!readonly)onChange(i===value?0:i);}}
          style={{fontSize:size,color:i<=(hov||value)?ORANGE:C.muted,cursor:readonly?"default":"pointer",lineHeight:1,transition:"color 0.08s",userSelect:"none"}}>★</span>
      ))}
    </div>
  );
}

// ── State Dots ───────────────────────────────────────────────
function StateDots({value,onChange,C,size=9}){
  return(
    <div style={{display:"flex",gap:3,alignItems:"center"}}>
      {[["green",GREEN,"学习中"],["orange",ORANGE,"已掌握"]].map(([c,hex,label])=>(
        <div key={c} onMouseDown={e=>e.stopPropagation()}
          onClick={e=>{e.stopPropagation();onChange(value===c?null:c);}}
          title={`${label}（再点清除）`}
          style={{width:size,height:size,borderRadius:2,cursor:"pointer",
            background:hex,opacity:value===c?1:0.22,border:`1px solid ${hex}`,transition:"opacity 0.12s"}}/>
      ))}
    </div>
  );
}

// ── Connector + Button (Miro/FigJam style) ───────────────────
function PlusBtn({nx,ny,side,color,label,onClick,onEnter,onLeave}){
  const[hov,setHov]=useState(false);
  const isRight=side==="right";
  const x=isRight?nx+NW:nx+NW/2-11;
  const y=isRight?ny+NH/2-11:ny+NH;
  return(
    <div
      onMouseEnter={()=>{onEnter();setHov(true);}}
      onMouseLeave={()=>{onLeave();setHov(false);}}
      onMouseDown={e=>e.stopPropagation()}
      onClick={e=>{e.stopPropagation();onClick();}}
      title={label}
      style={{position:"absolute",left:x,top:y,zIndex:30,cursor:"pointer",
        display:"flex",flexDirection:isRight?"row":"column",alignItems:"center"}}>
      {/* Connector line */}
      <div style={{
        width:isRight?18:1.5,height:isRight?1.5:18,
        background:color,opacity:0.55,flexShrink:0,transition:"opacity 0.1s"}}/>
      {/* Circle button */}
      <div style={{
        width:22,height:22,borderRadius:"50%",
        background:color,color:"#fff",
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:17,fontWeight:300,lineHeight:1,
        transform:hov?"scale(1.18)":"scale(1)",
        transition:"transform 0.12s, box-shadow 0.12s",
        boxShadow:hov?`0 4px 14px ${color}80`:`0 2px 8px ${color}50`}}>+</div>
    </div>
  );
}

// ── Tree Item ────────────────────────────────────────────────
function TreeItem({id,ch,nodes,setNodes,depth,sel,onSelect,exp,onToggle,lq,tEId,setTEId,C}){
  const node=nodes.find(n=>n.id===id);
  const[ev,setEv]=useState("");
  useEffect(()=>{if(tEId===id&&node)setEv(node.title);},[tEId]);
  if(!node||node.pending||node.isNew)return null;
  if(lq&&!hasMatch(id,ch,nodes,lq))return null;
  const kids=ch[id]||[],hasK=kids.length>0,isOpen=exp.has(id),isSel=sel===id,isEd=tEId===id;
  const confirm=()=>{if(ev.trim())setNodes(p=>p.map(n=>n.id===id?{...n,title:ev.trim()}:n));setTEId(null);};
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:4,
        padding:`3px 8px 3px ${8+depth*14}px`,
        background:isSel?"rgba(245,158,11,0.08)":"transparent",
        borderLeft:isSel?`2px solid ${ORANGE}`:"2px solid transparent",
        borderRadius:"0 4px 4px 0",cursor:"pointer"}}>
        <span onClick={e=>{e.stopPropagation();if(hasK)onToggle(id);}}
          style={{width:14,fontSize:9,color:C.dim,flexShrink:0,cursor:hasK?"pointer":"default"}}>
          {hasK?(isOpen?"▼":"▶"):"·"}
        </span>
        {isEd?(
          <input autoFocus value={ev} onChange={e=>setEv(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter")confirm();if(e.key==="Escape")setTEId(null);}}
            onBlur={confirm} onClick={e=>e.stopPropagation()}
            style={{flex:1,background:C.sub,border:`1px solid ${ORANGE}`,borderRadius:4,padding:"1px 6px",color:C.text,fontSize:11,outline:"none"}}/>
        ):(
          <span onClick={()=>onSelect(id)} onDoubleClick={e=>{e.stopPropagation();setTEId(id);}} title="双击改名"
            style={{fontSize:11,color:C.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {node.title}
          </span>
        )}
        {node.files.length>0&&<span style={{fontSize:9,color:C.muted,flexShrink:0}}>·{node.files.length}</span>}
      </div>
      {hasK&&isOpen&&kids.map(k=>(
        <TreeItem key={k} id={k} ch={ch} nodes={nodes} setNodes={setNodes} depth={depth+1}
          sel={sel} onSelect={onSelect} exp={exp} onToggle={onToggle} lq={lq} tEId={tEId} setTEId={setTEId} C={C}/>
      ))}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────
export default function SkillTree(){
  const[nodes,setNodes]     =useState(NODES0);
  const[edges,setEdges]     =useState(EDGES0);
  const[sel,setSel]         =useState(null);
  const[drag,setDrag]       =useState(null);
  const[q,setQ]             =useState("");
  const[exp,setExp]         =useState(new Set(["root"]));
  const[pulse,setPulse]     =useState(null);
  const[cEId,setCEId]       =useState(null);
  const[cEV,setCEV]         =useState("");
  const[tEId,setTEId]       =useState(null);
  const[cmd,setCmd]         =useState("");
  const[dark,setDark]       =useState(true);
  const[fStars,setFStars]   =useState(null);
  const[fAtLeast,setFAtLeast]=useState(true);
  const[fUnrated,setFUnrated]=useState(false);
  const[hovId,setHovId]     =useState(null);

  const cvs=useRef(null),ds=useRef(null),fileRef=useRef(null);
  const didDrag=useRef(false),nodesRef=useRef(nodes),edgesRef=useRef(edges);
  const hoverTimer=useRef(null);
  useEffect(()=>{nodesRef.current=nodes;},[nodes]);
  useEffect(()=>{edgesRef.current=edges;},[edges]);

  const C=useMemo(()=>mk(dark),[dark]);
  const selNode=sel?nodes.find(n=>n.id===sel):null;
  const lq=q.toLowerCase();
  const{ch,pa}=useMemo(()=>buildMaps(edges),[edges]);
  const depths=useMemo(()=>computeDepths(nodes,edges,ch),[nodes,edges,ch]);
  const rootIds=useMemo(()=>{const ci=new Set(edges.map(e=>e.t));return nodes.filter(n=>!ci.has(n.id)&&!n.pending&&!n.isNew).map(n=>n.id);},[nodes,edges]);
  const pending=nodes.filter(n=>n.pending);
  const regular=nodes.filter(n=>!n.pending&&!n.isNew);
  const stats=useMemo(()=>({
    total:regular.length,rated:regular.filter(n=>n.rating>0).length,
    unrated:regular.filter(n=>n.rating===0).length,top:regular.filter(n=>n.rating===5).length,
    pend:pending.length,dist:[0,1,2,3,4,5].map(r=>regular.filter(n=>n.rating===r).length),
  }),[nodes]);
  const dimIds=useMemo(()=>{
    const ids=new Set();
    nodes.forEach(n=>{
      const sf=lq&&!n.title.toLowerCase().includes(lq)&&!n.sub.toLowerCase().includes(lq);
      let ff=false;
      if(fUnrated)ff=n.rating!==0;
      else if(fStars)ff=fAtLeast?n.rating<fStars:n.rating!==fStars;
      if(sf||ff)ids.add(n.id);
    });
    return ids;
  },[nodes,lq,fStars,fAtLeast,fUnrated]);

  // ── Delete node ──
  const deleteNode=useCallback((id)=>{
    setNodes(p=>p.filter(n=>n.id!==id));
    setEdges(p=>p.filter(e=>e.f!==id&&e.t!==id));
    setSel(s=>s===id?null:s);
    setHovId(null);
  },[]);

  // ── Keyboard delete ──
  useEffect(()=>{
    const onKey=e=>{
      if(e.key!=="Delete"&&e.key!=="Backspace")return;
      const tag=document.activeElement?.tagName;
      if(tag==="INPUT"||tag==="TEXTAREA")return;
      if(sel){e.preventDefault();deleteNode(sel);}
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[sel,deleteNode]);

  // ── Hover ──
  const onNodeEnter=useCallback((id)=>{clearTimeout(hoverTimer.current);if(!drag)setHovId(id);},[drag]);
  const onNodeLeave=useCallback(()=>{hoverTimer.current=setTimeout(()=>setHovId(null),200);},[]);
  const onPlusEnter=useCallback(()=>clearTimeout(hoverTimer.current),[]);
  const onPlusLeave=useCallback(()=>{hoverTimer.current=setTimeout(()=>setHovId(null),200);},[]);

  // ── Add sibling ──
  const addSibling=useCallback((nodeId)=>{
    const node=nodesRef.current.find(n=>n.id===nodeId);if(!node)return;
    const parentId=(pa[nodeId]||[])[0]||null;
    const newId=`n-${Date.now()}`;
    setNodes(p=>[...p,{id:newId,title:"",sub:"",rating:0,stateColor:null,pending:false,isNew:true,
      x:node.x+NW+32,y:node.y,files:[],notes:"",createdAt:Date.now()}]);
    if(parentId)setEdges(p=>[...p,{f:parentId,t:newId}]);
    setCEId(newId);setCEV("");setHovId(null);
  },[pa]);

  // ── Add child ──
  const addChild=useCallback((nodeId)=>{
    const node=nodesRef.current.find(n=>n.id===nodeId);if(!node)return;
    const childNodes=(ch[nodeId]||[]).map(cid=>nodesRef.current.find(n=>n.id===cid)).filter(Boolean);
    const maxY=childNodes.length?Math.max(...childNodes.map(n=>n.y)):node.y;
    const newY=Math.max(node.y+NH+52,maxY+NH+20);
    const newId=`n-${Date.now()}`;
    setNodes(p=>[...p,{id:newId,title:"",sub:"",rating:0,stateColor:null,pending:false,isNew:true,
      x:node.x,y:newY,files:[],notes:"",createdAt:Date.now()}]);
    setEdges(p=>[...p,{f:nodeId,t:newId}]);
    setCEId(newId);setCEV("");setHovId(null);
    setExp(e=>{const s=new Set(e);s.add(nodeId);return s;});
  },[ch]);

  // ── Drag ──
  const onMD=useCallback((e,id)=>{
    if(cEId===id)return;
    e.stopPropagation();
    didDrag.current=false;
    ds.current={x:e.clientX,y:e.clientY,id};
  },[cEId]);

  useEffect(()=>{
    const mv=e=>{
      if(!ds.current)return;
      if(!drag){
        const dx=Math.abs(e.clientX-ds.current.x),dy=Math.abs(e.clientY-ds.current.y);
        if(dx>5||dy>5){
          didDrag.current=true;
          const{id}=ds.current;
          const node=nodesRef.current.find(n=>n.id===id);
          const r=cvs.current?.getBoundingClientRect();
          if(!node||!r)return;
          setDrag({id,ox:ds.current.x-r.left+cvs.current.scrollLeft-node.x,oy:ds.current.y-r.top+cvs.current.scrollTop-node.y});
        }
        return;
      }
      const r=cvs.current?.getBoundingClientRect();if(!r)return;
      setNodes(p=>p.map(n=>n.id===drag.id?{...n,
        x:Math.max(0,e.clientX-r.left+cvs.current.scrollLeft-drag.ox),
        y:Math.max(0,e.clientY-r.top+cvs.current.scrollTop-drag.oy)}:n));
    };
    const up=()=>setDrag(null);
    window.addEventListener("mousemove",mv);window.addEventListener("mouseup",up);
    return()=>{window.removeEventListener("mousemove",mv);window.removeEventListener("mouseup",up);};
  },[drag]);

  const scrollTo=useCallback((id)=>{
    const node=nodesRef.current.find(n=>n.id===id),el=cvs.current;if(!node||!el)return;
    el.scrollTo({left:node.x+NW/2-el.clientWidth/2,top:node.y+NH/2-el.clientHeight/2,behavior:"smooth"});
    setPulse(id);setTimeout(()=>setPulse(null),900);
  },[]);

  const onMU=useCallback((e,id)=>{
    e.stopPropagation();
    if(!didDrag.current&&ds.current?.id===id){setSel(s=>s===id?null:id);scrollTo(id);}
    didDrag.current=false;ds.current=null;
  },[scrollTo]);

  const onSelect=useCallback((id)=>{setSel(id);scrollTo(id);},[scrollTo]);
  const onToggle=useCallback((id)=>{setExp(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});},[]);
  const onDbl=useCallback((e,id)=>{e.stopPropagation();const node=nodes.find(n=>n.id===id);if(!node)return;setCEId(id);setCEV(node.title);},[nodes]);

  const confirmCEdit=useCallback(()=>{
    const node=nodesRef.current.find(n=>n.id===cEId);
    if(cEV.trim()){
      setNodes(p=>p.map(n=>n.id===cEId?{...n,title:cEV.trim(),isNew:false}:n));
    }else if(node?.isNew){
      setNodes(p=>p.filter(n=>n.id!==cEId));
      setEdges(p=>p.filter(e=>e.f!==cEId&&e.t!==cEId));
    }
    setCEId(null);
  },[cEId,cEV]);

  const setRating=(id,r)=>setNodes(p=>p.map(n=>n.id===id?{...n,rating:r}:n));
  const setNodeState=(id,c)=>setNodes(p=>p.map(n=>n.id===id?{...n,stateColor:c}:n));
  const confirmNode=(id)=>setNodes(p=>p.map(n=>n.id===id?{...n,pending:false}:n));
  const rejectNode=(id)=>{setNodes(p=>p.filter(n=>n.id!==id));setEdges(p=>p.filter(e=>e.f!==id&&e.t!==id));if(sel===id)setSel(null);};
  const confirmAll=()=>setNodes(p=>p.map(n=>({...n,pending:false})));

  const addDraft=()=>{
    if(!cmd.trim())return;
    const my=nodes.length?Math.max(...nodes.map(n=>n.y)):400;
    setNodes(p=>[...p,{id:`d-${Date.now()}`,title:cmd.trim(),sub:"",rating:0,stateColor:null,pending:true,isNew:false,
      x:80+Math.random()*300,y:my+110,files:[],notes:"",createdAt:Date.now()}]);
    setCmd("");
  };
  const addFile=e=>{
    const f=e.target.files[0];if(!f)return;
    const name=f.name.replace(/\.[^/.]+$/,""),ext=f.name.split(".").pop().toLowerCase();
    const my=nodes.length?Math.max(...nodes.map(n=>n.y)):400;
    setNodes(p=>[...p,{id:`d-${Date.now()}`,title:name,sub:"从文件导入",rating:0,stateColor:null,pending:true,isNew:false,
      x:80+Math.random()*300,y:my+110,files:[{n:f.name,t:ext}],notes:"",createdAt:Date.now()}]);
    e.target.value="";
  };
  const download=()=>{
    const txt=genSummary(nodes,stats);
    const blob=new Blob([txt],{type:"text/plain;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`技能树总结-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  };

  const W=Math.max(780,...nodes.map(n=>n.x+NW+120));
  const H=Math.max(520,...nodes.map(n=>n.y+NH+120));
  const path=selNode?ancestorPath(selNode.id,pa,nodes):[];
  const filterActive=fStars||fUnrated;
  const hovNode=hovId?nodes.find(n=>n.id===hovId):null;

  // ── BUG FIX: use individual border properties, NOT shorthand ──
  // Using `border` shorthand + `borderLeft` causes React diff to skip reapplying
  // borderLeft when only `border` changes. Individual props avoid this entirely.
  const getNodeSty=(node,isSel)=>{
    const is5=node.rating===5;
    const edgeOpacity=isSel?"rgba(245,158,11,0.9)":is5?"rgba(245,158,11,0.45)":C.bdr;
    return{
      borderTop:`1px solid ${edgeOpacity}`,
      borderRight:`1px solid ${edgeOpacity}`,
      borderBottom:`1px solid ${edgeOpacity}`,
      // Left border is independent — ALWAYS 3px orange for 5-star, unaffected by isSel changes
      borderLeft:is5?`3px solid ${ORANGE}`:`1px solid ${C.bdr}`,
      background:node.pending?"rgba(245,158,11,0.04)":is5?"rgba(245,158,11,0.03)":C.node,
      boxShadow:isSel?"0 0 16px rgba(245,158,11,0.28)":is5?"0 0 10px rgba(245,158,11,0.10)":"none",
    };
  };

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:C.bg,color:C.text,fontFamily:"system-ui,sans-serif",userSelect:"none"}}>
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>

        {/* ── LEFT ─────────────────────────── */}
        <div style={{width:222,background:C.panel,borderRight:`1px solid ${C.bdr}`,display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{padding:"12px",borderBottom:`1px solid ${C.bdr}`}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:10,fontWeight:600,color:C.dim,letterSpacing:1}}>技能总览</span>
              <div style={{display:"flex",gap:5}}>
                <button onClick={download} style={{padding:"3px 8px",background:"transparent",border:`1px solid ${GREEN}`,borderRadius:5,color:GREEN,fontSize:10,cursor:"pointer"}}>📋 总结</button>
                <button onClick={()=>setDark(d=>!d)} style={{padding:"3px 8px",background:"transparent",border:`1px solid ${C.bdr}`,borderRadius:5,color:C.dim,fontSize:12,cursor:"pointer"}}>{dark?"☀️":"🌙"}</button>
              </div>
            </div>
            {[5,4,3,2,1].map(r=>(
              <div key={r} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                <span style={{fontSize:9,color:r===5?ORANGE:C.dim,width:48,flexShrink:0,letterSpacing:-1}}>{"★".repeat(r)}{"☆".repeat(5-r)}</span>
                <div style={{flex:1,height:4,background:C.bdr,borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",background:r===5?ORANGE:GREEN,borderRadius:2,
                    width:`${stats.total?stats.dist[r]/stats.total*100:0}%`,transition:"width 0.4s"}}/>
                </div>
                <span style={{fontSize:9,color:C.dim,width:14,textAlign:"right"}}>{stats.dist[r]}</span>
              </div>
            ))}
            <div style={{marginTop:6,fontSize:9,color:C.muted}}>
              已评级 {stats.rated}/{stats.total} 节点{stats.unrated>0?` · ${stats.unrated} 未评级`:""}
            </div>
            {stats.pend>0&&(
              <div style={{marginTop:8,fontSize:10,color:ORANGE,background:"rgba(245,158,11,0.08)",
                padding:"4px 8px",borderRadius:4,display:"flex",justifyContent:"space-between",alignItems:"center",border:`1px solid rgba(245,158,11,0.2)`}}>
                <span>◦ {stats.pend} 个草稿</span>
                <span onClick={confirmAll} style={{cursor:"pointer",textDecoration:"underline",fontSize:9}}>合并全部</span>
              </div>
            )}
          </div>

          <div style={{padding:"8px 10px",borderBottom:`1px solid ${C.bdr}`}}>
            <div style={{position:"relative"}}>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="搜索节点..."
                style={{width:"100%",boxSizing:"border-box",background:C.sub,border:`1px solid ${C.bdr}`,
                  borderRadius:6,padding:"6px 26px 6px 28px",color:C.text,fontSize:11,outline:"none"}}/>
              <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:C.dim,fontSize:11}}>🔍</span>
              {q&&<span onClick={()=>setQ("")} style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",color:C.dim,fontSize:14,cursor:"pointer",lineHeight:1}}>×</span>}
            </div>
          </div>

          <div style={{flex:1,overflowY:"auto",padding:"6px 4px"}}>
            {rootIds.map(id=>(
              <TreeItem key={id} id={id} ch={ch} nodes={nodes} setNodes={setNodes} depth={0}
                sel={sel} onSelect={onSelect} exp={exp} onToggle={onToggle} lq={lq}
                tEId={tEId} setTEId={setTEId} C={C}/>
            ))}
            {pending.length>0&&(
              <div style={{marginTop:8,padding:"0 8px"}}>
                <div style={{fontSize:9,color:ORANGE,marginBottom:4}}>◦ 草稿</div>
                {pending.map(n=>(
                  <div key={n.id} onClick={()=>onSelect(n.id)}
                    style={{fontSize:11,color:ORANGE,padding:"3px 6px",cursor:"pointer",
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                      borderLeft:"2px solid rgba(245,158,11,0.4)",marginBottom:2}}>{n.title}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── CANVAS ───────────────────────── */}
        <div ref={cvs} style={{flex:1,overflow:"auto",cursor:drag?"grabbing":"default",background:C.bg}}>
          <div style={{position:"relative",width:W,height:H}}>

            <svg style={{position:"absolute",top:0,left:0,width:W,height:H,pointerEvents:"none"}}>
              {edges.map(e=>{
                const fn=nodes.find(n=>n.id===e.f),tn=nodes.find(n=>n.id===e.t);if(!fn||!tn)return null;
                const fx=fn.x+NW/2,fy=fn.y+NH,tx=tn.x+NW/2,ty=tn.y,my=(fy+ty)/2;
                const dim=dimIds.has(e.f)&&dimIds.has(e.t);
                return (
                  <path key={`${e.f}-${e.t}`}
                    d={`M ${fx},${fy} C ${fx},${my} ${tx},${my} ${tx},${ty}`}
                    fill="none" stroke={fn.rating===5?ORANGE:GREEN}
                    strokeWidth={fn.rating===5?1.6:1}
                    strokeOpacity={dim?0.04:0.28}
                    strokeDasharray={fn.rating===0||fn.isNew?"5,3":"none"}/>
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map(node=>{
              const isSel=node.id===sel,isPulse=node.id===pulse,isDim=dimIds.has(node.id);
              const isED=cEId===node.id,isHov=hovId===node.id;
              const ns=getNodeSty(node,isSel);
              return(
                <div key={node.id}
                  onMouseEnter={()=>onNodeEnter(node.id)}
                  onMouseLeave={onNodeLeave}
                  onMouseDown={e=>onMD(e,node.id)}
                  onMouseUp={e=>onMU(e,node.id)}
                  onDoubleClick={e=>onDbl(e,node.id)}
                  style={{position:"absolute",left:node.x,top:node.y,width:NW,minHeight:NH,
                    boxSizing:"border-box",...ns,borderRadius:9,
                    cursor:drag?.id===node.id?"grabbing":"grab",
                    zIndex:isSel?10:node.pending?8:node.rating===5?5:1,
                    opacity:isDim?0.14:1,transform:isPulse?"scale(1.06)":"scale(1)",
                    transition:drag?.id===node.id?"none":"opacity 0.2s,transform 0.22s"}}>

                  {/* × Delete button — appears on hover, top-right */}
                  {isHov&&!node.pending&&!node.isNew&&!isED&&(
                    <div onMouseDown={e=>e.stopPropagation()}
                      onClick={e=>{e.stopPropagation();deleteNode(node.id);}}
                      title="删除节点 (Delete键)"
                      style={{position:"absolute",top:5,right:5,width:17,height:17,
                        borderRadius:"50%",background:"rgba(239,68,68,0.12)",
                        border:"1px solid rgba(239,68,68,0.45)",color:RED,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:11,lineHeight:1,cursor:"pointer",zIndex:20}}>×</div>
                  )}

                  <div style={{padding:"9px 11px"}}>
                    {isED?(
                      <input autoFocus value={cEV} onChange={e=>setCEV(e.target.value)}
                        placeholder="输入节点名称..."
                        onKeyDown={e=>{
                          if(e.key==="Enter")confirmCEdit();
                          if(e.key==="Escape"){
                            if(node.isNew){setNodes(p=>p.filter(n=>n.id!==cEId));setEdges(p=>p.filter(e=>e.f!==cEId&&e.t!==cEId));}
                            setCEId(null);
                          }
                        }}
                        onBlur={confirmCEdit}
                        onClick={e=>e.stopPropagation()} onMouseDown={e=>e.stopPropagation()}
                        style={{width:"100%",background:"transparent",border:"none",
                          borderBottom:`1px solid ${ORANGE}`,color:C.text,
                          fontSize:12,fontWeight:600,outline:"none",padding:"0 0 2px",
                          marginBottom:2,fontFamily:"inherit"}}/>
                    ):(
                      <div title="双击改名" style={{fontSize:12,fontWeight:600,color:C.text,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:3}}>
                        {node.title||<span style={{color:C.muted,fontWeight:400,fontStyle:"italic"}}>未命名</span>}
                      </div>
                    )}
                    {!node.isNew&&<div style={{fontSize:10,color:C.dim,marginBottom:6}}>{node.sub}</div>}
                    {!node.isNew&&(
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <Stars value={node.rating} onChange={r=>setRating(node.id,r)} size={11} C={C}/>
                        <StateDots value={node.stateColor} onChange={c=>setNodeState(node.id,c)} C={C} size={9}/>
                      </div>
                    )}
                    {node.files.length>0&&<div style={{fontSize:9,color:C.muted,marginTop:4}}>📎{node.files.length}</div>}
                    {node.pending&&(
                      <div style={{display:"flex",gap:4,marginTop:6}}>
                        <button onMouseDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();confirmNode(node.id);}}
                          style={{fontSize:9,background:"rgba(16,185,129,0.12)",border:`1px solid ${GREEN}`,color:GREEN,borderRadius:3,padding:"2px 8px",cursor:"pointer"}}>✓ 确认</button>
                        <button onMouseDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();rejectNode(node.id);}}
                          style={{fontSize:9,background:"rgba(239,68,68,0.1)",border:`1px solid ${RED}`,color:RED,borderRadius:3,padding:"2px 8px",cursor:"pointer"}}>✗</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Connector-style + buttons (Miro/FigJam style) */}
            {hovNode&&!drag&&!cEId&&(
              <>
                <PlusBtn nx={hovNode.x} ny={hovNode.y} side="right"
                  color={ORANGE} label="添加同级节点（同一父节点）"
                  onClick={()=>addSibling(hovId)}
                  onEnter={onPlusEnter} onLeave={onPlusLeave}/>
                <PlusBtn nx={hovNode.x} ny={hovNode.y} side="bottom"
                  color={GREEN} label="添加子节点"
                  onClick={()=>addChild(hovId)}
                  onEnter={onPlusEnter} onLeave={onPlusLeave}/>
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT ────────────────────────── */}
        {selNode&&(
          <div style={{width:258,background:C.panel,borderLeft:`1px solid ${C.bdr}`,display:"flex",flexDirection:"column",flexShrink:0}}>
            <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.bdr}`,background:C.sub}}>
              <div style={{fontSize:9,color:C.muted,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{path.join(" › ")}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1,minWidth:0,marginRight:6}}>
                  <input value={selNode.title}
                    onChange={e=>setNodes(p=>p.map(n=>n.id===sel?{...n,title:e.target.value}:n))}
                    style={{width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${C.bdr}`,
                      color:C.text,fontSize:13,fontWeight:600,outline:"none",padding:"0 0 3px",marginBottom:5,fontFamily:"inherit"}}/>
                  <input value={selNode.sub}
                    onChange={e=>setNodes(p=>p.map(n=>n.id===sel?{...n,sub:e.target.value}:n))}
                    placeholder="副标题..."
                    style={{width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${C.bdr}`,
                      color:C.dim,fontSize:11,outline:"none",padding:"0 0 2px",marginBottom:4,fontFamily:"inherit"}}/>
                  <div style={{fontSize:9,color:C.muted}}>创建于 {fmtDate(selNode.createdAt)}</div>
                </div>
                <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:18,padding:0,lineHeight:1}}>×</button>
              </div>
            </div>

            <div style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:14}}>

              <div>
                <div style={{fontSize:9,color:C.dim,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>掌握评级</div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <Stars value={selNode.rating} onChange={r=>setRating(sel,r)} size={22} C={C}/>
                  <StateDots value={selNode.stateColor} onChange={c=>setNodeState(sel,c)} C={C} size={14}/>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,color:C.text}}>{RATING_LABELS[selNode.rating]}{selNode.rating>0&&` · ${selNode.rating}/5星`}</span>
                  {selNode.stateColor&&(
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,
                      background:selNode.stateColor==="green"?"rgba(16,185,129,0.12)":"rgba(245,158,11,0.12)",
                      color:selNode.stateColor==="green"?GREEN:ORANGE,
                      border:`1px solid ${selNode.stateColor==="green"?GREEN:ORANGE}`}}>
                      {STATE_LABELS[selNode.stateColor]}
                    </span>
                  )}
                </div>
              </div>

              {(ch[selNode.id]||[]).length>0&&(
                <div>
                  <div style={{fontSize:9,color:C.dim,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>子节点 ({(ch[selNode.id]||[]).length})</div>
                  {(ch[selNode.id]||[]).map(cid=>{
                    const cn=nodes.find(n=>n.id===cid);if(!cn)return null;
                    const gk=(ch[cid]||[]).length;
                    return(
                      <div key={cid} onClick={()=>{setSel(cid);scrollTo(cid);}}
                        style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",
                          background:C.sub,border:`1px solid ${C.bdr}`,
                          borderLeft:`3px solid ${cn.rating===5?ORANGE:C.bdr}`,
                          borderRadius:6,marginBottom:4,cursor:"pointer"}}>
                        <span style={{fontSize:12}}>{gk>0?"📂":"📄"}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:11,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cn.title}</div>
                          <div style={{fontSize:9,color:C.muted,marginTop:1}}>{fmtDate(cn.createdAt)}{gk>0?` · ${gk}子`:""}</div>
                        </div>
                        {cn.rating>0&&<span style={{fontSize:8,color:ORANGE,flexShrink:0,letterSpacing:-2}}>{"★".repeat(cn.rating)}</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {selNode.pending&&(
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>confirmNode(sel)} style={{flex:1,padding:"7px",background:"rgba(16,185,129,0.1)",border:`1px solid ${GREEN}`,color:GREEN,borderRadius:6,cursor:"pointer",fontSize:11}}>✓ 确认合并</button>
                  <button onClick={()=>rejectNode(sel)} style={{padding:"7px 12px",background:"rgba(239,68,68,0.08)",border:`1px solid ${RED}`,color:RED,borderRadius:6,cursor:"pointer",fontSize:11}}>✗ 删除</button>
                </div>
              )}

              <div>
                <div style={{fontSize:9,color:C.dim,textTransform:"uppercase",letterSpacing:1,marginBottom:7}}>笔记</div>
                <textarea value={selNode.notes}
                  onChange={e=>setNodes(p=>p.map(n=>n.id===sel?{...n,notes:e.target.value}:n))}
                  placeholder="添加笔记..." rows={3}
                  style={{width:"100%",boxSizing:"border-box",background:C.sub,border:`1px solid ${C.bdr}`,
                    borderRadius:6,padding:"8px 10px",color:C.text,fontSize:11.5,lineHeight:1.7,
                    outline:"none",resize:"vertical",fontFamily:"inherit"}}/>
              </div>

              <div>
                <div style={{fontSize:9,color:C.dim,textTransform:"uppercase",letterSpacing:1,marginBottom:7}}>附件 ({selNode.files.length})</div>
                {selNode.files.map((f,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",
                    background:C.sub,border:`1px solid ${C.bdr}`,borderRadius:6,marginBottom:4,fontSize:11,color:C.text}}>
                    <span style={{fontSize:13}}>{FI[f.t]||FI.default}</span>
                    <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.n}</span>
                    <span style={{fontSize:9,color:C.muted,background:C.bg,padding:"2px 5px",borderRadius:3,flexShrink:0}}>{f.t?.toUpperCase()}</span>
                  </div>
                ))}
                <button style={{marginTop:4,width:"100%",padding:7,background:"transparent",
                  border:`1px dashed ${C.bdr}`,borderRadius:6,color:C.muted,fontSize:11,cursor:"pointer"}}>
                  + 添加附件
                </button>
              </div>

              {/* Delete node button */}
              <div style={{paddingTop:4,borderTop:`1px solid ${C.bdr}`}}>
                <button onClick={()=>deleteNode(sel)}
                  style={{width:"100%",padding:"7px",background:"rgba(239,68,68,0.06)",
                    border:`1px solid rgba(239,68,68,0.35)`,borderRadius:6,
                    color:RED,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                  🗑 删除节点
                </button>
                <div style={{fontSize:9,color:C.muted,textAlign:"center",marginTop:4}}>或选中后按 Delete 键</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM ───────────────────────── */}
      <div style={{background:C.panel,borderTop:`1px solid ${C.bdr}`,padding:"8px 20px",flexShrink:0}}>
        <div style={{display:"flex",gap:4,marginBottom:8,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:10,color:C.dim,flexShrink:0,marginRight:2}}>筛选</span>
          {[1,2,3,4,5].map(i=>(
            <button key={i} onClick={()=>{if(fStars===i)setFStars(null);else{setFStars(i);setFUnrated(false);}}}
              style={{padding:"3px 9px",borderRadius:8,fontSize:10,cursor:"pointer",
                border:`1px solid ${fStars===i?ORANGE:C.bdr}`,
                background:fStars===i?"rgba(245,158,11,0.1)":"transparent",
                color:fStars===i?ORANGE:C.dim,transition:"all 0.1s"}}>
              ★{i}星
            </button>
          ))}
          {fStars&&(
            <button onClick={()=>setFAtLeast(a=>!a)}
              style={{padding:"3px 9px",borderRadius:8,fontSize:10,cursor:"pointer",
                border:`1px solid ${fAtLeast?GREEN:C.bdr}`,
                background:fAtLeast?"rgba(16,185,129,0.1)":"transparent",
                color:fAtLeast?GREEN:C.dim,transition:"all 0.1s"}}>以上</button>
          )}
          <button onClick={()=>{setFUnrated(f=>!f);setFStars(null);}}
            style={{padding:"3px 9px",borderRadius:8,fontSize:10,cursor:"pointer",
              border:`1px solid ${fUnrated?ORANGE:C.bdr}`,
              background:fUnrated?"rgba(245,158,11,0.1)":"transparent",
              color:fUnrated?ORANGE:C.dim,transition:"all 0.1s"}}>未评级</button>
          {(filterActive||q)&&(
            <button onClick={()=>{setFStars(null);setFUnrated(false);setFAtLeast(true);setQ("");}}
              style={{padding:"3px 8px",borderRadius:8,fontSize:10,cursor:"pointer",
                border:`1px solid ${C.bdr}`,background:"transparent",color:C.muted}}>清除</button>
          )}
          {fStars&&<span style={{fontSize:9,color:C.muted,marginLeft:2}}>{fAtLeast?`≥${fStars}★`:`仅${fStars}★`}</span>}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8,
          background:C.sub,border:`1px solid ${C.bdr}`,borderRadius:14,
          padding:"8px 10px 8px 16px",
          boxShadow:dark?"0 -2px 20px rgba(0,0,0,0.25)":"0 -1px 8px rgba(0,0,0,0.05)"}}>
          <input value={cmd} onChange={e=>setCmd(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&cmd.trim())addDraft();}}
            placeholder="输入技能名称，添加草稿节点..."
            style={{flex:1,background:"transparent",border:"none",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}/>
          <button onClick={()=>fileRef.current?.click()} title="上传文件"
            style={{width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",
              background:"transparent",border:`1px solid ${C.bdr}`,borderRadius:8,color:C.dim,fontSize:15,cursor:"pointer",flexShrink:0}}>📎</button>
          <input ref={fileRef} type="file" style={{display:"none"}} onChange={addFile}/>
          <button onClick={addDraft} disabled={!cmd.trim()}
            style={{padding:"6px 18px",
              background:cmd.trim()?ORANGE:"transparent",
              border:`1px solid ${cmd.trim()?ORANGE:C.bdr}`,
              borderRadius:10,color:cmd.trim()?"#1a0a00":C.muted,
              fontSize:12,cursor:cmd.trim()?"pointer":"default",
              fontWeight:cmd.trim()?600:400,flexShrink:0,transition:"all 0.15s"}}>
            添加草稿
          </button>
          {pending.length>0&&(
            <button onClick={confirmAll}
              style={{padding:"6px 16px",background:"rgba(16,185,129,0.12)",
                border:`1px solid ${GREEN}`,borderRadius:10,color:GREEN,
                fontSize:12,cursor:"pointer",flexShrink:0,fontWeight:500}}>
              ✓ 合并 ({pending.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
