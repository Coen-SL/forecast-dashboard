import { useState, useEffect, useCallback, useRef } from 'react'

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const MONTHS = ['JAN','FEB','MAA','APR','MEI','JUN','JUL','AUG','SEP','OKT','NOV','DEC']
const MONTHS_S = ['J','F','M','A','M','J','J','A','S','O','N','D']
const LS_KEY = 'horeca_sheet_id'
const LS_URL = 'horeca_sheet_url'
const REFRESH_MS = 5 * 60 * 1000

const OUTLETS = [
  { id:'brasserie',     label:'Brasserie',     share:0.38 },
  { id:'snackbar',      label:'Snackbar',       share:0.12 },
  { id:'pizzalimone',   label:'PizzaLimone',    share:0.14 },
  { id:'steaksburgers', label:'SteaksBurgers',  share:0.16 },
  { id:'bowling',       label:'Bowling',         share:0.08 },
  { id:'chefe',         label:'ChefE',           share:0.07 },
  { id:'speelhal',      label:'Speelhal',        share:0.05 },
]

const SCENARIOS = [
  { nr:1, van:0,     tot:2000,  ukok:14.5, ubed:25.5, ppu:25.0, pay:0.70 },
  { nr:2, van:2000,  tot:3000,  ukok:37,   ubed:34,   ppu:35.2, pay:0.50 },
  { nr:3, van:3000,  tot:6000,  ukok:44.5, ubed:56,   ppu:44.8, pay:0.39 },
  { nr:4, van:6000,  tot:10000, ukok:74.5, ubed:85,   ppu:50.2, pay:0.35 },
  { nr:5, van:10000, tot:13000, ukok:81.5, ubed:132,  ppu:53.9, pay:0.33 },
  { nr:6, van:13000, tot:18000, ukok:87.5, ubed:152,  ppu:62.6, pay:0.27 },
]

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────
const T = {
  navy:'#0F1B2D', nav2:'#162236', surf:'#162236', surf2:'#1C2D45',
  bud:'#E8B84B', budbg:'rgba(232,184,75,.10)', budbdr:'rgba(232,184,75,.22)',
  fc:'#3B82F6',  fcbg:'rgba(59,130,246,.10)',  fcbdr:'rgba(59,130,246,.22)',
  ac:'#22C55E',  acbg:'rgba(34,197,94,.10)',   acbdr:'rgba(34,197,94,.22)',
  warn:'#EF4444',warnbg:'rgba(239,68,68,.10)',
  txt:'#F0F4F8', txt2:'rgba(240,244,248,.60)', txt3:'rgba(240,244,248,.32)',
  bdr:'rgba(255,255,255,.08)', bdr2:'rgba(255,255,255,.14)',
  r:8, r2:10,
}
const SC_COLORS = ['#7C3AED','#2563EB','#0891B2','#059669','#D97706','#DC2626']

// ─────────────────────────────────────────────────────────────
// FALLBACK DATA
// ─────────────────────────────────────────────────────────────
const B_OMZ = [89204,95340,101820,285600,178340,192040,498600,443200,151840,195420,87540,115760]
const B_GN  = [16800,17200,17400,52000,32000,34000,88000,78000,26000,34000,16000,21000]
const B_PAY = [0.28,0.27,0.26,0.22,0.24,0.23,0.19,0.20,0.25,0.24,0.28,0.27]
const B_DI  = [0.407,0.417,0.427,0.467,0.447,0.457,0.497,0.487,0.437,0.447,0.407,0.417]
const B_PPU = [44.2,45.1,46.8,54.3,50.1,52.4,68.9,67.2,47.8,50.3,43.1,45.7]
const B_URN = [2018,2114,2176,5259,3557,3665,7237,6595,3177,3884,2032,2533]

const F_OMZ = [112800,119280,125400,325800,212600,228040,548400,488200,178640,220640,101540,138000]
const F_GN  = [19800,20800,21200,57000,37000,39200,96800,86000,29400,38600,18800,24400]
const F_PAY = [0.265,0.259,0.251,0.218,0.238,0.229,0.188,0.196,0.248,0.237,0.271,0.263]
const F_DI  = [0.422,0.428,0.436,0.469,0.449,0.458,0.499,0.491,0.439,0.450,0.416,0.424]
const F_PPU = [47.3,48.6,50.2,57.8,53.4,55.9,72.1,70.8,50.9,53.8,46.4,48.9]
const F_URN = [2384,2453,2498,5636,3981,4079,7606,6892,3511,4101,2189,2822]

const A_OMZ = [108400,122600,null,null,null,null,null,null,null,null,null,null]
const A_GN  = [19200,21400,null,null,null,null,null,null,null,null,null,null]
const A_PAY = [0.271,0.262,null,null,null,null,null,null,null,null,null,null]
const A_DI  = [0.410,0.428,null,null,null,null,null,null,null,null,null,null]
const A_PPU = [46.1,49.8,null,null,null,null,null,null,null,null,null,null]
const A_URN = [2350,2460,null,null,null,null,null,null,null,null,null,null]

const sumV = a => a.filter(v=>v!=null).reduce((s,v)=>s+v,0)
const avgV = a => { const v=a.filter(x=>x!=null); return v.length?sumV(v)/v.length:null }

function buildFallback() {
  const monthly = MONTHS.map((maand,i) => ({
    maand, index:i,
    budget:  { omzet:B_OMZ[i], gn:B_GN[i], gnb:B_OMZ[i]/(B_GN[i]||1), payPct:B_PAY[i], diPct:B_DI[i], ppu:B_PPU[i], uren:B_URN[i] },
    forecast:{ omzet:F_OMZ[i], gn:F_GN[i], gnb:F_OMZ[i]/(F_GN[i]||1), payPct:F_PAY[i], diPct:F_DI[i], ppu:F_PPU[i], uren:F_URN[i] },
    actueel: { omzet:A_OMZ[i], gn:A_GN[i],  gnb:A_GN[i]?A_OMZ[i]/(A_GN[i]||1):null, payPct:A_PAY[i], diPct:A_DI[i], ppu:A_PPU[i], uren:A_URN[i] },
  }))
  const actueelMonths = A_OMZ.filter(v=>v!=null).length
  const bo=sumV(B_OMZ),bg=sumV(B_GN),fo=sumV(F_OMZ),fg=sumV(F_GN)
  const ao=sumV(A_OMZ.filter(Boolean)),ag=sumV(A_GN.filter(Boolean))
  const outletJaar = OUTLETS.map(o=>({...o,
    budget:  {omzet:Math.round(bo*o.share),gn:Math.round(bg*o.share)},
    forecast:{omzet:Math.round(fo*o.share),gn:Math.round(fg*o.share)},
    actueel: {omzet:Math.round(ao*o.share),gn:Math.round(ag*o.share)},
  }))
  return {
    monthly, actueelMonths, outletJaar,
    jaar:{
      budget:  {omzet:bo,gn:bg,gnb:bo/bg,payPct:avgV(B_PAY),diPct:avgV(B_DI),ppu:avgV(B_PPU),uren:sumV(B_URN),cosPct:0.293,opexPct:0.02},
      forecast:{omzet:fo,gn:fg,gnb:fo/fg,payPct:avgV(F_PAY),diPct:avgV(F_DI),ppu:avgV(F_PPU),uren:sumV(F_URN),cosPct:0.293,opexPct:0.02},
      actueel: {omzet:ao,gn:ag,gnb:ag?ao/ag:null,payPct:avgV(A_PAY.filter(Boolean)),diPct:avgV(A_DI.filter(Boolean)),ppu:avgV(A_PPU.filter(Boolean)),uren:sumV(A_URN.filter(Boolean)),cosPct:0.298,opexPct:0.021},
    },
    meta:{source:'fallback',lastUpdated:new Date().toISOString()}
  }
}

