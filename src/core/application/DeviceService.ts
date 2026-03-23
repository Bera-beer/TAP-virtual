import type { DeviceRepository } from '../ports/DeviceRepository';

export class DeviceService {
  private repository: DeviceRepository;
  private currentDeviceId: string | null = null;

  constructor(repository: DeviceRepository) {
    this.repository = repository;
  }

  async initializeDevice(): Promise<string> {
    try {
      const devices = await this.repository.getDevices();
      const firstDevice = devices?.[0];
      if (firstDevice) {
        this.currentDeviceId = firstDevice.serialNumber || firstDevice.id;
        if (!this.currentDeviceId) throw new Error('First device has no ID or serialNumber');
        
        localStorage.setItem('current_device_id', this.currentDeviceId);
        console.log(`Device initialization successful. Using device: ${this.currentDeviceId}`);
        return this.currentDeviceId;
      }
      throw new Error('No devices found in the system');
    } catch (error) {
      console.error('Device initialization failed:', error);
      // Fallback to environment variable or default
      const fallback = import.meta.env.VITE_TAP_ID || 'TAP-01';
      this.currentDeviceId = fallback;
      return fallback;
    }
  }

  getDeviceId(): string {
    if (this.currentDeviceId) return this.currentDeviceId;
    return localStorage.getItem('current_device_id') || import.meta.env.VITE_TAP_ID || 'TAP-01';
  }
}
