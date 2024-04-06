var nodemailer = require('nodemailer');
require('dotenv').config();
const IMAP_EMAIL_AUTH_JSON = {
    host: process.env.BOX_IMAP_MAIL_SERVER,
    port: process.env.IMAP_PORT,
    secure: true,
    auth: {
        user: process.env.IMAP_USERNAME_EMAIL,
        pass: process.env.IMAP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: true
    },
    debug: true,
    logger: true,

};
exports.IMAP_EMAIL_AUTH_JSON = IMAP_EMAIL_AUTH_JSON;

const SMTP_EMAIL_AUTH_JSON = {
    host: process.env.BOX_IMAP_MAIL_SERVER,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.BCC_ORDER_EMAIL,
        pass: process.env.BCC_ORDER_EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: true
    },
    debug: true,
    logger: true,

};
exports.SMTP_EMAIL_AUTH_JSON = SMTP_EMAIL_AUTH_JSON;

const FORWARD_EMAIL_AUTH_JSON = {
    host: process.env.FORWARD_EMAIL_NET_SMTP_SERVER,
    port: process.env.FORWARD_EMAIL_NET_SMTP_SECURE_OLD_PORT,
    secure: true,
    auth: {
        user: process.env.FORWARD_EMAIL_NET_EMAIL,
        pass: process.env.FORWARD_EMAIL_NET_PASSWORD,
    },
    tls: {
        rejectUnauthorized: true,
    },
    debug: true,
    logger: true,

};

exports.FORWARD_EMAIL_AUTH_JSON = FORWARD_EMAIL_AUTH_JSON ;

class Email {
    
    constructor() {
        
        this.authJson = FORWARD_EMAIL_AUTH_JSON;
        this.transporter = nodemailer.createTransport(this.authJson);
    }

    /* send the email */
    async sendEmail(to, subject, html) {
        return new Promise(async(resolve, reject) => {
            try {
                const mailOptions = {
                    from: process.env.FORWARD_EMAIL_NET_EMAIL,
                    bcc: `${process.env.FORWARD_EMAIL_NET_EMAIL}`,
                    subject:subject,
                    to:to,
                    html:html
                };
    
                this.transporter.sendMail(mailOptions)
                .then(
                    (result) => {
                        console.log(`Email sent successfully: ${JSON.stringify(result)}`);
                        const emailObject = {
                            to: to,
                            subject: subject,
                            html: html
                        };
                        resolve(`Email sent successfully ${emailObject}`);
                    }
                )
                .catch((error) => {
                    console.log(`Error sending email: ${error}`);
                    reject(`Error sending email: ${error}`);
                });
                
            } catch (error) {
                console.log(error);
                reject(`Error sending email : ${error}`);
            };
        });
    }
};
exports.Email = Email;