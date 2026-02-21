<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue'
import { Droplet } from 'lucide-vue-next'

withDefaults(defineProps<{
  appName?: string
}>(), {
  appName: 'TAP'
})
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
      <div class="flex items-center gap-2 text-primary">
        <Droplet class="h-6 w-6" />
        <span class="text-2xl font-bold tracking-tight text-foreground">{{ appName }}</span>
      </div>
      
      <div class="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
