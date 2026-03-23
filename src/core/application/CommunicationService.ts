import { Subject, type Observable, firstValueFrom } from 'rxjs'
import { filter, map, timeout } from 'rxjs/operators'
import type * as CommunicationRepository from '../ports/CommunicationRepository'
import type { CommunicationEvent } from '../domain/communication'
import { 
  getDeviceMqttTopic, 
  getTagMqttTopic, 
  getConsumptionMqttTopic 
} from '../domain/communication'
import { deviceService } from '@/infrastructure/providers/DeviceProvider'

export class CommunicationService {
  private repository: CommunicationRepository.CommunicationRepository
  private eventsSubject = new Subject<CommunicationEvent>()
  public events$: Observable<CommunicationEvent> = this.eventsSubject.asObservable()

  constructor(repository: CommunicationRepository.CommunicationRepository) {
    this.repository = repository
  }

  private get tapId() {
    return deviceService.getDeviceId()
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



  publishTagDetection(tagCode: string) {
    this.repository.publish(getTagMqttTopic(this.tapId), JSON.stringify({ 
      tagCode 
    }))
  }

  publishConsumption(userId: string, amountConsumed: number) {
    this.repository.publish(getConsumptionMqttTopic(this.tapId), JSON.stringify({ 
      userId,
      amountConsumed,
      referenceTimestamp: Date.now()
    }))
  }

  publishCommand(command: string, payload?: any) {
    this.repository.publish(getDeviceMqttTopic(this.tapId), JSON.stringify({ 
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
          callback(payload.userId ? 'VALIDATE_TAG' : 'UNKNOWN', payload)
        } catch (e) {
          console.error('Failed to parse command payload', e)
        }
      })
    return {
      unsubscribe: () => sub.unsubscribe()
    }
  }

  async waitForCommand(timeoutMs = 10000): Promise<any> {
    const topic = getDeviceMqttTopic(this.tapId);
    return firstValueFrom(
      this.events$.pipe(
        filter((event: CommunicationEvent) => event.topic === topic),
        map((event: CommunicationEvent) => JSON.parse(event.content)),
        timeout(timeoutMs)
      )
    );
  }
}