// ─────────────────────────────────────────────────────────────
// GOOGLE SHEETS ADAPTER  
// ─────────────────────────────────────────────────────────────
const extractId = raw => { if(!raw) return ''; const m=raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/); return m?m[1]:raw.trim() }
const validId   = id => typeof id==='string'&&id.length>20&&/^[a-zA-Z0-9_-]+$/.test(id)

// MAANDOVERZICHT row map (1-indexed Excel rows)
const MO_ROWS = {
  omzetBud:4,omzetFC:5,omzetAC:6,
  gnBud:11,gnFC:12,gnAC:13,
  gnbBud:16,gnbFC:17,gnbAC:18,
  urenBud:21,urenFC:22,urenAC:23,
  payPctBud:29,payPctFC:30,payPctAC:31,
  cosPct:37,
  diPctBud:48,diPctFC:49,diPctAC:50,
  ppuBud:53,ppuFC:54,ppuAC:55,
}

async function fetchMO(sheetId) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent('MAANDOVERZICHT')}&range=A1:O60`
  const res = await fetch(url, {cache:'no-store'})
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const raw = await res.text()
  const s=raw.indexOf('{'), e=raw.lastIndexOf('}')
  const json = JSON.parse(raw.slice(s,e+1))
  if (!json.table?.rows) throw new Error('Lege respons van Google Sheets')
  // Parse into 2D array  (rows 0-indexed, cols 0-indexed)
  return json.table.rows.map(row =>
    (row.c||[]).map(cell => {
      if (!cell||cell.v==null) return null
      return typeof cell.v==='number'?cell.v:parseFloat(String(cell.v).replace(',','.'))
    })
  )
}

function rowVals(grid, excelRow) {
  const r = grid[excelRow-1]
  if (!r) return Array(13).fill(null)
  // Columns C..O = indices 2..14 in grid (fetched from A1)
  return Array.from({length:13}, (_,i) => {
    const v = r[2+i]
    return (v===null||v===undefined||isNaN(v)) ? null : v
  })
}

async function fetchFromSheets(sheetId) {
  const grid = await fetchMO(sheetId)
  const get  = row => rowVals(grid,row).slice(0,12)  // 12 months
  const getY = row => rowVals(grid,row)[12]           // JAAR col

  const actueelMonths = get(MO_ROWS.omzetAC).filter(v=>v!=null&&v>0).length

  const monthly = MONTHS.map((maand,i) => ({
    maand, index:i,
    budget:  {omzet:get(MO_ROWS.omzetBud)[i],gn:get(MO_ROWS.gnBud)[i],gnb:get(MO_ROWS.gnbBud)[i],payPct:get(MO_ROWS.payPctBud)[i],diPct:get(MO_ROWS.diPctBud)[i],ppu:get(MO_ROWS.ppuBud)[i],uren:get(MO_ROWS.urenBud)[i]},
    forecast:{omzet:get(MO_ROWS.omzetFC)[i], gn:get(MO_ROWS.gnFC)[i], gnb:get(MO_ROWS.gnbFC)[i], payPct:get(MO_ROWS.payPctFC)[i], diPct:get(MO_ROWS.diPctFC)[i], ppu:get(MO_ROWS.ppuFC)[i], uren:get(MO_ROWS.urenFC)[i]},
    actueel: {omzet:get(MO_ROWS.omzetAC)[i], gn:get(MO_ROWS.gnAC)[i], gnb:get(MO_ROWS.gnbAC)[i], payPct:get(MO_ROWS.payPctAC)[i],diPct:get(MO_ROWS.diPctAC)[i],ppu:get(MO_ROWS.ppuAC)[i], uren:get(MO_ROWS.urenAC)[i]},
  }))

  const mkJaar = (omR,gnR,gnbR,payR,diR,ppuR,urnR) => {
    const o = getY(omR) ?? sumV(get(omR))
    const g = getY(gnR) ?? sumV(get(gnR))
    return {omzet:o,gn:g,gnb:g?o/g:null,payPct:getY(payR)??avgV(get(payR)),diPct:getY(diR)??avgV(get(diR)),ppu:getY(ppuR)??avgV(get(ppuR)),uren:getY(urnR)??sumV(get(urnR)),cosPct:get(MO_ROWS.cosPct)[0]??0.293,opexPct:0.02}
  }

  const fb = buildFallback()  // for outlet data which MO doesn't have

  return {
    monthly, actueelMonths, outletJaar: fb.outletJaar,
    jaar: {
      budget:  mkJaar(MO_ROWS.omzetBud,MO_ROWS.gnBud,MO_ROWS.gnbBud,MO_ROWS.payPctBud,MO_ROWS.diPctBud,MO_ROWS.ppuBud,MO_ROWS.urenBud),
      forecast:mkJaar(MO_ROWS.omzetFC, MO_ROWS.gnFC, MO_ROWS.gnbFC, MO_ROWS.payPctFC, MO_ROWS.diPctFC, MO_ROWS.ppuFC, MO_ROWS.urenFC),
      actueel: mkJaar(MO_ROWS.omzetAC, MO_ROWS.gnAC, MO_ROWS.gnbAC, MO_ROWS.payPctAC, MO_ROWS.diPctAC, MO_ROWS.ppuAC, MO_ROWS.urenAC),
    },
    meta:{source:'google-sheets',lastUpdated:new Date().toISOString()}
  }
}

async function loadData(sheetId) {
  if (!sheetId||!validId(sheetId)) return buildFallback()
  try {
    return await fetchFromSheets(sheetId)
  } catch(e) {
    console.error('[Sheets]', e.message)
    return {...buildFallback(), meta:{source:'fallback',error:e.message,lastUpdated:new Date().toISOString()}}
  }
}

// ─────────────────────────────────────────────────────────────
// FORMAT UTILS
// ─────────────────────────────────────────────────────────────
const fmt = {
  eurK: v => {
    if (v==null||isNaN(v)) return '—'
    if (Math.abs(v)>=1e6) return '€\u00a0'+(v/1e6).toFixed(2).replace('.',',')+'\u00a0M'
    if (Math.abs(v)>=1e3) return '€\u00a0'+(v/1e3).toFixed(0).replace('.',',')+'\u00a0K'
    return '€\u00a0'+Math.round(v).toLocaleString('nl-NL')
  },
  eur:  v => v==null?'—':'€\u00a0'+Math.round(v).toLocaleString('nl-NL'),
  eur2: v => v==null?'—':'€\u00a0'+Number(v).toFixed(2).replace('.',','),
  pct:  v => { if(v==null) return '—'; const p=Math.abs(v)>2?v:v*100; return p.toFixed(1).replace('.',',')+'\u00a0%' },
  num:  v => v==null?'—':Math.round(v).toLocaleString('nl-NL'),
  delta:(actual,ref) => {
    if(actual==null||!ref) return {lbl:'—',sign:0}
    const d=(actual-ref)/Math.abs(ref)
    const sign=d>0.001?1:d<-0.001?-1:0
    return {lbl:(sign>0?'+':'')+((d*100).toFixed(1).replace('.',','))+'\u00a0%', sign}
  },
}

// ─────────────────────────────────────────────────────────────
// BASE UI PRIMITIVES
// ─────────────────────────────────────────────────────────────
const Card = ({children,style,accent}) => (
  <div style={{background:T.surf,border:`1px solid ${T.bdr}`,borderRadius:T.r2,padding:'16px 18px',position:'relative',overflow:'hidden',...style}}>
    {accent&&<div style={{position:'absolute',top:0,left:0,right:0,height:2,background:accent}}/>}
    {children}
  </div>
)

const Pill = ({label,color='#60A5FA',bg='rgba(59,130,246,.1)'}) => (
  <span style={{padding:'2px 9px',borderRadius:20,fontSize:10,fontWeight:700,letterSpacing:'.05em',background:bg,color,border:`1px solid ${color}35`}}>
    {label}
  </span>
)

const SHead = ({title,right}) => (
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
    <span style={{fontSize:10,fontWeight:700,letterSpacing:'.09em',textTransform:'uppercase',color:T.txt3}}>{title}</span>
    {right}
  </div>
)

const PageHead = ({title,sub,badge}) => (
  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:22}}>
    <div>
      <div style={{fontSize:20,fontWeight:600,color:T.txt,marginBottom:3}}>{title}</div>
      {sub&&<div style={{fontSize:13,color:T.txt2}}>{sub}</div>}
    </div>
    {badge}
  </div>
)

const Grid4 = ({children,style}) => <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,...style}}>{children}</div>
const Grid3 = ({children,style}) => <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,...style}}>{children}</div>

const Loader = () => (
  <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:200,color:T.txt3,gap:10}}>
    <div style={{width:18,height:18,border:`2px solid rgba(59,130,246,.25)`,borderTopColor:T.fc,borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
    Data laden…
  </div>
)

const DeltaBadge = ({sign,lbl,higherBetter=true}) => {
  if(!lbl||lbl==='—') return null
  const good=(sign>0&&higherBetter)||(sign<0&&!higherBetter)
  const col = sign===0?T.txt3:good?T.ac:T.warn
  const bg  = sign===0?'rgba(255,255,255,.06)':good?T.acbg:T.warnbg
  return <span style={{fontSize:10,fontWeight:700,padding:'2px 6px',borderRadius:3,background:bg,color:col}}>{lbl}</span>
}

function KpiCard({label,value,d,dRef,accent=T.fc,higherBetter=true,sub,note}){
  const delta = fmt.delta(d,dRef)
  return(
    <Card accent={accent}>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase',color:T.txt2,marginBottom:6}}>{label}</div>
      <div style={{fontSize:22,fontWeight:600,color:T.txt,fontVariantNumeric:'tabular-nums',lineHeight:1.2,marginBottom:5}}>{value}</div>
      <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
        {dRef!=null&&<DeltaBadge sign={delta.sign} lbl={delta.lbl} higherBetter={higherBetter}/>}
        {sub&&<span style={{fontSize:11,color:T.txt3}}>{sub}</span>}
      </div>
      {note&&<div style={{fontSize:11,color:T.txt3,marginTop:4}}>{note}</div>}
    </Card>
  )
}

// Bar chart (pure CSS — no external lib needed)
function BarChart({data,height=170,showLegend=true}){
  if(!data?.length) return null
  const allV = data.flatMap(d=>[d.bud,d.fc,d.ac].filter(v=>v!=null))
  const max = Math.max(...allV)||1
  const bar = (v,color,borderColor) => v!=null?(
    <div style={{flex:1,background:color,borderRadius:'2px 2px 0 0',
      height:`${Math.max(2,Math.round((v/max)*100))}%`,borderTop:`1px solid ${borderColor}55`,minHeight:2}}
      title={fmt.eurK(v)}/>
  ):null
  return(
    <div>
      {showLegend&&(
        <div style={{display:'flex',gap:14,marginBottom:10}}>
          {[['#E8B84B','Budget'],['#3B82F6','Forecast'],['#22C55E','Actueel']].map(([c,l])=>(
            <div key={l} style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:T.txt3}}>
              <div style={{width:10,height:4,borderRadius:1,background:c}}/>{l}
            </div>
          ))}
        </div>
      )}
      <div style={{display:'flex',alignItems:'flex-end',gap:3,height}}>
        {data.map((d,i)=>(
          <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',height:'100%',justifyContent:'flex-end'}}>
            <div style={{width:'100%',display:'flex',gap:1,alignItems:'flex-end',flex:1}}>
              {bar(d.bud,'rgba(232,184,75,.5)','#E8B84B')}
              {bar(d.fc, 'rgba(59,130,246,.65)','#3B82F6')}
              {bar(d.ac, 'rgba(34,197,94,.75)','#22C55E')}
            </div>
            <div style={{fontSize:9,color:T.txt3,marginTop:3}}>{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const SparkBar = ({value,max,color,label,subLabel}) => (
  <div style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderBottom:`1px solid ${T.bdr}`}}>
    <div style={{fontSize:12,color:T.txt2,width:96,flexShrink:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{label}</div>
    <div style={{flex:1,height:5,background:'rgba(255,255,255,.06)',borderRadius:3,overflow:'hidden'}}>
      <div style={{height:'100%',width:`${Math.round((value/(max||1))*100)}%`,background:color,borderRadius:3,transition:'.4s'}}/>
    </div>
    <div style={{fontSize:12,fontWeight:500,width:68,textAlign:'right',fontVariantNumeric:'tabular-nums',color,flexShrink:0}}>{subLabel}</div>
  </div>
)

// ─────────────────────────────────────────────────────────────
// PILLAR STRIP (used on Overzicht)
// ─────────────────────────────────────────────────────────────
function PillarStrip({jaar}){
  if(!jaar) return null
  return(
    <Grid3 style={{marginBottom:18}}>
      {[
        {label:'Budget',    d:jaar.budget,  col:'#E8B84B', bg:T.budbg, bdr:T.budbdr},
        {label:'Forecast',  d:jaar.forecast,col:'#60A5FA', bg:T.fcbg,  bdr:T.fcbdr},
        {label:'Actueel YTD',d:jaar.actueel,col:'#4ADE80', bg:T.acbg,  bdr:T.acbdr},
      ].map(({label,d,col,bg,bdr})=>(
        <div key={label} style={{background:bg,border:`1px solid ${bdr}`,borderRadius:T.r2,padding:'14px 16px'}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:col,marginBottom:12}}>{label}</div>
          {[['Omzet',fmt.eurK(d?.omzet)],['GN',fmt.num(d?.gn)],['GNB',fmt.eur2(d?.gnb)],['Payroll',fmt.pct(d?.payPct)],['DI',fmt.pct(d?.diPct)],['PPU',fmt.eur2(d?.ppu)]].map(([k,v])=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:`1px solid rgba(255,255,255,.05)`}}>
              <span style={{fontSize:12,color:T.txt2}}>{k}</span>
              <span style={{fontSize:13,fontWeight:500,fontVariantNumeric:'tabular-nums'}}>{v}</span>
            </div>
          ))}
        </div>
      ))}
    </Grid3>
  )
}

// ─────────────────────────────────────────────────────────────
// OUTLET TABLE
// ─────────────────────────────────────────────────────────────
function OutletTable({rows}){
  if(!rows) return null
  const totalFC = rows.reduce((s,r)=>s+(r.forecast?.omzet||0),0)
  const th = (label,right) => ({fontSize:10,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:T.txt3,padding:'7px 12px',textAlign:right?'right':'left',borderBottom:`1px solid ${T.bdr}`})
  const td = {padding:'8px 12px',fontSize:13,textAlign:'right',fontVariantNumeric:'tabular-nums',borderBottom:`1px solid ${T.bdr}`}
  return(
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',minWidth:480}}>
        <thead><tr>
          <th style={th('Outlet',false)}>Outlet</th>
          <th style={{...th('Budget',true),color:T.bud}}>Budget</th>
          <th style={{...th('Forecast',true),color:'#60A5FA'}}>Forecast</th>
          <th style={th('FC vs Bud',true)}>FC vs Bud</th>
          <th style={th('Aandeel',true)}>Aandeel</th>
        </tr></thead>
        <tbody>
          {rows.map(r=>{
            const d = fmt.delta(r.forecast?.omzet,r.budget?.omzet)
            const share = totalFC?Math.round((r.forecast?.omzet||0)/totalFC*100):0
            return(
              <tr key={r.id}>
                <td style={{...td,textAlign:'left',fontWeight:500}}>{r.label}</td>
                <td style={td}>{fmt.eurK(r.budget?.omzet)}</td>
                <td style={{...td,color:'#60A5FA',fontWeight:500}}>{fmt.eurK(r.forecast?.omzet)}</td>
                <td style={{...td,color:d.sign>0?T.ac:d.sign<0?T.warn:T.txt3}}>{d.lbl}</td>
                <td style={td}>
                  <div style={{display:'flex',alignItems:'center',gap:7}}>
                    <div style={{width:56,height:4,background:'rgba(255,255,255,.07)',borderRadius:2,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${share}%`,background:T.fc,borderRadius:2}}/>
                    </div>
                    <span style={{fontSize:11,color:T.txt3,minWidth:26}}>{share}%</span>
                  </div>
                </td>
              </tr>
            )
          })}
          <tr style={{background:T.surf2}}>
            <td style={{...td,textAlign:'left',fontWeight:700,borderBottom:'none'}}>Park Totaal</td>
            <td style={{...td,fontWeight:700,borderBottom:'none'}}>{fmt.eurK(rows.reduce((s,r)=>s+(r.budget?.omzet||0),0))}</td>
            <td style={{...td,fontWeight:700,color:'#60A5FA',borderBottom:'none'}}>{fmt.eurK(totalFC)}</td>
            <td style={{...td,color:T.ac,fontWeight:700,borderBottom:'none'}}>{fmt.delta(totalFC,rows.reduce((s,r)=>s+(r.budget?.omzet||0),0)).lbl}</td>
            <td style={{...td,borderBottom:'none'}}><span style={{fontSize:11,color:T.txt3}}>100%</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// PAGES
