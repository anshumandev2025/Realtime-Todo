import mongoose, { Document, Schema } from 'mongoose';

export interface IChecklistItem {
  text: string;
  completed: boolean;
}

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  projectId: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId[];
  order: number;
  labels: mongoose.Types.ObjectId[]; // Array of ObjectIds if referring to Project labels, or strings
  checklist: IChecklistItem[];
}

const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String }, // Can be rich text HTML or markdown string
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    order: { type: Number, required: true, default: 0 },
    labels: [{ type: Schema.Types.ObjectId }], // Storing label ObjectIds from Project
    checklist: [
      {
        text: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export const Task = mongoose.model<ITask>('Task', TaskSchema);
