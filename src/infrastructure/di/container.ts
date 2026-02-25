import { CommunicationAdapter } from '../adapters/CommunicationAdapter'
import { MqttService } from '@/core/application/MqttService'

const communicationAdapter = new CommunicationAdapter()
export const communicationService = new MqttService(communicationAdapter)
