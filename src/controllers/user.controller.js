import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    service: "gmail",
    secure: false,
    logger: true,
    secureConnection: false,
    port: 587,
    auth: {
        user: 'shivamverma1022@gmail.com',
        pass: 'wysi qayu zrqi cdcr'
    },
    tls: {
        rejectUnauthorized: true
    }
});

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const RefreshExpiryCode = asyncHandler(async (req, res) => {
    const {email} = req.body
    const user = await User.findOne({email})
    const expiryDate = new Date()
    expiryDate.setHours(expiryDate.getHours() + 1)
    user.verifyCodeExpiry = expiryDate
    await user.save()
    return res.status(200).json(
        new ApiResponse(200, "Expiry Extended!!")
    )

})

const registerUser = asyncHandler(async (req, res) => {

    const { fullName, email, username, password, isSuperAdmin} = req.body
    // console.log("email: ", email)

    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate the verification code
    const verifyCodeExpiry = new Date(Date.now() + 3600000)
    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        isSuperAdmin,
        verifyCode,
        verifyCodeExpiry
    })

console.log("Verify Code: ", verifyCode); // Log the generated verifyCode

const emailResponse = await transporter.sendMail({
    from: 'shivamverma1022@gmail.com', 
    to: `${email}`, // List of receivers
    subject: "OTP Verification :: College", 
    text: `Verify Code: ${verifyCode}`, // Include verifyCode in the email text
    html: `<b>Verify Code: ${verifyCode}</b>`, // Include verifyCode in the HTML
});

console.log("Message sent: %s", emailResponse.messageId); // Log email response
console.log(emailResponse);



    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // console.log(createdUser);

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    return res.status(200).json(
        new ApiResponse(200, "User Registerd Successfully. Please verify your Email-->>")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(400, "User doesnot exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Inavalid user Credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }
    const flag = loggedInUser.isVerified;
    if(!flag) {
        throw new ApiError(404, "User is not verified!! Please verified first")
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged Out"
            )
        )
})

const refreshAceessToken = asyncHandler(async (req, res) => {
    const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingrefreshToken) {
        throw new ApiError(401, "unauthorized Token")
    }
    try {

        const decodedToken = jwt.verify(
            incomingrefreshToken,
            process.env.ACCESS_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invaid refresh Token")
        }

        if (incomingrefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newrefreshToken } = await generateAccessAndRefereshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newrefreshToken },
                    "Access token refreshed"
                )
            )

    } catch (error) {
        throw new ApiError(401, error?.message ||
            "Invalid refresh Token"
        )
    }

})

const getCurrentUser = asyncHandler(async (req, res) => {
    console.log(req.user)
    return res
        .status(200)
        .json(200, req.user.isSuperAdmin, "Current user fetched successfully")
})

const verifyUser = asyncHandler(async(req, res) => {
    const {username, code} = await req.body
    const existedUser = await User.findOne({username})
    if(!existedUser) {
        throw new ApiError(409, "User not found")
    }

    const isCodeValid = existedUser.verifyCode === code
    const isCodenotExpired = new Date(existedUser.verifyCodeExpiry) > new Date()
    if(isCodeValid && isCodenotExpired) {
        existedUser.isVerified = true
        await existedUser.save()
        return res.status(200).json(
            new ApiResponse(200, "Email Verified Successfully")
        )
    }
    else if(!isCodenotExpired) {
        throw new ApiError(409, "Verification code has expired, please signup again to get a new code")
    }
    else {
        throw new ApiError(400, "Incorrect verification code")
    }

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAceessToken,
    getCurrentUser,
    verifyUser,
    RefreshExpiryCode
}