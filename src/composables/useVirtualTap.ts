import { onUnmounted, ref } from 'vue';
import { Subject, switchMap, timer, map, takeWhile } from 'rxjs';
import { fromPromise } from 'xstate';
import { useMachine } from '@xstate/vue';
import { virtualTapMachine, VirtualTapEventName } from '@/core/domain/virtualTapMachine';
import { VirtualTapState } from '@/core/domain/tap';
import { communicationService } from '@/infrastructure/providers/CommunicationProvider';

export function useVirtualTap() {
  const servedAmountMl = ref(0);
  const limitAmountMl = ref(0);
  const valveOpened = ref(false);
  const remainingMs = ref(0);

  const { snapshot, send, actorRef } = useMachine(virtualTapMachine.provide({
    actions: {
      wrapUpOperation: ({ context }) => {
        if (context.user && context.servedAmountMl !== undefined) {
          communicationService.publishConsumption(
            context.user.id,
            context.servedAmountMl
          );
        }
      }
    },
    actors: {
      validateCredential: fromPromise(async ({ input }: { input: { tag: string | undefined } }) => {
        if (!input.tag) throw new Error('Tag is required');
        communicationService.publishTagDetection(input.tag);
        const response = await communicationService.waitForCommand();
        
        // Unwrap NestJS MQTT response if needed
        const data = response.data || response;
        
        if (!data || !data.userId) {
            throw new Error('Invalid validation response');
        }

        return {
            user: {
                id: data.userId,
                name: `User ${data.userId.split('-')[0]}` // Partial name from ID for demo
            },
            limitAmountMl: data.creditAvailable || 0
        };
      }),
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
    
    // Update context for wrapUpOperation
    send({ type: VirtualTapEventName.UPDATE_SERVED_AMOUNT, amount: servedAmountMl.value });

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

  const identify = (tag: string) => {
    send({ type: VirtualTapEventName.TAG_DETECTED, tag });
  };

  const flow = (amount: number, count?: number) => {
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
    actorRef,
    identify,
    flow,
    emitEvent,
    toggleMaintenance,
    servedAmountMl,
    limitAmountMl,
    valveOpened,
    remainingMs
  };
}
