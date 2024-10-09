import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express()

// app.use is gener ally used to handle the configuration part 
// or to handle and use of middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
    
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// routes import

import userRouter from './routes/user.routes.js'
import eventRouter from './routes/event.routes.js'
import announcement from './routes/announcement.routes.js'

// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/event", eventRouter)
app.use("/api/v1/announcemnet", announcement)

export {app}