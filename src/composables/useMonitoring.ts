import { onMounted, onUnmounted, ref } from 'vue';
import { Subject, merge, type Subscription } from 'rxjs';
import mqtt from 'mqtt';
import { deviceService } from '@/infrastructure/providers/DeviceProvider';
import type { CommunicationEvent } from '@/core/domain/communication';

export function useMonitoring() {
  const events = ref<CommunicationEvent[]>([]);
  let client: mqtt.MqttClient | null = null;
  let subscription: Subscription;

  const commandSubject = new Subject<CommunicationEvent>();
  const tagSubject = new Subject<CommunicationEvent>();
  const consumptionSubject = new Subject<CommunicationEvent>();

  // Pipe them together
  const allEvents$ = merge(commandSubject, tagSubject, consumptionSubject);

  onMounted(() => {
    const brokerUrl = import.meta.env.VITE_MQTT_URL;
    const tapId = deviceService.getDeviceId();
    
    // Connect to the broker as a monitoring client
    client = mqtt.connect(brokerUrl, { clientId: `monitor-${tapId}-${Math.random().toString(36).substring(7)}` });

    client.on('connect', () => {
      console.log('Monitor connected to MQTT');
      // Subscribe to all topics for this tap
      client?.subscribe([
        `v1/device/${tapId}/command`,
        `v1/device/${tapId}/tag`,
        `v1/device/${tapId}/consumption`,
      ]);
    });

    client.on('message', (topic, message) => {
      const event: CommunicationEvent = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        topic,
        content: message.toString(),
      };

      if (topic.endsWith('/command')) {
        commandSubject.next(event);
      } else if (topic.endsWith('/tag')) {
        tagSubject.next(event);
      } else if (topic.endsWith('/consumption')) {
        consumptionSubject.next(event);
      }
    });

    subscription = allEvents$.subscribe((event) => {
      events.value.unshift(event);
      if (events.value.length > 50) {
        events.value.pop();
      }
    });
  });

  onUnmounted(() => {
    subscription?.unsubscribe();
    if (client) {
      client.end();
      client = null;
    }
  });

  const publishCommand = (command: string, payload?: any) => {
    if (client) {
      const tapId = deviceService.getDeviceId();
      client.publish(`v1/device/${tapId}/command`, JSON.stringify({ command, ...payload }));
    }
  };

  return {
    events,
    publishCommand
  };
}
