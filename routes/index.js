const express = require('express');
const router = express.Router();
const shopRoute = require('./shop');
const checkoutRoute = require('./checkout');
const f404Route = require('./f404');
const cartRoute = require('./cart');
const packagesRoute = require('./packages');
const productListRoute = require('./product-list');
const contactRoute = require('./contact');

const databaseAccessor = require('../database/controllers/database.js');

var databaseAccess = databaseAccessor     
var package_and_items_3000 = 'empty ';
var package_and_items_3800 = 'empty';
var package_and_items_4900 = 'empty';

/*
('d09745340cebd03c6e0a','Package For 150 Guests',3000),
('ab7adb97a1f89a92527a','Package For 250 Guests',3800),
('bfcd68043040f450b8e7','Package For 300 Guests',4900);
*/
var packagesid = ['d09745340cebd03c6e0a','ab7adb97a1f89a92527a','bfcd68043040f450b8e7'];

try {
    package_and_items_3000 = databaseAccess.getPackageItems(packageid='d09745340cebd03c6e0a');
    package_and_items_3800 = databaseAccess.getPackageItems(packageid='ab7adb97a1f89a92527a');
    package_and_items_4900 = databaseAccess.getPackageItems(packageid='bfcd68043040f450b8e7');


} catch(err) {
    console.log(err);

}
console.log(package_and_items_3000);
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
        response.render(
            'layout', { pageTitle: 'Checking Out', template: 'checkout'});
    });
    
    router.get('/cart', (request, response) => { 
        response.render(
            'layout', { pageTitle: 'Your Cart Items', template: 'cart'});
    });
    
    
    router.get('/packages', (request, response) => { 
        //response.locals.dbConn = sqlite3
        response.render('layout', { 
            pageTitle: 'Packages and Bundles', 
            template: 'packages',
            package3000: package_and_items_3000,
            package3800: package_and_items_3800,
            package4900: package_and_items_4900,
        });
        
    });
    
      
    router.get(['/product-list','/products-list'], (request, response) => { 
        
        response.render('layout', { pageTitle: 'Available Products', template: 'product-list'});

    });
    
    router.get(['/contact','/contactus'], (request, response) => { 
        
        response.render('layout', { pageTitle: 'Contact Us', template: 'contact'});

    });

    router.use('/shop', shopRoute());
    router.use('/checkout', checkoutRoute());
    router.use('/cart', cartRoute());
    router.use('/packages', packagesRoute());
    router.use(['/product-list','/products-list'], productListRoute());
    router.use(['/contact','/contactus'], contactRoute());
        
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

/*
{ 
            pageTitle: 'Packages and Bundles', 
            template: 'packages',
            dbConn : sqlite3
        }
*/