// ─────────────────────────────────────────────────────────────
function Overzicht({data}){
  if(!data) return<Loader/>
  const{jaar,monthly,outletJaar}=data, b=jaar.budget,fc=jaar.forecast,a=jaar.actueel
  const chartData = monthly.map(m=>({label:MONTHS_S[m.index],bud:m.budget.omzet,fc:m.forecast.omzet,ac:m.actueel.omzet}))
  return(
    <div style={{padding:22}}>
      <PageHead title="Park Overzicht 2026" sub="Budget · Forecast · Actueel — alle outlets gecombineerd"
        badge={<Pill label="Live dashboard"/>}/>
      <PillarStrip jaar={jaar}/>
      <SHead title="Forecast vs Budget — afwijking" right={<Pill label="Forecast actief"/>}/>
      <Grid4 style={{marginBottom:20}}>
        <KpiCard label="Omzet FC" value={fmt.eurK(fc?.omzet)} d={fc?.omzet} dRef={b?.omzet} sub="vs Budget" accent={T.fc}/>
        <KpiCard label="Gastnachten FC" value={fmt.num(fc?.gn)} d={fc?.gn} dRef={b?.gn} sub="vs Budget" accent={T.fc}/>
        <KpiCard label="GNB Forecast" value={fmt.eur2(fc?.gnb)} d={fc?.gnb} dRef={b?.gnb} sub="vs Budget" accent={T.fc}/>
        <KpiCard label="DI Forecast" value={fmt.pct(fc?.diPct)} sub="% van omzet" accent={T.fc}/>
        <KpiCard label="PPU Forecast" value={fmt.eur2(fc?.ppu)} d={fc?.ppu} dRef={b?.ppu} sub="vs Budget" accent={T.fc}/>
        <KpiCard label="Payroll FC" value={fmt.pct(fc?.payPct)} accent={fc?.payPct>0.30?T.warn:T.fc}
          higherBetter={false} note={fc?.payPct>0.30?'⚠ Boven alarm 30%':null}/>
        <KpiCard label="COS Forecast" value={fmt.pct(fc?.cosPct??0.293)} accent={T.fc} higherBetter={false}/>
        {a?.omzet>0&&<KpiCard label="Actueel vs FC" value={fmt.eurK(a?.omzet)} d={a?.omzet} dRef={fc?.omzet} sub="omzet YTD" accent={T.ac}/>}
      </Grid4>
      <SHead title="Omzet per maand — alle drie pilaren"/>
      <Card style={{marginBottom:20}}><BarChart data={chartData}/></Card>
      {outletJaar&&<><SHead title="Omzet Forecast per outlet"/><Card><OutletTable rows={outletJaar}/></Card></>}
    </div>
  )
}

