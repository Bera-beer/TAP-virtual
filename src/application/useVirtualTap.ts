import { useMachine } from '@xstate/vue';
import { virtualTapMachine, VirtualTapEventName } from '@/domain/tap/virtualTapMachine';

/**
 * Hexagonal architecture: Application Layer
 * This acts as an adapter providing the virtual domain machine to the UI.
 */
export function useVirtualTap() {
  const { snapshot, send } = useMachine(virtualTapMachine);

  // Domain Action
  const identify = (tag: string) => {
    send({ type: VirtualTapEventName.TAG_DETECTED, tag });
  };

  const pulse = (amount: number, count?: number) => {
    // PULSE will now be managed outside the state machine
    console.log(`Pulse count ${count} with amount ${amount}`);
  };

  const emitEvent = (type: VirtualTapEventName, payload?: any) => {
    send({ type, ...payload });
  };

  const toggleMaintenance = () => {
    if (snapshot.value.matches('maintenance')) {
      send({ type: VirtualTapEventName.MAINTENANCE_END });
    } else {
      send({ type: VirtualTapEventName.MAINTENANCE_START });
    }
  };

  return {
    state: snapshot,
    identify,
    pulse,
    emitEvent,
    toggleMaintenance
  };
}
