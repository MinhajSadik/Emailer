// import crypto from 'crypto';
import dotenv from 'dotenv';
import nodeMailer from "nodemailer";
import { MailInfo } from '../models/mail.model.js';

dotenv.config()

class Service {
    async sentMail(payload) {

        const serder = nodeMailer.createTransport({
            host: process.env.SMPT_HOST,
            port: process.env.SMPT_PORT,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.SMPT_MAIL,
                pass: process.env.SMPT_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.SMPT_MAIL,
            to: payload.emailID,
            cc: payload.CC,
            bcc: payload.BCC,
            subject: payload.subject,
            html: payload.html,
            attachments: payload.attachments,
        };

        return await serder.sendMail(mailOptions);
    }

    generateTrackingPixelUrl(emailID) {
        // return crypto.randomBytes(16).toString('hex');
        return `http://103.153.130.78:84/emailerapi/v1/track/open?emailID=${emailID}`;
        // return `http://localhost:5000/api/v1/track/open?emailID=${emailID}`;
    }

    // async mailLog(emailID) {
    //     return new Promise((resolve, reject) => {
    //         setTimeout(() => {
    //             console.log(`Email ID ${emailID} logged successfully.`);
    //             resolve(); 
    //         }, 100); 
    //     });
    // }

    async saveMailInfo(payload) {
        return await MailInfo.create(payload);
    }
}


export const MailService = new Service()