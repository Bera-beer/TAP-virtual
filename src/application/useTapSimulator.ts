import { useMachine } from '@xstate/vue';
import { computed } from 'vue';
import { tapMachine } from '@/domain/tap/tapMachine';

/**
 * Hexagonal architecture: the Application layout
 * Uses port/adapter concepts.
 */
export function useTapSimulator() {
  // Execute the domain machine through the Vue adapter framework
  const { snapshot, send } = useMachine(tapMachine);

  // Formatting adapter for display
  const formattedTimer = computed(() => {
    const totalMs = snapshot.value.context.remainingMs;
    const seconds = Math.floor(totalMs / 1000);
    const ms = totalMs % 1000;
    return `${seconds.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
  });

  // Current literal state (idle | operation)
  const currentState = computed(() => snapshot.value.value);

  // Isolate UI from raw domain commands
  const onIdentifyClick = () => {
    send({ type: 'IDENTIFY' });
  };

  return {
    currentState,
    formattedTimer,
    onIdentifyClick
  };
}
