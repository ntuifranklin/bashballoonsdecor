const express = require('express');
const router = express.Router();
const shopRoute = require('./shop');
const checkoutRoute = require('./checkout');
const f404Route = require('./f404');



module.exports = () => { 
        
    router.get('/', (request, response) => { 
        response.render('layout', 
        { 
            pageTitle: response.locals.siteName, 
            template: 'index', 
        });
        
    });
     
    
    router.get('/shop', (request, response) => { 
        response.render('layout', { pageTitle: 'Our Party Rental Inventory', template: 'shop'});
    });
    
    router.get('/checkout', (request, response) => { 
        response.render('layout', { pageTitle: 'Checking Out', template: 'checkout'});
    });
    
    router.use('/shop', shopRoute());
    router.use('/checkout', checkoutRoute());



        
    router.get('*', (request, response) => {

        response.status(404).render('layout', 
        { 
            pageTitle: 'Sorry We Could Not Find What You Are Looking For', 
            template: 'f404',
        });
    
    });

    
    router.use('/*', f404Route());
    

    return router;
};

