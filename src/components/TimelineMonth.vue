<script setup>
import { computed } from 'vue';
import { useTimelineStore, regionTrackClass } from '../stores/timeline';
import EventCard from './EventCard.vue';

const props = defineProps({
  section: { type: Object, required: true },
  refFn: { type: Function, required: true },
});

const store = useTimelineStore();
const isExpanded = computed(() => !store.collapsedKeys[props.section.key]);
const isActive = computed(() => store.activeKey === props.section.key);

/** 本月事件依軌道（地區）分組，維持日期排序 */
const eventsByRegion = computed(() => {
  const map = {};
  for (const region of store.activeRegions) map[region] = [];
  for (const evt of props.section.events) map[evt.region]?.push(evt);
  return map;
});
</script>

<template>
  <section :ref="refFn" :data-key="section.key" class="scroll-mt-28 pb-5">
    <!-- 月份標題（點擊手動收合/展開本月） -->
    <button
      type="button"
      class="group flex w-full items-baseline gap-3 py-1 text-left"
      @click="store.toggleCollapsed(section.key)"
    >
      <h3
        class="font-mono text-base font-bold transition-colors duration-500"
        :class="isActive ? 'text-amber-300' : 'text-stone-400 group-hover:text-stone-200'"
      >
        {{ section.month }} 月
      </h3>
      <span class="text-xs text-stone-600">{{ section.events.length }} 起事件</span>
      <span
        class="ml-auto text-[10px] text-stone-600 transition-transform duration-300"
        :class="isExpanded ? '' : '-rotate-90'"
        >▾</span
      >
    </button>

    <div class="month-body" :class="{ 'is-expanded': isExpanded }">
      <div class="month-body-inner">
        <!-- 三軌並列：台灣 / 中國 / 世界（篩選單一地區時為單軌） -->
        <div
          class="grid gap-x-4 gap-y-2 pt-1"
          :class="store.activeRegions.length > 1 ? 'md:grid-cols-3' : ''"
        >
          <div
            v-for="region in store.activeRegions"
            :key="region"
            class="space-y-2 border-l-2 pl-3"
            :class="regionTrackClass(region)"
          >
            <EventCard v-for="evt in eventsByRegion[region]" :key="evt.id" :event="evt" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
