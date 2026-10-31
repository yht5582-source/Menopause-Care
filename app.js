(function(){
const {assess,nhiOsteo,nhiDrugs,NHI_DATE,cases,questions,sources}=window.MENO;
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const letter=i=>String.fromCharCode(65+i);
// 選項順序隨機化，避免正解集中在同一個字母；perm[顯示位置] = 原始索引
const shuffle=n=>{const a=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

/* ---------- 照護情境分流 ---------- */
const form=$('#assessment-form'),out=$('#assessment-output'),initialOutput=out.innerHTML;
const flags=['cycleChange','hormonal','vms','gsm','uterus','bleeding','breastCancer','vteCvd','vteRisk','liver'];
form.addEventListener('submit',e=>{
  e.preventDefault();
  const f=form.elements,v=Object.fromEntries(flags.map(k=>[k,f[k].checked]));
  v.age=f.age.value;v.months=f.months.value;v.since=f.since.value;
  const r=assess(v),warn=r.errors.length||r.alerts.length;
  const sinceLine=Number.isFinite(r.since)?`<p class="since-line">距停經約 ${r.since} 年${r.sinceDerived?'（由無月經月數換算）':''}</p>`:'';
  out.innerHTML=`<div class="output-icon ${warn?'red':''}">${warn?'!':'✓'}</div><span class="kicker">CARE PATHWAY · <span class="badge intl">國際規範</span></span><h3>${esc(r.stage)}</h3><p>${esc(r.stageNote)}</p>${sinceLine}`+
    (r.notes.length?`<ul class="note-list">${r.notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul>`:'')+
    (r.alerts.length?`<div class="alert-list"><strong>先留意的警訊與風險</strong><ul>${r.alerts.map(a=>`<li>${esc(a)}</li>`).join('')}</ul></div>`:'')+
    (r.actions.length?`<div class="criteria">${r.actions.map((a,i)=>`<div><strong>${String(i+1).padStart(2,'0')} · ${esc(a.title)}</strong><p>${esc(a.body)}</p></div>`).join('')}</div>`:'')+
    (r.taiwan.length?`<div class="tw-block"><strong><span class="badge tw">台灣規範</span>健保給付提示</strong><ul>${r.taiwan.map(t=>`<li>${esc(t)}</li>`).join('')}</ul><small>${esc(NHI_DATE)}</small></div>`:'')+
    `<div class="output-note">這是教學分流，不構成診斷或處方。症狀有其他可能原因；若有異常出血先評估。HRT 須檢視禁忌、避孕需求、個人風險與當地藥物規範。</div>`;
  if(window.matchMedia('(max-width:900px)').matches)out.scrollIntoView({behavior:'smooth',block:'start'});
});
form.addEventListener('reset',()=>{out.innerHTML=initialOutput;});

/* ---------- 示範病例 ---------- */
const DIAG=['診斷','POI'];
const casePerm=Object.fromEntries(cases.map(c=>[c.id,shuffle(c.options.length)]));
let filter='全部';
function renderCases(){
  const chosen=cases.filter(c=>filter==='全部'||(filter==='診斷')===DIAG.includes(c.tag));
  $('#case-list').innerHTML=chosen.map(c=>`<article class="case-card" id="case-${c.id}"><div class="case-meta"><span>CASE ${c.id} · 虛構示例</span><span>${esc(c.tag)}</span></div><h3>${esc(c.title)}</h3><p>${esc(c.stem)}</p><div class="case-question"><strong>${esc(c.question)}</strong><div class="case-options">${casePerm[c.id].map((o,pos)=>`<button type="button" data-case="${c.id}" data-choice="${o}"><span>${letter(pos)}</span>${esc(c.options[o])}</button>`).join('')}</div></div><div class="case-reveal" hidden></div></article>`).join('');
}
renderCases();
$('#case-filters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;filter=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b);});renderCases();});
$('#case-list').addEventListener('click',e=>{
  const b=e.target.closest('[data-case]');if(!b)return;
  const c=cases.find(x=>x.id===b.dataset.case),i=Number(b.dataset.choice),card=b.closest('.case-card');
  card.querySelectorAll('[data-choice]').forEach(x=>{const o=Number(x.dataset.choice);x.disabled=true;x.classList.toggle('correct',o===c.answer);x.classList.toggle('incorrect',o===i&&i!==c.answer);});
  const reveal=card.querySelector('.case-reveal');reveal.hidden=false;
  reveal.innerHTML=`<div class="answer-label">${i===c.answer?'判斷正確':'重新檢視線索'} · 正解 ${letter(casePerm[c.id].indexOf(c.answer))}</div><p>${esc(c.why)}</p><div class="next"><strong>下一步</strong><p>${esc(c.next)}</p></div><button type="button" class="link-button" data-reset-case="${c.id}">重新作答 ↻</button>`;
});
$('#case-list').addEventListener('click',e=>{const b=e.target.closest('[data-reset-case]');if(!b)return;casePerm[b.dataset.resetCase]=shuffle(cases.find(c=>c.id===b.dataset.resetCase).options.length);renderCases();});

/* ---------- 分級考題 ---------- */
let level='住院醫師',pool=[],perms=[],index=0,chosen=[],submitted=false;
function setQuizLevel(newLevel){
  level=newLevel;pool=questions.filter(q=>q.level===level);perms=pool.map(q=>shuffle(q.a.length));index=0;chosen=[];submitted=false;
  document.querySelectorAll('[data-level]').forEach(b=>{b.classList.toggle('selected',b.dataset.level===level);b.setAttribute('aria-pressed',b.dataset.level===level);});
  renderQuiz();
}
function renderQuiz(){
  const q=pool[index];
  $('#quiz-progress').textContent=submitted?'完成':`題目 ${index+1} / ${pool.length}`;
  $('#progress-fill').style.width=`${submitted?100:Math.round(index/pool.length*100)}%`;
  if(submitted){
    const score=pool.reduce((n,q,i)=>n+(chosen[i]===q.correct),0);
    $('#quiz-content').innerHTML=`<div class="quiz-result"><span class="kicker">RESULT · ${level}</span><div class="score">${score}<small> / ${pool.length}</small></div><h3>${score>=8?'觀念掌握得很穩固':'從解析找出下一個學習重點'}</h3><p>以下可逐題檢視作答與解析。</p><button id="retry" type="button" class="button primary">重做這一組 ↻</button></div><div class="review">${pool.map((q,i)=>`<details${chosen[i]!==q.correct?' open':''}><summary><span class="${chosen[i]===q.correct?'ok':'ng'}">第 ${i+1} 題 · ${chosen[i]===q.correct?'答對':'答錯'}</span>${esc(q.q)}</summary><p>你的答案：${esc(q.a[chosen[i]])}<br>正確答案：${esc(q.a[q.correct])}</p><p>${esc(q.why)}</p></details>`).join('')}</div>`;
    $('#retry').onclick=()=>setQuizLevel(level);return;
  }
  const sel=chosen[index],answered=sel!==undefined;
  $('#quiz-content').innerHTML=`<div class="quiz-body"><span class="quiz-counter">${level} · QUESTION ${String(index+1).padStart(2,'0')}</span><h3>${esc(q.q)}</h3><div class="quiz-choices">${perms[index].map((o,pos)=>`<button type="button" data-answer="${o}" class="${sel===o?'picked':''} ${answered&&o===q.correct?'right':''} ${sel===o&&o!==q.correct?'wrong':''}" ${answered?'disabled':''}><span>${letter(pos)}</span>${esc(q.a[o])}</button>`).join('')}</div>${answered?`<div class="quiz-explanation"><strong>${sel===q.correct?'答對了':'正確答案：'+letter(perms[index].indexOf(q.correct))}</strong><p>${esc(q.why)}</p></div>`:''}<button id="quiz-next" class="button primary" type="button" ${answered?'':'disabled'}>${index===pool.length-1?'查看成績':'下一題'} <span aria-hidden="true">→</span></button></div>`;
  document.querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>{chosen[index]=Number(b.dataset.answer);renderQuiz();$('#quiz-next').focus({preventScroll:true});}));
  $('#quiz-next').onclick=()=>{if(chosen[index]===undefined)return;if(index===pool.length-1)submitted=true;else index++;renderQuiz();$('#quiz').scrollIntoView({behavior:'smooth'});};
}
document.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>setQuizLevel(b.dataset.level)));
setQuizLevel(level);

