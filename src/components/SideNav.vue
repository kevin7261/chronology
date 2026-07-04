<script setup>
import { ref, watch, nextTick } from 'vue';
import { useTimelineStore, monthKey } from '../stores/timeline';

const store = useTimelineStore();
const navEl = ref(null);
const yearEls = ref({});

const setYearEl = (year) => (el) => {
  if (el) yearEls.value[year] = el;
};

/**
 * 目前年份變動時，僅捲動左欄容器本身讓該年份保持可見。
 * 不用 scrollIntoView——它會連帶捲動視窗，干擾使用者的頁面滾動。
 */
watch(
  () => store.activeYear,
  async (year) => {
    if (year == null) return;
    await nextTick();
    const nav = navEl.value;
    const el = yearEls.value[year];
    if (!nav || !el) return;
    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    const margin = 48;
    if (top < nav.scrollTop + margin) {
      nav.scrollTo({ top: top - margin, behavior: 'smooth' });
    } else if (bottom > nav.scrollTop + nav.clientHeight - margin) {
      nav.scrollTo({ top: bottom - nav.clientHeight + margin, behavior: 'smooth' });
    }
  }
);

const jumpToYear = (yearEntry) => store.jumpTo(yearEntry.months[0].key);
</script>

<template>
  <nav
    ref="navEl"
    class="nav-scroll sticky top-5 h-[calc(100vh-40px)] overflow-y-auto border-r border-stone-800/80 py-10 pr-6"
    aria-label="年份導覽"
  >
    <p class="mb-6 font-mono text-[10px] tracking-[0.3em] text-stone-500 uppercase">Timeline Index</p>

    <ol class="space-y-1">
      <li v-for="yearEntry in store.years" :key="yearEntry.year" :ref="setYearEl(yearEntry.year)">
        <!-- 十年分隔線 -->
        <div
          v-if="yearEntry.year % 10 === 0"
          class="mt-4 mb-2 h-px bg-gradient-to-r from-stone-700/80 to-transparent first:mt-0"
        ></div>

        <button
          type="button"
          class="group flex w-full items-baseline gap-2 rounded px-2 py-1 text-left transition-all duration-300"
          :class="
            store.activeYear === yearEntry.year
              ? 'bg-amber-500/10'
              : 'hover:bg-stone-800/60'
          "
          @click="jumpToYear(yearEntry)"
        >
          <span
            class="font-mono transition-all duration-300"
            :class="
              store.activeYear === yearEntry.year
                ? 'text-xl font-bold text-amber-400'
                : 'text-sm text-stone-400 group-hover:text-stone-200'
            "
          >
            {{ yearEntry.year }}
          </span>
          <span class="text-[10px] text-stone-600">
            {{ yearEntry.months.reduce((n, m) => n + m.events.length, 0) }}
          </span>
        </button>

        <!-- 目前年份展開其月份 -->
        <div
          v-if="store.activeYear === yearEntry.year"
          class="mt-1 mb-2 flex flex-wrap gap-1.5 pl-2"
        >
          <button
            v-for="m in yearEntry.months"
            :key="m.key"
            type="button"
            class="rounded-full border px-2.5 py-0.5 font-mono text-[11px] transition-all duration-300"
            :class="
              store.activeKey === m.key
                ? 'border-amber-400/70 bg-amber-400/15 font-bold text-amber-300'
                : 'border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200'
            "
            @click="store.jumpTo(m.key)"
          >
            {{ m.month }}月
          </button>
        </div>
      </li>
    </ol>
  </nav>
</template>
