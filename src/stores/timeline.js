import { defineStore } from 'pinia';
import data from '../data/events.json';

/**
 * 產生月份唯一鍵，例如 1930 年 10 月 → "1930-10"
 */
export const monthKey = (year, month) => `${year}-${month}`;

export const useTimelineStore = defineStore('timeline', {
  state: () => ({
    meta: data.timeline_meta,
    events: data.events,
    /** 目前捲動所在的月份鍵（Scrollspy 高亮依據） */
    activeKey: null,
    /** 已展開（時間線上已抵達）的月份鍵集合 */
    expandedKeys: {},
    /** 導覽點擊觸發的目標，供時間軸捲動使用 */
    scrollTarget: null,
  }),

  getters: {
    /**
     * 依年份 → 月份層級化的時間軸結構（由舊到新）。
     * 只納入實際有事件的年月，年份範圍隨資料自動延伸。
     */
    years(state) {
      const byYear = new Map();
      for (const evt of state.events) {
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

    totalEvents(state) {
      return state.events.length;
    },
  },

  actions: {
    setActiveKey(key) {
      this.activeKey = key;
    },
    setExpanded(key, value) {
      this.expandedKeys[key] = value;
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
