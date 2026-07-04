import { defineStore } from 'pinia';
import data from '../data/events.json';

/**
 * 產生月份唯一鍵，例如 1930 年 10 月 → "1930-10"
 */
export const monthKey = (year, month) => `${year}-${month}`;

/** 地區清單與對應的 Tailwind 配色（badge / 篩選鈕共用） */
export const REGIONS = [
  {
    key: '台灣',
    badge: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
    pillActive: 'border-amber-400/70 bg-amber-400/15 text-amber-300 font-bold',
  },
  {
    key: '中國',
    badge: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
    pillActive: 'border-rose-400/70 bg-rose-400/15 text-rose-300 font-bold',
  },
  {
    key: '世界',
    badge: 'border-sky-500/40 bg-sky-500/15 text-sky-300',
    pillActive: 'border-sky-400/70 bg-sky-400/15 text-sky-300 font-bold',
  },
];

export const regionBadgeClass = (region) =>
  REGIONS.find((r) => r.key === region)?.badge ?? 'border-stone-600 bg-stone-800 text-stone-300';

export const useTimelineStore = defineStore('timeline', {
  state: () => ({
    meta: data.timeline_meta,
    events: data.events,
    /** 地區篩選：'all' | '台灣' | '中國' | '世界' */
    regionFilter: 'all',
    /** 目前捲動所在的月份鍵（Scrollspy 高亮依據） */
    activeKey: null,
    /** 已展開（時間線上已抵達）的月份鍵集合 */
    expandedKeys: {},
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
      this.expandedKeys = {};
      this.scrollTarget = null;
    },
    setActiveKey(key) {
      this.activeKey = key;
    },
    setExpanded(key, value) {
      if (this.expandedKeys[key] !== value) this.expandedKeys[key] = value;
    },
    /** 導覽點擊：展開目標之前的所有月份，避免平滑捲動途中版面高度位移 */
    jumpTo(key) {
      for (const section of this.monthSections) {
        this.expandedKeys[section.key] = true;
        if (section.key === key) break;
      }
      this.scrollTarget = { key, at: performance.now() };
    },
  },
});
