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
const {Email,isEmailValid,MAX_EMAIL_ADDR_LENGTH,VALID_EMAIL_REGEXP} = require('../utilities/email');
const {Fisl, MAX_BUFFER_SIZE,DEFAULT_BUFFER_TYPE} = require('../utilities/Fisl');
const stripe_payment_object = require("stripe")(`${process.env.BASH_BALLOONS_STRIPE_SECRET_KEY}`);
const {
    safeAgainstSqlAndShellInjection,
    isValidPhoneNumber,
    isValidTextMessage
} = require('../utilities/functions');


const checkOutValidation = [
    check('completename').isLength({ min: 5, max:MAX_BUFFER_SIZE }).withMessage('Please enter your full name.'),
    check('email').isLength({min:6, max:MAX_EMAIL_ADDR_LENGTH}).isEmail().normalizeEmail().withMessage('Please enter a valid email address.'),
    check('street_address').isLength({ min: 5, max:MAX_BUFFER_SIZE }).withMessage('Please enter your street address.'),
    check('city').isLength({ min: 2, max:MAX_BUFFER_SIZE }).withMessage('Please enter your city.'),
    check('state').isLength({ min: 2, max:MAX_BUFFER_SIZE }).withMessage('Please enter your state.'),
    check('zipcode').isLength({ min: 5, max:5 }).withMessage('Please a valid zipcode.'),
    check('phone').isLength({ min: 5, max:10 }).withMessage('Please enter your phone number.'),
    check('order_note').isLength({ min: 5, max:MAX_BUFFER_SIZE }).withMessage('Please enter your order note.'),
];


