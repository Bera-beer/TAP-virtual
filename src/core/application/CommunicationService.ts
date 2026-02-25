import { Subject, type Observable } from 'rxjs'
import { filter } from 'rxjs/operators'
import type * as CommunicationRepository from '../ports/CommunicationRepository'
import type { CommunicationEvent } from '../domain/communication'
import { MQTT_TOPIC_STATE, MQTT_TOPIC_CMD } from '../domain/communication'

export class CommunicationService {
  private repository: CommunicationRepository.CommunicationRepository
  private eventsSubject = new Subject<CommunicationEvent>()
  public events$: Observable<CommunicationEvent> = this.eventsSubject.asObservable()

  constructor(repository: CommunicationRepository.CommunicationRepository) {
    this.repository = repository
  }

  startListening() {
    this.repository.onEvent((event) => {
      this.eventsSubject.next(event)
    })
    this.repository.connect()
  }

  stopListening() {
    this.repository.disconnect()
  }

  publishState(stateValue: any, context: any) {
    this.repository.publish(MQTT_TOPIC_STATE, JSON.stringify({ state: stateValue, context }))
  }

  publishCommand(command: string, payload?: any) {
    this.repository.publish(MQTT_TOPIC_CMD, JSON.stringify({ command, ...payload }))
  }

  onCommand(callback: (cmd: string, payload: any) => void) {
    const sub = this.events$
      .pipe(filter((event) => event.topic === MQTT_TOPIC_CMD))
      .subscribe((event) => {
        try {
          const payload = JSON.parse(event.content)
          callback(payload.command, payload)
        } catch (e) {
          console.error('Failed to parse command payload', e)
        }
      })
    return {
      unsubscribe: () => sub.unsubscribe()
    }
  }
}
