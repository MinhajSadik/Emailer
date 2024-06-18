// import crypto from 'crypto';
import dotenv from 'dotenv';
import fs from "fs";
import nodeMailer from "nodemailer";
import dkim from 'nodemailer-dkim';
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { MailInfo } from '../models/mail.model.js';
const __filename = fileURLToPath(import.meta.url),
    __dirname = dirname(__filename),
    privateKeyPath = path.join(__dirname, "../keys/private.key"),
    privateKey = fs.readFileSync(privateKeyPath, "utf8");

dotenv.config()

class Service {
    async sentMail(payload) {

        const sender = nodeMailer.createTransport({
            host: process.env.SMPT_HOST,
            port: process.env.SMPT_PORT,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.SMPT_MAIL,
                pass: process.env.SMPT_PASSWORD,
            },
        });

        // Use the DKIM signer
        sender.use('stream', dkim.signer({
            domainName: 'littleprogrammers.org',
            keySelector: 'default',
            privateKey: privateKey
        }));

        const mailOptions = {
            from: process.env.SMPT_MAIL,
            to: payload.emailID,
            cc: payload.CC,
            bcc: payload.BCC,
            subject: payload.subject,
            html: payload.html,
            attachments: payload.attachments,
        };

        return await sender.sendMail(mailOptions);
    }

    generateTrackingPixelUrl(emailID) {
        return `http://103.153.130.78:84/emailerapi/v1/track/open?emailID=${emailID}`;
å    }

    async mailLog(emailID) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log(`Email ID ${emailID} logged successfully.`);
                resolve(); 
            }, 100); 
        });
    }

    async saveMailInfo(payload) {
        return await MailInfo.create(payload);
    }
}


export const MailService = new Service()