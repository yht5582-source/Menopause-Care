export const sources=[
  {name:'NICE NG23 · Menopause (2026 update)',url:'https://www.nice.org.uk/guidance/ng23/chapter/Recommendations',note:'臨床辨識、HRT、泌尿生殖症狀與追蹤'},
  {name:'The Menopause Society · 2022 Hormone Therapy',url:'https://doi.org/10.1097/GME.0000000000002028',note:'荷爾蒙治療時機、效益與風險'},
  {name:'The Menopause Society · 2023 Nonhormone Therapy',url:'https://menopause.org/professional-resources/position-statements',note:'熱潮紅非荷爾蒙治療'},
  {name:'ASRM · Premature Ovarian Insufficiency Guideline',url:'https://www.asrm.org/practice-guidance/practice-committee-documents/evidence-based-guideline-premature-ovarian-insufficiency--2024/',note:'40 歲以下卵巢功能不全辨識與照護'},
  {name:'FDA · Fezolinetant liver warning',url:'https://www.fda.gov/drugs/drug-safety-communications/fda-adds-warning-about-rare-occurrence-serious-liver-injury-use-veozah-fezolinetant-hot-flashes-due',note:'肝毒性警語與監測時程'}
];

export function assess(v){
  let stage='待釐清',stageNote='依症狀、月經史與藥物史判讀；需考慮其他閉經與症狀原因。';
  if(v.age<40 && v.months>=4){stage='疑似 POI 路徑';stageNote='40 歲以下月經失調至少 4 個月，先排除妊娠及其他原因，再以 FSH >25 IU/L 等標準評估；有不確定性時 4–6 週後重測。';}
  else if(v.age>=40 && v.age<45 && (v.vms||v.months>=4)){stage='早發停經評估';stageNote='40–44 歲合併停經相關症狀或週期改變，可考慮 FSH 輔助確認並評估骨骼與心血管風險。';}
  else if(v.age>=45 && v.hormonal){stage='荷爾蒙用藥中，判讀受限';stageNote='荷爾蒙避孕或其他治療可改變出血型態；複方避孕藥／高劑量黃體素期間不以 FSH 判定停經。';}
  else if(v.age>=45 && v.months>=12){stage='臨床上符合停經';stageNote='45 歲以上、未使用荷爾蒙避孕且連續至少 12 個月無月經，通常不需常規 FSH 確認。';}
  else if(v.age>=45 && v.vms && v.cycleChange){stage='臨床上符合停經過渡期';stageNote='45 歲以上近期熱潮紅與月經週期改變，通常以臨床判讀，不需常規 FSH。';}
  else if(v.age>=45){stage='依症狀持續追蹤';stageNote='補充月經型態、症狀及荷爾蒙用藥史；單次 FSH 不宜作為常規確認。';}
  const alerts=[];
  if(v.bleeding)alerts.push('未明原因陰道出血須先評估；使用全身 HRT 後若超過開始 6 個月或調整後 3 個月仍有非預期出血，應儘速就醫。');
  if(v.breastCancer)alerts.push('乳癌病史：全身 HRT 選擇需專科評估；GSM 先用非荷爾蒙保濕／潤滑，持續時與乳癌團隊共同討論局部治療。');
  if(v.vteCvd)alerts.push('曾有 VTE、腦中風或冠心病：系統性 HRT 不宜由此工具直接推薦，需個別風險及專科評估。');
  if(v.liver)alerts.push('活動性肝病或顯著肝功能異常：治療選擇需專科評估；fezolinetant 有肝毒性警語。');
  const late=v.age>=60 || (Number.isFinite(v.since) && v.since>10);
  if(late && v.vms)alerts.push('年齡 ≥60 歲或距停經 >10 年才開始全身 HRT，效益／風險比通常較不利；需特別審慎評估。');
  const actions=[];
  if(v.vms){
    if(alerts.length || late){actions.push({title:'熱潮紅 · 先做個別風險評估',body:'可討論更年期專屬 CBT 與非荷爾蒙選項；若考慮藥物，依適應症、交互作用及所在地核准／給付判斷。'});}
    else {actions.push({title:'熱潮紅 · 討論全身 HRT',body:v.uterus?'有子宮者需雌激素加適當黃體素保護子宮內膜；共同決策劑型、途徑、最低有效劑量與定期複評。':'已全子宮切除者可討論單用雌激素；仍需依個人風險、目標與偏好選擇。'});}
  }
  if(v.gsm){actions.push({title:'泌尿生殖症狀 · 局部處置',body:v.breastCancer?'先用非荷爾蒙陰道保濕與潤滑；若持續困擾，與乳癌專科共同討論局部雌激素等選項。':'可討論低劑量陰道雌激素，亦可併用陰道保濕與潤滑；即使已使用全身 HRT 仍可評估。'});}
  if(v.age<40 && v.months>=4)actions.push({title:'POI · 獨立照護路徑',body:'確診後討論骨骼、心血管、心理健康與生育；無禁忌時，荷爾蒙治療通常持續至一般停經年齡附近。'});
  actions.push({title:'長期健康與追蹤',body:'依年齡與個人風險評估骨質疏鬆、心血管風險、乳房與子宮頸篩檢；開始 HRT 後約 3 個月複評，其後至少每年檢視。'});
  return {stage,stageNote,alerts,actions,late};
}

