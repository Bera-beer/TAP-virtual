import { CommunicationService } from '@/core/application/CommunicationService'
import { CommunicationAdapter } from '../adapters/CommunicationAdapter'

const commAdapter = new CommunicationAdapter()
export const communicationService = new CommunicationService(commAdapter)
