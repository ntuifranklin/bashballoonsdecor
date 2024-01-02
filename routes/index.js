const express = require('express');
const router = express.Router();
const shopRoute = require('./shop');
const checkoutRoute = require('./checkout');
const f404Route = require('./f404');
const cartRoute = require('./cart');
const packagesRoute = require('./packages');
const productListRoute = require('./product-list');
const contactRoute = require('./contact');
const productDetailsRoute = require('./product-details');

require('dotenv').config();


module.exports = () => { 
        
    router.get('/', (request, response) => { 
        /* must have been loaded in server.js file  */  
                        
        const allpackages = require(process.env.PACKAGES_ONLY_FILE);
        const [
            package_3000,
            package_3800,
            package_4900,
        ] = [
            allpackages["package_3000"],
            allpackages["package_3800"],
            allpackages["package_4900"],
        ];

        response.render('layout', 
        { 
            pageTitle: request.locals.siteName, 
            template: 'index', 
            package3000: package_3000,
            package3800: package_3800,
            package4900: package_4900,
            list_of_items : request.locals.list_of_items,
            csrfToken: request.csrfToken(),
            customers_feedback: request.locals.customers_feedback,
        });
        
    });

    router.use('/shop', shopRoute());
    router.use('/checkout', checkoutRoute());
    router.use('/cart', cartRoute());
    
    router.use('/packages', packagesRoute());
    router.use(['/product-list','/products-list'], productListRoute());
    router.use(['/contact','/contactus'], contactRoute());
    router.use(['/product-details','/productdetails','/individual-item-details'], productDetailsRoute());
        
    router.get(['/*','/f404'], (request, response) => {

        response.status(404).render('layout', 
        { 
            pageTitle: 'Sorry We Could Not Find What You Are Looking For', 
            template: 'f404',
        });
    });
    
    router.use('/*', f404Route());
    
    return router;
};
