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
