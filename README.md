# Notes App

這是一個使用 Next.js (TypeScript) 與 React 開發的網頁版筆記應用程式。
它的設計理念與介面排版受到 Scrapbox 啟發，採用網格視圖加上文字片段來展示筆記，並將所有資料儲存於本地的 JSONL 檔案中。

## 🌟 主要功能

- **網格視圖 (Grid Layout)**：筆記以卡片形式呈現，預設按更新日期新舊遞減排序。
- **閱讀模式 (Reading Mode)**：點擊筆記卡片後，會開啟簡潔的互動式對話框 (Modal)，顯示標題、內文、圖片縮圖與標籤，提升閱讀體驗。
- **全文搜尋 (Full-Text Search)**：支援關鍵字全文搜尋，點擊搜尋按鈕後即時篩選符合內容的筆記。
- **歷史存檔 (Archive)**：內建封存按鈕，可透過下拉選單根據年份與月份篩選歷史筆記，功能類似 Tumblr 的 Archive 頁面。
- **編輯與刪除**：
  - 獨立的編輯介面，文字框支援隨內容長度自動調整捲動範圍以便於編輯。
  - **圖片上傳功能**：在編輯模式中可直接上傳照片，圖片會儲存在設備中，資料庫負責記錄檔案路徑。
  - 針對筆記進行安全的刪除操作（含刪除前確認機制）。
- **進階圖片瀏覽**：在閱讀模式下的圖片縮圖，點擊後會顯示原始尺寸，方便查看大圖。
- **效能最佳化**：精簡且高效的 UI，移除了多餘的動畫與特效，以確保在超過 5000 筆資料的情況下依然保持流暢的使用體驗。
- **外掛生態與腳本**：
  - 提供 `import_tumblr.py` 可用來匯入 Tumblr API 所產生的外部資料。
  - 專案包含資料清理腳本，自動偵測並移除 `.jsonl` 內的重複文字和外部網站的複雜引號格式，維持資料庫整潔。

## 📁 資料結構

筆記資料預設儲存於專案內部的 `data/notes.jsonl` (JSON Lines 格式)，每筆資料包含：

```typescript
export interface Note {
    id: string;      // 內容、日期與標題的 MD5 雜湊值（唯一識別碼）
    title: string;   // 筆記標題 (如未設定，預設為當前日期 YYYY-MM-DD)
    date: string;    // 最後編輯或建立時間 (ISO 8601 格式)
    tags: string[];  // 筆記的分類標籤陣列
    media: string[]; // 附檔（圖片或影片）的 URL 或本地路徑集合
    content: string; // 筆記內文純文字
}
```

## 🚀 快速開始

### 1. 啟動應用程式

您可以使用專案根目錄提供的 `start.bat` 腳本快速啟動服務並自動開啟瀏覽器：
```cmd
start.bat
```

如果您偏好手動啟動開發伺服器，請執行：
```bash
npm run dev
# 或 yarn dev
# 或 pnpm dev
```
啟動後使用瀏覽器開啟 [http://localhost:3000](http://localhost:3000) 即可開始使用。

## 🛠️ 技術棧

- **核心框架**：Next.js 16 (App Router)
- **前端工具**：React 19, TypeScript
- **樣式與 UI**：Tailwind CSS v4 (原生 CSS 整合)
- **資料儲存機制**：JSON Lines 本地檔案讀寫 (`data/notes.jsonl`)
