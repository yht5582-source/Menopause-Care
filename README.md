# 更年期照護互動學習站

繁體中文臨床教學網頁，依國際指引整理停經過渡期辨識、熱潮紅與泌尿生殖症狀照護、早發性卵巢功能不全（POI）及治療安全提醒。包含互動情境分流、6 個虛構病例、住院醫師與進階各 10 題測驗。

公開網站：https://yht5582-source.github.io/Menopause-Care/

## 使用與限制

直接開啟 `index.html` 即可使用（一般 script，file:// 也可執行）；無需伺服器或建置。檔案：`clinical.js`（分流引擎與教學資料，/*ENGINE-START*/…/*ENGINE-END*/）、`app.js`（畫面）、`style.css`。互動分流供教學與共同決策練習，不構成個人診斷或處方。治療應由專業人員依完整病史、禁忌、病人偏好及所在地藥物核准規範判斷。台灣健保給付另列一區，與國際指引分開標示（綠色「台灣規範」）。

## 指引與安全資訊

- [NICE NG23 Menopause（last updated 2026-04-15）](https://www.nice.org.uk/guidance/ng23/chapter/Recommendations)
- [NICE TA1143 Fezolinetant（2026）](https://www.nice.org.uk/guidance/ta1143)
- [The Menopause Society 2022 Hormone Therapy Position Statement](https://doi.org/10.1097/GME.0000000000002028)
- [The Menopause Society 2023 Nonhormone Therapy Position Statement](https://menopause.org/professional-resources/position-statements)
- [ESHRE/ASRM/CRE/IMS Evidence-based Guideline: Premature Ovarian Insufficiency](https://www.asrm.org/practice-guidance/practice-committee-documents/evidence-based-guideline-premature-ovarian-insufficiency--2024/)
- [健保署 藥品給付規定（第一節、第五節）](https://www.nhi.gov.tw/ch/cp-7593-ad2a9-3397-1.html)
- [健保用藥品項網路查詢](https://info.nhi.gov.tw/INAE3000/INAE3000S01)（查詢 2026-10-31）
- [FDA fezolinetant 肝毒性警語](https://www.fda.gov/drugs/drug-safety-communications/fda-adds-warning-about-rare-occurrence-serious-liver-injury-use-veozah-fezolinetant-hot-flashes-due)

內容查核：2026 年 10 月。

## 測試

```bash
node --test tests/clinical.test.cjs
```

## 更新紀錄

- v1.2（2026-10-31）新增台灣健保給付區：雌／黃體素、陰道 estriol、SSRI/SNRI（1.2.1）、gabapentin（1.1.6、1.3.2.2）、Mirena（5.3.5）、經皮 estradiol（5.3.1）給付規定；fezolinetant、elinzanetant、tibolone、ospemifene、prasterone 未列給付品項；骨鬆藥物 5.6.1–5.6.3 給付檢核。分流結果分為「國際規範」與「台灣規範」兩區。測試 20 項。
- v1.3（2026-10-31）視覺設計整理：統一色彩 token（深綠＋沙金，玫瑰色僅作點綴），支援深色模式；固定式頂欄並標示目前區段；內文字級加大；病例卡片不再因等高留白；選項正誤以色彩與圓點標示；健保表以色條區分有／未列給付；分流結果改為卡片式；支援減少動態與列印樣式。
- v1.1（2026-10-31）除錯與優化：測試改指向實際檔案（原 import 不存在的 `dist/`）；改為一般 script，直接開檔不再因 ES module 被瀏覽器擋下；考題與病例選項順序隨機（原 20 題中 19 題正解皆為 A）；距停經年數空白時由無月經月數換算以偵測晚啟動；40 歲以下 POI 路徑納入稀發月經、加註 NICE 2 次 FSH 與 ESHRE/ASRM 單次 FSH 差異，POI 不再誤判為晚啟動；40–44 歲僅週期改變也進入評估；停經後出血 ≥55 歲走 NG12；新增 BMI >30／VTE 危險因子（經皮途徑）、fezolinetant（NICE TA1143、肝病禁用）、tamoxifen 與 paroxetine/fluoxetine 交互作用、避孕提醒、輸入檢查與清除按鈕。測試 15 項。
