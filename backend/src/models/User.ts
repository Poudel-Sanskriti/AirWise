import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  auth0Id?: string;
  email: string;
  name: string;
  picture?: string;
  healthProfile: {
    conditions: string[];
    ageGroup: 'child' | 'adult' | 'senior';
    lifestyle: string[];
    sensitivities: string[];
  };
  preferences: {
    units: 'metric' | 'imperial';
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  auth0Id: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  picture: String,
  healthProfile: {
    conditions: [{ type: String }],
    ageGroup: { type: String, enum: ['child', 'adult', 'senior'], default: 'adult' },
    lifestyle: [{ type: String }],
    sensitivities: [{ type: String }]
  },
  preferences: {
    units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    notifications: { type: Boolean, default: true }
  }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);