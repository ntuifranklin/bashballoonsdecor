const express = require('express');
const router = express.Router();
require('dotenv').config();
var nodemailer = require('nodemailer'); 
const fs = require('fs');

module.exports = () => { 
    
        
    router.post('/', (request, response) => {
         
        if (request.session.userCart == undefined || Object.keys(request.session.userCart).length === 0 || !request.session.userCart || request.session.userCart == {} || request.session.userCart == null ) {
            response.redirect(200, '/');
            response.end(); 
        };
        /* Loop throgh the cart and generate an email that will recieve the order */
        var userCart = request.session.userCart ;
        var totalItems = 0 ;
        
        var grandTotal = 0.0 ;
        var orderHtml = `<html>`;
        //read jquery file stram and css stream into a string 
        let jqueryCode = ``;
        let bootstrapCode = `` ;
        const streamJquery = fs.createReadStream(`${process.env.BOOTSTRAP_JS_FILE}`, 'utf8');
        streamJquery.on('data', (dataChunck) => {
            jqueryCode += dataChunck.toString();
        });
          
        // Listen for the 'end' event and log the final string value
        streamJquery.on('end', () => {
            console.log(`Read jquery file : first 50 chars ${jqueryCode.split(" ").slice(0, 50).join(" ")}`);
        });

        const cssStream = fs.createReadStream(`${process.env.BOOTSTRAP_CSS_FILE}`, 'utf8');
        cssStream.on('data', (dataChunck) => {
            bootstrapCode += dataChunck.toString();
        });
        cssStream.on('end', () => {
            console.log(`Read css file : first 50 chars ${bootstrapCode.split(" ").slice(0, 50).join(" ")}`);
        });

        orderHtml += `<head>`;
        orderHtml += `<title>Order Confirmation</title>`;
        orderHtml += `<style>${bootstrapCode}</style>`;
        orderHtml += `</head>`;
        orderHtml += `<script>${jqueryCode}</script>`;
        orderHtml += `<body>`;

        orderHtml += `<h1>Order Confirmation</h1>`;
        orderHtml += `<h2>Order Details</h2>`;
        orderHtml += `<table class="table table-striped">`;
        orderHtml += `<thead>`; 
        orderHtml += `<tr>`;
        orderHtml += `<th>Ordered Item</th>`;
        orderHtml += `<th>Quantity</th>`;
        orderHtml += `<th>Unit Cost</th>`;
        orderHtml += `<th>Sub Total</th>`;
        orderHtml += `</thead>`;
        
        if ("IndividualItems" in userCart ) { 
            for(var itemKey in userCart["IndividualItems"])  {
                orderHtml += `<tr>`;
                var individualItem = JSON.parse(JSON.stringify(userCart["IndividualItems"][itemKey])) ;
                var itemDetails = JSON.parse(JSON.stringify(individualItem["individualItemDetails"])) ;
                totalItems += individualItem.quantity ;
                var itemsSubTotal = individualItem.quantity * itemDetails.individItemUnitCost ;
                grandTotal += itemsSubTotal ; 
                orderHtml += `<td>${itemDetails.individItemTitle}</td>`;
                orderHtml += `<td>${individualItem.quantity}</td>`;
                orderHtml += `<td>${itemDetails.individItemUnitCost}</td>`;
                orderHtml += `<td>${itemsSubTotal}</td>`;
                orderHtml += `</tr>`;
            }
        }

        if ("package" in userCart) {
            for (var packageKey in userCart["package"])  { 
                var package = JSON.parse(JSON.stringify(userCart["package"][packageKey]));
                var packageDetails = JSON.parse(JSON.stringify(package["packageDetails"])) ;
                var packageSubTotal = package["quantity"] * packageDetails["packagecost"] ;
                totalItems += package.quantity ;
                grandTotal += packageSubTotal ; 
                orderHtml += `<tr>`;
                orderHtml += `<td>${packageDetails["packagedesc"]}</td>`;
                orderHtml += `<td>${package["quantity"]}</td>`;
                orderHtml += `<td>${packageDetails["packagecost"]}</td>`;
                orderHtml += `<td>${packageSubTotal}</td>`;
                orderHtml += `</tr>`;
            }
            
        }
        orderHtml += `</body>`;
        orderHtml += `</html>`;
        var mailOptions = {
            from: `no-reply@bashballoonsrentals.com`,
            to: `asong_nic@yahoo.com, ntuifranklin2005@gmail.com`,
            subject: `bashballoonsrentals.com of Order Confirmation ${faker.string.uuid()}`,
            html: `${orderHtml}`
          } ;
        /* update the cart in the locals variable */
        //request.locals.userCart = JSON.stringify(request.session.userCart) ;
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

