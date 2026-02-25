<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useVirtualTap } from '@/composables/useVirtualTap'
import { useCommunication } from '@/composables/useCommunication'
import { VirtualTapState } from '@/core/domain/tap'

import TapHeader from './TapHeader.vue'
import TapControls from './TapControls.vue'
import TapOperation from './TapOperation.vue'

const tapId = 'TAP-01'

// State machine handlers
const { state, actorRef, identify, flow, toggleMaintenance, servedAmountMl, limitAmountMl, valveOpened, remainingMs } = useVirtualTap()

// Communication handlers
const { publishState, onCommand } = useCommunication()

let unsubscribeState: { unsubscribe: () => void }
let unsubscribeCmd: { unsubscribe: () => void }

onMounted(() => {
  // Subscribe to Application Layer state changes and publish to Communication Adapter
  unsubscribeState = actorRef.subscribe((newState) => {
    publishState(newState.value, newState.context)
  })

  // Listen to remote Commands from Communication Adapter and interact with Application Layer
  unsubscribeCmd = onCommand((command) => {
    if (command === 'MAINTENANCE') {
      toggleMaintenance();
    } else if (command === 'START_OPERATION') {
      identify('MQTT-CMD');
    }
  })
})

onUnmounted(() => {
  unsubscribeState?.unsubscribe()
  unsubscribeCmd?.unsubscribe()
})

const isIdle = computed(() => state.value.matches(VirtualTapState.IDLE));
const isMaintenance = computed(() => state.value.matches(VirtualTapState.MAINTENANCE));
const isOperation = computed(() => state.value.matches(VirtualTapState.OPERATION));

const currentStatus = computed<string>(() => {
  // Extracting a simple string representation from the potentially nested state object
  const s = state.value.value;
  if (typeof s === 'string') return s;
  if (s && typeof s === 'object') {
    const keys = Object.keys(s);
    if (keys.length > 0) return keys[0] as string;
  }
  return 'unknown';
});

const handleIdentify = (payload: { tag: string }) => {
  identify(payload.tag)
}

const handleFlow = (payload: { amount: number, count: number }) => {
  flow(payload.amount, payload.count)
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <TapHeader 
      :tap-id="tapId" 
      :status="currentStatus" 
      :is-maintenance="isMaintenance"
      :limit-amount-ml="limitAmountMl"
      :valve-opened="valveOpened"
      @toggle-maintenance="toggleMaintenance"
    />
    
    <TapControls 
      :is-idle="isIdle" 
      :current-status="(currentStatus as VirtualTapState)"
      @identify="handleIdentify" 
    />
    
    <TapOperation 
      :is-operation="isOperation" 
      :remaining-ms="remainingMs"
      :limit-amount-ml="limitAmountMl"
      :served-amount-ml="servedAmountMl"
      @flow="handleFlow" 
    />
  </div>
</template>
