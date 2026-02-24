<script setup lang="ts">
import { computed } from 'vue'
import { Progress } from '@/components/ui/progress'

const props = defineProps<{
  isOperation: boolean
  formattedTimer: string
  limitAmountMl: number
  servedAmountMl: number
}>()

const emit = defineEmits<{
  (e: 'pulse', payload: { amount: number, count: number }): void
}>()

const progress = computed(() => {
  if (!props.limitAmountMl || props.limitAmountMl <= 0) return 0;
  const percentage = (props.servedAmountMl / props.limitAmountMl) * 100;
  return Math.min(Math.round(percentage), 100);
})

const onClickPulse = () => {
  if (props.isOperation) {
    emit('pulse', { amount: 30, count: 1 })
  }
}
</script>

<template>
  <div class="flex flex-col gap-6" :class="{ 'opacity-50 pointer-events-none': !isOperation }">
    <!-- Progress Bar Section -->
    <div class="flex flex-col gap-2 relative w-full">
      <div class="flex items-center">
        <label for="progress-dispense" class="text-sm font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer">
          Dispense (Click)
        </label>
        <span class="ml-auto text-sm font-bold text-foreground">
          {{ progress }}%
        </span>
      </div>
      <Progress 
        :model-value="progress" 
        id="progress-dispense"
        class="h-12 w-full cursor-pointer active:scale-[0.98] transition-transform select-none border shadow-inner"
        @click="onClickPulse"
      />
    </div>

    <!-- Timer Section -->
    <div class="flex flex-col gap-2 items-center justify-center p-6 bg-secondary/30 rounded-lg border">
      <span class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Timer</span>
      <div class="text-5xl font-mono font-bold tracking-tight text-foreground/90 tabular-nums drop-shadow-sm">
        {{ formattedTimer }}
      </div>
    </div>
  </div>
</template>
