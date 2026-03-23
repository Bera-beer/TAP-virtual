export interface Device {
  id: string;
  serialNumber: string;
  name: string;
}

export interface DeviceRepository {
  getDevices(): Promise<Device[]>;
}
