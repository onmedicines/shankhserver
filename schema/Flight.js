import { Schema, model } from "mongoose";

const flightSchema = new Schema({
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  date: {
    year: {
      type: String,
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
});

export const Flight = model("Flight", flightSchema);
