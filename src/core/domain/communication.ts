export const MQTT_TOPIC_TELEMETRY = 'telemetry/state'
export const getDeviceMqttTopic = (tapId: string) => `device/${tapId}`

export interface CommunicationEvent {
  id: string
  timestamp: string
  topic: string
  content: string
}
