const express = require('express');
const router = express.Router();
const shopRoute = require('./shop');
const checkoutRoute = require('./checkout');
const f404Route = require('./f404');
const cartRoute = require('./cart');
const packagesRoute = require('./packages');
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

const {decode} = require('html-entities');

require('dotenv').config();

module.exports = () => { 
        
    /* generate a connection  */
    var con = mysql2.createPool({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_UPGRADED_NAME,
        waitForConnections: true,
        connectionLimit: 5,
        maxIdle:5, // max idle connections, the default value is the same as `connectionLimit`
        idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    });
    router.get('/', async (request, response) => { 
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
        //console.log(`Category name: ${category_name}`);
        category_name = category_name.toLocaleLowerCase();
        var categories = request.locals.categories;
        var category = null ;

        for (var i = 0; i < categories.length; i++) {
            if (categories[i].category_name.toLocaleLowerCase() === category_name) {
                category = JSON.parse(JSON.stringify(categories[i]));
                break;
            }
        }
        
        if (category == null) {
            response.status(200).redirect('/');
        } else {
            var category_items = await getCategoriesItems (con=con,tableName='category_items', category_id=category.category_id);
            //console.log(`category name : ${category.category_name} items: ${JSON.parse(JSON.stringify(category_items))}`);
            response.status(200).render('layout',
            {
                pageTitle: decode(category.category_name),
                template: 'rental-items-list',
                list_of_items : request.locals.list_of_items,
                category_items: category_items,
                category: decode(category.category_name),
                category_id: category.category_id,
                csrfToken: request.csrfToken(),
                decode: decode,
            });
        }
        
    });
        
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
