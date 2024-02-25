const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
var csrf = require('csurf');
const csrfProtection = csrf({ cookie: true }) ;

const {decode} = require('html-entities');

require('dotenv').config();
const createError = require('http-errors');
const {getCategoriesItems} = require('../database/controllers/database');

module.exports = () => { 
    
    router.post('/', csrfProtection, (request, response) => {
         
        var userCart = {} ;
        if (request.session.userCart) {
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        };
        var itemsHashOnly =  JSON.stringify(request.session.itemsByID) ;
        itemsHashOnly = JSON.parse(itemsHashOnly) ;
        
        const itemUpdateID = request.body.itemUpdateID;
        
        if (!( itemUpdateID in userCart)) {
            userCart[itemUpdateID] = {
               
            } ;   
        }
        
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
        userCart[itemUpdateID]["quantity"] += 1;
        request.session.userCart = JSON.parse(JSON.stringify(userCart)) ;
        request.session.save();
        //console.log(`Updated session cart ${JSON.stringify(request.session.userCart)}`);
        
        request.session.save();
        response.status(200).send({ message: 'success', responseText: 'Item added to cart' });
        //response.redirect(200, `/${source}#${htmlID}`);
        //response.end();
    });


    router.get('/', csrfProtection, async (request, response) => { 
       
        var categories = await JSON.parse(JSON.stringify(request.session.categories));
        
        //var categories_items = request.locals.categoriesItemsHash ;
        var userCart = {} ;
        if (request.session.userCart)
            userCart = await JSON.parse(JSON.stringify(request.session.userCart)) ;
        console.log('Passed cart : ' + JSON.stringify(userCart, null, 4));
        response.render('layout', { 
            pageTitle: 'Your Shopping Cart', 
            template: 'cart', 
            userCart: userCart,
            csrfToken: request.csrfToken(),
            categories: categories,
            decode:decode,
        });
    });

    return router;
};