const {
    CHECKOUT_ROUTE,
    SUCCESS_PAYMENT_ROUTE
} = require('../utilities/routes_constant_names');
module.exports = () => {
    router.post('/', checkOutValidation,csrfProtection, async (request, response) => {
         
        if (typeof request.session.userCart === "undefined" || request.session.userCart == undefined || Object.keys(request.session.userCart).length === 0 || !request.session.userCart || request.session.userCart == {} || request.session.userCart == null ) {
            response.redirect(200, '/');
            response.end(); 
        };

        var userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        /* Use buffers to prevent buffer overflow  */
        /*
        var completename = new String(request.body.completename);
        if (completename.length > MAX_BUFFER_SIZE )
            completename = completename.substring(0,MAX_BUFFER_SIZE);
        var email = new String(request.body.email);
        if (email.length > MAX_EMAIL_ADDR_LENGTH )
            email = email.substring(0,MAX_EMAIL_ADDR_LENGTH);
        var city = new String(request.body.city);
        if (city.length > MAX_BUFFER_SIZE )
            city = city.substring(0,MAX_BUFFER_SIZE);
        var state = new String(request.body.state);
        if (state.length > MAX_BUFFER_SIZE )
            state = state.substring(0,MAX_BUFFER_SIZE);

        var zipcode = new String(request.body.zipcode);
        if (zipcode.length > MAX_BUFFER_SIZE )
            zipcode = zipcode.substring(0,MAX_BUFFER_SIZE);
        var phone = new String(request.body.phone);
        if (phone.length > MAX_BUFFER_SIZE )
            phone = phone.substring(0,MAX_BUFFER_SIZE);
        
        var street_address = new String(request.body.street_address);
        if (street_address.length > MAX_BUFFER_SIZE )
            street_address = street_address.substring(0,MAX_BUFFER_SIZE);
        var order_note = new String(request.body.order_note);
        if (order_note.length > MAX_BUFFER_SIZE )
            order_note = order_note.substring(0,MAX_BUFFER_SIZE);
        */
        /* lets log what we have so far */

        /*
        console.log(`complete name passed: ${completename}`);
        console.log(`email passed: ${email}`);
        console.log(`city passed: ${city}`);
        console.log(`state passed: ${state}`);
        console.log(`zipcode passed: ${zipcode}`);
        console.log(`phone passed: ${phone}`);
        console.log(`street address passed: ${street_address}`);
        console.log(`order note: ${order_note}`);

        const fislCompleteName = new Fisl() ;   
        fislCompleteName.overLoadConstructor(completename.length, completename, DEFAULT_BUFFER_TYPE); 
        const fislEmail = new Fisl() ;   
        fislEmail.overLoadConstructor(email.length, email, DEFAULT_BUFFER_TYPE);  
        const fislCity = new Fisl() ;   
        fislCity.overLoadConstructor(city.length, city, DEFAULT_BUFFER_TYPE);  
        const fislState = new Fisl() ;   
        fislState.overLoadConstructor(state.length, state, DEFAULT_BUFFER_TYPE);  
        const fislZipCode = new Fisl() ;   
        fislZipCode.overLoadConstructor(zipcode.length, zipcode, DEFAULT_BUFFER_TYPE);   
        const fislPhone = new Fisl() ;   
        fislPhone.overLoadConstructor(phone.length, phone, DEFAULT_BUFFER_TYPE); 
        const fislStreetAddress = new Fisl() ;   
        fislStreetAddress.overLoadConstructor(street_address.length, street_address, DEFAULT_BUFFER_TYPE);   
        const fislOrderNote = new Fisl() ;   
        fislOrderNote.overLoadConstructor(order_note.length, order_note, DEFAULT_BUFFER_TYPE);  
        
        /* Get form data first, and sanitize or reject if necessary */
        /*
        completename = fislCompleteName.toString();
        console.log(`complete name passed: ${completename}`);
        email = fislEmail.toString();
        console.log(`email passed: ${email}`);
        city = fislCity.toString();
        console.log(`city passed: ${city}`);
        state = fislState.toString();
        console.log(`state passed: ${state}`);
        zipcode = fislZipCode.toString();
        console.log(`zipcode passed: ${zipcode}`);
        phone = fislPhone.toString();
        console.log(`phone passed: ${phone}`);
        street_address = fislStreetAddress.toString();
        console.log(`street address passed: ${street_address}`);
        order_note = fislOrderNote.toString();
        console.log(`order note: ${order_note}`);
        */
       /* Get form data first, and sanitize or reject if necessary */
       const completename = new String(request.body.completename);
       const email = new String(request.body.email) ;
       const city = new String(request.body.city) ;
       const state = new String(request.body.state) ;
       const zipcode = new String(request.body.zipcode) ;
       const phone = new String(request.body.phone) ; 
       const street_address = new String(request.body.street_address) ;
       const order_note = new String(request.body.order_note);
        //Check email is valid
        
        const emailValidation = await isEmailValid(email) ;
        if (!emailValidation && !emailValidation.valid && emailValidation.valid === false && !VALID_EMAIL_REGEXP.test(email)) {
            //email is not valid
            response.status(400).send(`Something wrong with your form.`); 
            //console.log(`bad email validation test`);
            return ;
        };
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
        //check if any bad characters are within the order_note
       
        const validCompleteName = isValidTextMessage(completename) && safeAgainstSqlAndShellInjection(completename);
        const validStreetAddress = isValidTextMessage(street_address) &&  safeAgainstSqlAndShellInjection(street_address);
        const validCity = isValidTextMessage(city) && safeAgainstSqlAndShellInjection(city);
        const validState = isValidTextMessage(state) && safeAgainstSqlAndShellInjection(state);
        const validZipCode = isValidTextMessage(zipcode) && safeAgainstSqlAndShellInjection(zipcode);
        const validPhone = isValidPhoneNumber(phone) ;
        const validOrderNote= isValidTextMessage(order_note) && safeAgainstSqlAndShellInjection(order_note);
       
        if (!validCompleteName) {
            response.status(400).send(`Please check the name entered`); 
           return ;
        } ;
        
        if (!validStreetAddress) {
            response.status(400).send(`Please check the street address`); 
           return ;
        } ;
        if (!validCity) {
            response.status(400).send(`Please check the city entered`); 
           return ;
        } ;
        if (!validState) {
            response.status(400).send(`Please check the state.`); 
           return ;
        } ;
        if (!validZipCode) {
            response.status(400).send(`Please check the zip code`); 
           return ;
        } ;
        if (!validPhone) {
            response.status(400).send(`Please check the phone number.`); 
           return ;
        } ;
        if (!validState) {
            response.status(400).send(`Please check the state.`); 
           return ;
        } ;
        if (!validOrderNote) {
            response.status(400).send(`Please check the order note`); 
           return ;
        } ;
       

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

            //List of items for stripe payment
            let productLineItems = [] ;
            //console.log(`order : oneOrderItemInsertSQL : ${oneOrderItemInsertSQL.length} : ${oneOrderItemInsertData.length}`);

            var emailOrderBodyHtml = "" ;
            var allIndividualItems = JSON.parse(JSON.stringify(userCart)) ;
            //emailOrderBodyHtml += "<table>";
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
                emailOrderBodyHtml += `\t\t\t\t<td>${parseFloat(itemDetails.unitPrice).toFixed(2)}</td>\n`;
                emailOrderBodyHtml += `\t\t\t\t<td>$${itemsSubTotal.toFixed(2)}</td>\n`;
                emailOrderBodyHtml += `\t\t\t</tr>\n`;
               
                var oneOrderItemInsertSQL = "INSERT INTO `order_category_items` VALUES(?, ?, ?, ?, ?, ?)";
                var oneOrderItemInsertData = [
                    order_category_items_id,
                    order_id,
                    itemDetails.category_id,
                    individualItem.quantity,
                    parseFloat(itemDetails.unitPrice).toFixed(2),
                    parseFloat(itemsSubTotal).toFixed(2)
                ];
                productLineItems.push({
                    price_data:{
                        currency: 'usd',
                        product_data:{
                            name:itemDetails.item_name
                        },
                        unit_amount: parseInt(parseFloat(itemDetails.unitPrice).toFixed(2)*100.0),
                    },
                    quantity:individualItem.quantity,
                });
                
                transactionQueries.push(oneOrderItemInsertSQL);
                transactionData.push(oneOrderItemInsertData);
               
            } ;
           
            orderInsertArray[3] = parseFloat(grandTotal).toFixed(2) ;
            con.execute('START TRANSACTION');
            
            for (var k = 0; k < transactionQueries.length; k++) {
                var query = transactionQueries[k];
                var data = transactionData[k];
                //console.log(`Executing query: ${query} with params: ${data}`);
                await con.execute(query, data, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                        //con.execute('ROLLBACK');
                        throw new Error(error);
                    } 
                });
            }
         
            
            /*
            //Stripe payment will be done later
            const protocol = request.protocol;
            const host = request.hostname;
            const originalUrl = request.originalUrl;
            const port = request.locals.port;
            var fullUrl = '';
            if (`${port}` != `80` )
                fullUrl = `${protocol}://${host}:${port}` ;
            else
                fullUrl = `${protocol}://${host}` ;
            var successfullPaymentUrl = `${fullUrl}/${SUCCESS_PAYMENT_ROUTE}?session_id={CHECKOUT_SESSION_ID}`;
            
            const session = await stripe_payment_object.checkout.sessions.create({
                line_items: productLineItems,
                mode: 'payment',
                success_url: `${successfullPaymentUrl}`,
                cancel_url: `${fullUrl}/${CHECKOUT_ROUTE}/`,
            });

            successfullPaymentUrl = `${fullUrl}/${SUCCESS_PAYMENT_ROUTE}?session_id=${session.id}`;
            */
            //console.log(`\n\n\nsuccessful payment url: ${successfullPaymentUrl} \n\n\n\n`);
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
            console.log(`Error on ${__filename} :  ${error.message}`);
            response.status(400).send('Error processing your order');
            return ;
            
        };
        var orderHtml = `<html>\n`;
        orderHtml += `<head>\n`;
        orderHtml += `<title>Order Confirmation</title>\n`;
        orderHtml += `<style>
                    table, tr, th, td {
                    border: 1px solid black;
                    border-collapse: collapse;
                    }
        </style>\n`;
        orderHtml += `</head>\n`;
        //orderHtml += `<script>${jqueryCode}</script>\n`;
        orderHtml += `<body>\n`;
        orderHtml += `\t<div class="container">\n`;
        orderHtml += `\t\t<h1>Order Confirmation</h1>\n`;      
        orderHtml += `\t\t<h3>Customer Phone : ${phone}</h3>\n`;
        orderHtml += `\t\t<h3>Customer Full Name : ${completename}</h3>\n`;
        orderHtml += `\t\t<h3>Customer Email : ${email}</h3>\n`;
        orderHtml += `\t\t<h3>Street Address : ${street_address}</h3>\n`;
        orderHtml += `\t\t<h3>City : ${city}</h3>\n`;
        orderHtml += `\t\t<h3>State : ${state}</h3>\n`;
        orderHtml += `\t\t<h3>Zip Code : ${zipcode}</h3>\n`;
        orderHtml += `\t\t<h3>Customer Order Note : ${order_note}</h3>\n`;
        orderHtml += `\t\t<h2>Order Details</h2>\n`;
        orderHtml += `\t\t<table class="table table-striped table-hover">\n`;
        //orderHtml += `\t\t\t<thead>\n`; 
        orderHtml += `\t\t\t\t<tr>\n`;
        orderHtml += `\t\t\t\t\t<th>Ordered Item</th>\n`;
        orderHtml += `\t\t\t\t\t<th>Quantity</th>\n`;
        orderHtml += `\t\t\t\t\t<th>Unit Cost</th>\n`;
        orderHtml += `\t\t\t\t\t<th>Sub Total in USD</th>\n`;
        orderHtml += `\t\t\t\t</tr>\n`;
        //orderHtml += `\t\t\t</thead>\n`;
        //orderHtml += `\t\t<tbody>\n`;
        orderHtml += `${emailOrderBodyHtml}`;
        orderHtml += `\t\t\t<tr>\n`;
        orderHtml += `\t\t\t\t<td>\n`;
        orderHtml += `\t\t\t\t<b>Grand Total : </b>\n`;
        orderHtml += `\t\t\t\t</td>\n`;
        orderHtml += `\t\t\t\t<td colspan=3>\n`;
        orderHtml += `\t\t\t\t<b>$${grandTotal.toFixed(3)}</b>\n`; 
        orderHtml += `\t\t\t\t</td>\n`;
        orderHtml += `\t\t\t</tr>\n`;
        
        //orderHtml += `\t\t\t\t</tbody>\n`;
        orderHtml += `\t\t\t</table>\n`;
        orderHtml += `\t\t</div>\n`;
        orderHtml += `\t</body>\n`;
        orderHtml += `</html>\n`;
        
        /* send the email */
        var emailSender = new Email();
        const orderConfirmationNumber = order_id ;
        var mailOptions = { 
            from: process.env.BCC_ORDER_EMAIL,
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
                //response.redirect(`${successfullPaymentUrl}`);
                //console.log(`Order Confirmation Email sent: ${JSON.stringify(result)}`);
                response.status(200).send(`Order processed successfully<br/>\nYou will receive a confirmation email`);
                return ;
            
            }
        )
        .catch((error) => {
            console.log(`\n\n\\n Error happened: ${error.message} \n\n\n`);
            response.redirect(`/${CHECKOUT_ROUTE}`);
            
        });

    });

    router.get('/', csrfProtection,async(request, response) => { 
        
        var userCart = {} ;
        
        var categories = await JSON.parse(JSON.stringify(request.session.categories));
        
        if (request.session.userCart)
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        
        var user = {} ;
        if (request.session.user && request.session.user.email)
            user = JSON.parse(JSON.stringify(request.session.user)) ;
        //console.log('Passed cart : ' + JSON.stringify(userCart, null, 4));
        response.render('layout', 
            { 
                pageTitle: 'Cart Checkout', 
                template: 'checkout', 
                userCart: userCart,
                error: null,
                success:null,
                user:user,
                IMG_DIR_FOR_WEB : request.session.IMG_DIR_FOR_WEB,
                csrfToken: request.csrfToken(),
                categories: categories,
                decode: decode,
                encode: encode
                
            }
        );
    });
     
    return router;
};