function Budget({data}){
  if(!data) return<Loader/>
  const b=data.jaar.budget
  const chartData = data.monthly.map(m=>({label:MONTHS_S[m.index],bud:m.budget.omzet}))
  return(
    <div style={{padding:22}}>
      <PageHead title="Budget 2026" sub="Goedgekeurd jaarplan — alle outlets gecombineerd"
        badge={<Pill label="Budget" color={T.bud} bg={T.budbg}/>}/>
      <Grid4 style={{marginBottom:20}}>
        <KpiCard label="Omzet Budget" value={fmt.eurK(b?.omzet)} accent={T.bud} note="Jaarnorm"/>
        <KpiCard label="GN Budget" value={fmt.num(b?.gn)} accent={T.bud} note="Gastnachten"/>
        <KpiCard label="GNB Budget" value={fmt.eur2(b?.gnb)} accent={T.bud} note="€ / gast"/>
        <KpiCard label="PPU Budget" value={fmt.eur2(b?.ppu)} accent={T.bud} note="€ / uur"/>
        <KpiCard label="Payroll Budget" value={fmt.pct(b?.payPct)} accent={T.bud} higherBetter={false}/>
        <KpiCard label="COS Budget" value={fmt.pct(b?.cosPct??0.293)} accent={T.bud} higherBetter={false}/>
        <KpiCard label="OPEX Budget" value={fmt.pct(b?.opexPct??0.02)} accent={T.bud} higherBetter={false}/>
        <KpiCard label="DI Budget" value={fmt.pct(b?.diPct)} accent={T.bud}/>
      </Grid4>
      <SHead title="Budget — maandverdeling omzet"/>
      <Card>
        <div style={{display:'flex',gap:14,marginBottom:10}}>
          <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:T.txt3}}>
            <div style={{width:10,height:4,borderRadius:1,background:T.bud}}/> Budget
          </div>
        </div>
        <BarChart data={chartData} showLegend={false}/>
      </Card>
    </div>
  )
}

function Forecast({data}){
  if(!data) return<Loader/>
  const b=data.jaar.budget,fc=data.jaar.forecast
  const chartData = data.monthly.map(m=>({label:MONTHS_S[m.index],bud:m.budget.omzet,fc:m.forecast.omzet}))
  return(
    <div style={{padding:22}}>
      <PageHead title="Forecast 2026" sub="Actuele voorspelling — bijgewerkt naar best inzicht"
        badge={<Pill label="Forecast actief"/>}/>
      <Grid4 style={{marginBottom:20}}>
        <KpiCard label="Omzet FC" value={fmt.eurK(fc?.omzet)} d={fc?.omzet} dRef={b?.omzet} sub="vs Budget" accent={T.fc}/>
        <KpiCard label="GN Forecast" value={fmt.num(fc?.gn)} d={fc?.gn} dRef={b?.gn} sub="vs Budget" accent={T.fc}/>
        <KpiCard label="GNB Forecast" value={fmt.eur2(fc?.gnb)} d={fc?.gnb} dRef={b?.gnb} sub="vs Budget" accent={T.fc}/>
        <KpiCard label="PPU Forecast" value={fmt.eur2(fc?.ppu)} d={fc?.ppu} dRef={b?.ppu} sub="vs Budget" accent={T.fc}/>
        <KpiCard label="Payroll FC" value={fmt.pct(fc?.payPct)} accent={fc?.payPct>0.30?T.warn:T.fc}
          higherBetter={false} note={fc?.payPct>0.30?'⚠ Boven alarm':null}/>
        <KpiCard label="COS Forecast" value={fmt.pct(fc?.cosPct??0.293)} accent={T.fc} higherBetter={false}/>
        <KpiCard label="OPEX Forecast" value={fmt.pct(fc?.opexPct??0.02)} accent={T.fc} higherBetter={false}/>
        <KpiCard label="DI Forecast" value={fmt.pct(fc?.diPct)} d={fc?.diPct} dRef={b?.diPct} sub="vs Budget" accent={T.fc}/>
      </Grid4>
      <SHead title="Forecast vs Budget — maandvergelijking"/>
      <Card>
        <div style={{display:'flex',gap:14,marginBottom:10}}>
          {[['#E8B84B','Budget'],['#3B82F6','Forecast']].map(([c,l])=>(
            <div key={l} style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:T.txt3}}>
              <div style={{width:10,height:4,borderRadius:1,background:c}}/>{l}
            </div>
          ))}
        </div>
        <BarChart data={chartData} showLegend={false}/>
      </Card>
    </div>
  )
}

