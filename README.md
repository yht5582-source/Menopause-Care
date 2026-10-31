# 更年期照護互動學習站

繁體中文臨床教學網頁，依國際指引整理停經過渡期辨識、熱潮紅與泌尿生殖症狀照護、早發性卵巢功能不全（POI）及治療安全提醒。包含互動情境分流、6 個虛構病例、住院醫師與進階各 10 題測驗。

公開網站：https://yht5582-source.github.io/Menopause-Care/

## 使用與限制

直接開啟 `index.html` 即可使用（一般 script，file:// 也可執行）；無需伺服器或建置。檔案：`clinical.js`（分流引擎與教學資料，/*ENGINE-START*/…/*ENGINE-END*/）、`app.js`（畫面）、`style.css`。互動分流供教學與共同決策練習，不構成個人診斷或處方。治療應由專業人員依完整病史、禁忌、病人偏好及所在地藥物核准規範判斷。本頁未納入台灣健保給付資訊。

## 指引與安全資訊

- [NICE NG23 Menopause（last updated 2026-04-15）](https://www.nice.org.uk/guidance/ng23/chapter/Recommendations)
- [NICE TA1143 Fezolinetant（2026）](https://www.nice.org.uk/guidance/ta1143)
- [The Menopause Society 2022 Hormone Therapy Position Statement](https://doi.org/10.1097/GME.0000000000002028)
- [The Menopause Society 2023 Nonhormone Therapy Position Statement](https://menopause.org/professional-resources/position-statements)
- [ESHRE/ASRM/CRE/IMS Evidence-based Guideline: Premature Ovarian Insufficiency](https://www.asrm.org/practice-guidance/practice-committee-documents/evidence-based-guideline-premature-ovarian-insufficiency--2024/)
- [FDA fezolinetant 肝毒性警語](https://www.fda.gov/drugs/drug-safety-communications/fda-adds-warning-about-rare-occurrence-serious-liver-injury-use-veozah-fezolinetant-hot-flashes-due)

內容查核：2026 年 10 月。

## 測試

```bash
node --test tests/clinical.test.cjs
```

## 更新紀錄

- v1.1（2026-10-31）除錯與優化：測試改指向實際檔案（原 import 不存在的 `dist/`）；改為一般 script，直接開檔不再因 ES module 被瀏覽器擋下；考題與病例選項順序隨機（原 20 題中 19 題正解皆為 A）；距停經年數空白時由無月經月數換算以偵測晚啟動；40 歲以下 POI 路徑納入稀發月經、加註 NICE 2 次 FSH 與 ESHRE/ASRM 單次 FSH 差異，POI 不再誤判為晚啟動；40–44 歲僅週期改變也進入評估；停經後出血 ≥55 歲走 NG12；新增 BMI >30／VTE 危險因子（經皮途徑）、fezolinetant（NICE TA1143、肝病禁用）、tamoxifen 與 paroxetine/fluoxetine 交互作用、避孕提醒、輸入檢查與清除按鈕。測試 15 項。
