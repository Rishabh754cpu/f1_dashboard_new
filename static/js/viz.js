/* Native rebuild of the Tableau workbook (Dashboard + Story 1). Data: championship_standings sheet. */
(function(){
const ROWS=window.F1_ROWS.map(r=>({season:r[0],driver:r[1],team:r[2],points:r[3],wins:r[4],podiums:r[5],poles:r[6],champ:r[7]}));
const SEASONS=[...new Set(ROWS.map(r=>r.season))].sort();
// Driver/team filters copied from the workbook worksheets
const DF={
 champTeam:['Alex Albon','Carlos Sainz','Charles Leclerc','Esteban Ocon','Fernando Alonso','George Russell','Kevin Magnussen','Lance Stroll','Lando Norris','Lewis Hamilton','Liam Lawson','Max Verstappen','Nico Hülkenberg','Oscar Piastri','Pierre Gasly','Sergio Perez'],
 podiums:['Alex Albon','Carlos Sainz','Charles Leclerc','Esteban Ocon','Fernando Alonso','George Russell','Kevin Magnussen','Lance Stroll','Max Verstappen','Zhou Guanyu'],
 poles:['Alex Albon','Carlos Sainz','Charles Leclerc','Esteban Ocon','Fernando Alonso','Max Verstappen','Nico Hülkenberg','Oscar Piastri','Pierre Gasly','Sergio Perez','Valtteri Bottas','Yuki Tsunoda','Zhou Guanyu'],
 top:['Alex Albon','Carlos Sainz','Charles Leclerc','Esteban Ocon','Max Verstappen'],
 trend:['Ferrari','Haas','Red Bull Racing']};
const PAL=['#e10600','#ff8700','#ffd400','#00d2be','#3671c6','#9b5de5','#f15bb5','#8a8a92','#2ec4b6','#ff5d73'];
const TEAMC={'Red Bull Racing':'#3671c6','Ferrari':'#e10600','Mercedes':'#00d2be','McLaren':'#ff8700','Haas':'#b6babd','Alpine':'#2293d1','Aston Martin':'#229971'};
const NS='http://www.w3.org/2000/svg';
const S={from:SEASONS[0],to:SEASONS[SEASONS.length-1]};
const inRange=r=>r.season>=S.from&&r.season<=S.to;
const sum=(rows,key,f,inc)=>{const m={};rows.filter(r=>!inc||inc.includes(r[key])).forEach(r=>m[r[key]]=(m[r[key]]||0)+r[f]);return Object.entries(m).map(([k,v])=>({k,v}));};
const desc=a=>a.sort((x,y)=>y.v-x.v);
const colorOf=(k,i)=>TEAMC[k]||PAL[i%PAL.length];
function el(n,a,p,t){const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);if(t!=null)e.textContent=t;p&&p.appendChild(e);return e;}
function tip(e,t){const x=document.createElementNS(NS,'title');x.textContent=t;e.appendChild(x);}
function svg(w,h){return el('svg',{viewBox:`0 0 ${w} ${h}`,role:'img'});}
const TXT='#a9a9b2',GRID='#2a2a2e';
function empty(){const d=document.createElement('p');d.className='vz-empty';d.textContent='No data for this selection.';return d;}

function barH(data,colors){ if(!data.length)return empty();
 const w=520,rh=26,m={l:130,r:44,t:6,b:6},h=m.t+m.b+data.length*rh,s=svg(w,h),mx=Math.max(...data.map(d=>d.v))||1;
 data.forEach((d,i)=>{const y=m.t+i*rh,bw=(w-m.l-m.r)*d.v/mx;
  el('text',{x:m.l-8,y:y+rh/2+4,'text-anchor':'end',fill:TXT,'font-size':12},s,d.k);
  const r=el('rect',{x:m.l,y:y+4,width:Math.max(bw,1),height:rh-8,rx:2,fill:colors?colorOf(d.k,i):'#e10600'},s);tip(r,`${d.k}: ${d.v.toLocaleString()}`);
  el('text',{x:m.l+bw+6,y:y+rh/2+4,fill:'#f2f2f4','font-size':12},s,d.v.toLocaleString());});
 return s;}
function barV(data){ if(!data.length)return empty();
 const w=520,h=260,m={l:40,r:10,t:14,b:30},s=svg(w,h),mx=Math.max(...data.map(d=>d.v))||1,bw=(w-m.l-m.r)/data.length;
 for(let i=0;i<=4;i++){const y=m.t+(h-m.t-m.b)*(1-i/4);el('line',{x1:m.l,x2:w-m.r,y1:y,y2:y,stroke:GRID},s);el('text',{x:m.l-6,y:y+4,'text-anchor':'end',fill:TXT,'font-size':10},s,Math.round(mx*i/4));}
 data.forEach((d,i)=>{const bh=(h-m.t-m.b)*d.v/mx,x=m.l+i*bw;
  const r=el('rect',{x:x+bw*.15,y:h-m.b-bh,width:bw*.7,height:bh,rx:2,fill:'#e10600'},s);tip(r,`${d.k}: ${d.v}`);
  el('text',{x:x+bw/2,y:h-10,'text-anchor':'middle',fill:TXT,'font-size':10},s,data.length>12?"'"+String(d.k).slice(2):d.k);});
 return s;}
function line(series,xs){ if(!series.length||!xs.length)return empty();
 const w=520,h=270,m={l:50,r:12,t:12,b:30},s=svg(w,h),mx=Math.max(1,...series.flatMap(a=>a.pts.map(p=>p.v)));
 const X=i=>m.l+(xs.length>1?(w-m.l-m.r)*i/(xs.length-1):(w-m.l-m.r)/2),Y=v=>h-m.b-(h-m.t-m.b)*v/mx;
 for(let i=0;i<=4;i++){const y=Y(mx*i/4);el('line',{x1:m.l,x2:w-m.r,y1:y,y2:y,stroke:GRID},s);el('text',{x:m.l-6,y:y+4,'text-anchor':'end',fill:TXT,'font-size':10},s,Math.round(mx*i/4));}
 xs.forEach((x,i)=>{if(xs.length<=9||i%2===0)el('text',{x:X(i),y:h-10,'text-anchor':'middle',fill:TXT,'font-size':10},s,x);});
 series.forEach((a,si)=>{const c=colorOf(a.k,si);
  el('polyline',{points:a.pts.map(p=>`${X(xs.indexOf(p.x))},${Y(p.v)}`).join(' '),fill:'none',stroke:c,'stroke-width':2.5,'stroke-linejoin':'round'},s);
  a.pts.forEach(p=>{const c2=el('circle',{cx:X(xs.indexOf(p.x)),cy:Y(p.v),r:3.5,fill:c},s);tip(c2,`${a.k} ${p.x}: ${p.v}`);});});
 const wrap=document.createElement('div');wrap.append(s,legend(series.map((a,i)=>[a.k,colorOf(a.k,i)])));return wrap;}
function legend(items){const l=document.createElement('div');l.className='vz-legend';items.forEach(([k,c])=>{const s=document.createElement('span');s.innerHTML=`<i style="background:${c}"></i>`;s.append(k);l.appendChild(s);});return l;}
function pie(data){ if(!data.length)return empty();
 const tot=data.reduce((a,d)=>a+d.v,0),s=svg(300,260),cx=150,cy=130,R=110;let a0=-Math.PI/2;
 data.forEach((d,i)=>{const a1=a0+2*Math.PI*d.v/tot,big=a1-a0>Math.PI?1:0,c=PAL[i%PAL.length];
  const p=el('path',{d:`M${cx} ${cy}L${cx+R*Math.cos(a0)} ${cy+R*Math.sin(a0)}A${R} ${R} 0 ${big} 1 ${cx+R*Math.cos(a1)} ${cy+R*Math.sin(a1)}Z`,fill:c,stroke:'#141416','stroke-width':2},s);
  tip(p,`${d.k}: ${d.v.toLocaleString()} pts (${(100*d.v/tot).toFixed(1)}%)`);
  if(a1-a0>.35)el('text',{x:cx+R*.65*Math.cos((a0+a1)/2),y:cy+R*.65*Math.sin((a0+a1)/2)+4,'text-anchor':'middle',fill:'#fff','font-size':12,'font-weight':700},s,Math.round(100*d.v/tot)+'%');a0=a1;});
 const w=document.createElement('div');w.className='vz-pie';w.append(s,legend(data.map((d,i)=>[d.k,PAL[i%PAL.length]])));return w;}

// Each chart = one worksheet of the workbook
const CH={
 winsSeason:{t:'Wins by Season',r:()=>barV(SEASONS.filter(y=>y>=S.from&&y<=S.to).map(y=>({k:y,v:ROWS.filter(r=>r.season===y).reduce((a,r)=>a+r.wins,0)}))),note:()=>{const a=SEASONS.filter(y=>y>=S.from&&y<=S.to).map(y=>({k:y,v:ROWS.filter(r=>r.season===y).reduce((a,r)=>a+r.wins,0)}));const b=desc(a)[0];return b?`${b.k} had the most race wins (${b.v}).`:''}},
 winsDriver:{t:'Wins by Driver',r:()=>barH(desc(sum(ROWS.filter(inRange),'driver','wins')).filter(d=>d.v>0)),note:()=>{const b=desc(sum(ROWS.filter(inRange),'driver','wins'))[0];return b?`${b.k} leads with ${b.v} wins.`:''}},
 topPts:{t:'Top Driver by Points',r:()=>pie(desc(sum(ROWS.filter(inRange),'driver','points',DF.top))),note:()=>{const b=desc(sum(ROWS.filter(inRange),'driver','points',DF.top))[0];return b?`${b.k} has the largest share of points among the selected drivers.`:''}},
 champTeam:{t:'Championships by Team',r:()=>barH(desc(sum(ROWS.filter(inRange),'team','champ')).filter(d=>d.v>0),1),note:()=>{const b=desc(sum(ROWS.filter(inRange),'team','champ'))[0];return b&&b.v?`${b.k} has the most titles (${b.v}).`:''}},
 podiums:{t:'Podiums by Driver',r:()=>barH(desc(sum(ROWS.filter(inRange),'driver','podiums',DF.podiums))),note:()=>{const b=desc(sum(ROWS.filter(inRange),'driver','podiums',DF.podiums))[0];return b?`${b.k} stands on the podium most often (${b.v}).`:''}},
 poles:{t:'Pole Positions by Driver',r:()=>barH(desc(sum(ROWS.filter(inRange),'driver','poles',DF.poles))),note:()=>{const b=desc(sum(ROWS.filter(inRange),'driver','poles',DF.poles))[0];return b?`${b.k} has the most poles (${b.v}).`:''}},
 champDriver:{t:'Driver Championships',r:()=>barH(desc(sum(ROWS.filter(inRange),'driver','champ')).filter(d=>d.v>0)),note:()=>{const a=desc(sum(ROWS.filter(inRange),'driver','champ')).filter(d=>d.v>0);return a.length?a.map(d=>`${d.k} ${d.v}`).join(' · '):''}},
 trend:{t:'Team Points Trend',r:()=>{const xs=SEASONS.filter(y=>y>=S.from&&y<=S.to);return line(DF.trend.map(t=>({k:t,pts:xs.map(y=>({x:y,v:ROWS.filter(r=>r.team===t&&r.season===y).reduce((a,r)=>a+r.points,0)}))})),xs);},note:()=>'Season points for Ferrari, Haas and Red Bull Racing.'},
 teamPts:{t:'Points by Team',r:()=>barH(desc(sum(ROWS.filter(inRange),'team','points')),1),note:()=>{const b=desc(sum(ROWS.filter(inRange),'team','points'))[0];return b?`${b.k} has scored the most points (${b.v.toLocaleString()}).`:''}}
};
function draw(host,key,big){host.innerHTML='';const c=CH[key];const f=document.createElement('figure');f.className='vz-fig'+(big?' big':'');
 const h=document.createElement('figcaption');h.textContent=c.t;f.appendChild(h);const b=document.createElement('div');b.className='vz-plot';b.appendChild(c.r());f.appendChild(b);
 const n=c.note();if(n){const p=document.createElement('p');p.className='vz-note2';p.textContent=n;f.appendChild(p);}host.appendChild(f);}

// ---------- Dashboard ----------
const DASH=['winsSeason','winsDriver','topPts','champTeam','podiums','poles','champDriver','trend','teamPts'];
let dashBuilt=false;
function renderDash(){const g=document.getElementById('vz-grid');g.innerHTML='';DASH.forEach(k=>{const d=document.createElement('div');d.className='vz-cell';g.appendChild(d);draw(d,k);});
 const rr=ROWS.filter(inRange);document.getElementById('vz-kpis').innerHTML=[['Seasons',S.to-S.from+1],['Race wins',rr.reduce((a,r)=>a+r.wins,0)],['Podiums',rr.reduce((a,r)=>a+r.podiums,0)],['Titles awarded',rr.reduce((a,r)=>a+r.champ,0)],['Points scored',rr.reduce((a,r)=>a+r.points,0).toLocaleString()]].map(([l,v])=>`<div><b>${v}</b><span>${l}</span></div>`).join('');}
function buildDash(){const host=document.getElementById('host-dashboard');
 const opt=v=>SEASONS.map(y=>`<option${y===v?' selected':''}>${y}</option>`).join('');
 host.innerHTML=`<div class="vz-bar"><label>From season <select id="vz-from">${opt(S.from)}</select></label><label>To season <select id="vz-to">${opt(S.to)}</select></label><button type="button" id="vz-reset">Reset</button></div><div id="vz-kpis" class="vz-kpis"></div><div id="vz-grid" class="vz-grid"></div>`;
 const fr=host.querySelector('#vz-from'),to=host.querySelector('#vz-to');
 const ch=()=>{S.from=+fr.value;S.to=+to.value;if(S.from>S.to){S.to=S.from;to.value=S.to;}renderDash();};
 fr.onchange=to.onchange=ch;host.querySelector('#vz-reset').onclick=()=>{fr.value=SEASONS[0];to.value=SEASONS[SEASONS.length-1];ch();};
 renderDash();dashBuilt=true;}

// ---------- Story (story points from "Story 1") ----------
const STORY=[['winsSeason','Wins by Season'],['topPts','Top Driver by Points'],['winsDriver','Wins by Driver'],['champTeam','Championships by Team'],['poles','Pole Positions by Driver'],['champDriver','Driver Championships'],['trend','Team Points Trend'],['teamPts','Points by Team']];
let si=0,storyBuilt=false;
function renderStory(){const host=document.getElementById('host-story');const [k,cap]=STORY[si];
 const saved={...S};S.from=SEASONS[0];S.to=SEASONS[SEASONS.length-1];
 host.innerHTML=`<div class="vz-tabs" role="tablist">${STORY.map((s,i)=>`<button type="button" role="tab" aria-selected="${i===si}" class="${i===si?'on':''}" data-i="${i}">${s[1]}</button>`).join('')}</div><div id="vz-story-stage"></div><div class="vz-nav"><button type="button" id="vz-prev"${si?'':' disabled'}>Previous</button><span>Story point ${si+1} of ${STORY.length}</span><button type="button" id="vz-next"${si<STORY.length-1?'':' disabled'}>Next</button></div>`;
 draw(host.querySelector('#vz-story-stage'),k,true);Object.assign(S,saved);
 host.querySelectorAll('.vz-tabs button').forEach(b=>b.onclick=()=>{si=+b.dataset.i;renderStory();});
 host.querySelector('#vz-prev').onclick=()=>{si--;renderStory();};host.querySelector('#vz-next').onclick=()=>{si++;renderStory();};storyBuilt=true;}

// ---------- Show / hide wiring (runs before the old Tableau handlers) ----------
function setOpen(name,open){const b=document.getElementById('body-'+name),e=document.getElementById('empty-'+name),t=document.getElementById('toggle-'+name);
 if(!b)return;b.hidden=!open;if(e)e.hidden=open;if(t)t.textContent=(open?'Hide ':'Show ')+(name==='dashboard'?'Dashboard':'Story');
 if(open){if(name==='dashboard'&&!dashBuilt)buildDash();if(name==='story'&&!storyBuilt)renderStory();}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-show],[data-toggle]');if(!b)return;
 const name=b.dataset.show||b.dataset.toggle;if(name!=='dashboard'&&name!=='story')return;
 e.preventDefault();e.stopImmediatePropagation();
 if(b.dataset.show){setOpen(name,true);document.getElementById(name).scrollIntoView({behavior:'smooth'});}
 else setOpen(name,document.getElementById('body-'+name).hidden);},true);
})();
