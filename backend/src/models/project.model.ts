import mongoose, { Document, Schema } from "mongoose";

export interface IProjectLabel {
  name: string;
  color: string;
}

export interface IProject extends Document {
  name: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  tasks: mongoose.Types.ObjectId[];
  labels: IProjectLabel[];
}

const ProjectSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    labels: [
      {
        name: { type: String },
        color: { type: String },
      },
    ],
  },
  { timestamps: true },
);

export const Project = mongoose.model<IProject>("Project", ProjectSchema);
