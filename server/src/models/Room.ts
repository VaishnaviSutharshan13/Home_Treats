import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  roomNumber: string;
  block: string;
  floor: string;
  capacity: number;
  occupied: number;
  type: 'Single Room' | 'Double Room' | 'Dormitory';
  price: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
  description: string;
  image: string;
  location: string;
  students: string[];
  facilities: string[];
  lastMaintenance: Date;
}

const RoomSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  roomNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  block: {
    type: String,
    required: true,
    enum: ['Block A', 'Block B', 'Block C', 'Block D']
  },
  floor: {
    type: String,
    required: true,
    enum: ['1st Floor', '2nd Floor', '3rd Floor', '4th Floor']
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  occupied: {
    type: Number,
    default: 0,
    min: 0
  },
  type: {
    type: String,
    required: true,
    enum: ['Single Room', 'Double Room', 'Dormitory']
  },
  price: {
    type: Number,
    required: true,
    min: [4000, 'Minimum room price is LKR 4,000']
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600'
  },
  location: {
    type: String,
    default: 'Jaffna, Sri Lanka'
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Maintenance'],
    default: 'Available'
  },
  students: [{
    type: String
  }],
  facilities: [{
    type: String,
    enum: ['WiFi', 'AC', 'Study Table', 'Wardrobe', 'Private Bathroom', 'Common Area', 'Lockers']
  }],
  lastMaintenance: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model<IRoom>('Room', RoomSchema);
