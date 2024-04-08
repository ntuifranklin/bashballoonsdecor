const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
var csrf = require('csurf');
const csrfProtection = csrf({ cookie: true }) ;
const {decode, encode} = require('html-entities');


require('dotenv').config();
const createError = require('http-errors');
//const {getCategoriesItems} = require('../database/controllers/database');

/* For caching data to increase speed */
const NodeCache = require( "node-cache" );
const cache = new NodeCache();

module.exports = () => { 
    
    router.get('/', csrfProtection, async (request, response) => { 
       
       
        
        var categories = cache.get('categories');
        if (!categories) {
            categories = await JSON.parse(JSON.stringify(request.session.categories));
            cache.set('categories', categories);
        }
         
        //var categories_items = request.locals.categoriesItemsHash ;
        var userCart = {} ;
        if (request.session.userCart)
            userCart = await JSON.parse(JSON.stringify(request.session.userCart)) ;
        //console.log('Passed cart : ' + JSON.stringify(userCart, null, 4));
        response.render('layout', { 
            pageTitle: 'Your Shopping Cart', 
            template: 'cart', 
            userCart: userCart,
            csrfToken: request.csrfToken(),
            categories: categories,
            decode:decode,
            encode:encode
        });
    });

    router.post('/', csrfProtection, (request, response) => {
         
        var userCart = {} ;
        if (request.session.userCart) {
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        };
        var itemsHashOnly =  JSON.stringify(request.session.itemsByID) ;
        itemsHashOnly = JSON.parse(itemsHashOnly) ;
        
        const itemUpdateID = request.body.itemUpdateID;
        const addQuantity = 'a';
        const subtractQuantity = 's';
        const removeItem = 'r';
        const validActions = [addQuantity, subtractQuantity, removeItem];
        const action = request.body.action;
        if (!validActions.includes(action)) {
            response.status(400).send({ message: 'error', responseText: 'Invalid action' });
            return;
        } ;
        
        if (!( itemUpdateID in userCart)) {
            userCart[itemUpdateID] = {
               
            } ;   
        } ;
        
        if (!("quantity" in userCart[itemUpdateID])) {
            userCart[itemUpdateID]["quantity"] = 0;
        } ;

        var itemDetails = null ;
        if (! ("itemDetails" in userCart[itemUpdateID])) {
            userCart[itemUpdateID]["itemDetails"] = {} ;
        } ;

        itemDetails = JSON.parse(JSON.stringify(itemsHashOnly[itemUpdateID])) ;
        //console.log(`itemDetails : ${JSON.stringify(itemDetails)}`);
        userCart[itemUpdateID]["itemDetails"] = itemDetails["itemDetails"] ;
    
        /* update quantity and save session */
        if (action == subtractQuantity) {
            if (userCart[itemUpdateID]["quantity"] < 1 ) {
                response.status(400).send({ message: 'error', responseText: 'Item not in cart' });
                return;
            } else if (userCart[itemUpdateID]["quantity"] == 1) {
                delete userCart[itemUpdateID];
                request.session.userCart = JSON.parse(JSON.stringify(userCart)) ;
                request.session.save();
                response.status(200).send({ message: 'success', responseText: 'Item removed from cart' });
                return;
            } else {
                userCart[itemUpdateID]["quantity"] -= 1;
                request.session.userCart = JSON.parse(JSON.stringify(userCart)) ;
                request.session.save();
                response.status(200).send({ message: 'success', responseText: 'Item removed from cart' });
                return;
            }
           
        } else {
            userCart[itemUpdateID]["quantity"] += 1;
            request.session.userCart = JSON.parse(JSON.stringify(userCart)) ;
            request.session.save();
            response.status(200).send({ message: 'success', responseText: 'Item added to cart' });
            return;
        };
    });

    
    router.post('/changeQuantity', csrfProtection, (request, response) => {
         
        var userCart = {} ;
        if (request.session.userCart) {
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        } else {
            response.status(400).send({ message: 'error', responseText: "You don't have a cart yet" });
            return; 
        } ;
        if (!request.session.itemsByID || request.session.itemsByID == null) {
            response.status(400).send({ message: 'error', responseText: "There are no items in the store" });
            return;
        }
        var itemsHashOnly =  JSON.parse(JSON.stringify(request.session.itemsByID))  ;
        //console.log(`itemsHashOnly : ${JSON.stringify(itemsHashOnly)}`);
        
        const itemID = new String(request.body.itemID);

        if (itemsHashOnly == null || !(itemID in itemsHashOnly) ) {
            response.status(400).send({ message: 'error', responseText: 'Item not found' });
            return;
        };
        const updatedQuantity = new String(request.body.updatedQuantity);
        var integerQuantity = parseInt(updatedQuantity);

        if(isNaN(integerQuantity) || integerQuantity < 0) {
            response.status(400).send({ message: 'error', responseText: 'Invalid quantity' });
            return;
        }
        
        if (!( itemID in userCart)) {
            userCart[itemID] = {
               
            } ;   
        }
        
        if (!("quantity" in userCart[itemID])) {
           userCart[itemID]["quantity"] = 0;
        } ;
        
        if (! ("itemDetails" in userCart[itemID])) {
            userCart[itemID]["itemDetails"] = {} ;
            var itemDetails = null ;
            itemDetails = JSON.parse(JSON.stringify(itemsHashOnly[itemID])) ;
            //console.log(`itemDetails : ${JSON.stringify(itemDetails)}`);
            userCart[itemID]["itemDetails"] = itemDetails["itemDetails"] ;
        } ;

         /* update quantity and save session */
        userCart[itemID]["quantity"] = integerQuantity ;
        request.session.userCart = JSON.parse(JSON.stringify(userCart)) ;
        request.session.save();
        response.status(200).send({ message: 'success', responseText: `Cart updated successfully` });
    });
    
    router.post('/deleteItem', csrfProtection, (request, response) => {
         
        var userCart = {} ;
        if (request.session.userCart) {
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        } else {
            response.status(400).send({ message: 'error', responseText: "You don't have a cart yet" });
            return; 
        } ;
        const itemID = new String(request.body.itemID);
        const source = new String(request.body.source);
        if (!( itemID in userCart)) {
            response.status(400).send({ message: 'error', responseText: 'Item not found' });
            return;
        } ;

         /* update cart save session */
        delete userCart[itemID] ;
        request.session.userCart = JSON.parse(JSON.stringify(userCart)) ;
        request.session.save();
        response.status(200).send({ message: 'success', responseText: `Item deleted from cart successfully` });
    });


    return router;
};

