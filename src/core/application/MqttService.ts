import type { MqttRepository } from '../ports/MqttRepository'
import type { MqttEvent } from '../domain/MqttEvent'
import { ref, type Ref } from 'vue'

export class MqttService {
  private repository: MqttRepository
  public events: Ref<MqttEvent[]> = ref([])

  constructor(repository: MqttRepository) {
    this.repository = repository
  }

  startListening() {
    this.repository.onEvent((event) => {
      this.events.value.unshift(event)
      if (this.events.value.length > 50) {
        this.events.value.pop()
      }
    })
    this.repository.connect()
  }

  stopListening() {
    this.repository.disconnect()
  }

  publish(topic: string, message: string) {
    this.repository.publish(topic, message)
  }
}

