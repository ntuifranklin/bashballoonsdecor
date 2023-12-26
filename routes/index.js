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
        
        response.render('layout', 
        { 
            pageTitle: request.locals.siteName, 
            template: 'index', 
            csrfToken: request.csrfToken()
        });
        
    });

    router.use('/shop', shopRoute());
    router.use('/checkout', checkoutRoute());
    router.use('/cart', cartRoute());
    router.use('/packages', packagesRoute());
    router.use(['/product-list','/products-list'], productListRoute());
    router.use(['/contact','/contactus'], contactRoute());
    router.use(['/product-details','/productdetails','/individual-items-details'], productDetailsRoute());
        
    router.get('/*', (request, response) => {

        response.status(404).render('layout', 
        { 
            pageTitle: 'Sorry We Could Not Find What You Are Looking For', 
            template: 'f404',
        });
    });
    
    router.use('/*', f404Route());
    
    return router;
};
