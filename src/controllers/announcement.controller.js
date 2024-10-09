import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Event } from "../models/event.models.js"
import { Announcement } from "../models/announcement.models.js";

const GetAllAnnouncement = asyncHandler(async (req, res) => {
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
        const result = await Announcement.aggregatePaginate(Announcement.aggregate(pipeline), options);
        
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

const AddAnnouncement = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    const event = await Announcement.create({
        title: title,
        description: description
    })
    console.log(event)
    if (!event) {
        throw new ApiError(400, "Error during creation")
    }

    return res.status(200).json(
        new ApiResponse(200, "Announcement Added Successfully")
    )
})

const updateAnnouncement = asyncHandler(async (req, res) => {
    const { AnnouncementId } = req.params;
    const { title, description } = req.body;

    if (!AnnouncementId) {
        throw new ApiError(400, "Event ID is required");
    }

    try {
        const updateData = {
            title: title,
            description: description,
        };
        const announcement = await Announcement.findByIdAndUpdate(
            AnnouncementId,
            { $set: updateData },
            { new: true }
        );
        if (!announcement) {
            throw new ApiError(404, "Announcement not found");
        }

        return res.status(200).json(new ApiResponse(200, "Announcement Updated Successfully", announcement));
    } catch (error) {
        return res.status(400).json(new ApiError(400, error.message));
    }
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
    const { AnnouncementId } = req.params
    //TODO: delete Event
    const announcement = await Announcement.findByIdAndDelete(AnnouncementId);
    console.log(announcement)

    return res
        .status(200)
        .json(new ApiError(200, "Event deleted Successfully !!"))

})

export {
    GetAllAnnouncement,
    AddAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
}