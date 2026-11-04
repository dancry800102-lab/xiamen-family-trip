# 廈門慢遊記

2027/02/06–2027/02/10，五天四夜。沿用南京旅遊手冊的紙色、襯線字體、日期切換與資訊分區，以海綠色呈現廈門主題。所有未確認資訊明確標示待規劃，不沿用南京旅伴或帳務。

來源：src/ 為前端，worker/api.js 為共享記帳 API。使用 Sites Worker 與本網站獨立 D1 資料庫，專案識別見 .openai/hosting.json。公開訪客可讀寫帳目，與南京網站相同。

9 位成員：7 位大人、李知芮（3歲）、林新恩（4歲）。支援 9 人均分、7 位大人均分、自選成員（含單人）；新台幣以整數分儲存，依固定名單分配不足一分尾差。新增請求帶冪等識別避免網路重試重複入帳。刪除保留資料庫紀錄但不計入明細與結算。

建置：node scripts/build.mjs。驗證：node --test tests/ledger.test.mjs。本機預覽：node scripts/preview.mjs（Node 24，使用獨立 .preview.sqlite，不連到正式資料庫）。dist/server/index.js 為單一 Worker，內嵌前端資產；drizzle/ 為上線時套用的 SQL 遷移，已套用遷移不可更改。
