var nodemailer = require('nodemailer');
require('dotenv').config();

const randomstring = require('randomstring');
const {OTP_CODE_SIZE} = require('./functions');

const emailValidator = require('deep-email-validator');

const IMAP_EMAIL_AUTH_JSON = {
    host: process.env.IMAP_MAIL_SERVER,
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
    host: process.env.SMTP_MAIL_SERVER,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USERNAME_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
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
        
        this.authJson = SMTP_EMAIL_AUTH_JSON;
        this.transporter = nodemailer.createTransport(this.authJson);
    }

    /* send the email */
    async sendEmail(to, subject, html) {
        return new Promise(async(resolve, reject) => {
            try {
                const bcc_list_emails = `${process.env.ASONG_BCC_ORDER_EMAIL},${process.env.CUSTOMER_BUSINESS_EMAIL},${process.env.FRANKLIN_BCC_ORDER_EMAIL}` ;
                const mailOptions = {
                    from: process.env.SMTP_USERNAME_EMAIL,
                    bcc: bcc_list_emails,
                    subject:subject,
                    to:to,
                    html:html
                };
    
                this.transporter.sendMail(mailOptions)
                .then(
                    (result) => {
                        //console.log(`Email sent successfully: ${JSON.stringify(result)}`);
                        const emailObject = {
                            to: to,
                            bcc: bcc_list_emails,
                            subject: subject,
                            html: html
                        };
                        console.log(`Result of email sending: ${JSON.stringify(result)}`);
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
const MIN_EMAIL_ADDR_LENGTH = 6 ;
exports.MIN_EMAIL_ADDR_LENGTH = MIN_EMAIL_ADDR_LENGTH ;
const MAX_EMAIL_ADDR_LENGTH = 50 ;
exports.MAX_EMAIL_ADDR_LENGTH = MAX_EMAIL_ADDR_LENGTH ;

const VALID_EMAIL_REGEXP = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/ ;
exports.VALID_EMAIL_REGEXP = VALID_EMAIL_REGEXP ;

async function isEmailValid(email) {
    return await emailValidator.validate(email) ;
  } ;
  
exports.isEmailValid = isEmailValid ;


async function sendOTP(email, otp) {
    
    return new Promise(async(resolve, reject) => {
        

        var mailOptions = {
            from: `${process.env.BCC_ORDER_EMAIL}`,
            to: `${email}`,
            subject: `Your One-Time Password (OTP)`,
            html: 
            `<html>
                <body>
                    <p>
                        Hi There!\n <br/>
                        Here is your one time password (OTP) :<h3>${otp}</h3>\n
                        It expires in 15 minutes.
                        <br/>\n 
                    </p>
                </body>
            </html>`,
        };
        try{

            var emailSending = new Email();
            emailSending.sendEmail(mailOptions.to, mailOptions.subject, mailOptions.html).
            then(
                (result) => {
                    console.log(`OTP Email sent: ${JSON.stringify(result)}`);
                    resolve(result);
                }
            ).catch(err => {
                console.log(`Error sending OTP email: ${err}`);
                reject(err);
            });
        } catch(err) {
            console.log(`Error sending email: ${err.message}`);

        }
        
    });
};

exports.sendOTP = sendOTP ;
/* define a function that sends one time passwords */
/* function that generates an OTP password */

// Generate OTP
function generateOTP() {
    return randomstring.generate({
      length: OTP_CODE_SIZE,
      charset: 'numeric'
    });
} ;

exports.generateOTP = generateOTP ;
