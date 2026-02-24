import { useMachine } from '@xstate/vue';
import { fromPromise } from 'xstate';
import { Subject, switchMap, timer, map, takeWhile } from 'rxjs';
import { onUnmounted, ref } from 'vue';
import { virtualTapMachine, VirtualTapEventName } from '@/domain/tap/virtualTapMachine';
import { VirtualTapState } from '@/types/tap';

/**
 * Hexagonal architecture: Application Layer
 * This acts as an adapter providing the virtual domain machine to the UI.
 */
export function useVirtualTap() {
  const servedAmountMl = ref(0);
  const limitAmountMl = ref(0);
  const valveOpened = ref(false);
  const remainingMs = ref(0);

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

    if (newState.matches(VirtualTapState.OPERATION)) {
      if (remainingMs.value === 0) remainingMs.value = 5000;
    } else {
      remainingMs.value = 0;
    }
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
    switchMap(() => {
      const duration = 5000;
      const start = Date.now();
      return timer(0, 50).pipe(
        map(() => Math.max(0, duration - (Date.now() - start))),
        takeWhile(ms => ms > 0 && snapshot.value.matches(VirtualTapState.OPERATION), true)
      );
    })
  ).subscribe((ms) => {
    if (!snapshot.value.matches(VirtualTapState.OPERATION)) return;
    
    remainingMs.value = ms;
    if (ms === 0) {
      send({ type: VirtualTapEventName.EXPIRED });
    }
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
    if (snapshot.value.matches(VirtualTapState.MAINTENANCE)) {
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
    valveOpened,
    remainingMs
  };
}
