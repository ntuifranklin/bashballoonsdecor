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


const databaseAccessor = require('../database/controllers/database.js');


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
        var userCart = {} ;
        if (!request.session.userCart) {
            request.session.userCart = {} ;
        };
        userCart = request.session.userCart ;
        response.render('layout', { pageTitle: 'Your Cart Items', template: 'cart', userCart: userCart});
    });
    
    router.post('/cart', (request, response) => {
        /* Here a post request at assets/js/cart.js 
         file was sent through a function called updateCart.
         this function takes two parameters : the itemID (productID or packageid)
         and the itemType ( product or package ) 
        */
        if (!request.session.userCart) {
            request.session.userCart = {} ;
        };
        
        var itemUpdateID = request.body.itemUpdateID;
        var productOrPackage = request.body.updateType ;
        var keyToUpdate = "";
        if (productOrPackage == "product")
            keyToUpdate = "product" ;
        else 
            keyToUpdate = "package";
        console.log(`${itemUpdateID}`);
        if (!request.session.userCart[keyToUpdate]) {
            request.session.userCart[keyToUpdate] = {
                
            }
        }
        if (!request.session.userCart[keyToUpdate][itemUpdateID]) {
            request.session.userCart[keyToUpdate][itemUpdateID] = {
            }
        }
        
        if (request.session.userCart[keyToUpdate][itemUpdateID]) {
            request.session.userCart[keyToUpdate][itemUpdateID] = {
                "quantity" : 0
            }
        }
        request.session.userCart[keyToUpdate][itemUpdateID]["quantity"] += 1;
        request.session.save();
        response.end();
        //response.redirect(200, '/product-list');
    });


    
    
    router.get(['/packages','/packages-list','/packageslist','/packageslists'], async (request, response) => { 
        
        var packagesid = ['d09745340cebd03c6e0a','ab7adb97a1f89a92527a','bfcd68043040f450b8e7'];

        try {
            const package_and_items_3000 = await databaseAccessor.getPackageItems(packageid = 'd09745340cebd03c6e0a');
            const package_and_items_3800 = await databaseAccessor.getPackageItems(packageid = 'ab7adb97a1f89a92527a');
            const package_and_items_4900 = await databaseAccessor.getPackageItems(packageid = 'bfcd68043040f450b8e7');
            //console.log('package3000_and_items ' + package_and_items_3000);
            response.render('layout', { 
                pageTitle: 'Packages and Bundles', 
                template: 'packages',
                package3000: package_and_items_3000,
                package3800: package_and_items_3800,
                package4900: package_and_items_4900,
            });

        } catch(err) {
            console.log(err);

        }
        
        
    });
    
      
    router.get(['/product-list','/products-list'], async(request, response) => { 
        const list_of_items = await databaseAccessor.getIndividualItems();
        
        response.render('layout', { 
            pageTitle: 'Individual Items | Individual Products', 
            template: 'product-list',
            list_of_items : list_of_items,
            category: 'Individual Party Rental Items',
        }); 
    });
    
    router.get(['/product-details','/individual-item-details','/item-details','items-details'], (request, response) => { 
        response.render('layout', { pageTitle: 'Details of Product with title BlaBlaBla', template: 'product-details'});
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

/*
{ 
            pageTitle: 'Packages and Bundles', 
            template: 'packages',
            dbConn : sqlite3
        }
*/
