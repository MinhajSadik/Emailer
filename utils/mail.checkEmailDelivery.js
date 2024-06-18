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
    console.log(imapConfig);
    const imap = new Imap(imapConfig);

    imap.once('ready', function() {

        console.log("IMAP connection ready");

        imap.openBox('INBOX', true, async (err, box) => {
            if (err) {
                console.error("Error opening INBOX:", err.message);
                return;
            }

            console.log("INBOX opened");

            const searchCriteria = [['FROM', 'contact@littleprogrammers.org'], ['SINCE', new Date()]];
            const fetchOptions = { bodies: '' };

            imap.search(searchCriteria, (err, results) => {
                if (err) {
                    console.error("Search error:", err.message);
                    return;
                }
                if (!results || results.length === 0) {
                    console.log('No emails found in INBOX.');
                    checkSpamFolder();
                    return;
                }

                console.log(`Found ${results.length} emails in INBOX`);

                const f = imap.fetch(results, fetchOptions);
                f.on('message', (msg, seqno) => {
                    msg.on('body', async (stream, info) => {
                        const parsed = await simpleParser(stream);
                        console.log(`Email found in INBOX: ${parsed.subject}`);
                        imap.end();
                    });
                });

                f.once('error', (err) => {
                    console.log('Fetch error:', err.message);
                });
            });
        });
    });

    function checkSpamFolder() {

        console.log("Checking Spam folder");

        imap.openBox('[Gmail]/Spam', true, (err, box) => {

            if (err) {
                console.error("Error opening Spam folder:", err);
                return;
            }

            console.log("Spam folder opened");

            const searchCriteria = [['FROM', 'contact@littleprogrammers.org'], ['SINCE', new Date()]];
            const fetchOptions = { bodies: '' };

            imap.search(searchCriteria, (err, results) => {
                if (err) {
                    console.error("Search error:", err.message);
                    return;
                }
                if (!results || results.length === 0) {
                    console.log('No emails found in Spam folder.');
                    imap.end();
                    return;
                }

                console.log(`Found ${results.length} emails in Spam folder`);

                const f = imap.fetch(results, fetchOptions);
                f.on('message', (msg, seqno) => {
                    msg.on('body', async (stream, info) => {
                        const parsed = await simpleParser(stream);
                        console.log(`Email found in Spam folder: ${parsed.subject}`);
                        imap.end();
                    });
                });

                f.once('error', (err) => {
                    console.log('Fetch error:', err.message);
                });
            });
        });
    }

    imap.once('error', function(err) {
        console.log("IMAP error:", err.message);
    });

    imap.once('end', function() {
        console.log('Connection ended');
    });

    imap.connect();
}

export default checkEmailDelivery;
