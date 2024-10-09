import { Router } from 'express';
import {
    GetAllAnnouncement,
    AddAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
} from "../controllers/announcement.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/CRUD/:AnnouncementId")
    .patch(updateAnnouncement)
    .delete(deleteAnnouncement)
    .post(AddAnnouncement)

router.route("/").get(GetAllAnnouncement);

export default router