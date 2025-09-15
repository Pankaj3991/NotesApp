import { Schema, model, models, Document } from "mongoose";
import { ITenant } from "./Tenant";

export interface IUser extends Document {
  tenantId: ITenant["_id"];
  email: string;
  passwordHash: string;
  role: "admin" | "member";
}

const UserSchema = new Schema<IUser>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    email: { type: String, required: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "member"], required: true },
  },
  { timestamps: true }
);

// unique per tenant
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export default models.User || model<IUser>("User", UserSchema);