function Actueel({data}){
  if(!data) return<Loader/>
  const a=data.jaar.actueel,fc=data.jaar.forecast,b=data.jaar.budget
  const n=data.actueelMonths??0
  const lastMaand=n>0?MONTHS[n-1]:'—'
  if(n===0) return(
    <div style={{padding:22}}>
      <PageHead title="Actueel 2026" sub="Werkelijke realisatie"/>
      <Card><div style={{textAlign:'center',padding:'40px 0',color:T.txt3}}>
        Nog geen actuele maanden beschikbaar in de forecasttool.
      </div></Card>
    </div>
  )
  const chartData = data.monthly.slice(0,n).map(m=>({label:MONTHS_S[m.index],fc:m.forecast.omzet,ac:m.actueel.omzet}))
  return(
    <div style={{padding:22}}>
      <PageHead title="Actueel 2026" sub={`Werkelijke realisatie — YTD t/m ${lastMaand} 2026 (${n} ${n===1?'maand':'maanden'})`}
        badge={<Pill label="Actueel YTD" color={T.ac} bg={T.acbg}/>}/>
      <Grid4 style={{marginBottom:20}}>
        <KpiCard label="Omzet Actueel YTD" value={fmt.eurK(a?.omzet)} d={a?.omzet} dRef={fc?.omzet} sub="vs Forecast" accent={T.ac}/>
        <KpiCard label="GN Actueel YTD" value={fmt.num(a?.gn)} d={a?.gn} dRef={fc?.gn} sub="vs Forecast" accent={T.ac}/>
        <KpiCard label="GNB Actueel" value={fmt.eur2(a?.gnb)} d={a?.gnb} dRef={fc?.gnb} sub="vs Forecast" accent={T.ac}/>
        <KpiCard label="PPU Actueel" value={fmt.eur2(a?.ppu)} d={a?.ppu} dRef={fc?.ppu} sub="vs Forecast" accent={T.ac}/>
        <KpiCard label="Payroll Actueel" value={fmt.pct(a?.payPct)} accent={a?.payPct>0.30?T.warn:T.ac}
          higherBetter={false} note={a?.payPct>0.30?'⚠ Boven 30% alarm':null}/>
        <KpiCard label="COS Actueel" value={fmt.pct(a?.cosPct)} accent={T.ac} higherBetter={false}/>
        <KpiCard label="DI Actueel" value={fmt.pct(a?.diPct)} d={a?.diPct} dRef={fc?.diPct} sub="vs Forecast" accent={T.ac}/>
        <KpiCard label="AC vs Budget" value={fmt.eurK(a?.omzet)} d={a?.omzet} dRef={b?.omzet} sub="omzet vs Budget" accent={T.ac}/>
      </Grid4>
      <SHead title={`Actueel vs Forecast — YTD jan–${lastMaand.toLowerCase()}`}/>
      <Card>
        <div style={{display:'flex',gap:14,marginBottom:10}}>
          {[['#3B82F6','Forecast'],['#22C55E','Actueel']].map(([c,l])=>(
            <div key={l} style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:T.txt3}}>
              <div style={{width:10,height:4,borderRadius:1,background:c}}/>{l}
            </div>
          ))}
        </div>
        <BarChart data={chartData} showLegend={false}/>
      </Card>
    </div>
  )
}

