import { defineStore } from 'pinia';
import data from '../data/events.json';

/**
 * 產生月份唯一鍵，例如 1930 年 10 月 → "1930-10"
 */
export const monthKey = (year, month) => `${year}-${month}`;

/** 地區清單與對應的 Tailwind 配色（軌道線 / 文字 / 篩選鈕共用） */
export const REGIONS = [
  {
    key: '台灣',
    track: 'border-amber-500/35',
    text: 'text-amber-300',
    pillActive: 'border-amber-400/70 bg-amber-400/15 text-amber-300 font-bold',
  },
  {
    key: '中國',
    track: 'border-rose-500/35',
    text: 'text-rose-300',
    pillActive: 'border-rose-400/70 bg-rose-400/15 text-rose-300 font-bold',
  },
  {
    key: '世界',
    track: 'border-sky-500/35',
    text: 'text-sky-300',
    pillActive: 'border-sky-400/70 bg-sky-400/15 text-sky-300 font-bold',
  },
];

export const regionTrackClass = (region) =>
  REGIONS.find((r) => r.key === region)?.track ?? 'border-stone-700';

export const regionTextClass = (region) =>
  REGIONS.find((r) => r.key === region)?.text ?? 'text-stone-300';

export const useTimelineStore = defineStore('timeline', {
  state: () => ({
    meta: data.timeline_meta,
    events: data.events,
    /** 地區篩選：'all' | '台灣' | '中國' | '世界' */
    regionFilter: 'all',
    /** 目前捲動所在的月份鍵（Scrollspy 高亮依據） */
    activeKey: null,
    /** 使用者手動收合的月份鍵（預設全部展開，捲動不改變版面） */
    collapsedKeys: {},
    /** 導覽點擊觸發的目標，供時間軸捲動使用 */
    scrollTarget: null,
  }),

  getters: {
    filteredEvents(state) {
      if (state.regionFilter === 'all') return state.events;
      return state.events.filter((e) => e.region === state.regionFilter);
    },

    /**
     * 依年份 → 月份層級化的時間軸結構（由舊到新）。
     * 只納入實際有事件的年月，年份範圍隨資料自動延伸。
     */
    years() {
      const byYear = new Map();
      for (const evt of this.filteredEvents) {
        if (!byYear.has(evt.year)) byYear.set(evt.year, new Map());
        const byMonth = byYear.get(evt.year);
        if (!byMonth.has(evt.month)) byMonth.set(evt.month, []);
        byMonth.get(evt.month).push(evt);
      }
      return [...byYear.keys()]
        .sort((a, b) => a - b)
        .map((year) => ({
          year,
          months: [...byYear.get(year).keys()]
            .sort((a, b) => a - b)
            .map((month) => ({
              key: monthKey(year, month),
              year,
              month,
              events: byYear
                .get(year)
                .get(month)
                .slice()
                .sort((a, b) => (a.day ?? 0) - (b.day ?? 0)),
            })),
        }));
    },

    /** 攤平後依序排列的月份區塊清單（右欄渲染順序） */
    monthSections() {
      return this.years.flatMap((y) => y.months);
    },

    activeYear(state) {
      return state.activeKey ? Number(state.activeKey.split('-')[0]) : null;
    },

    /** 目前顯示的軌道（全部模式為三軌並列，篩選後為單軌） */
    activeRegions(state) {
      return state.regionFilter === 'all' ? REGIONS.map((r) => r.key) : [state.regionFilter];
    },

    regionCounts(state) {
      const counts = { all: state.events.length };
      for (const e of state.events) counts[e.region] = (counts[e.region] ?? 0) + 1;
      return counts;
    },
  },

  actions: {
    setRegionFilter(region) {
      if (this.regionFilter === region) return;
      this.regionFilter = region;
      this.activeKey = null;
      this.collapsedKeys = {};
      this.scrollTarget = null;
    },
    setActiveKey(key) {
      this.activeKey = key;
    },
    toggleCollapsed(key) {
      this.collapsedKeys[key] = !this.collapsedKeys[key];
    },
    /** 導覽點擊：確保目標展開後平滑捲動（版面固定，落點不會位移） */
    jumpTo(key) {
      this.collapsedKeys[key] = false;
      this.scrollTarget = { key, at: performance.now() };
    },
  },
});
