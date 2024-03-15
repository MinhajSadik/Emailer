// import crypto from 'crypto';
import nodeMailer from "nodemailer";

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
            to: payload.email,
            cc: payload.CC,
            bcc: payload.BCC,
            subject: payload.subject,
            html: payload.html,
            attachments: payload.attachments,
        };

        return await serder.sendMail(mailOptions);
    }

    generateTrackingPixelUrl(emailID) {
        return `http://localhost:5000/api/v1/track/open?emailID=${emailID}`;
        // return crypto.randomBytes(16).toString('hex');
    }

    // async saveMail(payload) {
    //     return await Subscriber.create(payload);
    // }
}


export const MailService = new Service()