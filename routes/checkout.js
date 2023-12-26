const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
var nodemailer = require('nodemailer'); 
const fs = require('fs');

        
//read jquery file stream and css stream into a string 
const jqueryCode = fs.readFileSync(`${process.env.BOOTSTRAP_JS_FILE}`).toString();
const bootstrapCode = fs.readFileSync(`${process.env.BOOTSTRAP_CSS_FILE}`).toString(); ;


module.exports = () => { 
    
        
    router.post('/', (request, response) => {
         
        if (request.session.userCart == undefined || Object.keys(request.session.userCart).length === 0 || !request.session.userCart || request.session.userCart == {} || request.session.userCart == null ) {
            response.redirect(200, '/');
            response.end(); 
        };
        /* Loop throgh the cart and generate an email that will recieve the order */
        var userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        var totalItems = 0 ;
        
        var grandTotal = 0.0 ;
        var orderHtml = `<html>\n`;
       /*
       <div class="container-fluid">
  ...
</div>
       
       */

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
        orderHtml += `\t\t\t\t\t<th>Sub Total</th>\n`;
        orderHtml += `\t\t\t\t</tr>\n`;
        orderHtml += `\t\t\t</thead>\n`;
        orderHtml += `\t\t<tbody>\n`;
        
        if ("IndividualItems" in userCart ) { 
            var allIndividualItems = JSON.parse(JSON.stringify(userCart["IndividualItems"])) ;
            for(var itemKey in allIndividualItems)  {
                orderHtml += `\t\t\t<tr>\n`;
                var individualItem = JSON.parse(JSON.stringify(allIndividualItems[itemKey])) ;
                var itemDetails = JSON.parse(JSON.stringify(individualItem["individualItemDetails"])) ;
                totalItems += individualItem.quantity ;
                var itemsSubTotal = individualItem.quantity * itemDetails.individItemUnitCost ;
                grandTotal += itemsSubTotal ; 
                orderHtml += `\t\t\t\t<td>${itemDetails.individItemTitle}</td>\n`;
                orderHtml += `\t\t\t\t<td>${individualItem.quantity}</td>\n`;
                orderHtml += `\t\t\t\t<td>${itemDetails.individItemUnitCost}</td>\n`;
                orderHtml += `\t\t\t\t<td>${itemsSubTotal}</td>\n`;
                orderHtml += `\t\t\t</tr>\n`;
            }
        }

        if ("package" in userCart) {
            var allPackages = JSON.parse(JSON.stringify(userCart["package"])) ;
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
                orderHtml += `\t\t\t\t<td>${packageSubTotal}</td>\n`;
                orderHtml += `\t\t\t</tr>\n`;
            }
            
        }
        
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
        console.log(`auth json ${JSON.stringify(authJson, null, 4)}}`);
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
            to: `asong_nic@yahoo.com, ntuifranklin2005@gmail.com`,
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
        response.redirect(200, '/product-list');
        response.end(); 
    });

    router.get('/', (request, response) => { 
        
        var userCart = {} ;
        if (request.session.userCart)
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        //console.log('User Cart in cart.js: ' + JSON.stringify(userCart, null, 4));
        response.render('layout', { pageTitle: 'Checkout', template: 'checkout', userCart: userCart});
    });
     


    return router;
};

