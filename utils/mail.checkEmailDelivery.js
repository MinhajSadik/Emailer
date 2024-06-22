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


function checkEmailDelivery() {
    const imap = new Imap(imapConfig);

    imap.once('ready', function () {
        console.log("IMAP connection ready");

        openInbox(imap)
            .then(() => searchEmails(imap, 'INBOX'))
            .then(results => {
                if (results.length === 0) {
                    console.log('No emails found in INBOX.');
                    return checkSpamFolder(imap);
                } else {
                    return fetchEmails(imap, results, 'INBOX');
                }
            })
            .catch(err => console.error("Error:", err.message));
    });

    imap.once('error', function (err) {
        console.log("IMAP error:", err.message);
    });

    imap.once('end', function () {
        console.log('Connection ended');
    });

    imap.connect();
}

function openInbox(imap) {
    return new Promise((resolve, reject) => {
        imap.openBox('INBOX', true, (err, box) => {
            if (err) return reject(err);
            console.log("INBOX opened");
            resolve(box);
        });
    });
}

function searchEmails(imap, folder) {
    const searchCriteria = [['FROM', 'contact@littleprogrammers.org'], ['SINCE', new Date(Date.now() - 24 * 60 * 60 * 1000)]];
    return new Promise((resolve, reject) => {
        console.log(`Searching emails in ${folder} with criteria:`, searchCriteria);
        imap.search(searchCriteria, (err, results) => {
            if (err) return reject(err);
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
                const parsed = await simpleParser(stream);
                console.log(`Email found in ${folder}: ${parsed.subject}`);
            });
        });

        f.once('error', (err) => {
            console.log('Fetch error:', err.message);
            reject(err);
        });

        f.once('end', () => {
            console.log(`Finished fetching emails from ${folder}`);
            imap.end();
            resolve();
        });
    });
}

function checkSpamFolder(imap) {
    return new Promise((resolve, reject) => {
        imap.openBox('[Gmail]/Spam', true, (err, box) => {
            if (err) return reject(err);
            console.log("Spam folder opened");

            searchEmails(imap, '[Gmail]/Spam')
                .then(results => {
                    if (results.length === 0) {
                        console.log('No emails found in Spam folder.');
                        imap.end();
                    } else {
                        return fetchEmails(imap, results, '[Gmail]/Spam');
                    }
                })
                .catch(err => reject(err));
        });
    });
}

export default checkEmailDelivery;
