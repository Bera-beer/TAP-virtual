export const getDeviceMqttTopic = (tapId: string) => `v1/device/${tapId}/command`
export const getTagMqttTopic = (tapId: string) => `v1/device/${tapId}/tag`
export const getConsumptionMqttTopic = (tapId: string) => `v1/device/${tapId}/consumption`

export interface CommunicationEvent {
  id: string
  timestamp: string
  topic: string
  content: string
}
