import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const Announcementschema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
    }, {
        timestamps: true
    }
)

Announcementschema.plugin(mongooseAggregatePaginate)

export const Announcement = mongoose.model("Announcement", Announcementschema)