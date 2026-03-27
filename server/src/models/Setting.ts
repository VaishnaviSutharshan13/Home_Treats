import mongoose, { Document, Schema } from 'mongoose';

export interface ISetting extends Document {
  key: string;
  heroImage?: string;
}

const SettingSchema: Schema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global',
      trim: true,
    },
    heroImage: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISetting>('Setting', SettingSchema);
