<script setup>
import { ref } from 'vue';
import { regionTextClass } from '../stores/timeline';

defineProps({
  event: { type: Object, required: true },
});

/** 說明內容預設收合，點擊卡片展開 */
const open = ref(false);
</script>

<template>
  <article
    class="cursor-pointer rounded-md bg-stone-900/60 px-3 py-2 transition-colors duration-200 select-none hover:bg-stone-800/80"
    :aria-expanded="open"
    @click="open = !open"
  >
    <div class="flex items-baseline gap-2">
      <span class="w-9 shrink-0 font-mono text-[11px] text-amber-400/90">
        {{ event.day ? `${event.day} 日` : event.month ? '本月' : '—' }}
      </span>
      <h4 class="min-w-0 flex-1 text-sm leading-snug font-bold text-stone-100">
        {{ event.title }}
      </h4>
      <!-- 行動版單欄堆疊時以文字標示軌道 -->
      <span class="text-[10px] md:hidden" :class="regionTextClass(event.region)">
        {{ event.region }}
      </span>
      <span
        class="text-[10px] text-stone-600 transition-transform duration-300"
        :class="open ? 'rotate-180' : ''"
        >▾</span
      >
    </div>

    <!-- 點擊後展開的說明區 -->
    <div class="month-body" :class="{ 'is-expanded': open }">
      <div class="month-body-inner">
        <div class="pt-2 pb-1">
          <p class="text-xs leading-relaxed text-stone-400">
            {{ event.description }}
          </p>
          <div class="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              v-for="tag in event.tags"
              :key="tag"
              class="rounded-full bg-stone-800 px-2 py-0.5 text-[10px] text-stone-400"
            >
              {{ tag }}
            </span>
            <a
              :href="event.wiki_url"
              target="_blank"
              rel="noopener"
              class="ml-auto inline-flex items-center gap-1 text-[11px] text-amber-500/80 transition-colors hover:text-amber-300"
              @click.stop
            >
              維基百科驗證
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
