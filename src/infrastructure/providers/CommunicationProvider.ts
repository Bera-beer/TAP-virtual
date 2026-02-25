import { CommunicationAdapter } from '../adapters/CommunicationAdapter'
import { MqttService } from '@/core/application/MqttService'

const commAdapter = new CommunicationAdapter()
export const communicationService = new MqttService(commAdapter)