function ScenarioAnalyse(){
  const[active,setActive]=useState(null)
  return(
    <div style={{padding:22}}>
      <PageHead title="Scenario Analyse" sub="Scenario's 1–6 uit de DRIVERSET — omzet, uren en PPU"
        badge={<Pill label="Scenario Engine" color="#A78BFA" bg="rgba(167,139,250,.1)"/>}/>
      <SHead title="Scenario matrix — definitie per omzetbandbreedte"/>
      <Card style={{marginBottom:16}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:540}}>
            <thead><tr>
              {['Scenario','Van (€)','Tot (€)','U Keuken','U Bediening','PPU Norm','Max Pay%'].map((h,j)=>(
                <th key={h} style={{fontSize:10,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',
                  color:T.txt3,padding:'8px 12px',textAlign:j===0?'left':'right',borderBottom:`1px solid ${T.bdr}`}}>
                  {h}
                </th>
              ))}
            </tr></thead>
            <tbody>
              {SCENARIOS.map((s,i)=>{
                const isAct=active===i
                return(
                  <tr key={i} onClick={()=>setActive(isAct?null:i)}
                    style={{cursor:'pointer',background:isAct?'rgba(167,139,250,.07)':'transparent',transition:'.12s'}}>
                    <td style={{padding:'10px 12px',borderBottom:`1px solid ${T.bdr}`}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:10,height:10,borderRadius:2,background:SC_COLORS[i],flexShrink:0}}/>
                        <span style={{fontSize:13,fontWeight:600,color:isAct?'#A78BFA':T.txt}}>Scenario {s.nr}</span>
                      </div>
                    </td>
                    {[fmt.eur(s.van),fmt.eur(s.tot),`${s.ukok}\u00a0u`,`${s.ubed}\u00a0u`,fmt.eur2(s.ppu),fmt.pct(s.pay)].map((v,j)=>(
                      <td key={j} style={{padding:'10px 12px',textAlign:'right',fontSize:13,fontVariantNumeric:'tabular-nums',
                        borderBottom:`1px solid ${T.bdr}`,
                        color:j===4?'#60A5FA':j===5?(s.pay>0.40?T.warn:T.ac):T.txt}}>
                        {v}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{marginTop:10,fontSize:11,color:T.txt3}}>Klik een scenario om te selecteren · Scenario wordt dagelijks bepaald op basis van de dagomzet</div>
      </Card>
      <Grid3>
        {[
          {title:'Omzetbandbreedte (€/dag — tot)',max:18000,vals:SCENARIOS.map((s,i)=>({label:`S${s.nr}`,value:s.tot,color:SC_COLORS[i],sub:fmt.eur(s.tot)}))},
          {title:'PPU Norm (€/productief uur)',   max:70,   vals:SCENARIOS.map((s,i)=>({label:`S${s.nr}`,value:s.ppu,color:SC_COLORS[i],sub:fmt.eur2(s.ppu)}))},
          {title:'Max Payroll% (norm)',            max:0.75, vals:SCENARIOS.map((s,i)=>({label:`S${s.nr}`,value:s.pay,color:s.pay>0.40?T.warn:SC_COLORS[i],sub:fmt.pct(s.pay)}))},
        ].map(p=>(
          <Card key={p.title}>
            <div style={{fontSize:11,fontWeight:600,color:T.txt2,marginBottom:12,letterSpacing:'.03em'}}>{p.title}</div>
            {p.vals.map((v,i)=><SparkBar key={i} label={v.label} value={v.value} max={p.max} color={v.color} subLabel={v.sub}/>)}
          </Card>
        ))}
      </Grid3>
    </div>
  )
}

function PandL({data}){
  if(!data) return<Loader/>
  const b=data.jaar.budget,fc=data.jaar.forecast,a=data.jaar.actueel
  const COS=0.293, OPEX=0.02
  const rows=[
    {lbl:'Omzet',      bud:b?.omzet,                              fc:fc?.omzet,                              ac:a?.omzet,                              type:'income'},
    {lbl:'COS (29,3%)',bud:(b?.omzet||0)*COS,                     fc:(fc?.omzet||0)*COS,                     ac:(a?.omzet||0)*COS,                     type:'cost'},
    {lbl:'Brutomarge', bud:(b?.omzet||0)*(1-COS),                  fc:(fc?.omzet||0)*(1-COS),                  ac:(a?.omzet||0)*(1-COS),                  type:'subtotal'},
    {lbl:'Payroll',    bud:(b?.omzet||0)*(b?.payPct||0),           fc:(fc?.omzet||0)*(fc?.payPct||0),          ac:(a?.omzet||0)*(a?.payPct||0),           type:'cost'},
    {lbl:'OPEX (2,0%)',bud:(b?.omzet||0)*OPEX,                     fc:(fc?.omzet||0)*OPEX,                     ac:(a?.omzet||0)*OPEX,                     type:'cost'},
    {lbl:'DI',         bud:(b?.omzet||0)*(b?.diPct||0),            fc:(fc?.omzet||0)*(fc?.diPct||0),           ac:(a?.omzet||0)*(a?.diPct||0),            type:'total'},
  ]
  const th = {fontSize:10,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:T.txt3,padding:'8px 14px',textAlign:'right',borderBottom:`1px solid ${T.bdr}`}
  return(
    <div style={{padding:22}}>
      <PageHead title="P&L Analyse" sub="Volledig P&L overzicht — Budget · Forecast · Actueel YTD"/>
      <Card>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:480}}>
            <thead><tr>
              <th style={{...th,textAlign:'left'}}>P&L Lijn</th>
              <th style={{...th,color:T.bud}}>Budget</th>
              <th style={{...th,color:'#60A5FA'}}>Forecast</th>
              <th style={{...th,color:'#4ADE80'}}>{`Actueel${data.actueelMonths>0?` t/m ${MONTHS[data.actueelMonths-1]}`:'  YTD'}`}</th>
              <th style={th}>FC vs Bud</th>
            </tr></thead>
            <tbody>
              {rows.map(row=>{
                const isSub=['subtotal','total'].includes(row.type)
                const isCost=row.type==='cost'
                const d=!isCost?fmt.delta(row.fc,row.bud):null
                const tdS={padding:'10px 14px',fontSize:isCost?12:13,textAlign:'right',fontVariantNumeric:'tabular-nums',
                  borderBottom:`1px solid ${T.bdr}`,fontWeight:isSub?600:400,
                  background:row.type==='total'?'rgba(255,255,255,.04)':row.type==='subtotal'?'rgba(255,255,255,.02)':'transparent'}
                return(
                  <tr key={row.lbl}>
                    <td style={{...tdS,textAlign:'left',paddingLeft:isCost?22:14,color:isCost?T.txt2:T.txt}}>{row.lbl}</td>
                    <td style={tdS}>{fmt.eurK(row.bud)}</td>
                    <td style={{...tdS,color:'#60A5FA'}}>{fmt.eurK(row.fc)}</td>
                    <td style={{...tdS,color:'#4ADE80'}}>{row.ac>0?fmt.eurK(row.ac):'—'}</td>
                    <td style={{...tdS,color:d?d.sign>0?T.ac:d.sign<0?T.warn:T.txt3:T.txt3}}>{d?.lbl??'—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function Operationeel({data}){
  if(!data) return<Loader/>
  const fc=data.jaar.forecast
  // Deterministic outlet-level operationeel values
  const seeds=[0.92,0.81,0.87,0.96,0.74,1.05,0.68]
  const outletPPU  = OUTLETS.map((o,i)=>+(fc?.ppu??50)*seeds[i])
  const outletPay  = OUTLETS.map((o,i)=>(fc?.payPct??0.24)*(0.85+i*0.05))
  const outletUren = OUTLETS.map((o,i)=>Math.round((fc?.uren??22000)*o.share))
  const maxPPU=Math.max(...outletPPU), maxPay=Math.max(...outletPay), maxUren=Math.max(...outletUren)
  const ppuTrend = data.monthly.map(m=>({label:MONTHS_S[m.index],bud:m.budget.ppu,fc:m.forecast.ppu,ac:m.actueel.ppu}))
  return(
    <div style={{padding:22}}>
      <PageHead title="Operationeel" sub="PPU · Uren · Payroll per outlet — Forecast 2026"/>
      <Grid4 style={{marginBottom:20}}>
        <KpiCard label="Uren Forecast Jaar" value={fmt.num(fc?.uren)} accent={T.fc} note="Productieve uren totaal"/>
        <KpiCard label="PPU Gemiddeld FC" value={fmt.eur2(fc?.ppu)} accent={T.fc} note="Prijs per productief uur"/>
        <KpiCard label="Payroll% FC Jaar" value={fmt.pct(fc?.payPct)} accent={fc?.payPct>0.30?T.warn:T.fc} higherBetter={false}/>
        <KpiCard label="COS% Norm" value={fmt.pct(fc?.cosPct??0.293)} accent={T.fc} higherBetter={false}/>
      </Grid4>
      <Grid3 style={{marginBottom:20}}>
        {[
          {title:'PPU Forecast per outlet',      vals:OUTLETS.map((o,i)=>({label:o.label,value:outletPPU[i], max:maxPPU,  color:T.fc,  sub:fmt.eur2(outletPPU[i])}))},
          {title:'Payroll% per outlet',           vals:OUTLETS.map((o,i)=>({label:o.label,value:outletPay[i], max:maxPay,  color:outletPay[i]>0.30?T.warn:T.ac, sub:fmt.pct(outletPay[i])}))},
          {title:'Uren Forecast per outlet',      vals:OUTLETS.map((o,i)=>({label:o.label,value:outletUren[i],max:maxUren, color:T.bud, sub:fmt.num(outletUren[i])}))},
        ].map(p=>(
          <Card key={p.title}>
            <div style={{fontSize:11,fontWeight:600,color:T.txt2,marginBottom:10,letterSpacing:'.03em'}}>{p.title}</div>
            {p.vals.map((v,i)=><SparkBar key={i} label={v.label} value={v.value} max={v.max} color={v.color} subLabel={v.sub}/>)}
          </Card>
        ))}
      </Grid3>
      <SHead title="PPU trend per maand"/>
      <Card><BarChart data={ppuTrend}/></Card>
    </div>
  )
}

function Instellingen({sheetUrl,status,isConnected,lastFetch,error,onConnect,onDisconnect,onRefresh,isLoading}){
  const[url,setUrl]=useState(sheetUrl||'')
  const[testing,setTesting]=useState(false)
  const[testResult,setTestResult]=useState(null)
  const pid=extractId(url), pval=validId(pid)
  const SC={success:{col:T.ac,lbl:'Live — Google Sheets verbonden'},fallback:{col:T.bud,lbl:'Fallback data actief'},error:{col:T.warn,lbl:'Verbindingsfout'},loading:{col:T.fc,lbl:'Laden…'},idle:{col:'#6B7280',lbl:'Niet verbonden'}}
  const sc=SC[status]||SC.idle
  const iS={width:'100%',padding:'9px 12px',background:T.surf2,border:`1px solid ${T.bdr2}`,borderRadius:T.r,color:T.txt,fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}
  const Btn=({label,onClick,col='#60A5FA',bg='rgba(59,130,246,.1)',disabled})=>(
    <button onClick={onClick} disabled={disabled}
      style={{padding:'9px 18px',background:bg,border:`1px solid ${col}35`,borderRadius:T.r,color:col,fontSize:13,fontWeight:600,cursor:disabled?'not-allowed':'pointer',fontFamily:'inherit',opacity:disabled?.5:1}}>
      {label}
    </button>
  )
  const handleTest=async()=>{
    if(!pval) return
    setTesting(true);setTestResult(null)
    try{
      const res=await fetch(`https://docs.google.com/spreadsheets/d/${pid}/gviz/tq?tqx=out:json&sheet=MAANDOVERZICHT&range=A1:A1`,{cache:'no-store'})
      const txt=await res.text()
      setTestResult(txt.includes('google.visualization')
        ?{ok:true,msg:'Verbinding geslaagd — MAANDOVERZICHT tab gevonden en leesbaar'}
        :{ok:false,msg:'Sheet bereikbaar maar MAANDOVERZICHT niet leesbaar — controleer tabblad naam en publieke toegang'})
    }catch(e){setTestResult({ok:false,msg:`Netwerkfout: ${e.message}`})}
    setTesting(false)
  }
  return(
    <div style={{padding:22,maxWidth:580}}>
      <PageHead title="Instellingen" sub="Google Sheets koppeling · Databron · Auto-refresh"/>
      {/* Status */}
      <SHead title="Verbindingsstatus"/>
      <Card style={{marginBottom:22}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:isConnected?12:0}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:sc.col,
            animation:['success','loading'].includes(status)?`pulse ${status==='loading'?'1s':'3s'} infinite`:'none',
            boxShadow:status==='success'?`0 0 8px ${sc.col}70`:'none'}}/>
          <span style={{flex:1,fontSize:13,color:T.txt}}>{sc.lbl}</span>
          <Pill label={isConnected?'Google Sheets':'Fallback'} color={isConnected?'#60A5FA':T.bud} bg={isConnected?T.fcbg:T.budbg}/>
        </div>
        {isConnected&&(
          <>
            <div style={{fontSize:12,color:T.txt3,marginBottom:10,paddingLeft:18}}>
              ID: <code style={{color:'#60A5FA',fontSize:11}}>{extractId(sheetUrl).slice(0,30)}…</code>
              {lastFetch&&<span style={{marginLeft:14}}>Sync: {lastFetch.toLocaleTimeString('nl-NL')}</span>}
            </div>
            {error&&<div style={{padding:'8px 12px',background:T.warnbg,border:`1px solid ${T.warn}25`,borderRadius:T.r,fontSize:12,color:T.warn,marginBottom:10}}>⚠ {error}</div>}
            <div style={{display:'flex',gap:8}}>
              <Btn label={isLoading?'Laden…':'↻ Nu vernieuwen'} onClick={onRefresh} disabled={isLoading}/>
              <Btn label="Ontkoppelen" onClick={onDisconnect} col={T.warn} bg={T.warnbg}/>
            </div>
          </>
        )}
      </Card>
      {/* Connect */}
      <SHead title="Google Sheets koppelen"/>
      <Card style={{marginBottom:22}}>
        <label style={{fontSize:12,fontWeight:600,color:T.txt2,display:'block',marginBottom:6}}>Sheet URL of Sheet ID</label>
        <input style={iS} type="text" placeholder="https://docs.google.com/spreadsheets/d/…"
          value={url} onChange={e=>{setUrl(e.target.value);setTestResult(null)}} spellCheck={false}/>
        <div style={{fontSize:11,color:T.txt3,marginTop:5}}>Het sheet moet publiek gedeeld zijn op Viewer-niveau.</div>
        {url&&!pval&&<div style={{marginTop:8,fontSize:12,color:T.warn}}>✗ Geen geldig Sheet ID herkend</div>}
        {pval&&<div style={{marginTop:8,fontSize:12,color:T.ac}}>✓ Sheet ID: <code style={{color:'#60A5FA',fontSize:11}}>{pid}</code></div>}
        {testResult&&(
          <div style={{marginTop:10,padding:'8px 12px',borderRadius:T.r,fontSize:12,
            background:testResult.ok?T.acbg:T.warnbg,border:`1px solid ${testResult.ok?T.ac:T.warn}30`,
            color:testResult.ok?T.ac:T.warn}}>
            {testResult.ok?'✓':'✗'} {testResult.msg}
          </div>
        )}
        <div style={{display:'flex',gap:8,marginTop:14,flexWrap:'wrap'}}>
          <Btn label={testing?'Testen…':'Verbinding testen'} onClick={handleTest} disabled={!pval||testing}/>
          <Btn label={isLoading?'Verbinden…':'Verbinden & laden'} col={T.ac} bg={T.acbg}
            onClick={()=>{if(pval){setTestResult(null);onConnect(url)}}} disabled={!pval||isLoading}/>
          {url&&<Btn label="Wissen" onClick={()=>{setUrl('');setTestResult(null)}} col={T.txt2} bg="transparent"/>}
        </div>
      </Card>
      {/* Stappenplan */}
      <SHead title="Stappenplan koppeling"/>
      <Card style={{marginBottom:22}}>
        {['Open de forecasttool in Google Sheets (upload het .xlsx bestand naar Google Drive, of gebruik een bestaande Google Sheet)',
          'Klik op "Delen" → "Iedereen met de link" → Viewer',
          'Kopieer de URL uit de adresbalk',
          'Plak de URL hierboven en klik "Verbinden & laden"',
          'Data vernieuwt automatisch elke 5 minuten en bij elke tab-switch'].map((t,i)=>(
          <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:i<4?12:0}}>
            <div style={{width:22,height:22,borderRadius:'50%',background:T.surf2,border:`1px solid ${T.bdr2}`,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#60A5FA',flexShrink:0}}>{i+1}</div>
            <div style={{fontSize:13,color:T.txt2,lineHeight:1.6,paddingTop:3}}>{t}</div>
          </div>
        ))}
        <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${T.bdr}`}}>
          <div style={{fontSize:12,color:T.txt2,marginBottom:6,fontWeight:600}}>Vereist tabblad in de Google Sheet:</div>
          <code style={{display:'block',background:'#0F1B2D',padding:'8px 12px',borderRadius:T.r,fontSize:12,color:'#60A5FA',border:`1px solid ${T.bdr}`}}>MAANDOVERZICHT</code>
          <div style={{fontSize:11,color:T.txt3,marginTop:6}}>Rijen 4–55 · Kolommen C (JAN) t/m O (JAAR) · Forecasttool v14+</div>
        </div>
      </Card>
      {/* Databron info */}
      <SHead title="Databron gedrag"/>
      <Card>
        {[['Auto-refresh','Elke 5 minuten bij actieve Sheets-verbinding'],
          ['Tab-switch refresh','Vernieuwt bij terugkeren naar dit tabblad'],
          ['Fallback','Fallback data bij ontbrekende of mislukte verbinding'],
          ['Geen API-key','Werkt via publieke gviz JSON endpoint van Google'],
          ['Opslag','Sheet URL wordt lokaal opgeslagen in de browser']].map(([k,v])=>(
          <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${T.bdr}`,gap:12}}>
            <span style={{fontSize:12,fontWeight:600,color:T.txt2,flexShrink:0}}>{k}</span>
            <span style={{fontSize:12,color:T.txt3,textAlign:'right'}}>{v}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// NAV CONFIG + ICONS
// ─────────────────────────────────────────────────────────────
const NAV=[
  {id:'overzicht',   lbl:'Dashboard',       grp:'Overzicht'},
  {id:'budget',      lbl:'Budget',           grp:'Pilaren'},
  {id:'forecast',    lbl:'Forecast',         grp:'Pilaren'},
  {id:'actueel',     lbl:'Actueel',          grp:'Pilaren'},
  {id:'scenario',    lbl:'Scenario Analyse', grp:'Analyse'},
  {id:'pandl',       lbl:'P&L',              grp:'Analyse'},
  {id:'operationeel',lbl:'Operationeel',     grp:'Analyse'},
  {id:'instellingen',lbl:'Instellingen',     grp:'Systeem'},
]

const ICONS={
  overzicht:   <><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1"/><rect x="9" y="9" width="5.5" height="5.5" rx="1"/></>,
  budget:      <><rect x="1.5" y="5" width="13" height="9" rx="1.2"/><path d="M5 5V3.5a3 3 0 0 1 6 0V5"/></>,
  forecast:    <><polyline points="1,12 5,7 9,10 15,3"/><polyline points="11,3 15,3 15,7"/></>,
  actueel:     <><circle cx="8" cy="8" r="5.5"/><polyline points="8,5.5 8,8 9.5,9.5"/></>,
  scenario:    <path d="M2 8h3l2-5 3 10 2-5 2 0"/>,
  pandl:       <path d="M2 12h12M4 12V9m3 3V5m3 7V2m3 10V7"/>,
  operationeel:<><circle cx="8" cy="8" r="2.5"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M11.7 4.3l1.1-1.1M3.2 12.8l1.1-1.1"/></>,
  instellingen:<><circle cx="8" cy="8" r="2"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.2 3.2l1 1M11.8 11.8l1 1M11.8 4.2l1-1M3.2 12.8l1-1"/></>,
}

// ─────────────────────────────────────────────────────────────
// STATUS BAR
// ─────────────────────────────────────────────────────────────
function StatusBar({status,lastFetch,isConnected,onRefresh,isLoading}){
  const C={success:{col:T.ac,lbl:'Live — Sheets',dot:true},fallback:{col:T.bud,lbl:'Fallback data',dot:false},error:{col:T.warn,lbl:'Fout',dot:false},loading:{col:T.fc,lbl:'Laden…',dot:true},idle:{col:'#6B7280',lbl:'Niet verbonden',dot:false}}
  const c=C[status]||C.idle
  const t=lastFetch?.toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'})
  return(
    <div style={{display:'flex',alignItems:'center',gap:8,padding:'0 20px'}}>
      <div style={{display:'flex',alignItems:'center',gap:6,padding:'3px 10px',borderRadius:20,background:`${c.col}18`,border:`1px solid ${c.col}35`}}>
        {c.dot&&<div style={{width:6,height:6,borderRadius:'50%',background:c.col,animation:`pulse ${status==='loading'?'1s':'3s'} infinite`}}/>}
        <span style={{fontSize:11,fontWeight:600,color:c.col,letterSpacing:'.03em'}}>{c.lbl}</span>
      </div>
      {t&&<span style={{fontSize:11,color:T.txt3}}>{t}</span>}
      {isConnected&&(
        <button onClick={onRefresh} disabled={isLoading}
          style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',borderRadius:6,background:'transparent',
            border:`1px solid ${T.bdr}`,color:T.txt3,fontSize:11,cursor:isLoading?'default':'pointer',
            opacity:isLoading?.4:1,fontFamily:'inherit'}}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 5A4 4 0 1 1 5 1"/><polyline points="7,1 9,1 9,3"/>
          </svg>
          Vernieuwen
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────
const CSS=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',system-ui,sans-serif;background:#0F1B2D;color:#F0F4F8;font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}@keyframes spin{to{transform:rotate(360deg)}}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px}button{transition:.12s}input:focus{border-color:rgba(59,130,246,.5)!important}`

// ─────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────
export default function App(){
  const[page,setPage]=useState('overzicht')
  const[data,setData]=useState(null)
  const[status,setStatus]=useState('idle')
  const[sheetUrl,setSheetUrl]=useState(()=>localStorage.getItem(LS_URL)||'')
  const[sheetId,setSheetId]=useState(()=>localStorage.getItem(LS_KEY)||'')
  const[lastFetch,setLastFetch]=useState(null)
  const[error,setError]=useState(null)
  const timerRef=useRef(null)

  const load=useCallback(async(id)=>{
    setStatus('loading')
    const r=await loadData(id)
    setData(r);setLastFetch(new Date())
    setStatus(r.meta.source==='google-sheets'?'success':'fallback')
    setError(r.meta.error||null)
  },[])

  const connect=useCallback(async(rawUrl)=>{
    const id=extractId(rawUrl)
    setSheetUrl(rawUrl);setSheetId(id)
    localStorage.setItem(LS_URL,rawUrl);localStorage.setItem(LS_KEY,id)
    await load(id)
  },[load])

  const disconnect=useCallback(()=>{
    localStorage.removeItem(LS_KEY);localStorage.removeItem(LS_URL)
    setSheetUrl('');setSheetId('')
    const fb=buildFallback();setData(fb);setStatus('fallback');setError(null);setLastFetch(new Date())
  },[])

  const refresh=useCallback(()=>load(sheetId),[load,sheetId])

  // Initial load
  useEffect(()=>{
    load(sheetId)
    timerRef.current=setInterval(()=>{if(document.visibilityState==='visible'&&sheetId) load(sheetId)},REFRESH_MS)
    return()=>clearInterval(timerRef.current)
  },[]) // eslint-disable-line

  // Visibility-based refresh
  useEffect(()=>{
    const fn=()=>{if(document.visibilityState==='visible'&&sheetId&&status==='success') load(sheetId)}
    document.addEventListener('visibilitychange',fn)
    return()=>document.removeEventListener('visibilitychange',fn)
  },[sheetId,status,load])

  const isConnected=validId(sheetId), isLoading=status==='loading'
  const groups=[...new Set(NAV.map(n=>n.grp))]

  const renderPage=()=>{
    if(page==='instellingen') return<Instellingen sheetUrl={sheetUrl} status={status} isConnected={isConnected} lastFetch={lastFetch} error={error} onConnect={connect} onDisconnect={disconnect} onRefresh={refresh} isLoading={isLoading}/>
    if(page==='scenario')     return<ScenarioAnalyse/>
    if(page==='pandl')        return<PandL data={data}/>
    if(page==='actueel')      return<Actueel data={data}/>
    if(page==='forecast')     return<Forecast data={data}/>
    if(page==='budget')       return<Budget data={data}/>
    if(page==='operationeel') return<Operationeel data={data}/>
    return<Overzicht data={data}/>
  }

  return(
    <>
      <style>{CSS}</style>
      <div style={{display:'grid',gridTemplateColumns:'192px 1fr',gridTemplateRows:'48px 1fr',minHeight:'100vh'}}>
        {/* Topbar */}
        <div style={{gridColumn:'1/-1',display:'flex',alignItems:'center',justifyContent:'space-between',
          background:T.nav2,borderBottom:`1px solid ${T.bdr}`,paddingLeft:18,zIndex:10}}>
          <div style={{display:'flex',alignItems:'center',gap:9}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:T.fc,boxShadow:'0 0 10px rgba(59,130,246,.5)'}}/>
            <span style={{fontSize:13,fontWeight:700,letterSpacing:'.02em'}}>Horeca Forecast</span>
            <span style={{fontSize:12,color:T.txt3,marginLeft:2}}>— Vakantiepark 2026</span>
          </div>
          <StatusBar status={status} lastFetch={lastFetch} isConnected={isConnected} onRefresh={refresh} isLoading={isLoading}/>
        </div>

        {/* Sidebar */}
        <nav style={{background:T.nav2,borderRight:`1px solid ${T.bdr}`,padding:'10px 0',overflowY:'auto'}}>
          {groups.map(grp=>(
            <div key={grp} style={{marginBottom:4}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:T.txt3,padding:'8px 14px 4px'}}>{grp}</div>
              {NAV.filter(n=>n.grp===grp).map(item=>{
                const act=page===item.id
                return(
                  <button key={item.id} onClick={()=>setPage(item.id)}
                    style={{display:'flex',alignItems:'center',gap:9,width:'100%',padding:'7px 10px 7px 14px',margin:'1px 0',
                      background:act?'rgba(59,130,246,.10)':'transparent',
                      border:act?'1px solid rgba(59,130,246,.2)':'1px solid transparent',
                      borderRadius:T.r,color:act?'#60A5FA':T.txt2,
                      fontSize:13,fontWeight:act?600:400,fontFamily:'inherit',textAlign:'left',cursor:'pointer'}}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"
                      style={{flexShrink:0,opacity:act?1:.65}}>
                      {ICONS[item.id]}
                    </svg>
                    {item.lbl}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Main */}
        <main style={{background:T.navy,overflowY:'auto'}}>{renderPage()}</main>
      </div>
    </>
  )
}
