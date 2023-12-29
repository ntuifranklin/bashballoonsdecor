const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
var csrf = require('csurf');
const csrfProtection = csrf({ cookie: true })

require('dotenv').config();
const createError = require('http-errors');
const databaseAccessor = require('../database/controllers/database');

module.exports = () => { 
    
    router.post('/', csrfProtection, (request, response) => {
         
        if (!request.session.userCart) {
            request.session.userCart = {
            } ;
        };
        
        var itemUpdateID = new String(request.body.itemUpdateID);
        var productOrPackage = new String(request.body.updateType) ;
        var keyToUpdate = "";
        var tableName = "";
        var keyFieldName = "";
        const source = new String(request.body.source);
        const htmlID = new String(request.body.htmlID);
        if (productOrPackage == "IndividualItems")  {
            keyToUpdate = "IndividualItems" ;
            tableName = process.env.PRODUCT_TABLE_NAME;
            keyFieldName = process.env.INDIVIDUAL_ITEM_TABLE_KEY_FIELD_NAME;
        } else {
            keyToUpdate = "package";
            tableName = process.env.PACKAGE_TABLE_NAME;
            keyFieldName = process.env.PACKAGE_TABLE_KEY_FIELD_NAME;
        }
            
        //console.log(`product or package ID received : ${itemUpdateID}`);
        if (!( keyToUpdate in request.session.userCart)) {
            request.session.userCart[keyToUpdate] = {
                
            }
        }
        if (!( itemUpdateID in request.session.userCart[keyToUpdate]) ) {
            request.session.userCart[keyToUpdate][itemUpdateID] = {
            }
        }
        
        if (!("quantity" in request.session.userCart[keyToUpdate][itemUpdateID])) {
            request.session.userCart[keyToUpdate][itemUpdateID] = {
                "quantity" : 0
            }
        }
    
         
            /* The product/package details must have been loaded at the start of the app
            * First: access the request.locals variable and pull the data for that product/package.
            * Second: assign it to the session variable for the corresponding product/package
            * Finally: save the session
            */
        if (keyToUpdate == "IndividualItems") {
           
            if (itemUpdateID in request.locals.individualItems ) {
                request.session.userCart[keyToUpdate][itemUpdateID]["individualItemDetails"] = 
                request.locals.individualItems[itemUpdateID]["individualItemDetails"];
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
        //console.log(`Updated session ${JSON.stringify(request.session.userCart)}`);

        /* update the cart in the locals variable */
        //request.locals.userCart = JSON.stringify(request.session.userCart) ;
        request.session.save();
        response.status(200).send({ message: 'success', responseText: 'Item added to cart' });
        //response.redirect(200, `/${source}#${htmlID}`);
        //response.end();
    });


    router.get('/', (request, response) => { 
        
        var userCart = {} ;
        if (request.session.userCart)
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        //console.log('User Cart in cart.js: ' + JSON.stringify(userCart, null, 4));
        response.render('layout', { 
            pageTitle: 'Your Shopping Cart', 
            template: 'cart', 
            userCart: userCart,
            csrfToken: request.csrfToken()
        });
    });

    return router;
};

