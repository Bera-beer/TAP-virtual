import type { DeviceRepository, Device } from '@/core/ports/DeviceRepository';
import type { AuthService } from '@/core/application/AuthService';

export class DeviceAdapter implements DeviceRepository {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async getDevices(): Promise<Device[]> {
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = this.authService.getToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${apiUrl}/admin/devices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch devices: ${response.status} ${response.statusText} ${errorText}`);
    }

    return await response.json();
  }
}
