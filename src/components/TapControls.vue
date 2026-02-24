<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  isIdle: boolean
  currentStateLiteral: string
}>()

const emit = defineEmits<{
  (e: 'identify', payload: { tag: string }): void
}>()

const tags = ref<string[]>(['22725620', '07228325', '21634656'])
const selectedTag = ref<string>(tags.value[0] || '')

const onIdentify = () => {
  if (selectedTag.value) {
    emit('identify', { tag: selectedTag.value })
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
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
      @click="onIdentify"
      :disabled="!isIdle"
    >
      {{ currentStateLiteral }}
    </Button>
  </div>
</template>
