const express = require('express');
const router = express.Router();
var mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');
const {generateUniqueID} = require('../database/controllers/database');
require('dotenv').config();
var nodemailer = require('nodemailer'); 
const fs = require('fs');

const bodyParser = require('body-parser');
var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });
const cookieSession = require('cookie-session');
var parseForm = bodyParser.urlencoded({ extended: true });
const { check,validationResult } = require('express-validator');
const mysql2 = require('mysql2');
        
//read jquery file stream and css stream into a string 
const jqueryCode = fs.readFileSync(`${process.env.BOOTSTRAP_JS_FILE}`).toString();
const bootstrapCode = fs.readFileSync(`${process.env.BOOTSTRAP_CSS_FILE}`).toString(); ;

const checkOutValidation = [
    check('completename').isLength({ min: 5 }).withMessage('Please enter your full name.'),
    check('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address.'),
    check('street_address').isLength({ min: 5 }).withMessage('Please enter your street address.'),
    check('city').isLength({ min: 2 }).withMessage('Please enter your city.'),
    check('state').isLength({ min: 2 }).withMessage('Please enter your state.'),
    check('zipcode').isLength({ min: 5 }).withMessage('Please enter your zipcode.'),
    check('phone').isLength({ min: 5 }).withMessage('Please enter your phone number.'),
    check('order_note').isLength({ min: 5 }).withMessage('Please enter your order note.'),
];
module.exports = () => {
    router.post('/', checkOutValidation, async (request, response) => {
         
        if (typeof request.session.userCart === "undefined" || request.session.userCart == undefined || Object.keys(request.session.userCart).length === 0 || !request.session.userCart || request.session.userCart == {} || request.session.userCart == null ) {
            response.redirect(200, '/');
            response.end(); 
        };

        var userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;

        /* Get form data first, and sanitize or reject if necessary */
        const completename = new String(request.body.completename);
        const email = new String(request.body.email) ;
        const city = new String(request.body.city) ;
        const state = new String(request.body.state) ;
        const zipcode = new String(request.body.zipcode) ;
        const phone = new String(request.body.phone) ;
        const street_address = new String(request.body.street_address) ;
        const order_note = new String(request.body.order_note);

        const formerrors = validationResult(request);
        if (!formerrors.isEmpty()) {
            const err_message = formerrors.array().map(i => i.msg).join('<br>');
            //console.log(`Error processing form: ${JSON.stringify(formerrors.array(), null, 4)}`);
            return response.status(400).send(`${err_message}`); 
        }
        //============================================
        /* Begin sanitize from data here */

        /* End Sanitize form data  */
        //============================================

        /* Loop through the cart and:
            - create arrays that will be inserted into the database in the following order : 
                * customer
                * order
                * order_individual_items if any
                * order_packages if any
            - generate an email that will recieve the order 
        */
        
        let con;
        try {
            con = await mysql2.createPool({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
            idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0
            });
            // con.connect();
            // Start Transaction
            con.execute('START TRANSACTION'); //con.beginTransaction() does not seem to work
            //generate new order id
            var order_id = await generateUniqueID(con=con, tableName="orders", keyFieldName="order_id") ;
            //generate new customer id
            var customer_id = await generateUniqueID(con=con, tableName="customers", keyFieldName="customer_id") ;
            const customerInsertArray = [
                customer_id, 
                completename, 
                email, 
                street_address,
                city, 
                state, 
                zipcode, 
                phone, 
                order_note] ;
            
              // Insert customers
            con.execute(
                "INSERT INTO customers VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)",
                customerInsertArray,
                async (err, results,fields) => {
                    if (err) {
                        console.error("Error inserting new customer, reverting changes: ", err);
                        await con.execute('ROLLBACK');//con.rollback();
                        /* If an error occured, just tell the user something went wrong */
                        return response.status(400).send({ message: `${err.message}`, responseText: 'Error processing your order' });
                    };
                }
            );

            
            var orderInsertArray = [
                order_id,
                customer_id,
                new Date().toISOString().slice(0, 19).replace('T', ' '),
                0.0, //total_amount
                'pending',//payment_status
                '' //paypal_transaction_id
            ] ;
            con.execute(
                "INSERT INTO orders VALUES(?, ?, ?, ?, ?, ?)",
                orderInsertArray,
                async (err, results,fields) => {
                    if (err) {
                        console.error("Error inserting new order, reverting changes: ", err);
                        await con.execute('ROLLBACK');//con.rollback();
                        /* If an error occured, just tell the user something went wrong */
                        return response.status(400).send({ message: `${err.message}`, responseText: 'Error processing your order' });
                    };
                }
            );
            

        } catch (error) {

            console.error("Error loading data, reverting changes: ", error);
            con.execute('ROLLBACK');//con.rollback();
            
            return response.status(400).send({ message: `${error.message}`, responseText: 'Error processing your order' });

        };
        var totalItems = 0 ;
        
        var grandTotal = 0.0 ;
        var orderHtml = `<html>\n`;

        orderHtml += `<head>\n`;
        orderHtml += `<title>Order Confirmation</title>\n`;
        orderHtml += `<style>${bootstrapCode}</style>\n`;
        orderHtml += `</head>\n`;
        orderHtml += `<script>${jqueryCode}</script>\n`;
        orderHtml += `<body>\n`;
        orderHtml += `\t<div class="container">\n`;
        orderHtml += `\t\t<h1>Order Confirmation</h1>\n`;
        orderHtml += `\t\t<h2>Order Details</h2>\n`;
        orderHtml += `\t\t<table class="table table-striped table-hover">\n`;
        orderHtml += `\t\t\t<thead>\n`; 
        orderHtml += `\t\t\t\t<tr>\n`;
        orderHtml += `\t\t\t\t\t<th>Ordered Item</th>\n`;
        orderHtml += `\t\t\t\t\t<th>Quantity</th>\n`;
        orderHtml += `\t\t\t\t\t<th>Unit Cost</th>\n`;
        orderHtml += `\t\t\t\t\t<th>Sub Total in USD</th>\n`;
        orderHtml += `\t\t\t\t</tr>\n`;
        orderHtml += `\t\t\t</thead>\n`;
        orderHtml += `\t\t<tbody>\n`;
        var individualItemsInsert = [] ;
        if ("IndividualItems" in userCart ) { 
            var allIndividualItems = JSON.parse(JSON.stringify(userCart["IndividualItems"])) ;
            for(var itemKey in allIndividualItems)  {
                var order_individualItemID = await generateUniqueID(con=con, tableName="order_individualItems", keyFieldName="order_individItemID") ;
                orderHtml += `\t\t\t<tr>\n`;
                var individualItem = JSON.parse(JSON.stringify(allIndividualItems[itemKey])) ;
                var itemDetails = JSON.parse(JSON.stringify(individualItem["individualItemDetails"])) ;
                totalItems += individualItem.quantity ;
                var itemsSubTotal = individualItem.quantity * itemDetails.individItemUnitCost ;
                grandTotal += itemsSubTotal ; 
                orderHtml += `\t\t\t\t<td>${itemDetails.individItemTitle}</td>\n`;
                orderHtml += `\t\t\t\t<td>${individualItem.quantity}</td>\n`;
                orderHtml += `\t\t\t\t<td>${itemDetails.individItemUnitCost}</td>\n`;
                orderHtml += `\t\t\t\t<td>$${itemsSubTotal}</td>\n`;
                orderHtml += `\t\t\t</tr>\n`;
                /* 
                    individualItemsInsert.push([
                    order_individualItemID,
                    order_id,
                    itemDetails.individItemID,
                    individualItem.quantity,
                    itemDetails.individItemUnitCost,
                    itemsSubTotal,
                ]);
                */
                con.execute(
                    "INSERT INTO order_individualItems VALUES(?, ?, ?, ?, ?, ?)",
                    [
                        order_individualItemID,
                        order_id,
                        itemDetails.individItemID,
                        individualItem.quantity,
                        itemDetails.individItemUnitCost,
                        itemsSubTotal,
                    ],
                    async (err, results,fields) => {
                        if (err) {
                            console.error("Error inserting order_individualItems, reverting changes: ", err);
                            await con.execute('ROLLBACK');//con.rollback();
                            /* If an error occured, just tell the user something went wrong */
                            return response.status(400).send({ message: `${err.message}`, responseText: 'Error processing your order' });
                        };
                    }
                );
                
            } ;
            //now insert into the database
           
        }

        var order_packagesInsert = [] ;
        if ("package" in userCart) {
            var allPackages = JSON.parse(JSON.stringify(userCart["package"])) ;
            var order_packageid = await generateUniqueID(con=con, tableName="order_package", keyFieldName="order_packageid") ;
            for (var packageKey in allPackages)  { 
                var packag = JSON.parse(JSON.stringify(allPackages[packageKey]));
                var packageDetails = JSON.parse(JSON.stringify(packag["packageDetails"])) ;
                var packageSubTotal = packag["quantity"] * packageDetails["packagecost"] ;
                totalItems += packag.quantity ;
                grandTotal += packageSubTotal ; 
                orderHtml += `\t\t\t<tr>\n`;
                orderHtml += `\t\t\t\t<td>${packageDetails["packagedesc"]}</td>\n`;
                orderHtml += `\t\t\t\t<td>${packag["quantity"]}</td>\n`;
                orderHtml += `\t\t\t\t<td>${packageDetails["packagecost"]}</td>\n`;
                orderHtml += `\t\t\t\t<td>$${packageSubTotal}</td>\n`;
                orderHtml += `\t\t\t</tr>\n`;
                order_packagesInsert.push([
                    order_packageid,
                    order_id,
                    packageDetails["packageid"],
                    packag["quantity"],
                    packageDetails["packagecost"],
                    packageSubTotal,
                ]);
            }
            //now insert into the database
           
            await con.execute(
                "INSERT INTO order_package VALUES(?, ?, ?, ?, ?, ?)",
                order_packagesInsert,
                async (err, results,fields) => {
                    if (err) {
                        console.error("Error inserting order_package, reverting changes: ", err);
                        await con.execute('ROLLBACK');//con.rollback();
                        /* If an error occured, just tell the user something went wrong */
                        return response.status(400).send({ message: `${err.message}`, responseText: 'Error processing your order' });
                    };
                }
            );
        }


        con.execute('COMMIT'); //await con.commit();
        
        //con.end();
         
        orderHtml += `\t\t\t<tr>\n`;
        orderHtml += `\t\t\t\t<td colspan=2>\n`;
        orderHtml += `\t\t\t\t<b>Grand Total : </b>\n`;
        orderHtml += `\t\t\t\t</td>\n`;
        orderHtml += `\t\t\t\t<td>\n`;
        orderHtml += `\t\t\t\t<b>$${grandTotal}</b>\n`; 
        orderHtml += `\t\t\t\t</td>\n`;
        orderHtml += `\t\t\t</tr>\n`;
        
        orderHtml += `\t\t\t\t</tbody>\n`;
        orderHtml += `\t\t\t</table>\n`;
        orderHtml += `\t\t</div>\n`;
        orderHtml += `\t</body>\n`;
        orderHtml += `</html>\n`;
        
        /* send the email */
        const authJson = {
            host: process.env.FORWARD_EMAIL_NET_SMTP_SERVER,
            port: process.env.FORWARD_EMAIL_NET_SMTP_PORT,
            secure: false,
            auth: {
            // TODO: replace `user` and `pass` values from:
            // <https://forwardemail.net/guides/send-email-with-custom-domain-smtp>
            user: process.env.FORWARD_EMAIL_NET_EMAIL,
            pass: process.env.FORWARD_EMAIL_NET_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false
            },
        };
        //console.log(`auth json ${JSON.stringify(authJson, null, 4)}}`);
        const transporter = nodemailer.createTransport({
            host: process.env.FORWARD_EMAIL_NET_SMTP_SERVER,
            port: process.env.FORWARD_EMAIL_NET_SMTP_PORT,
            secure: false,
            auth: {
            // TODO: replace `user` and `pass` values from:
            // <https://forwardemail.net/guides/send-email-with-custom-domain-smtp>
            user: process.env.FORWARD_EMAIL_NET_EMAIL,
            pass: process.env.FORWARD_EMAIL_NET_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false
            },
        });
        const orderConfirmationNumber = uuidv4() ;
        var mailOptions = {
            from: `${process.env.FORWARD_EMAIL_NET_EMAIL}`,
            to: `${email}`,
            bcc: `asong_nic@yahoo.com, ntuifranklin2005@gmail.com, ivoanu@gmail.com, ivoanu@yahoo.uk`,
            subject: `bashballoonsrentals.com of Order Confirmation ${orderConfirmationNumber}`,
            html: `${orderHtml}`
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log(`Email sent: ${info.response}`);
              //console.log(`HTML Sent : ---\n ${orderHtml}\n----\n---\n`);
            }
        });
        /* update the cart in the locals variable */
        request.session.userCart = {} ;
        request.locals.userCart = JSON.stringify(request.session.userCart) ;
        request.session.save();
        return response.status(200).send({ 
            message: `success`, 
            responseText: 'Your order is currently being processed. You will receive an email confirmation shortly.' 
        });

    });

    router.get('/', (request, response) => { 
        
        var userCart = {} ;
        if (request.session.userCart)
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        //console.log('User Cart in cart.js: ' + JSON.stringify(userCart, null, 4));
        response.render('layout', 
                        { 
                            pageTitle: 'Cart Checkout', 
                            template: 'checkout', 
                            userCart: userCart,
                            error: null,
                            success:null,
                            csrfToken: request.csrfToken()
                        }
        );
    });
     
    return router;
};

