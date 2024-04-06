const express = require('express');
const router = express.Router();
const shopRoute = require('./shop');
const checkoutRoute = require('./checkout');
const f404Route = require('./f404');
const cartRoute = require('./cart');
const rentalItemsListRoute = require('./rental-items-list');
const contactRoute = require('./contact');
const productDetailsRoute = require('./product-details');
const listItemsByCategoryNameRoute = require('./list_items_by_category_name');
const adminRoute = require('./admin');
const loginRoute = require('./login');
const logoutRoute = require('./logout');
const verifyOTPRoute = require('./verifyotp');
const { ExpressValidator } = require('express-validator');
const bodyParser = require('body-parser');
var mysql2 = require('mysql2');
var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });
const {getCategoriesItems} = require('../database/controllers/database');

const {decode, encode} = require('html-entities');

require('dotenv').config();

module.exports = () => { 
        
    router.use(bodyParser.json());

    router.get('/', csrfProtection, async (request, response) => { 
        /* must have been loaded in server.js file  */  
        var categories = request.session.categories;
        var categories_items = request.session.categoriesItemsHash;
        
        var userCart = {} ;
        if (request.session.userCart)
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        
        //console.log(`User cart : ${JSON.stringify(userCart)}`);
        response.render('layout', 
        { 
            pageTitle: request.locals.siteName, 
            template: 'index', 
            userCart : userCart,
            categories: request.session.categories,
            items_array: request.session.items_array,
            csrfToken: request.csrfToken(),
            customers_feedback: request.locals.customers_feedback,
            decode: decode,
            encode: encode,
        });
        
    });
    router.use('/shop', shopRoute());
    router.use('/checkout', checkoutRoute());
    router.use('/cart', cartRoute());
    router.use(['/rental-items-list'], rentalItemsListRoute());
    router.use(['/contact','/contactus'], contactRoute());
    router.use(['/product-details','/productdetails','/individual-items-details'], productDetailsRoute());
    router.use(['/dashboard','/admin','/backend'], adminRoute());
    router.use(['/login','/identify-your-self','/whoami'], loginRoute());
    router.use(['/logout','/signout'], logoutRoute());
    router.use(['/verifyotp','/verify-otp'], verifyOTPRoute());

    /* this route allows someone to search for a list of items based on an item category name */
    router.use('/:category_name',listItemsByCategoryNameRoute())
    
    router.use(['/*','/f404'], f404Route());
    
    return router;
};
