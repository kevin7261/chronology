# 台灣・中國・世界重大事件編年表

結合「連續滾動流暢感」與「節點展開結構感」的雙欄直式編年表網頁應用，從人類文明的曙光（約西元前 3500 年）到當代，涵蓋台灣、中國、世界三條並列時間線，可依地區篩選，事件說明點擊卡片展開。前端完全靜態化、資料本地化——所有歷史事件由 `src/data/events.json` 驅動，不呼叫任何 LLM API，杜絕 API Key 暴露風險與流量費用。

## 技術架構

- **Vue 3**（Composition API）+ **Pinia** + **Tailwind CSS v4** + **Vite**
- 部署：GitHub Actions 自動建置並發佈至 GitHub Pages（`.github/workflows/deploy.yml`）

## 核心互動

| 區域 | 行為 |
| --- | --- |
| 左欄（25%） | 年份／月份索引，`sticky` 固定；Scrollspy 即時高亮目前進度（放大、加粗、高亮色），目前年份自動展開月份並自動捲動置中 |
| 右欄（75%） | 連續滾動瀑布流時間軸；內容預設全部展開，捲動過程零版面變動；點擊月份標題可手動收合／展開（手風琴動畫） |
| 地區篩選 | sticky 篩選列可切換 全部／台灣／中國／世界，事件卡片附地區徽章（台灣＝琥珀、中國＝玫紅、世界＝天藍） |
| 點擊跳轉 | 點擊左欄月份，右欄以 `smooth` 平滑捲動至該月起點；跳轉前先展開途中所有區塊，避免捲動落點位移 |

時間流向由舊到新：最上方為 1700 年代，向下滾動推演至 2026 年；上限年份隨資料自動延伸，無需手動修改。Scrollspy 以 IntersectionObserver 實作，捲動路徑上不讀取版面幾何、不改變版面高度，確保滾動完全順暢。

## 開發

```bash
npm install
npm run dev      # 開發伺服器
npm run build    # 產出 dist/
```

## 資料擴充（AI 工作流）

未來的事件擴充與資料填補，完全在本地 IDE 環境（Claude Code / Cursor 等）由 AI 代理編輯 `src/data/events.json` 完成。擴充時必須嚴格遵守以下 Schema：

```json
{
  "id": "evt_YYYYMMDD_001",
  "year": 1930,
  "month": 10,
  "day": 27,
  "region": "台灣",
  "title": "事件標題",
  "description": "一至兩句客觀描述。",
  "tags": ["分類標籤"],
  "wiki_url": "https://zh.wikipedia.org/wiki/..."
}
```

規則：

1. **每筆事件必附 `wiki_url`** 作為事實驗證來源，且必須是真實存在的維基百科條目。
2. `region` 必須為 `"台灣"`、`"中國"`、`"世界"` 三者之一。
3. `events` 陣列必須維持**由舊到新**排序。
4. `id` 格式為 `evt_YYYYMMDD_序號`；僅知月份、不確定日期時 `day` 填 `null`（id 中日期以 `00` 代替），不可捏造日期。同日多筆事件序號遞增（`_001`、`_002`…）。
5. 古代事件：`year` 以負數表示西元前（如 `-221` = 西元前 221 年，id 用 `evt_bcYYYY_序號`）；僅知年份時 `month` 填 `null`，介面會顯示「全年」。約略年代在 `description` 中以「約」註明。
6. 新增事件後同步更新 `timeline_meta.last_updated`。
