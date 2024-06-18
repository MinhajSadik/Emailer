import cookieParser from "cookie-parser";
import cors from 'cors';
import dotenv from "dotenv";
import express from "express";
import connectDB from "./configs/database.config.js";
import { routes } from "./routes/mail.route.js";
const app = express()

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(cors())
dotenv.config()
const PORT = process.env.PORT

await connectDB()

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Do you want to send mail? visit send_mail route",
    });
});

app.use("/api/v1/", routes);


app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})