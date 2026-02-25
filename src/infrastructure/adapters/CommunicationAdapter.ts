import mqtt from 'mqtt'
import type { CommunicationRepository } from '@/core/ports/CommunicationRepository'
import type { CommunicationEvent } from '@/core/domain/communication'

export class CommunicationAdapter implements CommunicationRepository {
  private client: mqtt.MqttClient | null = null
  private callback: ((event: CommunicationEvent) => void) | null = null
  private topic = 'test/topic/tap-virtual/#';

  connect(): void {
    if (this.client) return

    const brokerUrl = import.meta.env.VITE_MQTT_URL
    this.client = mqtt.connect(brokerUrl)

    this.client.on('connect', () => {
      console.log('Connected to public MQTT broker')
      this.client?.subscribe(this.topic, (err) => {
        if (!err) {
          console.log(`Subscribed to topic: ${this.topic}`)
        }
      })
    })

    this.client.on('message', (topic, message) => {
      if (this.callback) {
        const time = new Date()
        const event: CommunicationEvent = {
          id: crypto.randomUUID(),
          timestamp: time.toISOString(),
          topic: topic,
          content: message.toString(),
        }
        this.callback(event)
      }
    })

    this.client.on('error', (err) => {
      console.error('MQTT error: ', err)
    })
  }

  disconnect(): void {
    if (this.client) {
      this.client.end()
      this.client = null
    }
  }

  onEvent(callback: (event: CommunicationEvent) => void): void {
    this.callback = callback
  }

  publish(topic: string, message: string): void {
    if (this.client) {
      this.client.publish(topic, message)
      console.log(`Published to ${topic}: ${message}`)
    } else {
      console.warn('Cannot publish, MQTT client not connected.')
    }
  }
}

