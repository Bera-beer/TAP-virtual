import type { CommunicationEvent } from '../domain/communication'

export interface CommunicationRepository {
  connect(): void
  disconnect(): void
  onEvent(callback: (event: CommunicationEvent) => void): void
  publish(topic: string, message: string): void
}
