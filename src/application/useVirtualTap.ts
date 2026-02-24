import { useMachine } from '@xstate/vue';
import { fromPromise } from 'xstate';
import { Subject, debounceTime } from 'rxjs';
import { onUnmounted, ref } from 'vue';
import { virtualTapMachine, VirtualTapEventName } from '@/domain/tap/virtualTapMachine';

/**
 * Hexagonal architecture: Application Layer
 * This acts as an adapter providing the virtual domain machine to the UI.
 */
export function useVirtualTap() {
  const servedAmountMl = ref(0);
  const limitAmountMl = ref(0);
  const valveOpened = ref(false);

  // Provide the implementation for the reset counter invoke
  const { snapshot, send, actorRef } = useMachine(virtualTapMachine.provide({
    actors: {
      resetServerAmount: fromPromise(async () => {
        servedAmountMl.value = 0;
      })
    }
  }));

  const stateSubscription = actorRef.subscribe((newState) => {
    console.log(`[Tap Machine] State triggered:`, newState.value, newState.context);
    limitAmountMl.value = newState.context.limitAmountMl || 0;
    valveOpened.value = newState.context.valveOpened || false;
  });

  const pulseSubject = new Subject<{ amount: number, count?: number }>();
  const pulseSubscription = pulseSubject.subscribe(({ amount }) => {
    console.log('Flow: +', amount, ' Limit:', snapshot.value.context.limitAmountMl);
    servedAmountMl.value += amount;
    
    if (servedAmountMl.value >= snapshot.value.context.limitAmountMl) {
      send({ type: VirtualTapEventName.DONE });
    }
  });

  const debounceSubscription = pulseSubject.pipe(
    debounceTime(5000)
  ).subscribe(() => {
    send({ type: VirtualTapEventName.EXPIRED });
  });

  onUnmounted(() => {
    pulseSubscription.unsubscribe();
    debounceSubscription.unsubscribe();
    stateSubscription.unsubscribe();
  });

  // Domain Action
  const identify = (tag: string) => {
    send({ type: VirtualTapEventName.TAG_DETECTED, tag });
  };

  const pulse = (amount: number, count?: number) => {
    pulseSubject.next({ amount, count });
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
    toggleMaintenance,
    servedAmountMl,
    limitAmountMl,
    valveOpened
  };
}
