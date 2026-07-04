<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { useTimelineStore } from '../stores/timeline';
import TimelineMonth from './TimelineMonth.vue';

const store = useTimelineStore();
const sectionEls = ref({});

const setSectionEl = (key) => (el) => {
  if (el) sectionEls.value[key] = el;
};

/**
 * Scrollspy 核心（rAF 節流）：
 * - 展開規則：區塊頂端進入視窗下緣 90% 內即展開；捲回上方、區塊退回視窗下方時收合。
 *   高度變化永遠發生在視窗下緣之外，捲動不會跳動。
 * - 高亮規則：以視窗 35% 高度為基準線，最後一個越過基準線的月份即為目前進度。
 */
let ticking = false;
const measure = () => {
  ticking = false;
  const expandLine = window.innerHeight * 0.9;
  const activeLine = window.innerHeight * 0.35;
  let activeKey = null;

  for (const section of store.monthSections) {
    const el = sectionEls.value[section.key];
    if (!el) continue;
    const top = el.getBoundingClientRect().top;
    store.setExpanded(section.key, top < expandLine);
    if (top <= activeLine) activeKey = section.key;
  }
  store.setActiveKey(activeKey ?? store.monthSections[0]?.key ?? null);
};

const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(measure);
};

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  measure();
});
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);
});

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
