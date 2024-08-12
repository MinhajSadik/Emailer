import dotenv from "dotenv";
import Imap from "imap";
import { simpleParser } from "mailparser";

dotenv.config();

const imapConfig = {
    user: process.env.TEST_EMAIL_USER,
    password: process.env.TEST_EMAIL_PASS,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: {
        rejectUnauthorized: false
    }
};

async function checkEmailDelivery() {
    const imap = new Imap(imapConfig);

    imap.once('ready', async function () {
        console.log("IMAP connection ready");

        try {
            await openBox(imap, 'INBOX');
            let results = await searchEmails(imap, 'INBOX');
            if (results.length === 0) {
                console.log('No emails found in INBOX.');
                await openBox(imap, '[Gmail]/Spam');
                results = await searchEmails(imap, '[Gmail]/Spam');
                if (results.length === 0) {
                    console.log('No emails found in Spam folder.');
                } else {
                    await fetchEmails(imap, results, '[Gmail]/Spam');
                }
            } else {
                await fetchEmails(imap, results, 'INBOX');
            }
        } catch (error) {
            console.error("Error:", error.message);
        } finally {
            imap.end();
        }
    });

    imap.once('error', function (err) {
        console.log("IMAP error:", err.message);
    });

    imap.once('end', function () {
        console.log('Connection ended');
    });

    imap.connect();
}

function openBox(imap, boxName) {
    return new Promise((resolve, reject) => {
        imap.openBox(boxName, true, (err, box) => {
            if (err) {
                console.error(`Failed to open ${boxName}:`, err.message);
                return reject(err);
            }
            console.log(`${boxName} opened`);
            resolve(box);
        });
    });
}

function searchEmails(imap, folder) {
    const searchCriteria = [['FROM', 'contact@littleprogrammers.org'], ['SINCE', new Date(Date.now() - 24 * 60 * 60 * 1000)]];
    return new Promise((resolve, reject) => {
        console.log(`Searching emails in ${folder} with criteria:`, searchCriteria);
        imap.search(searchCriteria, (err, results) => {
            if (err) {
                console.error(`Search error in ${folder}:`, err.message);
                return reject(err);
            }
            console.log(`Search results in ${folder}:`, results);
            resolve(results);
        });
    });
}

function fetchEmails(imap, results, folder) {
    return new Promise((resolve, reject) => {
        const fetchOptions = { bodies: '' };
        const f = imap.fetch(results, fetchOptions);

        f.on('message', (msg, seqno) => {
            console.log(`Fetching email ${seqno} from ${folder}`);
            msg.on('body', async (stream, info) => {
                try {
                    const parsed = await simpleParser(stream);
                    console.log(`Email found in ${folder}: ${parsed.subject}`);
                } catch (err) {
                    console.error(`Error parsing email body in ${folder}:`, err.message);
                }
            });
        });

        f.once('error', (err) => {
            console.log('Fetch error:', err.message);
            reject(err);
        });

        f.once('end', () => {
            console.log(`Finished fetching emails from ${folder}`);
            resolve();
        });
    });
}


export default checkEmailDelivery;
