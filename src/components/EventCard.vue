<script setup>
import { regionBadgeClass } from '../stores/timeline';

defineProps({
  event: { type: Object, required: true },
});
</script>

<template>
  <article
    class="event-card group rounded-lg border border-stone-800 bg-stone-900/60 p-5 transition-colors duration-300 hover:border-amber-500/40"
  >
    <div class="flex items-start gap-4">
      <!-- 日期徽章 -->
      <div
        class="flex w-14 shrink-0 flex-col items-center rounded-md border border-stone-700/80 bg-stone-950 py-2"
      >
        <span class="font-mono text-xl font-bold text-amber-400">
          {{ event.day ?? '—' }}
        </span>
        <span class="text-[10px] tracking-widest text-stone-500">
          {{ event.day ? '日' : '本月' }}
        </span>
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <h4 class="font-serif text-lg font-bold text-stone-100">
            {{ event.title }}
          </h4>
          <span
            class="mt-1 shrink-0 rounded-full border px-2 py-0.5 text-[10px] tracking-wider"
            :class="regionBadgeClass(event.region)"
          >
            {{ event.region }}
          </span>
        </div>
        <p class="mt-1.5 text-sm leading-relaxed text-stone-400">
          {{ event.description }}
        </p>

        <div class="mt-3 flex flex-wrap items-center gap-2">
          <span
            v-for="tag in event.tags"
            :key="tag"
            class="rounded-full bg-stone-800 px-2.5 py-0.5 text-[11px] text-stone-400"
          >
            {{ tag }}
          </span>
          <a
            :href="event.wiki_url"
            target="_blank"
            rel="noopener"
            class="ml-auto inline-flex items-center gap-1 text-xs text-amber-500/80 transition-colors hover:text-amber-300"
          >
            維基百科驗證
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </div>
  </article>
</template>
