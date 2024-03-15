import fs from "fs";
import handlebars from "handlebars";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import * as uuid from 'uuid';
import { MailService } from "../services/mail.service.js";
const __filename = fileURLToPath(import.meta.url),
    __dirname = dirname(__filename),
    pitchMailPath = path.join(__dirname, "../files/mail.html"),
    pitchMailFile = fs.readFileSync(pitchMailPath, "utf-8"),
    docTemplate = handlebars.compile(pitchMailFile)
fs.promises;



class Controller {
    async sendMail(req, res) {
        const { emails, CC, BCC } = req.body;

        try {
            const sendEmailPromises = emails.map(email => {
                const uniqueID = uuid.v4();
                const trackingPixelUrl = MailService.generateTrackingPixelUrl(uniqueID);
                const sendDataToHtml = {
                    name: "Little Programmers...",
                    trackingPixelUrl,
                };

                const templateData = docTemplate(sendDataToHtml);
                const options = {
                    email,
                    CC,
                    BCC,
                    subject: `Hey there, I am from ${process.env.APP_NAME}`,
                    html: templateData,
                };

                return MailService.sentMail(options); // Return the promise created by sentMail
            });

            // Wait for all the emails to be sent
            const results = await Promise.all(sendEmailPromises);

            // Once all emails are sent, send a response back
            res.status(200).json({
                message: "Emails have been sent",
                data: results
            });

        } catch (error) {
            res.status(500).json({
                error: error.message
            })
        }
    }

    async trackMail(req, res) {
        const { emailID } = req.query;
        console.log(`Email with ID ${emailID} was opened at ${new Date()}`);

        // Send a 1x1 pixel transparent GIF
        const pixel = Buffer.from(
            'R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
            'base64',
        );
        res.writeHead(200, {
            'Content-Type': 'image/gif',
            'Content-Length': pixel.length,
        });
        res.end(pixel);
    }
}


export const MailController = new Controller()