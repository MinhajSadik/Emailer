import { log } from "console";
import fs from "fs";
import handlebars from "handlebars";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
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
            const sendEmailPromises = emails.map((email, i) => {

                const trackingPixelUrl = MailService.generateTrackingPixelUrl(i);

                const sendDataToHtml = {
                    name: "Little Programmers...",
                    trackingPixelUrl,
                };

                log(trackingPixelUrl)
                
                const templateData = docTemplate(sendDataToHtml);
                const options = {
                    email,
                    CC,
                    BCC,
                    subject: `Hey there, I am from ${process.env.APP_NAME}`,
                    html: templateData,
                };

                return MailService.sentMail(options);
            });

            await Promise.all(sendEmailPromises);

            res.status(200).json({
                message: "Emails have been sent",
            });

        } catch (error) {
            res.status(500).json({
                error: error.message
            })
        }
    }


    async trackMail(req, res) {
        try {
            const { emailID } = req.query;
            log(`Email with ID ${emailID} was opened at ${new Date()}`);
    
            const pixel = Buffer.from(
                'R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
                'base64'
            );
    
            res.writeHead(200, {
                'Content-Type': 'image/gif',
                'Content-Length': pixel.length,
            });
    
            await new Promise((resolve, reject) => {
                res.end(pixel, () => {
                    resolve();
                });
            });

            return await MailService.saveMailInfo({
                log: `Email with ID (${emailID}) was opened at ${new Date()}`,
                emailID
            })
        } catch (error) {
            console.error("Error occurred while tracking mail:", error.message);
            res.status(500).end();
        }
    }    
    
}


export const MailController = new Controller()
