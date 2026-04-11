export interface ApiRoom {
  _id: string;
  name: string;
  roomNumber: string;
  block: string;
  floor: string;
  capacity: number;
  occupied: number;
  type: 'Single Room' | 'Double Room' | 'Dormitory';
  price: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
  description?: string;
  image?: string;
  location?: string;
  facilities?: string[];
}

export type SelectionAvailability = 'Available' | 'Limited' | 'Not Available';

export const toFloorId = (floor: string): string =>
  String(floor || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

export const buildingFromBlock = (block: string): string =>
  String(block || '').replace('Block', 'Building').trim();

export const selectionAvailability = (room: ApiRoom): SelectionAvailability => {
  if (room.status === 'Maintenance') return 'Not Available';
  const remaining = Number(room.capacity || 0) - Number(room.occupied || 0);
  if (room.status === 'Occupied' || remaining <= 0) return 'Not Available';
  if (remaining === 1) return 'Limited';
  return 'Available';
};

export const marketingAvailability = (room: ApiRoom): 'Available' | 'Limited Rooms' | 'Full' => {
  const current = selectionAvailability(room);
  if (current === 'Available') return 'Available';
  if (current === 'Limited') return 'Limited Rooms';
  return 'Full';
};
