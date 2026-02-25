export const MQTT_TOPIC_STATE = 'test/topic/tap-virtual/state'
export const MQTT_TOPIC_CMD = 'test/topic/tap-virtual/commands'

export interface CommunicationEvent {
  id: string
  timestamp: string
  topic: string
  content: string
}
