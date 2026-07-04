<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useTimelineStore } from './stores/timeline';
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
  return `${ys[0].year} — ${Math.max(ys[ys.length - 1].year, store.meta.end_year ?? 0)}`;
});
</script>

<template>
  <!-- 頂部閱讀進度條 -->
  <div class="fixed inset-x-0 top-0 z-50 h-0.5 bg-stone-800/60">
    <div
      class="h-full bg-gradient-to-r from-amber-600 to-amber-300"
      :style="{ width: `${progress * 100}%` }"
    ></div>
  </div>

  <!-- Hero 標題區 -->
  <header class="relative overflow-hidden border-b border-stone-800/80">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,119,6,0.12),transparent_55%)]"
    ></div>
    <div class="relative mx-auto max-w-6xl px-6 py-14 lg:py-20">
      <p class="mb-3 font-mono text-xs tracking-[0.35em] text-amber-500/90 uppercase">
        Chronology · {{ yearRange }}
      </p>
      <h1 class="font-serif text-3xl leading-tight font-black text-stone-50 lg:text-5xl">
        {{ store.meta.title }}
      </h1>
      <p class="mt-4 max-w-2xl text-sm leading-relaxed text-stone-400 lg:text-base">
        {{ store.meta.description }}
      </p>
      <p class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
        <span>共 {{ store.totalEvents }} 起事件</span>
        <span class="hidden h-3 w-px bg-stone-700 sm:block"></span>
        <span>每筆事件皆附維基百科驗證連結</span>
        <span class="hidden h-3 w-px bg-stone-700 sm:block"></span>
        <span>最後更新：{{ store.meta.last_updated }}</span>
      </p>
    </div>
  </header>

  <!-- 雙欄主體：左 25% 導覽 / 右 75% 時間軸 -->
  <div class="mx-auto flex max-w-6xl items-start px-6">
    <aside class="hidden w-1/4 shrink-0 lg:block">
      <SideNav />
    </aside>
    <main class="min-w-0 flex-1 lg:pl-12">
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
