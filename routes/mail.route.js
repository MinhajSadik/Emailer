import express from "express";
import { MailController } from "../controllers/mail.controller.js";


const router = express.Router()


router.post('/track/send_mail', MailController.sendMail)
router.get('/track/open', MailController.trackMail)



export const routes = router;