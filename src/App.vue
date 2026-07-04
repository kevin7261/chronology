<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useTimelineStore, REGIONS } from './stores/timeline';
import SideNav from './components/SideNav.vue';
import Timeline from './components/Timeline.vue';

const store = useTimelineStore();

/** 頁面整體閱讀進度（頂部進度條） */
const progress = ref(0);
const onScroll = () => {
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  progress.value = max > 0 ? Math.min(1, doc.scrollTop / max) : 0;
};
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});
onUnmounted(() => window.removeEventListener('scroll', onScroll));

const yearRange = computed(() => {
  const ys = store.years;
  if (!ys.length) return '';
  const first = Math.min(ys[0].year, store.meta.start_year ?? Infinity);
  const last = Math.max(ys[ys.length - 1].year, store.meta.end_year ?? 0);
  return `${first} — ${last}`;
});

/** 切換地區後回到時間軸頂端，避免停留在已消失的區塊位置 */
const selectRegion = (region) => {
  store.setRegionFilter(region);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<template>
  <!-- 頂部閱讀進度條 -->
  <div class="fixed inset-x-0 top-0 z-50 h-0.5 bg-stone-800/60">
    <div
      class="h-full bg-gradient-to-r from-amber-600 to-amber-300"
      :style="{ width: `${progress * 100}%` }"
    ></div>
  </div>

  <!-- 精簡標題列 -->
  <header class="border-b border-stone-800/80">
    <div
      class="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-4 gap-y-1 px-6 py-4"
    >
      <h1 class="font-serif text-base font-bold text-stone-100 lg:text-lg">
        {{ store.meta.title }}
      </h1>
      <p class="hidden text-xs text-stone-500 sm:flex sm:items-baseline sm:gap-x-3">
        <span class="font-mono tracking-widest text-amber-500/80">{{ yearRange }}</span>
        <span>共 {{ store.filteredEvents.length }} 起事件</span>
        <span class="hidden md:inline">每筆皆附維基百科驗證連結</span>
      </p>
    </div>
  </header>

  <!-- 雙欄主體：左 25% 導覽 / 右 75% 時間軸 -->
  <div class="mx-auto flex max-w-6xl items-start px-6">
    <aside class="hidden w-1/4 shrink-0 lg:block">
      <SideNav />
    </aside>
    <main class="min-w-0 flex-1 lg:pl-12">
      <!-- 地區篩選＋軌道標頭（sticky） -->
      <div
        class="sticky top-0 z-40 -mx-2 mt-4 rounded-b-2xl border-b border-stone-800/80 bg-stone-950/90 px-2 pt-3 pb-2 backdrop-blur"
      >
        <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="rounded-full border px-3.5 py-1 text-xs transition-colors duration-300"
          :class="
            store.regionFilter === 'all'
              ? 'border-stone-300/70 bg-stone-200/10 font-bold text-stone-100'
              : 'border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200'
          "
          @click="selectRegion('all')"
        >
          全部 {{ store.regionCounts.all }}
        </button>
        <button
          v-for="r in REGIONS"
          :key="r.key"
          type="button"
          class="rounded-full border px-3.5 py-1 text-xs transition-colors duration-300"
          :class="
            store.regionFilter === r.key
              ? r.pillActive
              : 'border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200'
          "
          @click="selectRegion(r.key)"
        >
          {{ r.key }} {{ store.regionCounts[r.key] ?? 0 }}
        </button>
        </div>

        <!-- 三軌欄位標頭（與下方月份格線對齊） -->
        <div
          v-if="store.regionFilter === 'all'"
          class="mt-2.5 hidden gap-x-4 md:grid md:grid-cols-3"
        >
          <div
            v-for="r in REGIONS"
            :key="r.key"
            class="border-l-2 pl-3 text-xs font-bold tracking-widest"
            :class="[r.track, r.text]"
          >
            {{ r.key }}
          </div>
        </div>
      </div>
      <Timeline />
    </main>
  </div>

  <footer class="mt-24 border-t border-stone-800/80">
    <div
      class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-xs text-stone-500"
    >
      <p>資料來源：本地 events.json，事件內容以維基百科連結為事實驗證依據。</p>
      <a
        href="https://github.com/kevin7261/chronology"
        target="_blank"
        rel="noopener"
        class="transition-colors hover:text-amber-400"
      >
        GitHub · kevin7261/chronology
      </a>
    </div>
  </footer>
</template>
