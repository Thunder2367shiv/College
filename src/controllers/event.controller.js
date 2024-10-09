import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Event } from "../models/event.models.js"
import mongoose from "mongoose"

const GetAllEvent = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', eventid } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Build match stage based on query and userId
    const matchStage = {
        $match: {}
    };

    if (query) {
        matchStage.$match.title = { $regex: query, $options: 'i' }; // Case-insensitive search
    }

    // Build sort stage based on sortBy and sortType
    const sortStage = {
        $sort: {
            [sortBy]: sortType === 'asc' ? 1 : -1
        }
    };

    // Aggregate pipeline
    const pipeline = [
        matchStage,
        sortStage
    ];

    // Pagination options
    const options = {
        page: pageNumber,
        limit: limitNumber
    };

    try {
        const result = await Event.aggregatePaginate(Event.aggregate(pipeline), options);
        
        res.status(200).json({
            success: true,
            data: result.docs,
            totalDocs: result.totalDocs,
            totalPages: result.totalPages,
            page: result.page,
            limit: result.limit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

const AddEvent = asyncHandler(async (req, res) => {
    // if(req.user.isSuperAdmin == false) {
    //     res.status(500).json({
    //         success: false,
    //         message: "Not Authorized to See this Page"
    //     });
    // }
    const { title, description, duration, EventDate} = req.body

    const event = await Event.create({
        title: title,
        description: description,
        duration: duration,
        EventDate: EventDate
    })
    console.log(event)
    if (!event) {
        throw new ApiError(400, "Error during creation")
    }

    return res.status(200).json(
        new ApiResponse(200, "Event Published Successfully")
    )
})

const updateEvent = asyncHandler(async (req, res) => {
    if(req.user.isSuperAdmin == false) {
        res.status(500).json({
            success: false,
            message: "Not Authorized to See this Page"
        });
    }
    const { eventId } = req.params;
    console.log("Eventid: ", eventId)
    const { title, description } = req.body;

    if (!eventId) {
        throw new ApiError(400, "eventId is required");
    }

    try {
        const updateData = {
            title: title,
            description: description,
        };
        const event = await Event.findByIdAndUpdate(
            eventId,
            { $set: updateData },
            { new: true }
        );
        if (!event) {
            throw new ApiError(404, "Event not found");
        }

        return res.status(200).json(new ApiResponse(200, "Event Updated Successfully", event));
    } catch (error) {
        return res.status(400).json(new ApiError(400, error.message));
    }
});

const deleteEvent = asyncHandler(async (req, res) => {
    // Authorization check (uncomment if needed)
    // if (req.user.isSuperAdmin === false) {
    //     return res.status(403).json({
    //         success: false,
    //         message: "Not Authorized to perform this action"
    //     });
    // }

    const { eventId } = req.params;
    console.log("event: ", eventId)

    // Check if EventId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Event ID"
        });
    }

    // Find and delete the event
    const event = await Event.findByIdAndDelete(eventId);

    // Check if event exists
    if (!event) {
        return res.status(404).json({
            success: false,
            message: "Event not found"
        });
    }

    console.log("Deleted Event: ", event);

    // Success response
    return res.status(200).json({
        success: true,
        message: "Event deleted successfully!"
    });
});


export {
    GetAllEvent,
    AddEvent,
    updateEvent,
    deleteEvent,
}