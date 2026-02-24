<script setup lang="ts">
import { ref } from 'vue'
import { useSwipe } from '@vueuse/core'
import TopMenu from './components/TopMenu.vue'
import VirtualTap from './components/VirtualTap.vue'
import DataPanel from './components/DataPanel.vue'
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

const activeTab = ref('data')

const swipeContainer = ref<HTMLElement | null>(null)
const { lengthX, lengthY } = useSwipe(swipeContainer, {
  onSwipeEnd(_e, direction) {
    // Only switch if mostly horizontal
    if (Math.abs(lengthX.value) > Math.abs(lengthY.value) && Math.abs(lengthX.value) > 50) {
      if (direction === 'left') {
        activeTab.value = 'actions'
      } else if (direction === 'right') {
        activeTab.value = 'data'
      }
    }
  },
})
</script>
<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
    <TopMenu />
    <main class="flex-1 w-full max-w-7xl mx-auto flex flex-col relative pb-24 md:pb-8 md:p-8">
      
      <!-- Desktop Layout: Flex (hidden on mobile) -->
      <div class="hidden md:flex gap-6 items-start h-full">
        <VirtualTap class="sticky top-24 w-[400px] shrink-0" />
        <DataPanel class="w-full relative flex-1" />
      </div>

      <!-- Mobile Layout: Swipeable container with fixed bottom navigation -->
      <div class="md:hidden flex flex-col flex-1 h-full w-full" ref="swipeContainer">
        <!-- Content Area -->
        <div class="flex-1 w-full p-4 overflow-y-auto mb-20">
          <DataPanel v-if="activeTab === 'data'" class="animate-in fade-in slide-in-from-right-4 duration-300" />
          <VirtualTap v-else class="animate-in fade-in slide-in-from-left-4 duration-300 border-none bg-transparent shadow-none" />
        </div>

        <!-- Fixed Bottom Tab Navigation -->
        <div class="fixed bottom-0 left-0 right-0 h-20 p-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50">
          <Tabs v-model="activeTab" class="w-full h-full">
            <TabsList class="grid w-full h-full grid-cols-2">
              <TabsTrigger value="data" class="h-full text-base font-medium">Data Table</TabsTrigger>
              <TabsTrigger value="actions" class="h-full text-base font-medium">Actions</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

    </main>
  </div>
</template>
<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
