import test from 'node:test';
import assert from 'node:assert/strict';
import {assess,cases,questions,sources} from '../dist/clinical.mjs';

const base={age:52,months:18,since:1.5,vms:true,gsm:false,cycleChange:false,hormonal:false,uterus:true,bleeding:false,breastCancer:false,vteCvd:false,liver:false};

test('45 歲以上典型停經以臨床判讀，保有子宮時提醒內膜保護',()=>{
  const r=assess(base);
  assert.equal(r.stage,'臨床上符合停經');
  assert.match(r.actions[0].body,/黃體素/);
  assert.equal(r.alerts.length,0);
});
test('POI 路徑與荷爾蒙用藥遮蔽分開處理',()=>{
  assert.equal(assess({...base,age:38,months:5}).stage,'疑似 POI 路徑');
  assert.match(assess({...base,age:38,months:5}).actions.find(a=>a.title.includes('POI')).body,/骨骼/);
  assert.equal(assess({...base,hormonal:true}).stage,'荷爾蒙用藥中，判讀受限');
});
test('警訊出血、乳癌與晚啟動不會直接推薦全身 HRT',()=>{
  for(const change of [{bleeding:true},{breastCancer:true},{vteCvd:true},{liver:true},{age:64,since:13}]){
    const r=assess({...base,...change});
    assert.ok(r.alerts.length>0);
    assert.match(r.actions[0].title,/風險評估/);
  }
});
test('乳癌病史且 GSM 先採非荷爾蒙方案',()=>{
  const r=assess({...base,vms:false,gsm:true,breastCancer:true});
  assert.match(r.actions[0].body,/非荷爾蒙/);
  assert.match(r.actions[0].body,/乳癌專科/);
});
test('教學資料完整且題目答案在有效範圍',()=>{
  assert.equal(cases.length,6);
  assert.equal(questions.filter(q=>q.level==='住院醫師').length,10);
  assert.equal(questions.filter(q=>q.level==='進階').length,10);
  assert.ok(questions.every(q=>q.correct>=0&&q.correct<q.a.length));
  assert.ok(cases.every(c=>c.answer>=0&&c.answer<c.options.length));
  assert.ok(sources.length>=4);
});
