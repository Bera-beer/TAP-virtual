import { onMounted, onUnmounted, ref } from 'vue';
import type { Subscription } from 'rxjs';

import { communicationService } from '@/infrastructure/providers/CommunicationProvider';
import type { CommunicationEvent } from '@/core/domain/communication';

export function useCommunication() {
  const events = ref<CommunicationEvent[]>([]);
  let subscription: Subscription;

  onMounted(() => {
    communicationService.startListening();
    subscription = communicationService.events$.subscribe((event) => {
      events.value.unshift(event);
      if (events.value.length > 50) {
        events.value.pop();
      }
    });
  });

  onUnmounted(() => {
    subscription?.unsubscribe();
    communicationService.stopListening();
  });

  const publishState = (stateValue: any, context: any) => {
    communicationService.publishState(stateValue, context);
  };

  const publishCommand = (command: string, payload?: any) => {
    communicationService.publishCommand(command, payload);
  };

  const onCommand = (callback: (cmd: string, payload: any) => void) => {
    return communicationService.onCommand(callback);
  };

  return {
    events,
    publishState,
    publishCommand,
    onCommand,
  };
}
