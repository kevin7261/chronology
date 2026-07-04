<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { useTimelineStore } from '../stores/timeline';
import TimelineMonth from './TimelineMonth.vue';

const store = useTimelineStore();
const sectionEls = ref({});

const setSectionEl = (key) => (el) => {
  if (el) sectionEls.value[key] = el;
  else delete sectionEls.value[key];
};

/**
 * Scrollspy 核心：改用 IntersectionObserver，滾動路徑上完全不讀取版面幾何，
 * 避免與展開動畫互相觸發同步 reflow（先前卡頓的主因）。
 *
 * - expandIO：區塊頂端進入視窗下緣 10% 內即展開；區塊退回視窗下方時收合。
 *   高度變化永遠發生在視窗下緣之外，捲動位置不受影響。
 * - activeIO：以視窗 20%~40% 高度為「目前進度」判定帶，取進度帶內
 *   文件順序最後的月份作為高亮目標。
 */
let expandIO = null;
let activeIO = null;
const inBand = new Map();

const rebuildObservers = () => {
  expandIO?.disconnect();
  activeIO?.disconnect();
  inBand.clear();

  expandIO = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const key = entry.target.dataset.key;
        if (entry.isIntersecting) store.setExpanded(key, true);
        else if (entry.boundingClientRect.top > 0) store.setExpanded(key, false);
      }
    },
    { rootMargin: '0px 0px -10% 0px' }
  );

  activeIO = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) inBand.set(entry.target.dataset.key, entry.isIntersecting);
      let active = null;
      for (const section of store.monthSections) {
        if (inBand.get(section.key)) active = section.key;
      }
      if (active) store.setActiveKey(active);
    },
    { rootMargin: '-20% 0px -60% 0px' }
  );

  for (const section of store.monthSections) {
    const el = sectionEls.value[section.key];
    if (el) {
      expandIO.observe(el);
      activeIO.observe(el);
    }
  }
  if (!store.activeKey) store.setActiveKey(store.monthSections[0]?.key ?? null);
};

onMounted(rebuildObservers);
onUnmounted(() => {
  expandIO?.disconnect();
  activeIO?.disconnect();
});

/** 切換地區篩選後，區塊全部重建，需重新掛上觀察器 */
watch(
  () => store.regionFilter,
  async () => {
    await nextTick();
    rebuildObservers();
  }
);

/** 導覽點擊跳轉：目標之前的區塊已由 store 先行展開，直接平滑捲動即可 */
watch(
  () => store.scrollTarget,
  async (target) => {
    if (!target) return;
    await nextTick();
    sectionEls.value[target.key]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
);
</script>

<template>
  <div class="relative py-10">
    <!-- 貫穿全時間軸的垂直主線 -->
    <div
      class="pointer-events-none absolute top-10 bottom-0 left-[7px] w-px bg-gradient-to-b from-amber-500/60 via-stone-700 to-stone-800"
    ></div>

    <template v-for="yearEntry in store.years" :key="yearEntry.year">
      <!-- 年份分隔標記 -->
      <div class="relative mt-14 mb-6 flex items-center gap-4 pl-8 first:mt-0">
        <span
          class="absolute left-0 h-[15px] w-[15px] rounded-full border-2 transition-colors duration-500"
          :class="
            store.activeYear === yearEntry.year
              ? 'border-amber-400 bg-amber-400/30'
              : 'border-stone-600 bg-stone-950'
          "
        ></span>
        <h2
          class="font-serif text-4xl font-black tracking-tight transition-colors duration-500"
          :class="store.activeYear === yearEntry.year ? 'text-amber-400' : 'text-stone-600'"
        >
          {{ yearEntry.year }}
        </h2>
      </div>

      <TimelineMonth
        v-for="section in yearEntry.months"
        :key="section.key"
        :ref-fn="setSectionEl(section.key)"
        :section="section"
      />
    </template>
  </div>
</template>
