const express = require('express');
const router = express.Router();
const shopRoute = require('./shop');
const checkoutRoute = require('./checkout');
const f404Route = require('./f404');
const cartRoute = require('./cart');
const rentalItemsListRoute = require('./rental-items-list');
const contactRoute = require('./contact');
const productDetailsRoute = require('./product-details');
const adminRoute = require('./admin');
const loginRoute = require('./login');
const logoutRoute = require('./logout');
const verifyOTPRoute = require('./verifyotp');
const { ExpressValidator } = require('express-validator');
const bodyParser = require('body-parser');
var mysql2 = require('mysql2');
const {getCategoriesItems} = require('../database/controllers/database');

const {decode, encode} = require('html-entities');

require('dotenv').config();

module.exports = () => { 
        
    router.use(bodyParser.json());
    router.get('/', async (request, response) => { 
        /* must have been loaded in server.js file  */  
        var categories = request.session.categories;
        var categories_items = request.session.categoriesItemsHash;
        
        var userCart = {} ;
        if (request.session.userCart)
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        
        console.log(`User cart : ${JSON.stringify(userCart)}`);
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
    router.get('/:category_name', async(request, response) => { 
        
        var category_name = new String(request.params.category_name);
        //console.log(`Category Name Encoded : ${category_name}`);
        var userCart = {} ;
        if (request.session.userCart)
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        
        category_name = category_name.toLocaleLowerCase();
        var categories = await JSON.parse(JSON.stringify(request.session.categories));
        
        var itemsByCategoryID = await JSON.parse(JSON.stringify(request.session.itemsByCategoryID));
        
        var category = {} ;
        var index = -1;
        var categoryID = "";
        category_name = encode(category_name);
        for (var i = 0; i < categories.length; i++) {
            var one_category = await JSON.parse(JSON.stringify(categories[i]));
            
            //console.log(`Category Name Encoded : ${category_name}`);
            if (encode(one_category.category_name.toLocaleLowerCase()) === category_name) {
                category = one_category;
                index = i;
                categoryID = new String(JSON.parse(JSON.stringify(one_category.category_id)));
               
                break;
            }
        }
        
        if (category == {} || index == -1 || categoryID == "") { 
                        
            response.status(200).redirect('/'); 
            
        } else {
           
            
            var category_items = [] ;
            if (categoryID in itemsByCategoryID) { 
                category_items = itemsByCategoryID[categoryID];
                response.status(200).render('layout',
                {
                    pageTitle: decode(category.category_name),
                    template: 'rental-items-list',
                    categories: categories,
                    items_array: request.session.items_array,
                    userCart: userCart,
                    category: decode(category.category_name),
                    category_id: category.category_id,
                    category_items: category_items,
                    csrfToken: request.csrfToken(),
                    decode: decode,
                    encode: encode,
                });
            } else {
                response.status(200).render('layout',
                {
                    pageTitle: "No Items Found in " + decode(category.category_name) + " Category",
                    template: 'noitems',
                    categories: categories,
                    category_items: category_items,
                    userCart: userCart,
                    category: decode(category.category_name),
                    csrfToken: request.csrfToken(),
                    decode: decode,
                    encode: encode,
                });
            } ;
            
        }
        
    });
        
    router.get('/*', async (request, response) => {

        var userCart = {} ;
        if (request.session.userCart)
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        
        var categories = [] ;
        var categories = await JSON.parse(JSON.stringify(request.session.categories));
        response.status(404).render('layout', 
        { 
            pageTitle: 'Sorry We Could Not Find What You Are Looking For', 
            template: 'f404',
            category_items: categories,
            userCart: userCart, 
            categories: categories,
            csrfToken: request.csrfToken(),
            decode: decode,
        });
    });
    
    router.use('/*', f404Route());
    
    return router;
};
