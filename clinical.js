/* 更年期照護教學引擎：瀏覽器以 window.MENO 使用，Node 測試以 require 載入 */
(function(root){
/*ENGINE-START*/
const sources=[
  {name:'NICE NG23 · Menopause（last updated 2026-04-15）',url:'https://www.nice.org.uk/guidance/ng23/chapter/Recommendations',note:'臨床辨識、HRT、泌尿生殖症狀、POI 與追蹤；1.8.4 非預期出血（2026 修訂）'},
  {name:'NICE TA1143 · Fezolinetant（2026）',url:'https://www.nice.org.uk/guidance/ta1143',note:'HRT 不適合時，中重度血管舒縮症狀的選項'},
  {name:'The Menopause Society · 2022 Hormone Therapy',url:'https://doi.org/10.1097/GME.0000000000002028',note:'荷爾蒙治療時機、效益與風險'},
  {name:'The Menopause Society · 2023 Nonhormone Therapy',url:'https://menopause.org/professional-resources/position-statements',note:'熱潮紅非荷爾蒙治療'},
  {name:'ESHRE/ASRM/CRE/IMS · POI Guideline 2024',url:'https://www.asrm.org/practice-guidance/practice-committee-documents/evidence-based-guideline-premature-ovarian-insufficiency--2024/',note:'40 歲以下卵巢功能不全：月經失調 ≥4 個月 + FSH >25 IU/L'},
  {name:'健保署 · 藥品給付規定（第一節、第五節）',url:'https://www.nhi.gov.tw/ch/cp-7593-ad2a9-3397-1.html',note:'台灣規範：5.3 雌／黃體素、5.6 骨鬆藥物、1.1.6 gabapentin、1.2.1 SSRI/SNRI'},
  {name:'健保署 · 健保用藥品項網路查詢',url:'https://info.nhi.gov.tw/INAE3000/INAE3000S01',note:'台灣規範：給付中品項（查詢 2026-10-31）'},
  {name:'FDA · Fezolinetant liver warning（2024）',url:'https://www.fda.gov/drugs/drug-safety-communications/fda-adds-warning-about-rare-occurrence-serious-liver-injury-use-veozah-fezolinetant-hot-flashes-due',note:'盒裝警語：基線、前 3 個月每月、第 6、9 個月肝功能'}
];

const num=x=>(x===''||x===null||x===undefined)?NaN:Number(x);

/* v: age, months, since(可空), cycleChange, hormonal, vms, gsm, uterus, bleeding, breastCancer, vteCvd, vteRisk, liver */
function assess(v){
  const age=num(v.age),months=num(v.months);
  const errors=[];
  if(!Number.isFinite(age)||age<18||age>100)errors.push('年齡請輸入 18–100 歲。');
  if(!Number.isFinite(months)||months<0)errors.push('距最後一次月經請輸入 0 以上的月數。');
  // 距停經年數：未填時，已無月經 ≥12 個月者以月數換算
  let since=num(v.since),sinceDerived=false;
  if(!Number.isFinite(since)&&Number.isFinite(months)&&months>=12){since=Math.round(months/12*10)/10;sinceDerived=true;}
  const notes=[];
  if(Number.isFinite(num(v.since))&&Number.isFinite(months)&&months>=12&&Math.abs(num(v.since)-months/12)>2)
    notes.push('「距停經年數」與「距最後一次月經月數」相差超過 2 年，請確認；晚啟動判斷採填寫的年數。');
  if(errors.length)return {errors,stage:'輸入待修正',stageNote:errors.join(' '),alerts:[],actions:[],notes,late:false,since,sinceDerived,poi:false,postmeno:false,taiwan:[]};

  const poi=age<40&&(months>=4||(v.cycleChange&&v.vms));
  const postmeno=months>=12&&!v.hormonal;
  let stage='待釐清',stageNote='依症狀、月經史與藥物史判讀；需考慮其他閉經與症狀原因。';
  if(poi){stage='疑似 POI 路徑';stageNote='40 歲以下有更年期症狀且無月經或月經稀少（≥4 個月）：先排除妊娠、甲狀腺、泌乳素等其他原因，再驗 FSH。ESHRE/ASRM 2024：FSH >25 IU/L 一次即可，不確定時 4–6 週後重測；NICE NG23：需相隔 4–6 週的 2 次 FSH 升高，不以單次檢驗或 AMH 常規診斷。';}
  else if(age<40&&(v.vms||v.cycleChange)){stage='40 歲以下症狀，持續觀察';stageNote='尚未達 ≥4 個月月經失調；排除妊娠與其他原因，記錄月經型態，若出現無月經或稀發月經，進入 POI 評估。';}
  else if(age>=40&&age<45&&(v.vms||v.cycleChange||months>=4)){stage='早發停經評估（40–44 歲）';stageNote='40–45 歲有停經相關症狀（含月經週期改變），NICE 1.3.6：可考慮以 FSH 輔助確認；先排除妊娠，並評估骨骼與心血管風險。';}
  else if(age>=45&&v.hormonal){stage='荷爾蒙用藥中，判讀受限';stageNote='荷爾蒙避孕或其他治療可改變出血型態；NICE 1.3.5：複方雌黃體素避孕或高劑量黃體素期間不以 FSH 判定停經。';}
  else if(age>=45&&months>=12){stage='臨床上符合停經';stageNote='45 歲以上、未使用荷爾蒙避孕且連續至少 12 個月無月經，通常不需常規 FSH 確認。';}
  else if(age>=45&&v.vms&&v.cycleChange){stage='臨床上符合停經過渡期';stageNote='45 歲以上新發熱潮紅與月經週期改變，以臨床判讀，不需常規 FSH。';}
  else if(age>=45&&v.vms&&months<12){stage='符合停經過渡期的可能';stageNote='45 歲以上熱潮紅但月經型態未改變：可依症狀臨床判讀，並排除甲狀腺、藥物等其他原因。';}
  else if(age>=45){stage='依症狀持續追蹤';stageNote='補充月經型態、症狀及荷爾蒙用藥史；單次 FSH 不宜作為常規確認。';}
  if(age<45&&v.hormonal)notes.push('正在使用荷爾蒙避孕／藥物：出血型態與 FSH 皆可能被遮蔽，判讀需保留。');
  if(age<55&&!postmeno)notes.push('停經未確立前仍可能懷孕；HRT 不具避孕效果，需另行討論避孕。');

  const alerts=[];
  if(v.bleeding){
    if(postmeno&&age>=55)alerts.push('停經後出血且 ≥55 歲：依 NICE NG12 疑似子宮內膜癌路徑轉介評估。');
    else if(postmeno)alerts.push('停經後出血：須評估子宮內膜病變，不直接歸因於荷爾蒙或萎縮。');
    else alerts.push('未明原因陰道出血須先評估；全身 HRT 開始超過 6 個月或更改劑量／製劑超過 3 個月後仍有非預期出血，應儘速就醫（NICE 1.8.4）。');
  }
  if(v.breastCancer)alerts.push('乳癌病史：不常規提供全身 HRT，需乳癌專科共同評估；GSM 先用非荷爾蒙保濕／潤滑。');
  if(v.vteCvd)alerts.push('曾有 VTE、腦中風或冠心病：系統性 HRT 不由此工具直接推薦，需個別風險及專科評估（VTE 高風險可先會診血液科）。');
  if(v.liver)alerts.push('活動性肝病或顯著肝功能異常：治療選擇需專科評估；fezolinetant 有肝毒性警語，肝硬化者禁用。');
  const late=!poi&&(age>=60||(Number.isFinite(since)&&since>10));
  if(late&&v.vms)alerts.push('年齡 ≥60 歲或距停經 >10 年才開始全身 HRT，效益／風險比通常較不利；需特別審慎評估。');

  const actions=[];
  const caution=alerts.length>0||late;
  if(v.vms){
    if(caution){
      let body='可提供更年期專屬 CBT；HRT 不適合時，可考慮 fezolinetant（NICE TA1143，需基線及定期肝功能）。SSRI／SNRI／clonidine 不作常規第一線，若使用需考量交互作用與副作用；依所在地核准／給付判斷。';
      if(v.liver)body='可提供更年期專屬 CBT；fezolinetant 不適用於肝硬化或顯著肝功能異常者。其他非荷爾蒙藥物依肝功能、交互作用與所在地核准判斷，宜與專科討論。';
      if(v.breastCancer)body+='使用 tamoxifen 者避免 paroxetine、fluoxetine（CYP2D6 抑制）。';
      actions.push({title:'熱潮紅 · 先做個別風險評估',body});
    }else if(poi){
      actions.push({title:'熱潮紅 · POI 荷爾蒙治療',body:'POI 若無禁忌，建議荷爾蒙治療（HRT 或複方避孕藥）以緩解症狀並保護骨骼與心血管；有子宮者需黃體素。HRT 不具避孕效果。'});
    }else{
      const route=v.vteRisk?'VTE 風險較高（如 BMI >30）時考慮經皮雌激素（NICE 1.5.28）；':'';
      actions.push({title:'熱潮紅 · 討論全身 HRT',body:(v.uterus?'有子宮者需雌激素加適當黃體素保護子宮內膜；':'已全子宮切除者可討論單用雌激素；')+route+'以最低有效劑量、共同決策劑型與途徑，並定期複評。不想用 HRT 者可討論 CBT 或非荷爾蒙選項。'});
    }
  }
  if(v.gsm){actions.push({title:'泌尿生殖症狀 · 局部處置',body:v.breastCancer?'先提供非荷爾蒙陰道保濕與潤滑；持續困擾時可考慮陰道雌激素（NICE 1.5.15），使用芳香環酶抑制劑者須與乳癌專科共同決定。':'可提供低劑量陰道雌激素，單用或併用保濕／潤滑；無效時可考慮 prasterone 或 ospemifene。即使已使用全身 HRT 仍可評估。'});}
  if(poi)actions.push({title:'POI · 獨立照護路徑',body:'確診後討論骨骼（DXA）、心血管、心理健康與生育；無禁忌時，荷爾蒙治療通常持續至一般停經年齡附近。'});
  if(!v.vms&&!v.gsm)actions.push({title:'症狀 · 目前無主要困擾',body:'不因年齡或檢驗數值本身啟動 HRT；說明可能出現的症狀與可尋求協助的時機。'});
  actions.push({title:'長期健康與追蹤',body:'依年齡與個人風險評估骨質疏鬆、心血管風險、乳房與子宮頸篩檢；開始 HRT 後約 3 個月複評，其後至少每年檢視。'});
  return {errors,stage,stageNote,alerts,actions,notes,late,since,sinceDerived,poi,postmeno,taiwan:taiwan(v)};
}

/* ---------- 台灣健保（藥品給付規定；健保用藥品項查詢 2026-10-31） ---------- */
const NHI_DATE='健保藥品給付規定（第一節、第五節，最新版分章節）與健保用藥品項查詢，查核 2026-10-31';
const nhiDrugs=[
  {group:'全身雌激素',listed:true,items:'estradiol valerate／estradiol 口服錠、結合型雌激素（conjugated estrogens）、estradiol 凝膠（如 Oestrogel、Divigel）與貼片',rule:'口服品項無專屬給付規定。5.3.1 Estradiol 經皮吸收製劑：5.3.1.1 Estraderm TTS、Oestro V.T 限不能口服者，申報時具體說明不能口服理由；5.3.1.2 Climara 50 限每週一片。凝膠未列於 5.3.1 子項。'},
  {group:'雌黃體素複方',listed:true,items:'estradiol + norethisterone、estradiol valerate + medroxyprogesterone 等',rule:'無專屬給付規定。'},
  {group:'黃體素（內膜保護）',listed:true,items:'微粒化 progesterone 軟膠囊（如 Utrogestan）、medroxyprogesterone 錠',rule:'無專屬給付規定。Levonorgestrel IUS（Mirena）5.3.5 僅限連續 ≥3 個月經血過多致 Hb ≤10 g/dL，5 年內不得再用，不含 HRT 內膜保護。'},
  {group:'陰道雌激素',listed:true,items:'estriol 0.5 mg 陰道錠／栓劑（如 Ovestin、Esvatin）',rule:'無專屬給付規定；給付品項中未見 estradiol 陰道錠。'},
  {group:'SSRI／SNRI',listed:true,items:'paroxetine、venlafaxine 等',rule:'1.2.1：病歷應詳細註明診斷依據及使用理由；給付規定未列熱潮紅適應症，依仿單核准適應症申報。'},
  {group:'Gabapentin',listed:true,items:'gabapentin',rule:'1.1.6 限帶狀疱疹後神經痛（他藥無效）；1.3.2.2 限局部癲癇輔助治療。用於熱潮紅不在給付範圍。'},
  {group:'NK3 拮抗劑',listed:false,items:'fezolinetant、elinzanetant',rule:'健保用藥品項查無給付中品項（2026-10-31）。'},
  {group:'其他',listed:false,items:'tibolone、ospemifene、prasterone',rule:'健保用藥品項查無給付中品項（2026-10-31）。'}
];

function taiwan(v){
  const out=[];
  if(v.vms){
    out.push('全身 HRT：口服 estradiol／結合型雌激素與微粒化 progesterone 均有健保品項，無專屬給付限制。');
    if(v.vteRisk||v.vteCvd)out.push('經皮雌激素：貼片（Estraderm TTS、Oestro V.T）依 5.3.1.1 限不能口服者，申報需具體說明理由；Climara 50 每週一片（5.3.1.2）。');
    out.push('Fezolinetant／elinzanetant 未在健保給付品項中（2026-10-31），需自費。');
    out.push('SSRI／SNRI 有給付品項（1.2.1 需病歷註明診斷依據與理由），但給付規定未列熱潮紅適應症；gabapentin 用於熱潮紅不在給付範圍（1.1.6、1.3.2.2）。');
  }
  if(v.gsm)out.push('陰道雌激素：健保品項為 estriol 0.5 mg 陰道錠／栓劑；ospemifene、prasterone 未在給付品項中。');
  if(v.uterus&&v.vms)out.push('Mirena 僅於經血過多致 Hb ≤10 g/dL 時給付（5.3.5），不含 HRT 內膜保護用途。');
  out.push('骨鬆藥物需符合 5.6 條件（DXA T-score 與骨折）；單純停經或 POI 不構成給付條件，可用下方「健保骨鬆給付檢核」。');
  return out;
}

/* o: tScore, hipSpine(脊椎/髖部骨折數), wristHumerus(遠端橈骨/近端肱骨骨折數), ra, insulinDM, steroid, recentNew(24 個月內新診斷骨折), arFail(抗骨吸收劑無法耐受或持續使用中仍新骨折), arFail12(持續使用 ≥12 個月仍新骨折或無法耐受) */
function nhiOsteo(o){
  const t=num(o.tScore),hs=num(o.hipSpine)||0,wh=num(o.wristHumerus)||0;
  if(!Number.isFinite(t))return {error:'請輸入 DXA T-score。'};
  const osteoporosis=t<=-2.5,osteopenia=t>-2.5&&t<-1.0;
  const res=[];
  const allAR=(osteoporosis&&hs>=1)||(osteopenia&&hs>=2);
  const denoAlen=allAR||(osteoporosis&&wh>=1)||(osteopenia&&wh>=2);
  const riskPath=osteoporosis&&!!(o.ra||o.insulinDM||o.steroid);
  res.push({drug:'雙磷酸鹽（alendronate、zoledronate、risedronate、ibandronate）、SERM（raloxifene、bazedoxifene）',ok:allAR,why:allAR?'5.6.1 2(1)Ⅰ：T ≤ -2.5 合併脊椎或髖部骨折，或骨質疏少（-2.5 < T < -1.0）合併脊椎／髖部 ≥2 處或 2 次骨折。':'需 T ≤ -2.5 合併脊椎／髖部骨折，或骨質疏少合併脊椎／髖部 ≥2 處（次）骨折。'});
  res.push({drug:'Denosumab（Prolia）、alendronate（部分品項除外）',ok:denoAlen||riskPath,why:allAR?'5.6.1 2(1)Ⅰ：同上（脊椎或髖部骨折條件）。':denoAlen?'5.6.1 2(1)Ⅰ：遠端橈骨或近端肱骨骨折之擴充條件（限 denosumab、alendronate）。':riskPath?'5.6.1 2(1)Ⅱ：T ≤ -2.5 且合併類風濕性關節炎、使用胰島素之糖尿病或類固醇 >5 mg/天超過 3 個月（病歷載明）。':'另可因遠端橈骨／近端肱骨骨折，或 T ≤ -2.5 合併 RA、胰島素治療糖尿病、類固醇 >5 mg/天 >3 個月而給付。'});
  const tpd=t<=-3.0&&hs>=2&&!!o.arFail12;
  res.push({drug:'Teriparatide',ok:tpd,why:'5.6.2：停經後婦女，T ≤ -3.0，脊椎或髖部 ≥2 處骨折，且無法耐受抗骨吸收劑或持續使用 ≥12 個月仍有 ≥1 處新骨折；最多 18 支、2 年內用完。'});
  const romo=t<=-3.0&&!!o.recentNew&&((hs+wh)>=2||!!o.arFail);
  res.push({drug:'Romosozumab',ok:romo,why:'5.6.3：停經後婦女，T ≤ -3.0；24 個月內 ≥2 處骨折含 1 處新診斷，或無法耐受／持續使用抗骨吸收劑仍有新診斷骨折；最多 24 支、1 年內用完。與 teriparatide 擇一。'});
  return {res,notes:['一次限用一項骨鬆藥物，不得併用（5.6.1 2(2)）。','使用雙磷酸鹽前須檢測血清 creatinine（5.6.1 2(3)）。','骨折部位與 T-score 判讀以原文為準；teriparatide／romosozumab 之骨折條件此處簡化計算。']};
}

const cases=[
  {id:'01',tag:'診斷',title:'48 歲，月經變亂又熱潮紅',stem:'最近 8 個月月經間隔忽長忽短，夜間熱潮紅影響睡眠，未使用荷爾蒙避孕。',question:'下一個常規檢驗應是？',options:['以症狀與週期變化臨床判斷，通常不需 FSH','每月抽 FSH 三次才能判定','只測 AMH'],answer:0,why:'45 歲以上、健康且有新發熱潮紅與週期變化，NICE 建議臨床辨識停經過渡期，不需常規實驗室檢驗。',next:'討論生活影響、治療偏好、避孕需求與個人風險。'},
  {id:'02',tag:'HRT',title:'52 歲，有子宮且熱潮紅嚴重',stem:'停經 18 個月，夜間盜汗和熱潮紅頻繁；無未明出血、乳癌或血栓病史，仍保有子宮。',question:'討論全身荷爾蒙治療時，哪個組合較合適？',options:['只用雌激素而不保護子宮內膜','雌激素合併適當黃體素，個別化路徑與劑量','只給黃體素且宣稱可預防心臟病'],answer:1,why:'有子宮者需合併黃體素保護內膜；治療需討論效益、風險、最低有效劑量與追蹤。',next:'依風險與偏好選擇口服／經皮方案，約 3 個月複評。'},
  {id:'03',tag:'GSM',title:'乳癌病史與陰道乾澀',stem:'58 歲，乳癌治療後使用芳香環酶抑制劑，陰道乾澀與性交痛持續。',question:'第一步較妥當的是？',options:['直接自行開始全身 HRT','先提供非荷爾蒙保濕／潤滑；持續困擾時與乳癌團隊討論','以陰道雷射作標準治療'],answer:1,why:'乳癌病史的 GSM 先用非荷爾蒙治療；芳香環酶抑制劑使用者若仍困擾，須與乳癌專家共同評估局部選項。',next:'檢視症狀與治療反應，評估其他病因。'},
  {id:'04',tag:'POI',title:'38 歲停經 5 個月',stem:'38 歲，月經停止 5 個月，偶有熱潮紅，妊娠試驗陰性，未使用荷爾蒙藥物。',question:'應考慮哪條路徑？',options:['直接按 52 歲自然停經處理','評估早發性卵巢功能不全（POI）及其他閉經原因','單次 AMH 即可確診 POI'],answer:1,why:'40 歲以下月經失調至少 4 個月須評估 POI；ESHRE/ASRM 2024 以 FSH >25 IU/L 確認（不確定時重測）；NICE NG23 則要求相隔 4–6 週 2 次 FSH 升高，不以單次檢驗或 AMH 常規診斷。',next:'兼顧生育、骨骼、心血管與心理健康。'},
  {id:'05',tag:'風險時機',title:'64 歲才開始考慮 HRT',stem:'停經約 13 年，近期熱潮紅，想知道是否可直接開始全身荷爾蒙治療。',question:'最合適的說明？',options:['任何年齡開始效益／風險都相同','較晚啟動的風險較高，需個別評估並討論其他選項','HRT 專門用於預防心血管疾病'],answer:1,why:'60 歲以上或距停經超過 10 年才開始全身 HRT，絕對風險較高，效益／風險比通常較不利。',next:'評估其他熱潮紅原因、個人風險與非荷爾蒙選項。'},
  {id:'06',tag:'出血警訊',title:'HRT 後仍有非預期出血',stem:'54 歲，有子宮，開始連續合併全身 HRT 已 9 個月，最近仍反覆出現非預期陰道出血。',question:'最適合的處置？',options:['視為永遠正常，等一年再說','儘速就醫評估出血，不直接歸因於 HRT','只加大雌激素'],answer:1,why:'NICE 2026 更新指出，開始全身 HRT 超過 6 個月或更改製劑／劑量超過 3 個月後的非預期出血，應儘速就醫評估。',next:'檢視用藥、出血型態與子宮內膜病變風險，依當地流程評估。'}
];

const questions=[
  {level:'住院醫師',q:'45 歲以上有新發熱潮紅和月經週期改變，常規診斷方式？',a:['臨床判讀','每人測 AMH','每人測雌二醇'],correct:0,why:'典型情境可臨床辨識停經過渡期，不需常規檢驗。'},
  {level:'住院醫師',q:'未用荷爾蒙避孕、45 歲以上，停經的臨床定義？',a:['無月經 3 個月','無月經至少 12 個月','FSH 單次升高'],correct:1,why:'NICE 以連續至少 12 個月無月經判定。'},
  {level:'住院醫師',q:'40–45 歲有症狀與週期改變，何時可考慮 FSH？',a:['可輔助確認早發停經','永遠不做','只能用 AMH'],correct:0,why:'NICE 1.3.6：40–45 歲有症狀（含週期改變）或 40 歲以下疑似停經者，可考慮以 FSH 確認。'},
  {level:'住院醫師',q:'有子宮者使用全身 HRT 應注意？',a:['雌激素合併適當黃體素','只有雌激素即可','只看熱潮紅次數'],correct:0,why:'需黃體素保護子宮內膜。'},
  {level:'住院醫師',q:'全子宮切除後，有症狀且適合 HRT 者可討論？',a:['雌激素單用','一定要合併黃體素','絕不使用雌激素'],correct:0,why:'NICE 建議全子宮切除後可提供雌激素單用。'},
  {level:'住院醫師',q:'更年期泌尿生殖症狀，無乳癌史時可討論？',a:['低劑量陰道雌激素','一律用全身 HRT','陰道雷射為標準'],correct:0,why:'NICE 建議提供陰道雌激素，可合併保濕及潤滑。'},
  {level:'住院醫師',q:'乳癌病史且有陰道乾澀，初始選擇？',a:['非荷爾蒙保濕或潤滑','自行開始全身 HRT','不需處理'],correct:0,why:'先用非荷爾蒙治療；持續困擾時需共同討論局部治療。'},
  {level:'住院醫師',q:'開始 HRT 後的常規複評？',a:['約 3 個月，之後至少每年','10 年後才需要','無須評估'],correct:0,why:'檢視症狀、出血、副作用和效益風險。'},
  {level:'住院醫師',q:'全身 HRT 的主要用途之一？',a:['緩解困擾的熱潮紅','心血管疾病初級預防','取代所有骨鬆篩檢'],correct:0,why:'HRT 是熱潮紅最有效治療之一，但不以預防 CVD 為主要目的。'},
  {level:'住院醫師',q:'使用複方荷爾蒙避孕藥時，FSH 判定停經？',a:['不可靠，不應以此判定','一律最準確','改用 AMH 即可確診'],correct:0,why:'複方避孕藥影響 FSH 和出血型態。'},
  {level:'進階',q:'38 歲無月經 5 個月，POI 的 FSH 診斷界線？',a:['>25 IU/L，必要時重測','只要 AMH 低','任何 FSH >5'],correct:0,why:'ESHRE/ASRM 2024 採月經失調至少 4 個月與 FSH >25 IU/L，不確定時 4–6 週後重測；NICE NG23 要求 2 次相隔 4–6 週的 FSH 升高。'},
  {level:'進階',q:'60 歲以上或距停經超過 10 年才開始全身 HRT？',a:['效益／風險比一般較不利','與早期開始相同','專用於心肌梗塞預防'],correct:0,why:'較晚啟動時 CHD、腦中風、VTE、失智的絕對風險較高。'},
  {level:'進階',q:'BMI >30 kg/m² 且考慮 HRT 時，NICE 的途徑建議？',a:['考慮經皮而非口服','一律口服','途徑與 VTE 風險無關'],correct:0,why:'NICE 1.5.28：VTE 風險較高（含 BMI >30）者考慮經皮而非口服 HRT，仍須整體個別化評估。'},
  {level:'進階',q:'有子宮、全身 HRT 9 個月仍反覆非預期出血？',a:['儘速評估','再觀察 5 年','只加大雌激素'],correct:0,why:'NICE 2026 更新指出超過開始後 6 個月或調整後 3 個月仍出血應儘速就醫。'},
  {level:'進階',q:'芳香環酶抑制劑治療中的乳癌患者，GSM 持續且非荷爾蒙治療無效？',a:['與乳癌專家共同討論局部治療','自行使用全身 HRT','陰道雷射列常規'],correct:0,why:'NICE 建議與乳癌團隊共同辨識適合的選項。'},
  {level:'進階',q:'Fezolinetant 的重要安全提醒？',a:['有肝毒性警語，需治療前與後續肝功能監測','不需抽血','可替代內膜保護'],correct:0,why:'FDA 盒裝警語要求基線、前 3 個月每月及第 6、9 個月肝功能檢測；所在地核准與給付另查。'},
  {level:'進階',q:'有乳房癌病史的陰道局部雌激素，何者正確？',a:['先非荷爾蒙，持續困擾時個別討論；AI 使用者需乳癌專家共同決策','完全等同全身 HRT','所有人自行使用無需討論'],correct:0,why:'局部吸收低但乳癌復發風險資料仍有不確定性，需個別化。'},
  {level:'進階',q:'全身 HRT 風險討論應包含哪些差異？',a:['年齡、停經年數、途徑、劑量、黃體素與個人風險','只看年齡','只看 FSH'],correct:0,why:'The Menopause Society 強調個人化與定期再評估。'},
  {level:'進階',q:'只存在 GSM、沒有全身 HRT 適應症時？',a:['優先考慮局部治療與非荷爾蒙選項','一律全身 HRT','不處理'],correct:0,why:'局部治療可直接針對 GSM，無須僅因此啟動全身 HRT。'},
  {level:'進階',q:'40 歲以下 POI 確診後，若無禁忌，荷爾蒙治療通常討論到何時？',a:['一般停經年齡附近','只治療一週','等到 80 歲才開始'],correct:0,why:'POI 的長期低雌激素影響骨骼與心血管健康，與自然停經 HRT 的時機不同。'}
];
/*ENGINE-END*/
const MENO={assess,taiwan,nhiOsteo,nhiDrugs,NHI_DATE,cases,questions,sources};
if(typeof module!=='undefined'&&module.exports)module.exports=MENO;else root.MENO=MENO;
})(typeof window!=='undefined'?window:globalThis);
