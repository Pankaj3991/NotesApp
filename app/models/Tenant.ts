import { Schema, model, models, Document } from "mongoose";

export interface ITenant extends Document {
  slug: string;
  name: string;
  subscription: "free" | "pro";
}

const TenantSchema = new Schema<ITenant>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    subscription: { type: String, enum: ["free", "pro"], default: "free" },
  },
  { timestamps: true }
);

export default models.Tenant || model<ITenant>("Tenant", TenantSchema);
