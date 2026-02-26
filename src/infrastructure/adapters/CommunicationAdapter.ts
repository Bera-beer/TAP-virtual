import mqtt from 'mqtt'
import type { CommunicationRepository } from '@/core/ports/CommunicationRepository'
import type { CommunicationEvent } from '@/core/domain/communication'

export class CommunicationAdapter implements CommunicationRepository {
  private client: mqtt.MqttClient | null = null
  private callback: ((event: CommunicationEvent) => void) | null = null
  private topics: string[] = [];

  connect(): void {
    if (this.client) return

    const brokerUrl = import.meta.env.VITE_MQTT_URL
    const tapId = import.meta.env.VITE_TAP_ID || 'TAP-01'
    this.topics = ['telemetry/state', `device/${tapId}`];
    
    this.client = mqtt.connect(brokerUrl)

    this.client.on('connect', () => {
      console.log('Connected to public MQTT broker')
      this.client?.subscribe(this.topics, (err) => {
        if (!err) {
          console.log(`Subscribed to topics: ${this.topics.join(', ')}`)
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

