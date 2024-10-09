import { Router } from 'express';
import {
    GetAllEvent,
    AddEvent,
    updateEvent,
    deleteEvent,
} from "../controllers/event.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(GetAllEvent)
    .post(AddEvent);

router
    .route("/:eventId")
    .delete(deleteEvent)
    .patch(updateEvent);

export default router