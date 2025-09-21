<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';
import {
  type ScrollAreaRootProps,
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from 'reka-ui';

type Props = ScrollAreaRootProps & {
  class?: HTMLAttributes['class'];
  mount?: 'vertical' | 'horizontal' | 'both';
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
};

const props = defineProps<Props>();

const delegatedProps = computed(() => {
  const { class: _, mount: __, ...delegated } = props;
  return delegated;
});

const isVertical = computed(() => {
  return ['vertical', 'both'].includes(props.mount ?? '') ? true : undefined;
});

const isHorizontal = computed(() => {
  return ['horizontal', 'both'].includes(props.mount ?? '') ? true : undefined;
});

const thumbColor = computed(() => {
  return props.color ? `bg-${props.color}` : 'bg-accented';
});

const scrollbarClass = `flex touch-none p-0.5 bg-transparent transition-colors duration-[160ms] ease-out data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5`;

const thumbClass = `z-20 flex-1 ${thumbColor.value} rounded-[10px] relative transition-colors hover:bg-primary before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]`;
</script>

<template>
  <ScrollAreaRoot
    v-bind="delegatedProps"
    :class="['relative overflow-hidden', props.class]"
  >
    <ScrollAreaViewport class="size-full rounded-[inherit]">
      <slot />
    </ScrollAreaViewport>

    <ScrollAreaScrollbar
      :force-mount="isVertical"
      :class="['z-20', scrollbarClass]"
      orientation="vertical"
    >
      <ScrollAreaThumb :class="thumbClass" />
    </ScrollAreaScrollbar>

    <ScrollAreaScrollbar
      :force-mount="isHorizontal"
      :class="scrollbarClass"
      orientation="horizontal"
    >
      <ScrollAreaThumb :class="thumbClass" />
    </ScrollAreaScrollbar>
  </ScrollAreaRoot>
</template>
