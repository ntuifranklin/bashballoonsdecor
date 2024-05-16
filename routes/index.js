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
              
        
        var categories = await JSON.parse(JSON.stringify(request.session.categories));
             
        var userCart = {} ;
        var user = {} ;
        if (request.session.user && request.session.user.email)
            user = JSON.parse(JSON.stringify(request.session.user)) ;

        if (request.session.userCart)
            userCart = await JSON.parse(JSON.stringify(request.session.userCart)) ;
        
        
        var items_array = await JSON.parse(JSON.stringify(request.session.items_array));
        const seoSiteLink = request.locals.seoSiteLink ;
        var seoObject = {
            title: request.locals.siteName,
            description: `Transform your event into an unforgettable celebration with our premier party rental service.\n
            with ${seoSiteLink}
            `,
        };

        //console.log(`User cart : ${JSON.stringify(userCart)}`);
        response.render('layout', 
        { 
            pageTitle: request.locals.siteName, 
            template: 'index', 
            userCart : userCart,
            user:user,
            categories: categories,
            items_array: items_array,
            IMG_DIR_FOR_WEB : request.session.IMG_DIR_FOR_WEB,
            csrfToken: request.csrfToken(),
            customers_feedback: request.locals.customers_feedback,
            decode: decode,
            encode: encode,
            seoObject : seoObject
        });
        
    });
    
    /* the routes below have to be here before the /:category_name route else things dont work properly */
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
    router.get('/:category_name',csrfProtection, async(request, response) => { 
        
        var category_name = new String(request.params.category_name);
        //console.log(`Category Name Encoded : ${category_name}`);
        var userCart = {} ;
        if (request.session.userCart)
            userCart = await JSON.parse(JSON.stringify(request.session.userCart)) ;
        
        category_name = category_name.toLocaleLowerCase();
        
        var categories = categories = await JSON.parse(JSON.stringify(request.session.categories));
        var itemsByCategoryID =  itemsByCategoryID = await JSON.parse(JSON.stringify(request.session.itemsByCategoryID)) ;
       
        var user = {} ;
        if (request.session.user && request.session.user.email)
            user = JSON.parse(JSON.stringify(request.session.user)) ;
        
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
            const humanFriendlyCategoryName = decode(category.category_name);
            if (categoryID in itemsByCategoryID) { 
                category_items = itemsByCategoryID[categoryID];
                const seoSiteLink = request.locals.seoSiteLink ;
                var seoObject = {
                    title: `Your ${humanFriendlyCategoryName} for your next party at ${seoSiteLink}`,
                    description: `Checkout our list of ${humanFriendlyCategoryName} with ${seoSiteLink}`,
                }
                response.status(200).render('layout',
                {
                    pageTitle: decode(category.category_name),
                    template: 'rental-items-list',
                    categories: categories,
                    items_array: request.session.items_array,
                    userCart: userCart,
                    user:user,
                    IMG_DIR_FOR_WEB : request.session.IMG_DIR_FOR_WEB,
                    category: decode(category.category_name),
                    category_id: category.category_id,
                    category_items: category_items,
                    csrfToken: request.csrfToken(),
                    decode: decode,
                    encode: encode,
                    seoObject:seoObject
                });
            } else {
                response.status(200).render('layout',
                {
                    pageTitle: "No Items Found in " + decode(category.category_name) + " Category",
                    template: 'noitems',
                    categories: categories,
                    category_items: category_items,
                    userCart: userCart,
                    user:user,
                    IMG_DIR_FOR_WEB : request.session.IMG_DIR_FOR_WEB,
                    category: decode(category.category_name),
                    csrfToken: request.csrfToken(),
                    decode: decode,
                    encode: encode,
                });
            } ;
            
        }
        
    });


    /* This should be the last route to catch errors */
    
    router.use(['/*','/f404'], f404Route());
    
    return router;
};
