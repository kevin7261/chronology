<script setup>
import { computed } from 'vue';
import { useTimelineStore } from '../stores/timeline';
import EventCard from './EventCard.vue';

const props = defineProps({
  section: { type: Object, required: true },
  refFn: { type: Function, required: true },
});

const store = useTimelineStore();
const isExpanded = computed(() => !!store.expandedKeys[props.section.key]);
const isActive = computed(() => store.activeKey === props.section.key);
</script>

<template>
  <section :ref="refFn" :data-key="section.key" class="relative scroll-mt-24 pb-2 pl-8">
    <!-- 月份節點圓點 -->
    <span
      class="absolute top-[9px] left-[3px] h-[9px] w-[9px] rounded-full transition-all duration-500"
      :class="isActive ? 'scale-150 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.7)]' : 'bg-stone-600'"
    ></span>

    <!-- 月份大標（收合狀態僅顯示此列） -->
    <button
      type="button"
      class="group flex w-full items-baseline gap-3 py-1 text-left"
      @click="store.setExpanded(section.key, !isExpanded)"
    >
      <h3
        class="font-mono text-lg font-bold transition-colors duration-500"
        :class="isActive ? 'text-amber-300' : 'text-stone-300 group-hover:text-stone-100'"
      >
        {{ section.month }} 月
      </h3>
      <span class="text-xs text-stone-500">{{ section.events.length }} 起事件</span>
      <span
        class="ml-auto text-xs text-stone-600 transition-transform duration-500"
        :class="isExpanded ? 'rotate-180' : ''"
        >▾</span
      >
    </button>

    <!-- 手風琴展開內容 -->
    <div class="month-body" :class="{ 'is-expanded': isExpanded }">
      <div class="month-body-inner">
        <div class="space-y-4 pt-3 pb-6">
          <EventCard v-for="evt in section.events" :key="evt.id" :event="evt" />
        </div>
      </div>
    </div>
  </section>
</template>
