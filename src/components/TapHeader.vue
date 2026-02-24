<script setup lang="ts">
import { Wrench } from 'lucide-vue-next'
import { Toggle } from '@/components/ui/toggle'
const props = defineProps<{
  tapId: string
  status: string
  isMaintenance?: boolean
  limitAmountMl?: number
  valveOpened?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggleMaintenance'): void
}>()
</script>

<template>
  <div class="flex flex-col border-b pb-4 gap-2">
    <div class="flex items-center justify-between gap-2">
      <h2 class="text-xl font-bold tracking-tight">
        Tap Simulator
      </h2>
      <Toggle 
        :pressed="isMaintenance"
        @click="emit('toggleMaintenance')"
        variant="outline"
        title="Toggle Maintenance Mode"
        class="h-9 w-9 p-0"
        :class="[isMaintenance ? 'bg-primary/20 text-primary border-primary/50' : 'text-muted-foreground']"
      >
        <Wrench class="w-5 h-5 md:w-4 md:h-4" />
      </Toggle>
    </div>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-base font-mono font-medium text-primary px-2 py-0.5 bg-primary/10 rounded-md">{{ tapId }}</span>
      </div>
      <span 
        class="px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shrink-0"
      >
        {{ status }}
      </span>
    </div>
    
    <div class="flex flex-col gap-1 mt-1 text-sm text-muted-foreground/80 font-mono tracking-tight bg-secondary/20 p-2 rounded-md border border-border/50">
      <div class="flex justify-between items-center">
        <span>Limit amount (ml):</span>
        <span class="font-bold text-foreground">{{ limitAmountMl || 0 }}</span>
      </div>
      <div class="flex justify-between items-center">
        <span>Valve state:</span>
        <span class="font-bold border px-1.5 py-0.5 rounded text-[10px] uppercase" :class="valveOpened ? 'bg-primary/20 text-primary border-primary/30' : 'bg-muted text-muted-foreground border-border'">
          {{ valveOpened ? 'Open' : 'Closed' }}
        </span>
      </div>
    </div>
  </div>
</template>
