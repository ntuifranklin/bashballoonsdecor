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

        
//read jquery file stream and css stream into a string 
const jqueryCode = fs.readFileSync(`${process.env.BOOTSTRAP_JS_FILE}`).toString();
const bootstrapCode = fs.readFileSync(`${process.env.BOOTSTRAP_CSS_FILE}`).toString(); ;


module.exports = () => {
    router.post('/', async (request, response) => {
         
        if (request.session.userCart == undefined || Object.keys(request.session.userCart).length === 0 || !request.session.userCart || request.session.userCart == {} || request.session.userCart == null ) {
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
            con = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME
            });
            // con.connect();
            // Start Transaction
            await con.beginTransaction();
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
            
            try {
                // Insert customers
                await con.batch(
                    "INSERT INTO customers VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    customerInsertArray
                );

                
                var orderInsertArray = [
                    order_id,
                    customer_id,
                    new Date().toISOString().slice(0, 19).replace('T', ' '),
                    0.0, //total_amount
                    'pending',//payment_status
                    '' //paypal_transaction_id
                ] ;
                await con.batch(
                    "INSERT INTO orders VALUES(?, ?, ?, ?, ?, ?)",
                    orderInsertArray
                );
                
                
            } catch(err){
                console.error("Error loading data, reverting changes: ", err);
                con.rollback();
                /* If an error occured, just tell the user something went wrong */
                response.render('layout',{ 
                            pageTitle: 'Checkout', 
                            template: 'checkout', 
                            userCart: userCart,
                            csrfToken: request.csrfToken(),
                            success:null,
                            error: "An error occured while processing your order. Please try again later."
                });
                

            } ;
            // Commit Changes

        } catch (error) {

            console.error("Error loading data, reverting changes: ", error);
            await con.rollback();/* If an error occured, just tell the user something went wrong */
            
            
            response.render('layout',{ 
                pageTitle: 'Checkout', 
                template: 'checkout', 
                userCart: userCart,
                csrfToken: request.csrfToken(),
                success: null ,
                error: "An error occured while processing your order. Please try again later."
            });

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
                individualItemsInsert.push([
                    order_individualItemID,
                    order_id,
                    itemDetails.individItemID,
                    individualItem.quantity,
                    itemDetails.individItemUnitCost,
                    itemsSubTotal,
                ]);
                
            } ;
            //now insert into the database
            try {
                await con.batch(
                    "INSERT INTO order_individualItems VALUES(?, ?, ?, ?, ?, ?)",
                    individualItemsInsert
                );
            } catch(err){
                console.error("Error loading data, reverting changes: ", err);
                await con.rollback();
                
                /* If an error occured, just tell the user something went wrong */
                response.render('layout',{ 
                            pageTitle: 'Checkout', 
                            template: 'checkout', 
                            userCart: userCart,
                            csrfToken: request.csrfToken(),
                            success:null,
                            error: "An error occured while processing your order. Please try again later."
                });
                
            } ;
        }

        var order_packagesInsert = [] ;
        if ("package" in userCart) {
            var allPackages = JSON.parse(JSON.stringify(userCart["package"])) ;
            var order_packageid = await generateUniqueID(con=con, tableName="order_package", keyFieldName="order_packageid") ;
            for (var packageKey in allPackages)  { 
                var package = JSON.parse(JSON.stringify(allPackages[packageKey]));
                var packageDetails = JSON.parse(JSON.stringify(package["packageDetails"])) ;
                var packageSubTotal = package["quantity"] * packageDetails["packagecost"] ;
                totalItems += package.quantity ;
                grandTotal += packageSubTotal ; 
                orderHtml += `\t\t\t<tr>\n`;
                orderHtml += `\t\t\t\t<td>${packageDetails["packagedesc"]}</td>\n`;
                orderHtml += `\t\t\t\t<td>${package["quantity"]}</td>\n`;
                orderHtml += `\t\t\t\t<td>${packageDetails["packagecost"]}</td>\n`;
                orderHtml += `\t\t\t\t<td>$${packageSubTotal}</td>\n`;
                orderHtml += `\t\t\t</tr>\n`;
                order_packagesInsert.push([
                    order_packageid,
                    order_id,
                    packageDetails["packageid"],
                    package["quantity"],
                    packageDetails["packagecost"],
                    packageSubTotal,
                ]);
            }
            //now insert into the database
            try {
                await con.batch(
                    "INSERT INTO order_package VALUES(?, ?, ?, ?, ?, ?)",
                    order_packagesInsert
                );
            } catch(err){
                console.error("Error loading data, reverting changes: ", err);
                con.rollback();
                
                /* If an error occured, just tell the user something went wrong */
                response.render('layout',{ 
                            pageTitle: 'Checkout', 
                            template: 'checkout', 
                            userCart: userCart,
                            csrfToken: request.csrfToken(),
                            success: null,
                            error: "An error occured while processing your order. Please try again later."
                });
            } ;
        }


        con.commit();
        con.end();
         
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
        response.render('layout',{ 
            pageTitle: 'Checkout', 
            template: 'checkout', 
            userCart: userCart,
            error: null,
            success: "Your order is currently being processed. You will receive an email confirmation shortly.",
            csrfToken: request.csrfToken()
        });

    });

    router.get('/', (request, response) => { 
        
        var userCart = {} ;
        if (request.session.userCart)
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        //console.log('User Cart in cart.js: ' + JSON.stringify(userCart, null, 4));
        response.render('layout', 
                        { 
                            pageTitle: 'Checkout', 
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

