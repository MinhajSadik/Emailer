import fs from "fs";
import handlebars from "handlebars";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { MailService } from "../services/mail.service.js";
import { scheduleEmailDeliveryCheck } from "../utils/mail.mailschedule.js";
import { chunkArray } from "../utils/mail.util.js";
const __filename = fileURLToPath(import.meta.url),
    __dirname = dirname(__filename),
    pitchMailPath = path.join(__dirname, "../files/mail.html"),
    pitchMailFile = fs.readFileSync(pitchMailPath, "utf-8"),
    docTemplate = handlebars.compile(pitchMailFile)
fs.promises;



class Controller {
    async sendMail(req, res) {
        const { emails, CC, BCC } = req.body;
        const batchSize = 10; // Number of emails to send in each batch
        const emailBatches = chunkArray(emails, batchSize);

        try {
            for (const batch of emailBatches) {
                const emailPromises = batch.map((emailID) => {
                    const trackingPixelUrl = MailService.generateTrackingPixelUrl(`${emailID}`);
    
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
    
                    return MailService.sentMail(options)
                        .then(() => ({
                            emailID,
                            status: 'success'
                        }))
                        .catch(error => ({
                            emailID,
                            status: 'error',
                            message: error.message
                        }));
                });

                const results = await Promise.all(emailPromises);
    
                // Check for errors in the current batch
                const errors = results.filter(result => result.status === 'error');
                if (errors.length) {
                    return res.status(500).json({
                        message: 'Some emails failed to send',
                        errors
                    });
                }
            }
            
            // Schedule email delivery check
            scheduleEmailDeliveryCheck();


            // If all batches processed successfully
            return res.status(200).json({
                message: "All emails have been sent successfully",
            });

        } catch (error) {
            console.error('Unexpected error:', error.message);
            return res.status(500).json({
                message: 'Unexpected error occurred',
                error: error.message
            });
        }
    }

    async trackMail(req, res) {
        const { emailID } = req.query;

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
                    log: `Email with ID ${emailID} was opened at ${new Date()}`,
                    emailID: emailID,
                });
            } catch (error) {
                console.error("Error occurred while tracking mail:", error.message);
            }
        })();
    }
}

export default Controller;



export const MailController = new Controller()