export const cases=[
  {id:'01',tag:'診斷',title:'48 歲，月經變亂又熱潮紅',stem:'最近 8 個月月經間隔忽長忽短，夜間熱潮紅影響睡眠，未使用荷爾蒙避孕。',question:'下一個常規檢驗應是？',options:['以症狀與週期變化臨床判斷，通常不需 FSH','每月抽 FSH 三次才能判定','只測 AMH'],answer:0,why:'45 歲以上、健康且有新發熱潮紅與週期變化，NICE 建議臨床辨識停經過渡期，不需常規實驗室檢驗。',next:'討論生活影響、治療偏好、避孕需求與個人風險。'},
  {id:'02',tag:'HRT',title:'52 歲，有子宮且熱潮紅嚴重',stem:'停經 18 個月，夜間盜汗和熱潮紅頻繁；無未明出血、乳癌或血栓病史，仍保有子宮。',question:'討論全身荷爾蒙治療時，哪個組合較合適？',options:['只用雌激素而不保護子宮內膜','雌激素合併適當黃體素，個別化路徑與劑量','只給黃體素且宣稱可預防心臟病'],answer:1,why:'有子宮者需合併黃體素保護內膜；治療需討論效益、風險、最低有效劑量與追蹤。',next:'依風險與偏好選擇口服／經皮方案，約 3 個月複評。'},
  {id:'03',tag:'GSM',title:'乳癌病史與陰道乾澀',stem:'58 歲，乳癌治療後使用芳香環酶抑制劑，陰道乾澀與性交痛持續。',question:'第一步較妥當的是？',options:['直接自行開始全身 HRT','先提供非荷爾蒙保濕／潤滑；持續困擾時與乳癌團隊討論','以陰道雷射作標準治療'],answer:1,why:'乳癌病史的 GSM 先用非荷爾蒙治療；芳香環酶抑制劑使用者若仍困擾，須與乳癌專家共同評估局部選項。',next:'檢視症狀與治療反應，評估其他病因。'},
  {id:'04',tag:'POI',title:'38 歲停經 5 個月',stem:'38 歲，月經停止 5 個月，偶有熱潮紅，妊娠試驗陰性，未使用荷爾蒙藥物。',question:'應考慮哪條路徑？',options:['直接按 52 歲自然停經處理','評估早發性卵巢功能不全（POI）及其他閉經原因','單次 AMH 即可確診 POI'],answer:1,why:'40 歲以下月經失調至少 4 個月須評估 POI；國際指引以 FSH >25 IU/L 等條件確認，必要時重測。',next:'兼顧生育、骨骼、心血管與心理健康。'},
  {id:'05',tag:'風險時機',title:'64 歲才開始考慮 HRT',stem:'停經約 13 年，近期熱潮紅，想知道是否可直接開始全身荷爾蒙治療。',question:'最合適的說明？',options:['任何年齡開始效益／風險都相同','較晚啟動的風險較高，需個別評估並討論其他選項','HRT 專門用於預防心血管疾病'],answer:1,why:'60 歲以上或距停經超過 10 年才開始全身 HRT，絕對風險較高，效益／風險比通常較不利。',next:'評估其他熱潮紅原因、個人風險與非荷爾蒙選項。'},
  {id:'06',tag:'出血警訊',title:'HRT 後仍有非預期出血',stem:'54 歲，有子宮，開始連續合併全身 HRT 已 9 個月，最近仍反覆出現非預期陰道出血。',question:'最適合的處置？',options:['視為永遠正常，等一年再說','儘速就醫評估出血，不直接歸因於 HRT','只加大雌激素'],answer:1,why:'NICE 2026 更新指出，開始全身 HRT 超過 6 個月或更改製劑／劑量超過 3 個月後的非預期出血，應儘速就醫評估。',next:'檢視用藥、出血型態與子宮內膜病變風險，依當地流程評估。'}
];

