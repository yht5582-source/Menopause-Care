const test=require('node:test');
const assert=require('node:assert/strict');
const {assess,cases,questions,sources}=require('../clinical.js');

const base={age:52,months:18,since:1.5,vms:true,gsm:false,cycleChange:false,hormonal:false,uterus:true,bleeding:false,breastCancer:false,vteCvd:false,vteRisk:false,liver:false};

test('45 歲以上典型停經以臨床判讀，保有子宮時提醒內膜保護',()=>{
  const r=assess(base);
  assert.equal(r.stage,'臨床上符合停經');
  assert.match(r.actions[0].body,/黃體素/);
  assert.equal(r.alerts.length,0);
});
test('全子宮切除者可單用雌激素；VTE 危險因子建議經皮',()=>{
  assert.match(assess({...base,uterus:false}).actions[0].body,/單用雌激素/);
  assert.match(assess({...base,vteRisk:true}).actions[0].body,/經皮/);
});
test('45 歲以上停經過渡期與荷爾蒙用藥遮蔽',()=>{
  assert.equal(assess({...base,months:2,cycleChange:true}).stage,'臨床上符合停經過渡期');
  assert.equal(assess({...base,hormonal:true}).stage,'荷爾蒙用藥中，判讀受限');
});
test('POI 路徑：≥4 個月無月經或稀發月經合併症狀；附 NICE 2 次 FSH 差異',()=>{
  const r=assess({...base,age:38,months:5,since:''});
  assert.equal(r.stage,'疑似 POI 路徑');
  assert.match(r.stageNote,/2 次 FSH/);
  assert.match(r.actions.find(a=>a.title.includes('POI ·')).body,/骨骼/);
  assert.equal(assess({...base,age:36,months:1,cycleChange:true}).stage,'疑似 POI 路徑');
  assert.equal(assess({...base,age:36,months:1}).stage,'40 歲以下症狀，持續觀察');
});
test('POI 不被誤判為晚啟動，且熱潮紅走 POI 荷爾蒙治療',()=>{
  const r=assess({...base,age:39,months:14,since:''});
  assert.equal(r.late,false);
  assert.match(r.actions[0].title,/POI 荷爾蒙/);
});
test('40–44 歲：只有週期改變也進入早發停經評估',()=>{
  assert.equal(assess({...base,age:42,months:1,vms:false,cycleChange:true}).stage,'早發停經評估（40–44 歲）');
});
test('警訊出血、乳癌、血栓、肝病與晚啟動不會直接推薦全身 HRT',()=>{
  for(const change of [{bleeding:true},{breastCancer:true},{vteCvd:true},{liver:true},{age:64,since:13}]){
    const r=assess({...base,...change});
    assert.ok(r.alerts.length>0);
    assert.match(r.actions[0].title,/風險評估/);
  }
});
test('距停經年數空白時由月數換算，晚啟動可被偵測',()=>{
  const r=assess({...base,age:58,months:132,since:''});
  assert.equal(r.since,11);
  assert.equal(r.sinceDerived,true);
  assert.equal(r.late,true);
  assert.match(r.actions[0].title,/風險評估/);
});
test('年數與月數明顯矛盾時提示',()=>{
  assert.ok(assess({...base,months:18,since:8}).notes.some(n=>n.includes('相差超過')));
});
test('停經後出血 ≥55 歲走 NG12 轉介；HRT 中出血提示 6/3 個月時限',()=>{
  assert.match(assess({...base,age:58,bleeding:true}).alerts[0],/NG12/);
  assert.match(assess({...base,months:3,bleeding:true}).alerts[0],/6 個月/);
});
test('肝病不建議 fezolinetant；乳癌 tamoxifen 交互作用',()=>{
  assert.match(assess({...base,liver:true}).actions[0].body,/不適用/);
  assert.match(assess({...base,breastCancer:true}).actions[0].body,/tamoxifen/);
  assert.match(assess({...base,age:64,since:13}).actions[0].body,/fezolinetant/);
});
test('乳癌病史且 GSM 先採非荷爾蒙方案',()=>{
  const r=assess({...base,vms:false,gsm:true,breastCancer:true});
  assert.match(r.actions[0].body,/非荷爾蒙/);
  assert.match(r.actions[0].body,/乳癌專科/);
});
test('未停經者提醒避孕；無症狀不啟動 HRT',()=>{
  assert.ok(assess({...base,months:3}).notes.some(n=>n.includes('避孕')));
  assert.match(assess({...base,vms:false}).actions[0].title,/無主要困擾/);
});
test('無效輸入回傳錯誤而非靜默判讀',()=>{
  const r=assess({...base,age:''});
  assert.ok(r.errors.length>0);
  assert.equal(r.actions.length,0);
});
test('教學資料完整且題目答案在有效範圍',()=>{
  assert.equal(cases.length,6);
  assert.equal(questions.filter(q=>q.level==='住院醫師').length,10);
  assert.equal(questions.filter(q=>q.level==='進階').length,10);
  assert.ok(questions.every(q=>q.correct>=0&&q.correct<q.a.length&&q.a.length>=3));
  assert.ok(cases.every(c=>c.answer>=0&&c.answer<c.options.length));
  assert.equal(new Set(cases.map(c=>c.id)).size,cases.length);
  assert.ok(sources.length>=5&&sources.every(s=>/^https:\/\//.test(s.url)));
});
