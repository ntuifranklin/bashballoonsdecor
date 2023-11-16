const express = require('express');
const router = express.Router();

require('dotenv').config();
const createError = require('http-errors');
const bodyParser = require('body-parser');
const databaseAccessor = require('../database/controllers/database');

module.exports = () => { 
    
    router.post('/', (request, response) => {
         
        if (!request.session.userCart) {
            request.session.userCart = {} ;
        };
        
        var itemUpdateID = new String(request.body.itemUpdateID);
        var productOrPackage = new String(request.body.updateType) ;
        var keyToUpdate = "";
        var tableName = "";
        var keyFieldName = "";
        if (productOrPackage == "product")  {
            keyToUpdate = "product" ;
            tableName = process.env.PRODUCT_TABLE_NAME;
            keyFieldName = process.env.PRODUCT_TABLE_KEY_FIELD_NAME;
        } else {
            keyToUpdate = "package";
            tableName = process.env.PACKAGE_TABLE_NAME;
            keyFieldName = process.env.PACKAGE_TABLE_KEY_FIELD_NAME;
        }
            
        console.log(`ItemID received : ${itemUpdateID}`);
        if (!request.session.userCart[keyToUpdate]) {
            request.session.userCart[keyToUpdate] = {
                
            }
        }
        if (!request.session.userCart[keyToUpdate][itemUpdateID]) {
            request.session.userCart[keyToUpdate][itemUpdateID] = {
            }
        }
        
        if (!request.session.userCart[keyToUpdate][itemUpdateID]["quantity"]) {
            request.session.userCart[keyToUpdate][itemUpdateID] = {
                "quantity" : 0
            }
        }
    
         
            /* The product/package details must have been loaded at the start of the app
            * First: access the request.locals variable and pull the data for that product/package.
            * Second: assign it to the session variable for the corresponding product/package
            * Finally: save the session
            */
        if (keyToUpdate == "product") {
           
            if (itemUpdateID in request.locals.products ) {
                request.session.userCart[keyToUpdate][itemUpdateID]["productDetails"] = 
                request.locals.products[itemUpdateID];
                request.session.save();
            } else {
                console.log(`BIG ERROR(THIS SHOULD NOT HAPPEN) : Products ${itemUpdateID} not found in request.locals.products`);
            }
            
        } else if (keyToUpdate == "package") {
    
            if (itemUpdateID in request.locals.packages ) {
                request.session.userCart[keyToUpdate][itemUpdateID]["packageDetails"] = 
                request.locals.packages[itemUpdateID];
                request.session.save();
            } else {
                console.log(`BIG ERROR(THIS SHOULD NOT HAPPEN) : Packages ${itemUpdateID} not found in request.locals.packages`);
            } 
        };
        
        /* update quantity and save session */
        request.session.userCart[keyToUpdate][itemUpdateID]["quantity"] += 1;
        request.session.save();

        /* update the cart in the locals variable */
        request.locals.userCart = request.session.userCart ;
        response.redirect(200, '/product-list');
        response.end();
    });


    router.get('/', (request, response) => { 
        
        var userCart = {} ;
        if (request.session.userCart)
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        console.log('User Cart: ' + JSON.stringify(userCart));
        response.render('layout', { pageTitle: 'Your Cart Items', template: 'cart', userCart: userCart});
    });

    return router;
};

