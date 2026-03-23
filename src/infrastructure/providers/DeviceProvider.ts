import { DeviceService } from '@/core/application/DeviceService';
import { DeviceAdapter } from '../adapters/DeviceAdapter';
import { authService } from './AuthProvider';

const deviceAdapter = new DeviceAdapter(authService);
export const deviceService = new DeviceService(deviceAdapter);
