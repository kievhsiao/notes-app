# Home Button Research

## 背景知識 (Background)
目前的筆記應用程式 (Notes App) 透過 `src/app/page.tsx` 中的 React State 管理過濾條件：
1. `searchQuery`: 型別為字串，用來過濾搜尋關鍵字。
2. `archiveDate`: 型別為物件 `{ year: number; month: number } | null`，用來選擇特定月份的封存筆記。

這些狀態變更時，會觸發 `useEffect` 重新向 `/api/notes` 發送 API 請求。

## 需求 (Requirement)
在頂端的工具列上增加一個「回到首頁」的按鈕，可從搜尋或 Archive 模式回到一般瀏覽狀態，並根據需求提出修改計畫。

## 可行作法 (Feasible Approach)
位於 `page.tsx` 中的 `<header className="app-header glass">` 內包含了 `header-actions` div，目前已經有 `SearchBar`、`ArchiveButton` 以及 `New Note` 按鈕。

為了能回到首頁（即清空搜尋與封存狀態），我們需要追加一個「回到首頁」(Home) 的按鈕：
* **狀態重置**：點擊「回到首頁」按鈕時，執行 `setSearchQuery("")` 與 `setArchiveDate(null)`。
* **條件顯示（可選）**：當 `searchQuery !== ""` 或 `archiveDate !== null` 的時候才顯示此按鈕，或者常駐顯示。考量到使用者體驗，當沒有套用任何過濾條件時，首頁按鈕也可以作為一般回饋，但為了避免畫面冗餘，可以選擇常駐顯示但透過較簡約的設計（例如僅有 Icon）。
* **樣式設計**：按鈕可以參考現有 `.create-btn` 的樣式，也可以新增一個 `.icon-btn` 來只顯示 SVG 圖示並帶有 hover 效果。

## 決定 (Decision)
1. 在 `page.tsx` 的 `.header-actions` 區域加入一個 `<button className="home-btn" ...>`。
2. 添加 SVG 圖示（家屋圖示）。
3. 按鈕 onClick 事件綁定清空狀態的邏輯。
4. 為了讓 UI 具有一致性，在 `<style jsx>` 中添加 `.home-btn` 的對應 CSS。
