import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const eventschema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    EventDate: {
      type: Date,
      default: Date.now,  // Set the current date as the default
    },
  },
  {
    timestamps: true,
  }
);

eventschema.plugin(mongooseAggregatePaginate);

export const Event = mongoose.model("Event", eventschema);
