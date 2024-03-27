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
    
        // Respond to the client immediately
        res.status(200).json({
            message: "Email sending process has been initiated",
        });
    
        emails.forEach(async (emailID) => {
            try {
                const trackingPixelUrl = MailService.generateTrackingPixelUrl(emailID);
    
                const sendDataToHtml = {
                    name: "Little Programmers...",
                    trackingPixelUrl,
                };
    
                const templateData = docTemplate(sendDataToHtml);
                const options = {
                    emailID,
                    CC,
                    BCC,
                    subject: `Hey there, I am from ${process.env.APP_NAME}`,
                    html: templateData,
                };
    
                await MailService.sentMail(options);
    
            } catch (error) {
                console.error(`Error sending email to ${emailID}:`, error.message);
            }
        });
    }
    

    async trackMail(req, res) {
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
        res.end(pixel);
    
        (async () => {
            try {
                await MailService.saveMailInfo({
                    log: `Email with ID (${emailID}) was opened at ${new Date()}`,
                    emailID
                });
            } catch (error) {
                console.error("Error occurred while tracking mail:", error.message);
            }
        })();
    }    
    
}


export const MailController = new Controller()
