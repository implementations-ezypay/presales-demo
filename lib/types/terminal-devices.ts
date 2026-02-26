export type DeviceStatus = "active" | "inactive" | "pending"

export interface Device {
  id: string
  name: string
  deviceId: string
  code: string
  status: DeviceStatus
  lastSeen: string
}
