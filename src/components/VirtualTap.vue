<script setup lang="ts">
import { computed } from 'vue'
import { useVirtualTap } from '@/application/useVirtualTap'
import TapHeader from './TapHeader.vue'
import TapControls from './TapControls.vue'
import TapOperation from './TapOperation.vue'

const tapId = 'TAP-01'

// Application layer provides the domain state and actions
const { state, identify, pulse, toggleMaintenance } = useVirtualTap()

// Presentation layer handles how the domain state is displayed
const formattedTimer = computed(() => {
  const totalMs = state.value.context.remainingMs || 0;
  const seconds = Math.floor(totalMs / 1000);
  const ms = totalMs % 1000;
  return `${seconds.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
});

const isIdle = computed(() => state.value.matches('idle'));
const isMaintenance = computed(() => state.value.matches('maintenance'));
const isOperation = computed(() => state.value.matches('operation'));

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

const currentStateLiteral = computed(() => {
  const s = state.value;
  if (s.matches('validating')) return 'Validating...';
  if (s.matches({ operation: 'finished' })) return 'Finished';
  if (s.matches('operation')) return 'Pouring...';
  return 'Identification';
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
      @toggle-maintenance="toggleMaintenance"
    />
    
    <TapControls 
      :is-idle="isIdle" 
      :current-state-literal="currentStateLiteral"
      @identify="handleIdentify" 
    />
    
    <TapOperation 
      :is-operation="isOperation" 
      :formatted-timer="formattedTimer"
      @pulse="handlePulse" 
    />
  </div>
</template>
