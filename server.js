const express = require('express');
const { faker } = require('@faker-js/faker');
const path = require('path');

const bodyParser = require('body-parser');
const {decode} = require('html-entities');
const template_folder = 'static_template';  
const routes = require('./routes');

const app = express();
// for server ip :
const ip = require("ip");
const SERVER_IP =  ip.address() ;

app.use(express.json());

require('dotenv').config();

const cookieParser = require('cookie-parser');
const {getCategories,getCategoriesItems} = require('./database/controllers/database');
const {isTestEnvUpgraded} = require('./utilities/functions');

/* App caching */

const nodecache = require('node-cache');
const app_cache = new nodecache({stdTTL: 899}); //15 minutes

//import all routes here to use in app.locals
const {
    CHECKOUT_ROUTE,
    CART_ROUTE,
    CONTACT_ROUTE,
    PRODUCT_DETAILS_ROUTE,
    ADMIN_ROUTE,
    LOGIN_ROUTE,
    LOGOUT_ROUTE,
    VERIFY_OTP_ROUTE,
    F404_ROUTE,
    SUCCESS_PAYMENT_ROUTE
} = require('./utilities/routes_constant_names');

//import all routes here to use in app.locals
/* File upload  */
const fileUpload = require('express-fileupload');
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, //maximum 50 MB
}));

/* dynamically detect the folder we are running from,
 then select port accordingly */
const TEST_PORT = process.env.TEST_SITE_PORT_UPGRADE;
const PROD_PORT = process.env.PRODUCTION_SITE_PORT_UPGRADE;
var PORT = TEST_PORT ;
var isTestingEnv = isTestEnvUpgraded(current_dir=new String(__dirname));
if ( !isTestingEnv) {
    PORT = PROD_PORT;
    console.log(`Production port loaded: ${PORT}`);
} else if (isTestingEnv) {
    PORT = TEST_PORT;
    console.log(`Testing port loaded: ${PORT}`);
} else {
    throw Error("We could neither detect testing or production environment");
}

var csrf = require('csurf');
// csrf protection
let csrfProtection = csrf({ cookie: true });

var parseForm = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.urlencoded({extended: true}));
app.use(parseForm);

const site_secret = faker.internet.password({ length:16 });

var dynamicCookie =  {
    sameSite: 'none',
    maxAge: Number(process.env.SESSION_MAXIMUM_TIME_IN_MILLI_SECONDS),
    secure: false,
    httpOnly: false,
};

/* If in a production environment, then use un secure cookies */
if (PORT == PROD_PORT) {
        
    app.set('trust proxy', 1) // trust first proxy
    dynamicCookie.secure = true; // serve secure cookies
    dynamicCookie.sameSite = 'strict';
    dynamicCookie.httpOnly = true;
    app.use(cookieParser(site_secret, dynamicCookie));
} else {
     
    app.set('trust proxy', 0) // trust first proxy
    dynamicCookie.secure = false; // we do not need to serve secure cookies
    dynamicCookie.sameSite = 'strict';
    dynamicCookie.httpOnly = false;
    app.use(cookieParser(site_secret, dynamicCookie));
} ;


/* Prevent attackes from guessing passwords with rate limiting per IP address */
const { rateLimit } = require('express-rate-limit');

const form_rate_limiter = rateLimit({
	windowMs: 30 * 60 * 1000, // 30 minutes
	limit: 10000, // Limit each IP to 1000 requests per `window` (here, per 30 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Use an external store for consistency across multiple server instances.

})

// Apply the rate limiting middleware to all requests.
app.use(form_rate_limiter); 


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
//app.set('assets', path.join(__dirname, './assets'));
app.use(express.static(path.join(__dirname, `./${template_folder}`)));

app.locals.siteName = process.env.SITENAME;
app.locals.miniSiteName = process.env.MINI_SITENAME;
app.locals.pageTitle = process.env.PAGETITLE;
app.locals.companyAddress= process.env.COMPANY_ADDRESS;
app.locals.companyBusinessName = process.env.COMPANY_BUSINESS_NAME;
app.locals.customerServiceNumber = process.env.CUSTOMER_SERVICE_NUMBER;
app.locals.customerServiceNumberExtra = process.env.CUSTOMER_SERVICE_NUMBER_EXTRA;
/* app.locals.customerServiceEmail = process.env.CUSTOMER_SERVICE_EMAIL; */
app.locals.customerServiceEmail = process.env.CUSTOMER_BUSINESS_EMAIL;
app.locals.customerBusinessNumber = process.env.CUSTOMER_BUSINESS_NUMBER;
app.locals.mediumLink = process.env.MEDIUM_LINK;
app.locals.facebookLink = process.env.FACEBOOK_LINK;
app.locals.instagramLink = process.env.INSTAGRAM_LINK;
app.locals.twitterLink = process.env.TWITTER_LINK;
app.locals.youtubeLink = process.env.YOUTUBE_LINK;
app.locals.googleMapsLink = process.env.GOOGLE_MAPS_LINK ;
app.locals.googleMapsFrameLink = process.env.GOOGLE_MAPS_FRAME_LINK ;
app.locals.seoSiteLink = process.env.SEO_SITE_LINK;
/* setting accepted routes */
app.locals.CHECKOUT_ROUTE = CHECKOUT_ROUTE ;
app.locals.CART_ROUTE = CART_ROUTE ;
app.locals.CONTACT_ROUTE = CONTACT_ROUTE ;
app.locals.PRODUCT_DETAILS_ROUTE = PRODUCT_DETAILS_ROUTE ;
app.locals.ADMIN_ROUTE = ADMIN_ROUTE ;
app.locals.LOGIN_ROUTE = LOGIN_ROUTE ;
app.locals.LOGOUT_ROUTE = LOGOUT_ROUTE ;
app.locals.VERIFY_OTP_ROUTE = VERIFY_OTP_ROUTE ;
app.locals.F404_ROUTE = F404_ROUTE ;
app.locals.SUCCESS_PAYMENT_ROUTE = SUCCESS_PAYMENT_ROUTE ;