/* ---------- 台灣健保 ---------- */
$('#nhi-drugs').innerHTML=nhiDrugs.map(d=>`<div class="nhi-row"><h3>${esc(d.group)}<span class="status ${d.listed?'yes':'no'}">${d.listed?'有給付品項':'未列給付'}</span></h3><p class="items">${esc(d.items)}</p><p>${esc(d.rule)}</p></div>`).join('');
$('#nhi-date').textContent=NHI_DATE+'。';
const osteoForm=$('#osteo-form');
osteoForm.addEventListener('submit',e=>{
  e.preventDefault();const f=osteoForm.elements;
  const r=nhiOsteo({tScore:f.tScore.value,hipSpine:f.hipSpine.value,wristHumerus:f.wristHumerus.value,ra:f.ra.checked,insulinDM:f.insulinDM.checked,steroid:f.steroid.checked,recentNew:f.recentNew.checked,arFail:f.arFail.checked,arFail12:f.arFail12.checked});
  const o=$('#osteo-output');
  if(r.error){o.innerHTML=`<div class="output-icon red">!</div><span class="kicker">NHI 5.6</span><h3>${esc(r.error)}</h3>`;return;}
  const n=r.res.filter(x=>x.ok).length;
  o.innerHTML=`<div class="output-icon ${n?'':'red'}">${n?'✓':'—'}</div><span class="kicker">NHI 5.6 · <span class="badge tw">台灣規範</span></span><h3>${n?`符合 ${n} 類藥物的給付條件`:'目前不符合骨鬆藥物給付條件'}</h3><div class="osteo-list">${r.res.map(x=>`<div><strong class="${x.ok?'yes':'no'}">${x.ok?'✓ 符合':'✗ 不符合'} · ${esc(x.drug)}</strong><p>${esc(x.why)}</p></div>`).join('')}</div><div class="output-note">${r.notes.map(esc).join('<br>')}</div>`;
});

/* ---------- 目前區段標示 ---------- */
const navLinks=[...document.querySelectorAll('.topbar nav a')];
if('IntersectionObserver' in window){
  const spy=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)navLinks.forEach(a=>a.classList.toggle('current',a.hash==='#'+e.target.id));}),{rootMargin:'-45% 0px -50% 0px'});
  navLinks.forEach(a=>{const t=document.querySelector(a.hash);if(t)spy.observe(t);});
}

$('#source-list').innerHTML=sources.map((s,i)=>`<a class="source-item" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"><span>${String(i+1).padStart(2,'0')}</span><span><strong>${esc(s.name)}</strong><small>${esc(s.note)}</small></span><span aria-hidden="true">↗</span></a>`).join('');
})();
