import mongoose, { Document, Schema } from 'mongoose';

export interface IOrgMember {
  user: mongoose.Types.ObjectId;
  role: 'admin' | 'member';
}

export interface IOrganization extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  members: IOrgMember[];
  projects: mongoose.Types.ObjectId[];
}

const OrganizationSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['admin', 'member'], required: true, default: 'member' },
      },
    ],
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  },
  { timestamps: true }
);

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