/* PORT we are launching from */
app.locals.port = PORT ;

/* now loop through the list_of_items */
var index = 0 ;

const customers_feedback = require(process.env.CUSTOMERS_FEEDBACK_FILE);
app.locals.customers_feedback = customers_feedback ;

/* location where images are being stored */
const {IMG_DIR_FOR_WEB} = require('./utilities/fileupload');
const { exit } = require('process');

/* We need to cache the database of items needed to load a page */

/* rejected firewall domains  */
const firewall = require('./utilities/firewall');
app.use(firewall);

const {
    ITEMS_ARRAY,
    ITEMS_BY_ID,
    ITEMS_BY_CATEGORY_ID,
    ITEMS_BY_CATEGORY_WEB_ID,
    ITEMS_DETAILS,
    CATEGORIES_TABLE,
    USER_CART,
    USER,
    QUANTITY
} = require('./utilities/web_page_variables');

app.use(csrfProtection, async(request, response, next) => { 
         
        var items_array = null ;
        var itemsByID = {} ;
        var itemsByCategoryID = {}
        var categories = null ;
        var itemsByCategoryWebID = {};

       
        var item = null ;

        items_array = app_cache.get(ITEMS_ARRAY);
    
        if (items_array == undefined ) {
            //console.log('Cache miss for ITEMS_ARRAY ');;
            items_array = await getCategoriesItems ();
            
            for (var j=0 ; j < items_array.length; j++ ) {
                item = JSON.parse(JSON.stringify(items_array[j]));
                //items_array[j].item_name = decode(item.item_name);
                var categoryID = item.category_id ;
                if (!(categoryID in itemsByCategoryID)) {
                    itemsByCategoryID[categoryID] = [] ;
                } ;
                itemsByCategoryID[categoryID].push(item);
                var itemID = new String(item.item_id) ;
                
                if (!(itemID in itemsByID)) { 
                    itemsByID[itemID] = {} ;
                } ;

                var category_webid = new String(item.category_webid);
                
                var category_id = new String(item.category_id);
                //console.log(`category_webid : ${category_webid}`);

                if (!(category_webid in itemsByCategoryWebID)) {
                    itemsByCategoryWebID[category_webid] = {};
                } ;
            
                itemsByCategoryWebID[category_webid] = JSON.parse(JSON.stringify(item)) ;

                itemsByID[itemID][ITEMS_DETAILS] = JSON.parse(JSON.stringify(item)) ;
                app_cache.set(ITEMS_ARRAY, items_array);
                app_cache.set(ITEMS_BY_ID, itemsByID);
                app_cache.set(ITEMS_BY_CATEGORY_ID, itemsByCategoryID);
                app_cache.set(ITEMS_BY_CATEGORY_WEB_ID, itemsByCategoryWebID);

            } ;

        } ;

        //console.log(`itemsByID in server.js: ${JSON.stringify(request.session.itemsByID,null,4)}`);
        categories = app_cache.get(CATEGORIES_TABLE)
        if (categories == undefined) {
            //console.log(`Cache miss for ${CATEGORIES_TABLE}`);
            categories = await getCategories (tableName=CATEGORIES_TABLE) ;
            for (var i = 0; i <  categories.length; i++) {
                var category = JSON.parse(JSON.stringify( categories[i]));
                category.category_name = category.category_name;
                //categories[i].category_name = category.category_name;
            };
            app_cache.set(CATEGORIES_TABLE, categories);
        } ;

        const protocol = request.protocol;
        const host = request.hostname;
        const originalUrl = request.originalUrl;
        const port = PORT;
        var fullUrl = '';
        /*
            If we are in production environment, then it 
            probably means that the isTestingEnv variable is set
        */
        if (isTestingEnv)
            fullUrl = `${protocol}://${host}:${port}${originalUrl}` ;
        else
            fullUrl = `${protocol}://${host}${originalUrl}` ;
        app.locals.originalUrl = originalUrl;
        app.locals.fullUrl = fullUrl ;
        app.locals.BASE_SERVER_URL = baseUrl ;
        request.locals = app.locals ;
        request.locals.app_cache = app_cache ;
        request.locals.USER_CART_NAME = USER_CART;
        request.locals.QUANTITY_NAME = QUANTITY ;
        request.locals.ITEMS_DETAILS_NAME = ITEMS_DETAILS;
        request.locals.LOGGEDIN_USER_VARIABLE_NAME = USER;
        response.locals.csrfToken = request.csrfToken();
        return next();

});

app.use('/',routes());

//exporting app for testing
module.exports = app.listen(PORT, () => {
    console.log(`Express server listening on : ${SERVER_IP}:${PORT} `);
   
});

