<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useVirtualTap } from '@/composables/useVirtualTap'
import { useCommunication } from '@/composables/useCommunication'
import { VirtualTapState } from '@/core/domain/tap'

import TapHeader from './TapHeader.vue'
import TapControls from './TapControls.vue'
import TapOperation from './TapOperation.vue'

import { deviceService } from '@/infrastructure/providers/DeviceProvider'

const tapId = deviceService.getDeviceId()

// State machine handlers
const { state, identify, flow, toggleMaintenance, servedAmountMl, limitAmountMl, valveOpened, remainingMs } = useVirtualTap()

// Communication handlers
const { onCommand } = useCommunication()

let unsubscribeCmd: { unsubscribe: () => void }

onMounted(() => {
  unsubscribeCmd = onCommand((command, payload) => {
    if (command === 'MAINTENANCE') {
      toggleMaintenance();
    } else if (command === 'START_OPERATION') {
      identify('MQTT-CMD');
    } else if (command === 'VALIDATE_TAG' && payload.userId) {
      // The machine waiter in validateCredential actor will handle this via CommunicationService.waitForCommand()
      // But we can also log it here if needed.
      console.log('Received validation response:', payload);
    }
  })
})

onUnmounted(() => {
  unsubscribeCmd?.unsubscribe()
})

const isIdle = computed(() => state.value.matches(VirtualTapState.IDLE));
const isMaintenance = computed(() => state.value.matches(VirtualTapState.MAINTENANCE));
const isOperation = computed(() => state.value.matches(VirtualTapState.OPERATION));

const currentStatus = computed<string>(() => {
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