export const questions=[
  {level:'住院醫師',q:'45 歲以上有新發熱潮紅和月經週期改變，常規診斷方式？',a:['臨床判讀','每人測 AMH','每人測雌二醇'],correct:0,why:'典型情境可臨床辨識停經過渡期，不需常規檢驗。'},
  {level:'住院醫師',q:'未用荷爾蒙避孕、45 歲以上，停經的臨床定義？',a:['無月經 3 個月','無月經至少 12 個月','FSH 單次升高'],correct:1,why:'NICE 以連續至少 12 個月無月經判定。'},
  {level:'住院醫師',q:'40–45 歲有症狀與週期改變，何時可考慮 FSH？',a:['可輔助確認早發停經','永遠不做','只能用 AMH'],correct:0,why:'NICE 對 40–45 歲或 40 歲以下疑似者可考慮 FSH。'},
  {level:'住院醫師',q:'有子宮者使用全身 HRT 應注意？',a:['雌激素合併適當黃體素','只有雌激素即可','只看熱潮紅次數'],correct:0,why:'需黃體素保護子宮內膜。'},
  {level:'住院醫師',q:'全子宮切除後，有症狀且適合 HRT 者可討論？',a:['雌激素單用','一定要合併黃體素','絕不使用雌激素'],correct:0,why:'NICE 建議全子宮切除後可提供雌激素單用。'},
  {level:'住院醫師',q:'更年期泌尿生殖症狀，無乳癌史時可討論？',a:['低劑量陰道雌激素','一律用全身 HRT','陰道雷射為標準'],correct:0,why:'NICE 建議提供陰道雌激素，可合併保濕及潤滑。'},
  {level:'住院醫師',q:'乳癌病史且有陰道乾澀，初始選擇？',a:['非荷爾蒙保濕或潤滑','自行開始全身 HRT','不需處理'],correct:0,why:'先用非荷爾蒙治療；持續困擾時需共同討論局部治療。'},
  {level:'住院醫師',q:'開始 HRT 後的常規複評？',a:['約 3 個月，之後至少每年','10 年後才需要','無須評估'],correct:0,why:'檢視症狀、出血、副作用和效益風險。'},
  {level:'住院醫師',q:'全身 HRT 的主要用途之一？',a:['緩解困擾的熱潮紅','心血管疾病初級預防','取代所有骨鬆篩檢'],correct:0,why:'HRT 是熱潮紅最有效治療之一，但不以預防 CVD 為主要目的。'},
  {level:'住院醫師',q:'使用複方荷爾蒙避孕藥時，FSH 判定停經？',a:['不可靠，不應以此判定','一律最準確','改用 AMH 即可確診'],correct:0,why:'複方避孕藥影響 FSH 和出血型態。'},
  {level:'進階',q:'38 歲無月經 5 個月，POI 的 FSH 診斷界線？',a:['>25 IU/L，必要時重測','只要 AMH 低','任何 FSH >5'],correct:0,why:'ASRM 指引採月經失調至少 4 個月與 FSH >25 IU/L；不確定時 4–6 週後重測。'},
  {level:'進階',q:'60 歲以上或距停經超過 10 年才開始全身 HRT？',a:['效益／風險比一般較不利','與早期開始相同','專用於心肌梗塞預防'],correct:0,why:'較晚啟動時 CHD、腦中風、VTE、失智的絕對風險較高。'},
  {level:'進階',q:'BMI >30 kg/m² 且考慮 HRT 時，NICE 的途徑建議？',a:['考慮經皮而非口服','一律口服','途徑與 VTE 風險無關'],correct:0,why:'VTE 風險較高時可考慮經皮途徑，仍須整體個別化評估。'},
  {level:'進階',q:'有子宮、全身 HRT 9 個月仍反覆非預期出血？',a:['儘速評估','再觀察 5 年','只加大雌激素'],correct:0,why:'NICE 2026 更新指出超過開始後 6 個月或調整後 3 個月仍出血應儘速就醫。'},
  {level:'進階',q:'芳香環酶抑制劑治療中的乳癌患者，GSM 持續且非荷爾蒙治療無效？',a:['與乳癌專家共同討論局部治療','自行使用全身 HRT','陰道雷射列常規'],correct:0,why:'NICE 建議與乳癌團隊共同辨識適合的選項。'},
  {level:'進階',q:'Fezolinetant 的重要安全提醒？',a:['有肝毒性警語，需治療前與後續肝功能監測','不需抽血','可替代內膜保護'],correct:0,why:'FDA 盒裝警語要求基線、前 3 個月每月及第 6、9 個月肝功能檢測；所在地核准與給付另查。'},
  {level:'進階',q:'有乳房癌病史的陰道局部雌激素，何者正確？',a:['先非荷爾蒙，持續困擾時個別討論；AI 使用者需乳癌專家共同決策','完全等同全身 HRT','所有人自行使用無需討論'],correct:0,why:'局部吸收低但乳癌復發風險資料仍有不確定性，需個別化。'},
  {level:'進階',q:'全身 HRT 風險討論應包含哪些差異？',a:['年齡、停經年數、途徑、劑量、黃體素與個人風險','只看年齡','只看 FSH'],correct:0,why:'The Menopause Society 強調個人化與定期再評估。'},
  {level:'進階',q:'只存在 GSM、沒有全身 HRT 適應症時？',a:['優先考慮局部治療與非荷爾蒙選項','一律全身 HRT','不處理'],correct:0,why:'局部治療可直接針對 GSM，無須僅因此啟動全身 HRT。'},
  {level:'進階',q:'40 歲以下 POI 確診後，若無禁忌，荷爾蒙治療通常討論到何時？',a:['一般停經年齡附近','只治療一週','等到 80 歲才開始'],correct:0,why:'POI 的長期低雌激素影響骨骼與心血管健康，與自然停經 HRT 的時機不同。'}
];
