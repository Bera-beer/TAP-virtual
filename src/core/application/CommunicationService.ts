import { Subject, type Observable } from 'rxjs'
import { filter } from 'rxjs/operators'
import type * as CommunicationRepository from '../ports/CommunicationRepository'
import type { CommunicationEvent } from '../domain/communication'
import { MQTT_TOPIC_TELEMETRY , getDeviceMqttTopic } from '../domain/communication'

export class CommunicationService {
  private repository: CommunicationRepository.CommunicationRepository
  private eventsSubject = new Subject<CommunicationEvent>()
  public events$: Observable<CommunicationEvent> = this.eventsSubject.asObservable()
  private tapId: string = import.meta.env.VITE_TAP_ID || 'TAP-01'

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
    this.repository.publish(MQTT_TOPIC_TELEMETRY, JSON.stringify({ 
      tapId: this.tapId, 
      status: stateValue, 
      context 
    }))
  }

  publishCommand(command: string, payload?: any) {
    this.repository.publish(getDeviceMqttTopic(this.tapId), JSON.stringify({ 
      tapId: this.tapId, 
      command, 
      ...payload 
    }))
  }

  onCommand(callback: (cmd: string, payload: any) => void) {
    const sub = this.events$
      .pipe(filter((event) => event.topic === getDeviceMqttTopic(this.tapId)))
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
