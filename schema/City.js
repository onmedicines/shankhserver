import { Schema, model } from "mongoose";

const citySchema = new Schema({
  city: { type: String, required: true },
  code: { type: String, required: true },
});

export const City = model("City", citySchema);
