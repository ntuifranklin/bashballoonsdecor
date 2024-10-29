const express = require('express');
const router = express.Router();
const checkoutRoute = require('./checkout');
const f404Route = require('./f404');
const cartRoute = require('./cart');
//const rentalItemsListRoute = require('./rental-items-list');
const contactRoute = require('./contact');
const rentalItemDetailsRoute = require('./rental-item-details');
const adminRoute = require('./admin');
const loginRoute = require('./login');
const logoutRoute = require('./logout');
const verifyOTPRoute = require('./verifyotp');
const successPaymentRoute = require('./success-payment-route');
const webstatsRoute = require('./webstats');
const bodyParser = require('body-parser');
var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });

require('dotenv').config();
const {
    CHECKOUT_ROUTE,
    CART_ROUTE,
    CONTACT_ROUTE,
    RENTAL_DETAILS_ROUTE,
    ADMIN_ROUTE,
    LOGIN_ROUTE,
    LOGOUT_ROUTE,
    VERIFY_OTP_ROUTE,
    F404_ROUTE,
    SUCCESS_PAYMENT_ROUTE,
    WEBSTATS_ROUTE
} = require('../utilities/routes_constant_names');

const {
    homePage,
    rentalItemsPerCategoryPage,
} = require('../controllers/indexController');


module.exports = () => { 
        
    router.use(bodyParser.json());

    router.get('/', csrfProtection, homePage);
    
    /* the routes below have to be here before the /:category_name route else things dont work properly */
    //router.use('/shop', shopRoute());
    router.use(`/${CHECKOUT_ROUTE}`, checkoutRoute());
    router.use(`/${CART_ROUTE}`, cartRoute());
    router.use(`/${CONTACT_ROUTE}`, contactRoute());
    router.use(`/${RENTAL_DETAILS_ROUTE}`, rentalItemDetailsRoute());
    router.use(`/${ADMIN_ROUTE}`, adminRoute());
    router.use(`/${LOGIN_ROUTE}`, loginRoute());
    router.use(`/${LOGOUT_ROUTE}`, logoutRoute());
    router.use(`/${VERIFY_OTP_ROUTE}`, verifyOTPRoute());
    router.use(`/${SUCCESS_PAYMENT_ROUTE}`,successPaymentRoute());
    router.use(`/${WEBSTATS_ROUTE}`, webstatsRoute()) ;

    /* this route allows someone to search for a list of items based on an item category name */
    router.get('/:category_weburl', csrfProtection, rentalItemsPerCategoryPage);

    /* This should be the last route to catch errors */    
    router.use(['/*',`${F404_ROUTE}`], f404Route());
    
    return router;
};
