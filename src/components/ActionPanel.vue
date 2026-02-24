<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { TapStatus } from '@/types/tap'
import { useTapSimulator } from '@/application/useTapSimulator'

const tapId = ref<string>('TAP-01')
const tags = ref<string[]>(['22725620', '07228325', '21634656'])
const selectedTag = ref<string>(tags.value[0] || '')
const status = ref<TapStatus>(TapStatus.READY)

const progress = ref<number>(0)
const { currentState, formattedTimer, onIdentifyClick } = useTapSimulator()

let intervalId: ReturnType<typeof setInterval> | null = null

const startProgress = () => {
  if (intervalId) return
  
  // Set initial interval
  intervalId = setInterval(() => {
    if (progress.value < 100) {
      progress.value = Math.min(progress.value + 10, 100)
    } else {
      stopProgress()
    }
  }, 200)
}

const stopProgress = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    
    <!-- Header -->
    <div class="flex items-center justify-between border-b pb-4 gap-4">
      <h2 class="text-xl font-bold tracking-tight flex items-center gap-2">
        Tap Simulator
        <span class="text-base font-mono font-medium text-primary px-2 py-0.5 bg-primary/10 rounded-md">{{ tapId }}</span>
      </h2>
      <!-- Badge Section -->
      <span 
        class="px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shrink-0"
      >
        {{ status }}
      </span>
    </div>

    <!-- Tag Section -->
    <div class="flex flex-col gap-3">
      <span class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Select Tag</span>
      <div class="flex flex-row flex-wrap gap-2">
        <label 
          v-for="tag in tags" 
          :key="tag" 
          class="flex flex-1 min-w-[100px] items-center justify-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors hover:bg-secondary/50"
          :class="{ 'border-primary bg-primary/5': selectedTag === tag }"
        >
          <input 
            type="radio" 
            :value="tag" 
            v-model="selectedTag" 
            class="w-4 h-4 text-primary focus:ring-primary accent-primary" 
          />
          <span class="font-mono text-sm" :class="{ 'font-semibold text-primary': selectedTag === tag }">{{ tag }}</span>
        </label>
      </div>
    </div>

    <!-- Identification Section -->
    <Button 
      class="w-full h-12 text-lg font-medium shadow-sm transition-transform active:scale-[0.98]" 
      variant="default"
      @click="onIdentifyClick"
      :disabled="currentState === 'operation'"
    >
      {{ currentState === 'operation' ? 'Operating...' : 'Identification' }}
    </Button>

    <!-- Progress Bar Section -->
    <div class="flex flex-col gap-2 relative">
      <span class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Dispense (Hold)</span>
      <div 
        class="relative w-full h-12 bg-secondary/80 rounded-lg overflow-hidden cursor-pointer active:scale-[0.98] transition-transform select-none border shadow-inner"
        @mousedown="startProgress"
        @mouseup="stopProgress"
        @mouseleave="stopProgress"
        @touchstart.prevent="startProgress"
        @touchend.prevent="stopProgress"
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
