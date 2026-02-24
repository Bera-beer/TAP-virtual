<script setup lang="ts">
import { computed } from 'vue'
import { useVirtualTap } from '@/application/useVirtualTap'
import { VirtualTapState } from '@/types/tap'
import TapHeader from './TapHeader.vue'
import TapControls from './TapControls.vue'
import TapOperation from './TapOperation.vue'

const tapId = 'TAP-01'

// Application layer provides the domain state and actions
const { state, identify, pulse, toggleMaintenance, servedAmountMl, limitAmountMl, valveOpened, remainingMs } = useVirtualTap()

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

const handlePulse = (payload: { amount: number, count: number }) => {
  pulse(payload.amount, payload.count)
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
      @pulse="handlePulse" 
    />
  </div>
</template>
