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

const {MySQLDBConnector, defaultMySQLDBConnectorConfig} = require('../database/models/MySQLDBConnector');

const {decode,encode} = require('html-entities');
const mysql2 = require('mysql2');
//read jquery file stream and css stream into a string 
const jqueryCode = fs.readFileSync(`${process.env.BOOTSTRAP_JS_FILE}`).toString();
const bootstrapCode = fs.readFileSync(`${process.env.BOOTSTRAP_CSS_FILE}`).toString(); 
const {Email} = require('../utilities/email');



const checkOutValidation = [
    check('completename').isLength({ min: 5, max:255 }).withMessage('Please enter your full name.'),
    check('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address.'),
    check('street_address').isLength({ min: 5, max:255 }).withMessage('Please enter your street address.'),
    check('city').isLength({ min: 2, max:255 }).withMessage('Please enter your city.'),
    check('state').isLength({ min: 2, max:255 }).withMessage('Please enter your state.'),
    check('zipcode').isLength({ min: 5, max:5 }).withMessage('Please a valid zipcode.'),
    check('phone').isLength({ min: 5, max:16 }).withMessage('Please enter your phone number.'),
    check('order_note').isLength({ min: 5, max:255 }).withMessage('Please enter your order note.'),
];
module.exports = () => {
    router.post('/', checkOutValidation,csrfProtection, async (request, response) => {
         
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

        //============================================
        /* Begin sanitize from data here */
        const formerrors = validationResult(request);
        if (!formerrors.isEmpty()) {
            const err_message = formerrors.array().map(i => i.msg).join('<br>');
            //console.log(`Error processing form: ${JSON.stringify(formerrors.array(), null, 4)}`);
            response.status(400).send(`${err_message}`); 
            return ;
        };
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
        
        let pool = null ;
        let con = null ;
        
        pool = mysql2.createPool(defaultMySQLDBConnectorConfig);
        con = pool;
        
        var transactionQueries = [];
        var transactionData = [];
        
        var totalItems = 0 ;
        
        var grandTotal = 0.0 ;
        try {
            pool = await MySQLDBConnector.getPool();
            con = pool;
            //generate new order id
            var order_id = await generateUniqueID(con=con, tableName="orders", keyFieldName="order_id", size=64) ;
            //generate new customer id
            var customer_id = await generateUniqueID(con=con, tableName="customers", keyFieldName="customer_id", size=16) ;
            const customerInsertSql = "INSERT INTO customers VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)";
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
            transactionQueries.push(customerInsertSql);
            transactionData.push(customerInsertArray);
            
            //console.log(`customer : oneOrderItemInsertSQL : ${transactionQueries.length} : ${transactionData.length}`);

            // Insert customers
            
                        
            var orderInsertArray = [
                order_id,
                customer_id,
                new Date().toISOString().slice(0, 19).replace('T', ' '),
                0.0, //total_amount
                'pending',//payment_status
                '' //paypal_transaction_id
            ] ;
            var orderInsertSql = "INSERT INTO orders VALUES(?, ?, ?, ?, ?, ?)";
            
            transactionData.push(orderInsertArray);
            transactionQueries.push(orderInsertSql);
            
            //console.log(`order : oneOrderItemInsertSQL : ${oneOrderItemInsertSQL.length} : ${oneOrderItemInsertData.length}`);

            var emailOrderBodyHtml = "" ;
            var allIndividualItems = JSON.parse(JSON.stringify(userCart)) ;
            for(var itemKey in allIndividualItems)  {
                var  order_category_items_id = await generateUniqueID(con=con, tableName="order_category_items", keyFieldName="order_category_items_id", size=64) ;
               
                emailOrderBodyHtml += `\t\t\t<tr>\n`;

                var individualItem = JSON.parse(JSON.stringify(allIndividualItems[itemKey])) ;
                var itemDetails = JSON.parse(JSON.stringify(individualItem["itemDetails"])) ;
                totalItems += individualItem.quantity ;
                var itemsSubTotal = individualItem.quantity * itemDetails.unitPrice ;
                grandTotal += itemsSubTotal ; 

                emailOrderBodyHtml += `\t\t\t\t<td>${itemDetails.item_name}</td>\n`;
                emailOrderBodyHtml += `\t\t\t\t<td>${individualItem.quantity}</td>\n`;
                emailOrderBodyHtml += `\t\t\t\t<td>${itemDetails.unitPrice}</td>\n`;
                emailOrderBodyHtml += `\t\t\t\t<td>$${itemsSubTotal}</td>\n`;
                emailOrderBodyHtml += `\t\t\t</tr>\n`;
               
                var oneOrderItemInsertSQL = "INSERT INTO `order_category_items` VALUES(?, ?, ?, ?, ?, ?)";
                var oneOrderItemInsertData = [
                    order_category_items_id,
                    order_id,
                    itemDetails.category_id,
                    individualItem.quantity,
                    itemDetails.unitPrice,
                    itemsSubTotal
                ];
                
                transactionQueries.push(oneOrderItemInsertSQL);
                transactionData.push(oneOrderItemInsertData);
                //console.log(`one item : oneOrderItemInsertSQL : ${transactionQueries.length} : ${transactionData.length}`);
            } ;

            /*
            MySQLDBConnector.executeInTransactionMode(transactionQueries, transactionData);
            */
           //update grand total before starting transaction
           orderInsertArray[3] = grandTotal ;
            con.execute('START TRANSACTION');
            
            for (var k = 0; k < transactionQueries.length; k++) {
                var query = transactionQueries[k];
                var data = transactionData[k];
                console.log(`Executing query: ${query} with params: ${data}`);
                await con.execute(query, data, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                        //con.execute('ROLLBACK');
                        throw new Error(error);
                    } 
                });
            }
            
            
            con.execute('COMMIT', function (error, results, fields) {
                if (error) {
                    console.log(error);
                    //con.execute('ROLLBACK');
                    throw new Error(error);
                } 
            });
            

        } catch (error) {

            console.error("Error loading data, reverting changes: ", error);
            var rollBack = await con.execute('ROLLBACK');
            
            response.status(400).send({ message: `${error.message}`, responseText: 'Error processing your order' });
            return ;

        };
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
        orderHtml += `${emailOrderBodyHtml}`;
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
        var emailSender = new Email();
        const orderConfirmationNumber = uuidv4() ;
        var mailOptions = { 
            from: process.env.BCC_ORDER_EMAIL,
            bcc: `${process.env.BCC_ORDER_EMAIL}, ${process.env.ADMIN_DEVELOPER_EMAIL}`,
            subject: `Order Confirmation: ${orderConfirmationNumber}`,
            to: email,
            html: orderHtml
        };
        emailSender.sendEmail(mailOptions.to, mailOptions.subject, mailOptions.html)
        .then(
            (result) => {
                /* update the cart in the locals variable */
                request.session.userCart = {} ;
                request.session.save();
                console.log(`Order Confirmation Email sent: ${JSON.stringify(result)}`);
                response.status(200).send({ message: `Order Confirmation Email sent: ${JSON.stringify(result)}`, responseText: 'Order processed successfully' });
                return ;
            }
        )
        .catch((error) => {
            console.log(`Error sending email: ${error}`);
            response.status(400).send({ message: `${error.message}`, responseText: 'Error processing your order' });
            return ;
        });

    });

    router.get('/', csrfProtection,async(request, response) => { 
        
        var userCart = {} ;
        
        var categories = await JSON.parse(JSON.stringify(request.session.categories));
        
        if (request.session.userCart)
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        
        //console.log('Passed cart : ' + JSON.stringify(userCart, null, 4));
        response.render('layout', 
            { 
                pageTitle: 'Cart Checkout', 
                template: 'checkout', 
                userCart: userCart,
                error: null,
                success:null,
                csrfToken: request.csrfToken(),
                categories: categories,
                decode: decode,
                encode: encode
                
            }
        );
    });
     
    return router;
};

