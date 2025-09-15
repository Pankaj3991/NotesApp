import { Schema, model, models, Document } from "mongoose";
import { ITenant } from "./Tenant";
import { IUser } from "./User";

export interface INote extends Document {
  tenantId: ITenant["_id"];
  userId: IUser["_id"];
  title: string;
  content: string;
}

const NoteSchema = new Schema<INote>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.Note || model<INote>("Note", NoteSchema);
