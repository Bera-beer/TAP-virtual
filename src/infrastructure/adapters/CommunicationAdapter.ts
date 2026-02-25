import mqtt from 'mqtt'
import type { MqttRepository } from '@/core/ports/MqttRepository'
import type { MqttEvent } from '@/core/domain/MqttEvent'

export class CommunicationAdapter implements MqttRepository {
  private client: mqtt.MqttClient | null = null
  private callback: ((event: MqttEvent) => void) | null = null
  private topic = 'test/topic/vue-hexagonal-example/#'

  connect(): void {
    if (this.client) return

    // Connect to a public test broker over WebSockets
    this.client = mqtt.connect('wss://test.mosquitto.org:8081')

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
        const event: MqttEvent = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: time.toLocaleTimeString(),
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

  onEvent(callback: (event: MqttEvent) => void): void {
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

