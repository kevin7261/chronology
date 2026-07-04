<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { useTimelineStore, formatYear } from '../stores/timeline';
import TimelineMonth from './TimelineMonth.vue';

const store = useTimelineStore();
const sectionEls = ref({});

const setSectionEl = (key) => (el) => {
  if (el) sectionEls.value[key] = el;
  else delete sectionEls.value[key];
};

/**
 * Scrollspy：純 IntersectionObserver 高亮，捲動過程零版面讀取、零版面變動
 * （內容預設全部展開，收合僅由使用者手動觸發）。
 * 以視窗 20%~40% 高度為「目前進度」判定帶，取帶內文件順序最後的月份高亮。
 */
let activeIO = null;
const inBand = new Map();

const rebuildObservers = () => {
  activeIO?.disconnect();
  inBand.clear();

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
    if (el) activeIO.observe(el);
  }
  if (!store.activeKey) store.setActiveKey(store.monthSections[0]?.key ?? null);
};

onMounted(rebuildObservers);
onUnmounted(() => activeIO?.disconnect());

/** 切換地區篩選或排序後，區塊全部重建，需重新掛上觀察器 */
watch(
  () => [store.regionFilter, store.sortOrder],
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
  <div class="py-8">
    <template v-for="yearEntry in store.years" :key="yearEntry.year">
      <!-- 年份分隔標記 -->
      <div class="mt-10 mb-4 flex items-center gap-4 first:mt-0">
        <h2
          class="font-serif text-2xl font-black tracking-tight transition-colors duration-500"
          :class="store.activeYear === yearEntry.year ? 'text-amber-400' : 'text-stone-600'"
        >
          {{ formatYear(yearEntry.year) }}
        </h2>
        <div class="h-px flex-1 bg-stone-800/80"></div>
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
