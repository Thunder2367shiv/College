import { Router } from "express"
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAceessToken,
    getCurrentUser,
    verifyUser,
    RefreshExpiryCode
}
    from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(registerUser)

router.route("/login").post(loginUser)
// secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAceessToken)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/verifyUser").get(verifyUser)
router.route("/RefreshExpiryCode").patch(RefreshExpiryCode)

export default router