<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isOperation: boolean
  formattedTimer: string
}>()

const emit = defineEmits<{
  (e: 'pulse', payload: { amount: number, count: number }): void
}>()

const progress = ref(0) // Default logic to be replaced later

const onClickPulse = () => {
  if (props.isOperation) {
    emit('pulse', { amount: 5, count: 30 })
  }
}
</script>

<template>
  <div class="flex flex-col gap-6" :class="{ 'opacity-50 pointer-events-none': !isOperation }">
    <!-- Progress Bar Section -->
    <div class="flex flex-col gap-2 relative">
      <span class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Dispense (Click)</span>
      <div 
        class="relative w-full h-12 bg-secondary/80 rounded-lg overflow-hidden cursor-pointer active:scale-[0.98] transition-transform select-none border shadow-inner"
        @click="onClickPulse"
      >
        <!-- Fill -->
        <div 
          class="h-full bg-primary transition-all duration-300 ease-linear shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]"
          :style="{ width: `${progress}%` }"
        ></div>
        <!-- Label -->
        <div 
          class="absolute inset-0 flex items-center justify-center font-bold font-mono tracking-widest pointer-events-none transition-colors drop-shadow-md"
          :class="progress > 50 ? 'text-primary-foreground' : 'text-foreground/80'"
        >
          {{ progress }}%
        </div>
      </div>
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
