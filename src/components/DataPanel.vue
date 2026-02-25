<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { communicationService } from '@/infrastructure/providers/CommunicationProvider'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

onMounted(() => {
  communicationService.startListening()
})

onUnmounted(() => {
  communicationService.stopListening()
})

const events = communicationService.events
const CMD_TOPIC = 'test/topic/vue-hexagonal-example/commands'

const publishCommand = (command: string) => {
  communicationService.publish(CMD_TOPIC, JSON.stringify({ command }))
}
</script>

<template>
  <div class="p-4 border rounded-xl bg-card overflow-x-auto">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <h2 class="text-xl font-semibold">MQTT Event Data</h2>
      
      <div class="flex gap-2">
        <button 
          @click="publishCommand('START_OPERATION')" 
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
        >
          Simulate Start
        </button>
        <button 
          @click="publishCommand('MAINTENANCE')" 
          class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
        >
          Toggle Maintenance
        </button>
      </div>
    </div>

    <Table>
      <TableCaption>A list of your recent MQTT events.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead class="w-[120px]">Timestamp</TableHead>
          <TableHead class="w-[200px]">Topic</TableHead>
          <TableHead>Message Content</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="event in events" :key="event.id">
          <TableCell class="font-medium text-muted-foreground whitespace-nowrap">{{ event.timestamp }}</TableCell>
          <TableCell class="text-xs text-muted-foreground break-all">{{ event.topic }}</TableCell>
          <TableCell class="font-mono text-sm break-all">{{ event.content }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
