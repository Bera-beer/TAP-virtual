import type { MqttEvent } from '../domain/MqttEvent'

export interface MqttRepository {
  connect(): void
  disconnect(): void
  onEvent(callback: (event: MqttEvent) => void): void
  publish(topic: string, message: string): void
}
